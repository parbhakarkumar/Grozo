import asyncHandler from "../utils/asyncHandler.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// ─────────────────────────────────────────────
// GET /api/admin/dashboard
// Returns comprehensive KPI data for admin dashboard
// ─────────────────────────────────────────────
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart  = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Run all DB queries in parallel for maximum speed
  const [
    totalOrders,
    todayOrders,
    weekOrders,
    monthOrders,
    statusBreakdown,
    totalRevenue,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    totalUsers,
    newUsersToday,
    newUsersThisWeek,
    totalProducts,
    activeProducts,
    recentOrders,
    revenueByDay,
    topProducts,
    deliveryStatusTimeline,
    recentUsers,
  ] = await Promise.all([
    // Order counts
    orderModel.countDocuments(),
    orderModel.countDocuments({ createdAt: { $gte: todayStart } }),
    orderModel.countDocuments({ createdAt: { $gte: weekStart } }),
    orderModel.countDocuments({ createdAt: { $gte: monthStart } }),

    // Orders by status
    orderModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // Revenue aggregations
    orderModel.aggregate([
      { $match: { payment: true } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    orderModel.aggregate([
      { $match: { payment: true, createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    orderModel.aggregate([
      { $match: { payment: true, createdAt: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    orderModel.aggregate([
      { $match: { payment: true, createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    // User counts
    userModel.countDocuments({ role: "user" }),
    userModel.countDocuments({ role: "user", createdAt: { $gte: todayStart } }),
    userModel.countDocuments({ role: "user", createdAt: { $gte: weekStart } }),

    // Product counts
    productModel.countDocuments(),
    productModel.countDocuments({ stock: { $gt: 0 } }).catch(() => productModel.countDocuments()),

    // Recent 10 orders with populated data
    orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),

    // Revenue per day — last 7 days
    orderModel.aggregate([
      {
        $match: {
          payment: true,
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Top 5 products by order count
    orderModel.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          image: { $first: { $arrayElemAt: ["$items.image", 0] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),

    // Average delivery time (Delivered orders only)
    orderModel.aggregate([
      { $match: { status: "Delivered" } },
      {
        $project: {
          deliveryTime: {
            $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 3600000],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgHours: { $avg: "$deliveryTime" },
          count: { $sum: 1 },
        },
      },
    ]),

    // Recent registered users
    userModel
      .find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(8)
      .select("-password")
      .lean(),
  ]);

  // ── Build status map ────────────────────────
  const statusMap = {};
  statusBreakdown.forEach(({ _id, count }) => {
    if (_id) statusMap[_id] = count;
  });

  const pendingOrders = (statusMap["Pending"] || 0) + (statusMap["Order Placed"] || 0);
  const processingOrders = (statusMap["Processing"] || 0) + (statusMap["Packing"] || 0);
  const shippedOrders =
    (statusMap["Shipped"] || 0) +
    (statusMap["Out for Delivery"] || 0) +
    (statusMap["Out for delivery"] || 0);
  const deliveredOrders = statusMap["Delivered"] || 0;
  const cancelledOrders = statusMap["Cancelled"] || 0;
  const actualTotalRevenue = totalRevenue[0]?.total || 0;
  const actualTodayRevenue = todayRevenue[0]?.total || 0;
  const actualMonthRevenue = monthRevenue[0]?.total || 0;

  // ── Build revenue by day (fill missing days) ─
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    const found = revenueByDay.find((r) => r._id === key);
    last7Days.push({
      date: key,
      label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
      revenue: found ? found.revenue : 0,
      orders: found ? found.orders : 0,
    });
  }

  // ── Delivery timeline ─────────────────────
  const deliveryAvg = deliveryStatusTimeline[0] || { avgHours: 0, count: 0 };

  // ── Attach customer info to recent orders ──
  const userIds = [...new Set(recentOrders.map((o) => o.userId).filter(Boolean))];
  const userMap = {};
  if (userIds.length > 0) {
    const users = await userModel
      .find({ _id: { $in: userIds } })
      .select("name email avatar");
    users.forEach((u) => {
      userMap[u._id.toString()] = { name: u.name, email: u.email, avatar: u.avatar };
    });
  }

  const enrichedOrders = recentOrders.map((order) => ({
    ...order,
    customer: userMap[order.userId] || { name: "Customer", email: "" },
  }));

  return res.status(200).json({
    success: true,
    totalUsers,
    totalProducts,
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    actualTotalRevenue,
    todayOrders,
    todayRevenue: actualTodayRevenue,
    monthlyRevenue: actualMonthRevenue,
    recentOrders: enrichedOrders,
    recentUsers,
    topSellingProducts: topProducts,
    stats: {
      orders: {
        total: totalOrders,
        today: todayOrders,
        thisWeek: weekOrders,
        thisMonth: monthOrders,
        byStatus: statusMap,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        inTransit: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      revenue: {
        total: actualTotalRevenue,
        today: actualTodayRevenue,
        thisWeek: weekRevenue[0]?.total || 0,
        thisMonth: actualMonthRevenue,
      },
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
      },
      delivery: {
        avgHours: Math.round(deliveryAvg.avgHours || 0),
        totalDelivered: deliveryAvg.count || 0,
      },
    },
    charts: {
      revenueByDay: last7Days,
      topProducts,
    },
  });
});

export { getDashboardStats };

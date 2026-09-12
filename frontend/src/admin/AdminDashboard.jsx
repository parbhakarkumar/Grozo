import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Users,
  Package,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RefreshCw,
  Eye,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

const currency = "₹";

const STATUS_COLOR = {
  Pending:            "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "Order Placed":     "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Confirmed:          "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Processing:         "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  Packing:            "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  Shipped:            "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "Out for Delivery": "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "Out for delivery": "bg-orange-500/15 text-orange-300 border-orange-500/30",
  Delivered:          "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Cancelled:          "bg-red-500/15 text-red-300 border-red-500/30",
};

const KpiCard = ({ icon: Icon, label, value, sub, accent, loading }) => (
  <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-3.5">
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: `${accent}18`, border: `1px solid ${accent}30`, color: accent }}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-black text-white mt-0.5 leading-none">
        {loading ? <span className="inline-block w-16 h-6 bg-slate-800 rounded animate-pulse" /> : value}
      </p>
      {sub && <p className="text-[10px] text-slate-500 mt-1 truncate">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { headers: { token } };
      const res = await axios.get(backendUrl + "/api/admin/dashboard", headers);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.warn("Failed to load dashboard statistics:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // DB Calculated Statistics (Zero hardcoding)
  const totalUsers         = data?.totalUsers ?? 0;
  const totalProducts      = data?.totalProducts ?? 0;
  const totalOrders        = data?.totalOrders ?? 0;
  const pendingOrders      = data?.pendingOrders ?? 0;
  const processingOrders   = data?.processingOrders ?? 0;
  const shippedOrders      = data?.shippedOrders ?? 0;
  const deliveredOrders    = data?.deliveredOrders ?? 0;
  const cancelledOrders    = data?.cancelledOrders ?? 0;
  const actualTotalRevenue = data?.actualTotalRevenue ?? 0;
  const todayOrders        = data?.todayOrders ?? 0;
  const todayRevenue       = data?.todayRevenue ?? 0;
  const monthlyRevenue     = data?.monthlyRevenue ?? 0;
  const recentOrders       = data?.recentOrders ?? [];
  const recentUsers        = data?.recentUsers ?? [];
  const topProducts        = data?.topSellingProducts ?? [];
  const revenueChart       = data?.charts?.revenueByDay ?? [];

  const maxRev = Math.max(1, ...revenueChart.map((d) => d.revenue));

  const kpis = [
    { icon: IndianRupee, label: "Actual Total Revenue", value: `${currency}${actualTotalRevenue.toLocaleString("en-IN")}`, sub: "From all paid database orders", accent: "#10b981" },
    { icon: TrendingUp,  label: "Today's Revenue",      value: `${currency}${todayRevenue.toLocaleString("en-IN")}`, sub: "Paid revenue captured today", accent: "#06b6d4" },
    { icon: Calendar,    label: "Monthly Revenue",      value: `${currency}${monthlyRevenue.toLocaleString("en-IN")}`, sub: "Current calendar month", accent: "#8b5cf6" },
    { icon: ShoppingCart,label: "Total Orders",         value: totalOrders, sub: `${todayOrders} placed today`, accent: "#6366f1" },
    { icon: Clock,       label: "Pending Orders",       value: pendingOrders, sub: "Awaiting confirmation/packing", accent: "#f59e0b" },
    { icon: Package,     label: "Processing Orders",    value: processingOrders, sub: "Being picked at dark store", accent: "#3b82f6" },
    { icon: Truck,       label: "Shipped Orders",       value: shippedOrders, sub: "Dispatched with delivery partner", accent: "#f97316" },
    { icon: CheckCircle2,label: "Delivered Orders",     value: deliveredOrders, sub: "Customer verified & completed", accent: "#22c55e" },
    { icon: XCircle,     label: "Cancelled Orders",     value: cancelledOrders, sub: "Cancelled by user or store", accent: "#ef4444" },
    { icon: Users,       label: "Total Users",          value: totalUsers, sub: "Registered customer accounts", accent: "#0ea5e9" },
    { icon: Package,     label: "Total Products",       value: totalProducts, sub: "Active catalog items in DB", accent: "#ec4899" },
  ];

  const statusBreakdown = [
    { label: "Delivered", count: deliveredOrders, color: "#22c55e" },
    { label: "Shipped", count: shippedOrders, color: "#f97316" },
    { label: "Processing", count: processingOrders, color: "#3b82f6" },
    { label: "Pending", count: pendingOrders, color: "#f59e0b" },
    { label: "Cancelled", count: cancelledOrders, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6 max-w-[1500px]">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">Production Admin Dashboard</h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
              100% Database Powered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real MongoDB statistics, live GPS delivery telemetry, and active order audits
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Database Stats</span>
        </button>
      </div>

      {/* ── KPI Grid: 11 Real Database Metrics ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} loading={loading} />
        ))}
      </div>

      {/* ── Charts & Order Status Distribution ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real Revenue Chart (Last 7 Days) - 7 Cols */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white">Daily Paid Revenue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Aggregated from paid database orders (Last 7 Days)</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              AGGREGATION QUERY
            </span>
          </div>

          {revenueChart.length > 0 ? (
            <div className="flex items-end gap-3 h-44 pt-4">
              {revenueChart.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[9px] text-slate-400 font-mono font-bold">
                    {d.revenue > 0 ? `₹${d.revenue}` : "—"}
                  </span>
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-cyan-600 to-emerald-400 min-h-[4px] transition-all duration-500 shadow-md shadow-cyan-950/40"
                    style={{ height: `${Math.max(4, (d.revenue / maxRev) * 110)}px` }}
                  />
                  <span className="text-[10px] text-slate-500 font-bold">{d.label?.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-xs text-slate-500">
              No revenue recorded in the last 7 days
            </div>
          )}
        </div>

        {/* Order Status Distribution - 5 Cols */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800/60 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-black text-white">Order Status Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status breakdown of {totalOrders} total orders</p>
          </div>

          <div className="space-y-3 pt-1">
            {statusBreakdown.map((s) => {
              const pct = totalOrders > 0 ? Math.round((s.count / totalOrders) * 100) : 0;
              return (
                <div key={s.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">{s.label}</span>
                    <span className="font-mono text-slate-400">
                      {s.count} orders ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Top Selling Products & Recent Registered Users ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Products (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white">Top Selling Products</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase">By Sales Volume</span>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No product sales recorded yet</p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-black text-slate-500 w-4">#{i + 1}</span>
                    {p.image ? (
                      <img src={p.image} alt={p._id} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs">
                        📦
                      </div>
                    )}
                    <p className="text-xs font-bold text-white truncate max-w-[200px]">{p._id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white">{p.totalSold} sold</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {currency}{(p.revenue || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registered Users (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white">Recent Registered Customers</h3>
            <Link to="/admin/users" className="text-xs font-bold text-cyan-400 hover:underline">
              View All ({totalUsers})
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No users registered yet</p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-600/20 text-cyan-400 font-black text-xs flex items-center justify-center border border-cyan-500/30">
                      {u.name?.slice(0, 2).toUpperCase() || "US"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{u.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold uppercase">
                      {u.role}
                    </span>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Orders with Live Tracking Links ───── */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white">Recent Orders</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest customer transactions from database</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Manage All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Order ID</th>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Items</th>
                <th className="px-5 py-3 text-left">Amount</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Tracking ID</th>
                <th className="px-5 py-3 text-left">Live Map</th>
                <th className="px-5 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500 text-xs">
                    No orders placed yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-300">
                      #{order._id?.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-bold text-white">{order.customer?.name || "Customer"}</p>
                      <p className="text-[10px] text-slate-500">{order.customer?.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-5 py-3.5 text-xs font-black text-white">
                      {currency}{order.amount?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          STATUS_COLOR[order.status] || "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-cyan-400">
                      {order.trackingId || "TRK-PENDING"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/tracking/${order._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-[10px] font-black transition-all"
                      >
                        <Truck className="w-3 h-3" />
                        <span>Live Track</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(order.createdAt || order.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

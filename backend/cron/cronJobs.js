import cron from "node-cron";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

/**
 * Job 1: Cleanup abandoned unpaid orders older than 7 days
 * Schedule: 0 2 * * * (Every day at 02:00 AM)
 */
export const cleanupAbandonedOrders = cron.schedule(
  "0 2 * * *",
  async () => {
    console.log("⏰ [Cron] Running abandoned orders cleanup job...");
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const result = await orderModel.deleteMany({
        payment: false,
        paymentMethod: { $ne: "COD" },
        createdAt: { $lt: sevenDaysAgo },
      });
      console.log(`✅ [Cron] Cleaned up ${result.deletedCount} abandoned unpaid orders.`);
    } catch (err) {
      console.error("❌ [Cron] Abandoned orders cleanup error:", err.message);
    }
  },
  { scheduled: false }
);

/**
 * Job 2: Daily revenue summary report
 * Schedule: 0 8 * * * (Every day at 08:00 AM)
 */
export const dailyRevenueSummary = cron.schedule(
  "0 8 * * *",
  async () => {
    console.log("⏰ [Cron] Generating daily revenue summary...");
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayOrders = await orderModel.find({
        createdAt: { $gte: startOfDay },
      });

      const totalRevenue = todayOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      console.log(
        `📊 [Cron Daily Report] Orders today: ${todayOrders.length} | Revenue: ₹${totalRevenue}`
      );
    } catch (err) {
      console.error("❌ [Cron] Daily summary error:", err.message);
    }
  },
  { scheduled: false }
);

/**
 * Job 3: Stock alert check for products with inventory < 5
 * Schedule: *\/30 * * * * (Every 30 minutes)
 */
export const stockAlertCheck = cron.schedule(
  "*/30 * * * *",
  async () => {
    console.log("⏰ [Cron] Checking low stock inventory...");
    try {
      const lowStockProducts = await productModel.find({ stock: { $lt: 5 } }).select("name stock");
      if (lowStockProducts.length > 0) {
        console.warn(`⚠️ [Cron Alert] ${lowStockProducts.length} items low in stock:`);
        lowStockProducts.forEach((p) => {
          console.warn(`   - ${p.name}: ${p.stock} units remaining`);
        });
      } else {
        console.log("✅ [Cron] All products have healthy inventory levels.");
      }
    } catch (err) {
      console.error("❌ [Cron] Stock alert check error:", err.message);
    }
  },
  { scheduled: false }
);

/**
 * Initializes and starts all automated cron background jobs.
 */
export const initCronJobs = () => {
  cleanupAbandonedOrders.start();
  dailyRevenueSummary.start();
  stockAlertCheck.start();
  console.log("⏰ [Cron Engine] Background tasks initialized & scheduled.");
};

import React, { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { TrendingUp, TrendingDown, IndianRupee, ShoppingCart, Package, BarChart3, Calendar, Clock } from "lucide-react";

const currency = "₹";

const TIME_RANGES = [
  { key: "7d", label: "Last 7 Days", days: 7 },
  { key: "14d", label: "Last 14 Days", days: 14 },
  { key: "30d", label: "Last 30 Days", days: 30 },
  { key: "month", label: "This Month", days: -1 },
  { key: "all", label: "All Time", days: 0 },
];

const AdminAnalytics = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("14d");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.post(backendUrl + "/api/order/list", {}, { headers: { token } });
        if (res.data.success) setOrders(res.data.orders || []);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  // ── Filter orders by selected time range ──────────────────
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const selected = TIME_RANGES.find((r) => r.key === range);
    if (!selected || selected.days === 0) return orders; // All time

    let startDate;
    if (selected.days === -1) {
      // This month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - selected.days);
    }

    return orders.filter((o) => {
      const d = new Date(o.date || o.createdAt);
      return d >= startDate;
    });
  }, [orders, range]);

  // ── Derived Analytics ──────────────────────────────────────
  const paidOrders = filteredOrders.filter((o) => o.payment);
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.amount || 0), 0);
  const avgOrderValue = filteredOrders.length ? Math.round(totalRevenue / filteredOrders.length) : 0;

  // Previous period for comparison
  const prevOrders = useMemo(() => {
    const now = new Date();
    const selected = TIME_RANGES.find((r) => r.key === range);
    if (!selected || selected.days <= 0) return [];
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - selected.days * 2);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() - selected.days);
    return orders.filter((o) => {
      const d = new Date(o.date || o.createdAt);
      return d >= startDate && d < endDate;
    });
  }, [orders, range]);

  const prevRevenue = prevOrders.filter((o) => o.payment).reduce((s, o) => s + (o.amount || 0), 0);
  const revenueGrowth = prevRevenue > 0 ? (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : null;
  const ordersGrowth = prevOrders.length > 0 ? (((filteredOrders.length - prevOrders.length) / prevOrders.length) * 100).toFixed(1) : null;

  // Revenue by day
  const selectedDays = TIME_RANGES.find((r) => r.key === range)?.days || 14;
  const chartDays = selectedDays <= 0 ? 14 : Math.min(selectedDays, 30);
  const dayBuckets = Array.from({ length: chartDays }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (chartDays - 1 - i));
    return { date: d, label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), revenue: 0, count: 0 };
  });
  paidOrders.forEach((o) => {
    const oDate = new Date(o.date || o.createdAt);
    dayBuckets.forEach((bucket) => {
      if (oDate.getDate() === bucket.date.getDate() && oDate.getMonth() === bucket.date.getMonth() && oDate.getFullYear() === bucket.date.getFullYear()) {
        bucket.revenue += o.amount || 0;
        bucket.count += 1;
      }
    });
  });
  const maxRevenue = Math.max(1, ...dayBuckets.map((d) => d.revenue));

  // Top products
  const productMap = {};
  filteredOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      if (!productMap[item.name]) productMap[item.name] = { name: item.name, count: 0, revenue: 0 };
      productMap[item.name].count += item.quantity || 1;
      productMap[item.name].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });
  const topProducts = Object.values(productMap).sort((a, b) => b.count - a.count).slice(0, 8);
  const maxCount = Math.max(1, ...topProducts.map((p) => p.count));

  // Revenue by Category
  const categoryMap = {};
  filteredOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const cat = item.category || "Other";
      if (!categoryMap[cat]) categoryMap[cat] = { name: cat, revenue: 0, count: 0 };
      categoryMap[cat].revenue += (item.price || 0) * (item.quantity || 1);
      categoryMap[cat].count += item.quantity || 1;
    });
  });
  const categories = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);
  const maxCatRevenue = Math.max(1, ...categories.map((c) => c.revenue));
  const categoryColors = ["#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899", "#14b8a6", "#f97316"];

  // Peak Hours
  const hourBuckets = Array(24).fill(0);
  filteredOrders.forEach((o) => {
    const d = new Date(o.date || o.createdAt);
    const h = d.getHours();
    if (!isNaN(h)) hourBuckets[h]++;
  });
  const maxHour = Math.max(1, ...hourBuckets);

  // Order status split
  const statusSplit = [
    { label: "Delivered", value: filteredOrders.filter((o) => o.status === "Delivered").length, color: "#10b981" },
    { label: "Shipped", value: filteredOrders.filter((o) => ["Shipped", "Out for delivery"].includes(o.status)).length, color: "#f59e0b" },
    { label: "Processing", value: filteredOrders.filter((o) => ["Order Placed", "Packing"].includes(o.status)).length, color: "#6366f1" },
    { label: "Cancelled", value: filteredOrders.filter((o) => o.status === "Cancelled").length, color: "#ef4444" },
  ];
  const totalSplit = Math.max(1, statusSplit.reduce((s, x) => s + x.value, 0));

  const GrowthBadge = ({ value }) => {
    if (value === null) return null;
    const isPositive = parseFloat(value) >= 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isPositive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositive ? "+" : ""}{value}%
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white">Sales Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Revenue trends, product performance & order breakdown</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-800/60 rounded-xl border border-slate-700/60">
          {TIME_RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                range === r.key
                  ? "bg-cyan-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `${currency}${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "#10b981", growth: revenueGrowth },
          { label: "Total Orders", value: filteredOrders.length, icon: ShoppingCart, color: "#6366f1", growth: ordersGrowth },
          { label: "Avg Order Value", value: `${currency}${avgOrderValue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "#f59e0b", growth: null },
          { label: "Unique Products", value: Object.keys(productMap).length, icon: Package, color: "#0ea5e9", growth: null },
        ].map((k) => (
          <div key={k.label} className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${k.color}18`, color: k.color }}>
                  <k.icon className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{k.label}</p>
              </div>
              <GrowthBadge value={k.growth} />
            </div>
            <p className="text-2xl font-black text-white">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Bar Chart */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-black text-white">Revenue Trend</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Last {chartDays} Days</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-6">Daily revenue from paid orders</p>

        {loading ? (
          <div className="h-44 flex items-end gap-2">
            {Array(chartDays).fill(0).map((_, i) => (
              <div key={i} className="flex-1 bg-slate-800 rounded-lg animate-pulse" style={{ height: `${Math.random() * 140 + 20}px` }} />
            ))}
          </div>
        ) : (
          <div className="flex items-end gap-1.5 h-44">
            {dayBuckets.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                {d.revenue > 0 && (
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[10px] font-bold text-white whitespace-nowrap">
                      {currency}{d.revenue.toLocaleString("en-IN")} · {d.count} orders
                    </div>
                    <div className="w-1.5 h-1.5 bg-slate-800 rotate-45 -mt-0.5" />
                  </div>
                )}
                <div
                  className="w-full rounded-t-lg transition-all duration-500 min-h-[4px]"
                  style={{
                    height: `${Math.max(4, (d.revenue / maxRevenue) * 160)}px`,
                    background: d.revenue > 0 ? "linear-gradient(to top, #0891B2, #10b981)" : "#1e293b",
                  }}
                />
                <span className="text-[8px] text-slate-600 font-bold -rotate-45 origin-left mt-1 truncate w-full text-center">
                  {d.label.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Middle Row: Category Breakdown + Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue by Category */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
          <h3 className="text-sm font-black text-white mb-5">Revenue by Category</h3>
          <div className="space-y-3">
            {loading ? (
              Array(5).fill(0).map((_, i) => <div key={i} className="h-8 bg-slate-800 rounded-xl animate-pulse" />)
            ) : categories.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No category data</p>
            ) : (
              categories.map((cat, i) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: categoryColors[i % categoryColors.length] }} />
                      <span className="text-xs text-slate-300 font-medium truncate">{cat.name}</span>
                    </div>
                    <span className="text-xs font-black text-white ml-2 shrink-0">
                      {currency}{cat.revenue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="ml-5 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(cat.revenue / maxCatRevenue) * 100}%`,
                        background: categoryColors[i % categoryColors.length],
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Peak Hours Heatmap */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-white">Peak Order Hours</h3>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
              <Clock className="w-3 h-3" />
              <span>24h Distribution</span>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-1.5">
            {hourBuckets.map((count, h) => {
              const intensity = count / maxHour;
              const isActive = count > 0;
              return (
                <div key={h} className="group relative">
                  <div
                    className="aspect-square rounded-lg transition-all duration-300 border border-slate-800/40"
                    style={{
                      background: isActive
                        ? `rgba(6, 182, 212, ${0.15 + intensity * 0.75})`
                        : "#1e293b",
                      borderColor: isActive ? `rgba(6, 182, 212, ${0.2 + intensity * 0.4})` : undefined,
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                    <div className="bg-slate-800 border border-slate-700 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap">
                      {h}:00 — {count} orders
                    </div>
                  </div>
                  {(h % 3 === 0) && (
                    <span className="text-[7px] text-slate-600 font-bold text-center block mt-0.5">
                      {h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold">Less orders</span>
            <div className="flex items-center gap-1">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                <div key={opacity} className="w-3 h-3 rounded-sm" style={{ background: `rgba(6, 182, 212, ${opacity})` }} />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-bold">More orders</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Products + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
          <h3 className="text-sm font-black text-white mb-5">Top Products by Sales</h3>
          <div className="space-y-3">
            {loading ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="h-8 bg-slate-800 rounded-xl animate-pulse" />)
            ) : topProducts.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No product data</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-black text-slate-600 w-4 text-right shrink-0">#{i + 1}</span>
                      <span className="text-xs text-slate-300 font-medium truncate">{p.name}</span>
                    </div>
                    <span className="text-xs font-black text-white ml-2 shrink-0">{p.count} sold</span>
                  </div>
                  <div className="ml-6 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(p.count / maxCount) * 100}%`, background: `hsl(${160 - i * 15}, 70%, 50%)` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
          <h3 className="text-sm font-black text-white mb-5">Order Status Distribution</h3>

          {/* Stacked Bar */}
          <div className="flex h-8 rounded-xl overflow-hidden mb-5">
            {statusSplit.map((s) => (
              <div
                key={s.label}
                className="h-full transition-all duration-700"
                style={{ width: `${(s.value / totalSplit) * 100}%`, background: s.color }}
                title={`${s.label}: ${s.value}`}
              />
            ))}
          </div>

          <div className="space-y-3">
            {statusSplit.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-white">{s.value}</span>
                  <span className="text-[10px] text-slate-600 w-10 text-right">
                    {((s.value / totalSplit) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Delivery Rate</p>
              <p className="text-xl font-black text-cyan-400 mt-1">
                {filteredOrders.length ? `${((statusSplit[0].value / filteredOrders.length) * 100).toFixed(1)}%` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cancel Rate</p>
              <p className="text-xl font-black text-red-400 mt-1">
                {filteredOrders.length ? `${((statusSplit[3].value / filteredOrders.length) * 100).toFixed(1)}%` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

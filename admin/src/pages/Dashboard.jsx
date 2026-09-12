import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { playNotificationSound } from "../utils/sound";

// Status styling configuration
const STATUS_STYLE = {
  "Order Placed":     { cls: "badge-info",    dot: "#3b82f6", label: "Order Placed" },
  Pending:            { cls: "badge-info",    dot: "#3b82f6", label: "Pending" },
  Confirmed:          { cls: "badge-info",    dot: "#60a5fa", label: "Confirmed" },
  Packing:            { cls: "badge-accent",  dot: "#6366f1", label: "Packing" },
  Processing:         { cls: "badge-accent",  dot: "#8b5cf6", label: "Processing" },
  Shipped:            { cls: "badge-warning", dot: "#f59e0b", label: "Shipped" },
  "Out for delivery": { cls: "badge-warning", dot: "#f59e0b", label: "Out for delivery" },
  "Out for Delivery": { cls: "badge-warning", dot: "#f59e0b", label: "Out for Delivery" },
  Delivered:          { cls: "badge-success", dot: "#10b981", label: "Delivered" },
  Cancelled:          { cls: "badge-danger",  dot: "#ef4444", label: "Cancelled" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_STYLE[status] || { cls: "badge-muted", dot: "#64748b", label: status };
  return (
    <span className={`badge ${cfg.cls}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label || status}
    </span>
  );
};

// Executive KPI Card
const KpiCard = ({ label, value, sub, icon, accent, colorClass }) => (
  <div
    className={`glass-card animate-fade-up ${colorClass || ""}`}
    style={{
      padding: "20px 22px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "90px",
        height: "90px",
        background: `radial-gradient(circle at top right, ${accent}18, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "var(--radius-md)",
        background: `${accent}20`,
        border: `1px solid ${accent}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: accent,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginTop: "4px" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          {sub}
        </div>
      )}
    </div>
  </div>
);

const Dashboard = ({ token }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders]               = useState([]);
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [activity, setActivity]           = useState([]);

  // Fetch all real MongoDB data
  const fetchDashboardData = async (isManual = false) => {
    if (!token) return;
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, ordersRes, productsRes] = await Promise.allSettled([
        axios.get(backendUrl + "/api/admin/dashboard", { headers: { token } }),
        axios.post(backendUrl + "/api/order/list", {}, { headers: { token } }),
        axios.get(backendUrl + "/api/product/list", { headers: { token } }),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
        setDashboardData(statsRes.value.data);
      }

      if (ordersRes.status === "fulfilled" && ordersRes.value.data.success) {
        setOrders(ordersRes.value.data.orders);
      }

      if (productsRes.status === "fulfilled" && productsRes.value.data.success) {
        setProducts(productsRes.value.data.products);
      }

      if (isManual) toast.success("Live operational metrics refreshed!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load live dashboard statistics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Real-time Socket.IO synchronization
  useEffect(() => {
    if (!token) return;
    const socket = io(backendUrl, { transports: ["websocket", "polling"] });

    socket.on("connect", () => {
      socket.emit("join_admin");
    });

    socket.on("new_order", (data) => {
      playNotificationSound();
      toast.info(`🔔 New order #${data.order?._id?.slice(-6) || ""} received!`);
      const entry = {
        id: data.order?._id || Date.now(),
        message: `New order from ${data.order?.address?.firstName || "Customer"}`,
        amount: data.order?.amount,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setActivity((prev) => [entry, ...prev].slice(0, 8));
      fetchDashboardData();
    });

    socket.on("order_status_updated", (data) => {
      toast.info(`📦 Order #${data.orderId?.slice(-6)} status updated to "${data.status}"`);
      fetchDashboardData();
    });

    return () => socket.disconnect();
  }, [token]);

  // Derive metrics from real database dashboard response
  const totalRevenue = dashboardData?.actualTotalRevenue ?? orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const todayRevenue = dashboardData?.todayRevenue ?? 0;
  const monthRevenue = dashboardData?.monthlyRevenue ?? 0;
  const totalOrdersCount = dashboardData?.totalOrders ?? orders.length;
  const inTransitCount = (dashboardData?.shippedOrders ?? 0) + orders.filter((o) => ["Shipped", "Out for delivery", "Out for Delivery"].includes(o.status)).length;
  const deliveredCount = dashboardData?.deliveredOrders ?? orders.filter((o) => o.status === "Delivered").length;
  const pendingCount = dashboardData?.pendingOrders ?? orders.filter((o) => ["Pending", "Order Placed"].includes(o.status)).length;
  const processingCount = dashboardData?.processingOrders ?? orders.filter((o) => ["Processing", "Packing"].includes(o.status)).length;
  const totalUsersCount = dashboardData?.totalUsers ?? (dashboardData?.stats?.users?.total ?? 1);
  const totalProductsCount = dashboardData?.totalProducts ?? products.length;

  const lowStockItems = products.filter((p) => (p.stock ?? 100) <= 5);
  const recentOrdersList = (dashboardData?.recentOrders && dashboardData.recentOrders.length > 0)
    ? dashboardData.recentOrders
    : [...orders].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 6);

  const topSellingList = dashboardData?.topSellingProducts || [];
  const recentUsersList = dashboardData?.recentUsers || [];
  const revenueTrendDays = dashboardData?.charts?.revenueByDay || [];

  // Max revenue for scaling bar chart
  const maxDayRevenue = Math.max(...revenueTrendDays.map((d) => d.revenue || 0), 1000);

  const kpis = [
    {
      label: "Total Revenue",
      value: loading ? "—" : `${currency}${totalRevenue.toLocaleString("en-IN")}`,
      sub: todayRevenue > 0 ? `+${currency}${todayRevenue.toLocaleString("en-IN")} today` : `Across ${totalOrdersCount} orders`,
      accent: "#8b5cf6",
      colorClass: "kpi-violet",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "Total Orders",
      value: loading ? "—" : totalOrdersCount,
      sub: `${deliveredCount} delivered · ${inTransitCount} active`,
      accent: "#6366f1",
      colorClass: "kpi-indigo",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: "Pending / Processing",
      value: loading ? "—" : (pendingCount + processingCount),
      sub: `${pendingCount} pending · ${processingCount} packing`,
      accent: "#f59e0b",
      colorClass: "kpi-amber",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Registered Users",
      value: loading ? "—" : totalUsersCount,
      sub: "Verified database accounts",
      accent: "#0ea5e9",
      colorClass: "kpi-sky",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Inventory Catalog",
      value: loading ? "—" : totalProductsCount,
      sub: lowStockItems.length > 0 ? `⚠️ ${lowStockItems.length} low-stock alerts` : "✓ Inventory healthy",
      accent: lowStockItems.length > 0 ? "#ef4444" : "#10b981",
      colorClass: lowStockItems.length > 0 ? "kpi-danger" : "kpi-emerald",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1440px", margin: "0 auto" }}>
      {/* ─── Top Control Bar ─── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
              Enterprise Control Dashboard
            </h1>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span className="live-dot" style={{ width: "6px", height: "6px" }} />
              LIVE DB TELEMETRY
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time logistics, telemetry coordinates, customer intelligence, and order fulfillment.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            style={{
              padding: "8px 14px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }}
            >
              <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {refreshing ? "Refreshing..." : "Sync Live Data"}
          </button>
          <a
            href="/add"
            className="btn-primary"
            style={{
              padding: "8px 14px",
              fontSize: "12px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Product
          </a>
        </div>
      </div>

      {/* ─── Executive KPI Cards ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      {/* ─── Low Stock Alert Banner ─── */}
      {lowStockItems.length > 0 && (
        <div
          className="glass-card animate-fade-up"
          style={{
            padding: "16px 20px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "22px" }}>⚠️</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#fca5a5" }}>
                Stock Depletion Alert ({lowStockItems.length} Products Low or Depleted)
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {lowStockItems.slice(0, 3).map((p) => `${p.name} (${p.stock || 0} remaining)`).join(", ")}
                {lowStockItems.length > 3 ? ` and ${lowStockItems.length - 3} more` : ""}
              </div>
            </div>
          </div>
          <a
            href="/list"
            className="btn-primary"
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              textDecoration: "none",
              background: "#ef4444",
            }}
          >
            Manage Inventory & Restock →
          </a>
        </div>
      )}

      {/* ─── Middle Grid: 7-Day Revenue Trend & Logistics Pipeline ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px", alignItems: "stretch" }}>
        {/* 7-Day Revenue Interactive Bar Visualizer */}
        <div className="glass-card animate-fade-up" style={{ padding: "22px", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                7-Day Revenue & Volume Velocity
              </h2>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                Aggregated daily revenue and order transaction counts
              </p>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--accent-light)", background: "rgba(99,102,241,0.12)", padding: "3px 8px", borderRadius: "var(--radius-sm)" }}>
              Actual Paid DB Transactions
            </span>
          </div>

          {revenueTrendDays.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No transaction history in the last 7 days.
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", height: "180px", paddingTop: "20px" }}>
              {revenueTrendDays.map((day) => {
                const heightPercent = Math.max(Math.round(((day.revenue || 0) / maxDayRevenue) * 100), 8);
                return (
                  <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: day.revenue > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {day.revenue > 0 ? `${currency}${day.revenue}` : "₹0"}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "42px",
                        height: `${heightPercent}%`,
                        background: day.revenue > 0
                          ? "linear-gradient(180deg, var(--accent-light), var(--accent))"
                          : "rgba(255,255,255,0.05)",
                        borderRadius: "6px 6px 0 0",
                        transition: "height 0.6s ease",
                        position: "relative",
                        cursor: "pointer",
                      }}
                      title={`${day.date}: ${currency}${day.revenue} (${day.orders} orders)`}
                    />
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>
                      {day.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Logistics Pipeline Breakdown */}
        <div className="glass-card animate-fade-up" style={{ padding: "22px", borderRadius: "var(--radius-lg)" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
            Logistics Pipeline Distribution
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "18px" }}>
            Current lifecycle distribution across all {totalOrdersCount} orders
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.entries(STATUS_STYLE).slice(0, 6).map(([status, cfg]) => {
              const count = orders.filter((o) => o.status === status).length;
              const pct = totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0;
              return (
                <div key={status}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{cfg.label}</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {count} <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 400 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: "6px", background: "var(--bg-hover)", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: cfg.dot,
                        borderRadius: "999px",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Bottom Grid: Recent Orders & Top Selling Leaderboard ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px", alignItems: "start" }}>
        
        {/* Recent Orders Table */}
        <div className="glass-card animate-fade-up" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Live Fulfillment Orders
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                Latest {recentOrdersList.length} database order transactions
              </div>
            </div>
            <a
              href="/orders"
              style={{
                fontSize: "12px",
                color: "var(--accent-light)",
                textDecoration: "none",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Full Orders Console →
            </a>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrdersList.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "13px" }}>
                        {order.address?.firstName} {order.address?.lastName}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {order.address?.city || "India"} · OTP: <strong style={{ color: "var(--text-primary)" }}>{order.deliveryOtp || "—"}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {Array.isArray(order.items) ? order.items.map((i) => i.name).join(", ") : "Items in package"}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                        {order.items?.length || 1} distinct item(s)
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                      {currency}{(order.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: order.paymentMethod === "COD" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
                          color: order.paymentMethod === "COD" ? "#f59e0b" : "#10b981",
                        }}
                      >
                        {order.paymentMethod || "COD"}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
                {!loading && recentOrdersList.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                      No orders found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products & Real-time Activity Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Top Selling Products Leaderboard */}
          <div className="glass-card animate-fade-up" style={{ padding: "20px", borderRadius: "var(--radius-lg)" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              Top Products by Volume
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Calculated dynamically from paid customer orders
            </p>

            {topSellingList.length === 0 ? (
              <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "16px 0", textAlign: "center" }}>
                No completed sales volume recorded yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {topSellingList.map((product, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "var(--radius-sm)",
                        overflow: "hidden",
                        background: "var(--bg-hover)",
                        flexShrink: 0,
                      }}
                    >
                      {product.image ? (
                        <img src={product.image} alt={product._id} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "10px" }}>
                          📦
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {product._id}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {product.totalSold} sold · <span style={{ color: "var(--accent-light)", fontWeight: 600 }}>{currency}{(product.revenue || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Socket.IO Event Feed */}
          <div className="glass-card animate-fade-up" style={{ padding: "20px", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div className="live-dot" />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Real-Time Dispatch Engine
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                  Socket.IO Active on Port 4000
                </div>
              </div>
            </div>

            {activity.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0", color: "var(--text-muted)", fontSize: "12px" }}>
                Listening for incoming live transactions...
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {activity.map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "8px", background: "var(--bg-hover)", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ fontSize: "14px" }}>⚡</span>
                    <div>
                      <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                        {item.message}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {currency}{(item.amount || 0).toLocaleString("en-IN")} · {item.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

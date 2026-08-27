import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { playNotificationSound } from "../utils/sound";

// Status config
const STATUS_STYLE = {
  "Order Placed":     { cls: "badge-info",    dot: "#3b82f6" },
  Packing:            { cls: "badge-accent",  dot: "#6366f1" },
  Shipped:            { cls: "badge-warning", dot: "#f59e0b" },
  "Out for delivery": { cls: "badge-warning", dot: "#f59e0b" },
  Delivered:          { cls: "badge-success", dot: "#10b981" },
  Cancelled:          { cls: "badge-danger",  dot: "#ef4444" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_STYLE[status] || { cls: "badge-muted", dot: "#64748b" };
  return (
    <span className={`badge ${cfg.cls}`}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {status}
    </span>
  );
};

// KPI Card
const KpiCard = ({ label, value, sub, icon, colorClass, accent }) => (
  <div
    className={`glass-card animate-fade-up ${colorClass}`}
    style={{ padding: "22px", display: "flex", alignItems: "center", gap: "18px" }}
  >
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "var(--radius-md)",
        background: `${accent}22`,
        border: `1px solid ${accent}33`,
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
      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginTop: "4px" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{sub}</div>
      )}
    </div>
  </div>
);

const Dashboard = ({ token }) => {
  const [orders, setOrders]     = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activity, setActivity] = useState([]);

  // Fetch data
  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const [ordersRes, productsRes] = await Promise.all([
          axios.post(backendUrl + "/api/order/list", {}, { headers: { token } }),
          axios.get(backendUrl + "/api/product/list", { headers: { token } }),
        ]);
        if (ordersRes.data.success)   setOrders(ordersRes.data.orders);
        if (productsRes.data.success) setProducts(productsRes.data.products);
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  // Socket for live activity
  useEffect(() => {
    if (!token) return;
    const socket = io(backendUrl, { transports: ["websocket", "polling"] });
    socket.on("connect", () => { socket.emit("join_admin"); });
    socket.on("new_order", (data) => {
      playNotificationSound();
      const entry = {
        id: data.order?._id || Date.now(),
        message: `New order from ${data.order?.address?.firstName || "Customer"}`,
        amount: data.order?.amount,
        time: new Date().toLocaleTimeString(),
      };
      setActivity((prev) => [entry, ...prev].slice(0, 8));
      setOrders((prev) => {
        const exists = prev.some((o) => o._id === data.order._id);
        return exists ? prev.map((o) => o._id === data.order._id ? data.order : o) : [data.order, ...prev];
      });
    });
    return () => socket.disconnect();
  }, [token]);

  // KPI calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const inTransitOrders = orders.filter((o) => ["Shipped", "Out for delivery"].includes(o.status)).length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const lowStockItems = products.filter((p) => (p.stock ?? 100) <= 5);

  const recentOrders = [...orders].sort((a, b) =>
    new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
  ).slice(0, 6);

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const kpis = [
    {
      label: "Total Orders",
      value: loading ? "—" : orders.length,
      sub: `${deliveredOrders} delivered`,
      colorClass: "kpi-indigo",
      accent: "#6366f1",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: "Total Revenue",
      value: loading ? "—" : `${currency}${totalRevenue.toLocaleString("en-IN")}`,
      sub: "Across all orders",
      colorClass: "kpi-violet",
      accent: "#8b5cf6",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "In-Transit Courier",
      value: loading ? "—" : inTransitOrders,
      sub: "Shipments on road",
      colorClass: "kpi-amber",
      accent: "#f59e0b",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      label: "Low Stock Alerts",
      value: loading ? "—" : lowStockItems.length,
      sub: lowStockItems.length > 0 ? "⚠️ Immediate restock needed" : "✓ Inventory healthy",
      colorClass: lowStockItems.length > 0 ? "kpi-amber" : "kpi-emerald",
      accent: lowStockItems.length > 0 ? "#ef4444" : "#10b981",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1400px" }}>
      {/* Header */}
      <div className="animate-fade-up">
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>Executive Control Dashboard</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Live delivery tracking, stock health, and revenue operations overview.
        </p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      {/* Low stock alert banner */}
      {lowStockItems.length > 0 && (
        <div
          className="glass-card animate-fade-up"
          style={{
            padding: "16px 20px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#fca5a5" }}>
                Stock Depletion Warning ({lowStockItems.length} Products)
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {lowStockItems.slice(0, 3).map((p) => `${p.name} (${p.stock || 0} left)`).join(", ")}
                {lowStockItems.length > 3 ? ` and ${lowStockItems.length - 3} more` : ""}
              </div>
            </div>
          </div>
          <a href="/list" className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px", textDecoration: "none" }}>
            Manage & Restock Inventory →
          </a>
        </div>
      )}

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px", alignItems: "start" }}>
        {/* Recent Orders Table */}
        <div className="glass-card animate-fade-up" style={{ overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Recent Orders & Logistics</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Latest {recentOrders.length} live orders</div>
            </div>
            <a href="/orders" style={{ fontSize: "12px", color: "var(--accent-light)", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
              View all orders
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </a>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Courier / OTP</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "13px" }}>
                        {order.address?.firstName} {order.address?.lastName}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {order.address?.city} · {order.items?.length || 0} items
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      {currency}{(order.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                      {order.courierPartner ? (
                        <div style={{ fontSize: "11px" }}>
                          <span style={{ color: "var(--accent-light)", fontWeight: 600 }}>{order.courierPartner}</span>
                          <div style={{ color: "var(--text-muted)" }}>#{order.trackingId}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          OTP: {order.deliveryOtp}
                        </span>
                      )}
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
                {!loading && recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Status Breakdown */}
          <div className="glass-card animate-fade-up" style={{ padding: "20px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
              Logistics Pipeline Breakdown
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {Object.entries(STATUS_STYLE).map(([status, cfg]) => {
                const count = statusCounts[status] || 0;
                const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
                return (
                  <div key={status}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{status}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {count}
                      </span>
                    </div>
                    <div style={{ height: "5px", background: "var(--bg-hover)", borderRadius: "999px", overflow: "hidden" }}>
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

          {/* Live Activity Feed */}
          <div className="glass-card animate-fade-up" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div className="live-dot" />
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Real-Time Dispatch Feed</div>
            </div>
            {activity.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)", margin: "0 auto 10px", display: "block" }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Listening for live transactions...</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {activity.map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", marginTop: "5px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
                        {item.message}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
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

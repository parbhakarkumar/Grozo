import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { playNotificationSound } from "../utils/sound";

// Status configuration
const STATUS_CONFIG = {
  "Order Placed":      { cls: "badge-info",    dot: "#3b82f6", label: "Order Placed" },
  Packing:             { cls: "badge-accent",  dot: "#6366f1", label: "Packing" },
  Shipped:             { cls: "badge-warning", dot: "#f59e0b", label: "Shipped" },
  "Out for delivery":  { cls: "badge-warning", dot: "#f59e0b", label: "Out for delivery" },
  Delivered:           { cls: "badge-success", dot: "#10b981", label: "Delivered (Verified)" },
  Cancelled:           { cls: "badge-danger",  dot: "#ef4444", label: "Cancelled" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { cls: "badge-muted", dot: "#64748b", label: status };
  return (
    <span className={`badge ${cfg.cls}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const COURIERS = ["Delhivery", "BlueDart", "Shadowfax", "DTDC", "Ekart", "Shiprocket", "Other"];

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [newOrderIds, setNewOrderIds] = useState(new Set());

  // Modal States
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [courierPartner, setCourierPartner] = useState("Delhivery");
  const [trackingId, setTrackingId] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);

  // OTP Modal
  const [otpModalOrder, setOtpModalOrder] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Timeline Modal
  const [timelineOrder, setTimelineOrder] = useState(null);

  const fetchAllOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );
      if (res.data.success) setOrders(res.data.orders);
      else toast.error(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e, order) => {
    const newStatus = e.target.value;

    // If attempting to mark as Delivered, require OTP verification to prevent fake delivery!
    if (newStatus === "Delivered" && !order.isOtpVerified) {
      setOtpModalOrder(order);
      setEnteredOtp("");
      return;
    }

    // If Shipped, open tracking modal if not already set
    if (newStatus === "Shipped" && !order.trackingId) {
      setTrackingModalOrder(order);
      setCourierPartner(order.courierPartner || "Delhivery");
      setTrackingId(order.trackingId || "");
      setTrackingUrl(order.trackingUrl || "");
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId: order._id, status: newStatus },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(`Status updated to "${newStatus}"`);
        setOrders((prev) =>
          prev.map((o) => (o._id === order._id ? res.data.order : o))
        );
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      toast.error("Please enter a tracking ID");
      return;
    }
    setSavingTracking(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/order/tracking`,
        {
          orderId: trackingModalOrder._id,
          courierPartner,
          trackingId: trackingId.trim(),
          trackingUrl: trackingUrl.trim() || `https://track.courier.com/${trackingId.trim()}`,
        },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Logistics tracking details assigned & status set to Shipped!");
        setOrders((prev) =>
          prev.map((o) => (o._id === trackingModalOrder._id ? res.data.order : o))
        );
        setTrackingModalOrder(null);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update tracking");
    } finally {
      setSavingTracking(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!enteredOtp.trim()) {
      toast.error("Please enter the 4-digit Delivery OTP");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/order/verify-otp`,
        {
          orderId: otpModalOrder._id,
          otp: enteredOtp.trim(),
        },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("✅ Delivery OTP Verified! Handover confirmed successfully.");
        setOrders((prev) =>
          prev.map((o) => (o._id === otpModalOrder._id ? res.data.order : o))
        );
        setOtpModalOrder(null);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP! Handover failed.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt("Reason for cancellation (Stock will be automatically restored):");
    if (reason === null) return;

    try {
      const res = await axios.post(
        `${backendUrl}/api/order/admin-cancel`,
        { orderId, reason: reason || "Cancelled by Admin" },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Order cancelled & inventory stock restored successfully.");
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.order : o))
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  // Real-time Socket.IO
  useEffect(() => {
    fetchAllOrders();
    if (!token) return;
    const socket = io(backendUrl, { transports: ["websocket", "polling"] });
    socket.on("connect", () => { socket.emit("join_admin"); });
    socket.on("new_order", (data) => {
      playNotificationSound();
      toast.info(
        `🔔 New Order from ${data.order?.address?.firstName || "Customer"} (${currency}${data.order?.amount})`,
        { autoClose: 5000 }
      );
      setOrders((prev) => {
        const exists = prev.some((o) => o._id === data.order._id);
        return exists
          ? prev.map((o) => (o._id === data.order._id ? data.order : o))
          : [data.order, ...prev];
      });
      setNewOrderIds((prev) => new Set([...prev, data.order._id]));
      setTimeout(() => {
        setNewOrderIds((prev) => {
          const n = new Set(prev);
          n.delete(data.order._id);
          return n;
        });
      }, 4000);
    });

    socket.on("order_status_updated", (data) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === data.orderId ? (data.order || { ...o, status: data.status }) : o))
      );
    });

    return () => socket.disconnect();
  }, [token]);

  // Filter + search
  const filtered = orders.filter((o) => {
    const name = `${o.address?.firstName || ""} ${o.address?.lastName || ""}`.toLowerCase();
    const tracking = (o.trackingId || "").toLowerCase();
    const matchSearch =
      search === "" ||
      name.includes(search.toLowerCase()) ||
      tracking.includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statuses = ["All", ...Object.keys(STATUS_CONFIG)];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1250px" }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
            Logistics & Delivery Operations
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Track courier shipments, verify deliveries via customer OTP (anti-fraud), and manage inventory returns.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              padding: "6px 14px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={fetchAllOrders}
            className="btn-ghost"
            style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 16px" }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Search + filter bar */}
      <div
        className="glass-card animate-fade-up"
        style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="orders-search"
            type="text"
            placeholder="Search by customer name or tracking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Status filters */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid",
                transition: "all 0.18s",
                ...(filterStatus === s
                  ? { background: "var(--accent-glow)", borderColor: "var(--accent)", color: "var(--accent-light)" }
                  : { background: "transparent", borderColor: "var(--border)", color: "var(--text-secondary)" }),
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Order list cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)", margin: "0 auto 14px", display: "block" }}>
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>No orders found</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>Try adjusting your search or status filter</div>
          </div>
        ) : (
          filtered.map((order, i) => {
            const isDelivered = order.status === "Delivered";
            const isCancelled = order.status === "Cancelled";
            const isHighRisk = order.riskScore === "HIGH";

            return (
              <div
                key={order._id || i}
                className={`glass-card animate-fade-up ${newOrderIds.has(order._id) ? "new-order-flash" : ""}`}
                style={{
                  padding: "22px 24px",
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 220px",
                  gap: "20px",
                  alignItems: "start",
                  borderLeft: isHighRisk
                    ? "4px solid #ef4444"
                    : isDelivered
                    ? "4px solid #10b981"
                    : "1px solid var(--border)",
                  animationDelay: `${i * 0.03}s`,
                }}
              >
                {/* Parcel Icon */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-md)",
                    background: isHighRisk ? "rgba(239,68,68,0.15)" : "var(--accent-glow)",
                    border: `1px solid ${isHighRisk ? "rgba(239,68,68,0.4)" : "rgba(99,102,241,0.2)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isHighRisk ? "#ef4444" : "#818cf8"} strokeWidth="1.8">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>

                {/* Main details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Top Badges */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    <span className={`badge ${order.payment ? "badge-success" : "badge-warning"}`}>
                      {order.payment ? "Paid" : "Unpaid"}
                    </span>
                    <span className="badge badge-muted">
                      {order.paymentMethod?.toUpperCase() || "COD"}
                    </span>
                    {isHighRisk && (
                      <span className="badge badge-danger" style={{ fontWeight: 700 }}>
                        ⚠️ HIGH RISK COD
                      </span>
                    )}
                    {order.deliveryOtp && (
                      <span
                        className="badge badge-accent"
                        title="Customer must provide this 4-digit OTP upon delivery"
                        style={{ fontFamily: "monospace", letterSpacing: "1px" }}
                      >
                        Delivery OTP: <strong>{order.deliveryOtp}</strong>
                      </span>
                    )}
                    {order.isOtpVerified && (
                      <span className="badge badge-success">
                        ✓ OTP Verified Delivery
                      </span>
                    )}
                  </div>

                  {/* Items list */}
                  <div>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                        <span style={{ color: "#f59e0b", fontWeight: 600 }}>{item.name}</span> ×{item.quantity}
                        {item.size && <span style={{ color: "var(--text-muted)" }}> ({item.size})</span>}
                      </div>
                    ))}
                  </div>

                  {/* Address & Customer */}
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                      {order.address?.firstName} {order.address?.lastName}
                    </div>
                    <div>{order.address?.street}, {order.address?.city}, {order.address?.state} — {order.address?.zipcode}</div>
                    {order.address?.phone && (
                      <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                        📞 {order.address.phone}
                      </div>
                    )}
                  </div>

                  {/* Tracking Info Section */}
                  {order.courierPartner && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border)",
                        fontSize: "12px",
                        display: "flex",
                        gap: "14px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        🚚 Courier: <strong>{order.courierPartner}</strong>
                      </div>
                      <div>
                        Tracking #: <strong style={{ color: "var(--accent-light)" }}>{order.trackingId}</strong>
                      </div>
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "var(--accent-light)", textDecoration: "underline", fontWeight: 600 }}
                        >
                          Open Live Tracking ↗
                        </a>
                      )}
                    </div>
                  )}

                  {/* Actions (Timeline, Tracking Button, Cancel) */}
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                    <button
                      onClick={() => {
                        setTrackingModalOrder(order);
                        setCourierPartner(order.courierPartner || "Delhivery");
                        setTrackingId(order.trackingId || "");
                        setTrackingUrl(order.trackingUrl || "");
                      }}
                      className="btn-ghost"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      📦 {order.trackingId ? "Edit Tracking" : "Attach Courier Tracking"}
                    </button>

                    <button
                      onClick={() => setTimelineOrder(order)}
                      className="btn-ghost"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      🕒 History ({order.statusHistory?.length || 1})
                    </button>

                    {!isDelivered && !isCancelled && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="btn-danger"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        Cancel & Restock
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Column: Price & Status Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "right" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total Amount</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                      {currency}{(order.amount || 0).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div style={{ textAlign: "left" }}>
                    <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "6px" }}>
                      Delivery Status
                    </label>
                    <div style={{ marginBottom: "8px" }}>
                      <StatusBadge status={order.status} />
                    </div>

                    {!isCancelled && (
                      <select
                        id={`order-status-${order._id}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(e, order)}
                        style={{ width: "100%", fontSize: "12px", padding: "8px", fontWeight: 600 }}
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Packing">Packing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Delivered">Delivered (Verify OTP)</option>
                      </select>
                    )}

                    {!isDelivered && !isCancelled && (
                      <button
                        onClick={() => {
                          setOtpModalOrder(order);
                          setEnteredOtp("");
                        }}
                        className="btn-primary"
                        style={{ marginTop: "8px", width: "100%", padding: "7px", fontSize: "11px" }}
                      >
                        🛡️ Verify OTP & Deliver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─────────────────────────────────────────────
          MODAL 1: Courier Tracking Assignment
      ───────────────────────────────────────────── */}
      {trackingModalOrder && (
        <div className="modal-overlay">
          <div className="glass-card animate-fade-up" style={{ maxWidth: "480px", width: "90%", padding: "28px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
              🚚 Assign Courier & Tracking
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Order #{trackingModalOrder._id.slice(-6)} · {trackingModalOrder.address?.firstName} {trackingModalOrder.address?.lastName}
            </p>

            <form onSubmit={handleSaveTracking} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Courier Partner *
                </label>
                <select
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {COURIERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  AWB / Tracking Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEL128947192"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Live Tracking URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://track.courier.com/AWB"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  disabled={savingTracking}
                  className="btn-primary"
                  style={{ flex: 1, padding: "10px" }}
                >
                  {savingTracking ? "Saving..." : "Save Tracking & Mark Shipped"}
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="btn-ghost"
                  style={{ padding: "10px 16px" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          MODAL 2: Anti-Fake Delivery OTP Verification
      ───────────────────────────────────────────── */}
      {otpModalOrder && (
        <div className="modal-overlay">
          <div className="glass-card animate-fade-up" style={{ maxWidth: "440px", width: "90%", padding: "28px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🛡️</div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
              Anti-Fraud Delivery Verification
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "18px", lineHeight: "1.5" }}>
              To prevent fake delivery marking, enter the <strong>4-digit OTP</strong> provided to customer <strong>{otpModalOrder.address?.firstName}</strong>.
            </p>

            <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="• • • •"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                  style={{
                    width: "160px",
                    textAlign: "center",
                    fontSize: "24px",
                    letterSpacing: "8px",
                    fontWeight: 800,
                    padding: "10px",
                  }}
                  autoFocus
                  required
                />
              </div>

              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Demo hint: The OTP for this order is <code style={{ color: "var(--accent-light)", fontWeight: 700 }}>{otpModalOrder.deliveryOtp}</code>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="btn-primary"
                  style={{ flex: 1, padding: "11px" }}
                >
                  {verifyingOtp ? "Verifying..." : "Verify OTP & Confirm Delivery"}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpModalOrder(null)}
                  className="btn-ghost"
                  style={{ padding: "11px 16px" }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          MODAL 3: Status History Timeline
      ───────────────────────────────────────────── */}
      {timelineOrder && (
        <div className="modal-overlay">
          <div className="glass-card animate-fade-up" style={{ maxWidth: "500px", width: "90%", padding: "28px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
              🕒 Shipment Timeline & Audit Log
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Order #{timelineOrder._id.slice(-6)} · {timelineOrder.address?.firstName} {timelineOrder.address?.lastName}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "320px", overflowY: "auto", paddingRight: "8px" }}>
              {timelineOrder.statusHistory?.map((entry, idx) => (
                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent)", marginTop: "4px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {entry.status}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                      {entry.note || "Status updated"}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "3px" }}>
                      {new Date(entry.timestamp).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setTimelineOrder(null)}
              className="btn-ghost"
              style={{ width: "100%", marginTop: "20px", padding: "10px" }}
            >
              Close History
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default Orders;

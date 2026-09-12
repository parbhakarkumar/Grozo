import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { Search, RefreshCw, Filter, CheckCircle2, Truck, Package, Clock, XCircle, Eye, ChevronDown } from "lucide-react";

const currency = "₹";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const STATUS_COLOR = {
  Pending:          "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "Order Placed":   "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Confirmed:        "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Processing:       "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  Packing:          "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  Shipped:          "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "Out for Delivery": "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "Out for delivery": "bg-orange-500/15 text-orange-300 border-orange-500/30",
  Delivered:        "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Cancelled:        "bg-red-500/15 text-red-300 border-red-500/30",
};

const STATUS_ICON = {
  Pending:          Clock,
  "Order Placed":   Clock,
  Confirmed:        CheckCircle2,
  Processing:       Package,
  Packing:          Package,
  Shipped:          Truck,
  "Out for Delivery": Truck,
  "Out for delivery": Truck,
  Delivered:        CheckCircle2,
  Cancelled:        XCircle,
};

const AdminOrders = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.post(backendUrl + "/api/order/list", {}, { headers: { token } });
      if (res.data.success) {
        const sorted = [...(res.data.orders || [])].sort(
          (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        );
        setOrders(sorted);
        setFiltered(sorted);
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [token]);

  useEffect(() => {
    let result = [...orders];
    if (statusFilter !== "All") result = result.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o._id?.toLowerCase().includes(q) ||
        `${o.address?.firstName} ${o.address?.lastName}`.toLowerCase().includes(q) ||
        o.address?.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, orders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: newStatus },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(`Status updated to "${newStatus}"`);
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const counts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-5 max-w-[1400px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white">Orders Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {filtered.length} of {orders.length} total orders
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {["All", ...ORDER_STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === s
                ? "bg-cyan-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {s}
            {s !== "All" && (
              <span className="ml-1.5 opacity-60">({counts[s] || 0})</span>
            )}
            {s === "All" && <span className="ml-1.5 opacity-60">({orders.length})</span>}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 max-w-md">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Search by order ID or customer name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-slate-500 outline-none flex-1"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {["Order ID","Customer","Items","Amount","Payment","Status","Tracking ID","Update Status","Live Map","Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(10).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3 bg-slate-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-500">
                    No orders match your filter
                  </td>
                </tr>
              ) : filtered.map(order => {
                const Icon = STATUS_ICON[order.status] || Clock;
                return (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] text-slate-400">
                          #{order._id?.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs font-semibold text-white">
                          {order.address?.firstName} {order.address?.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500">{order.address?.city}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {order.items?.length || 0} items
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          className="ml-1 text-slate-600 hover:text-slate-400"
                        >
                          <Eye className="w-3 h-3 inline" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs font-black text-white whitespace-nowrap">
                        {currency}{order.amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${order.payment ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                            {order.payment ? (order.paymentMethod === "UPI" ? "Paid (UPI)" : "Paid") : "Pending (COD)"}
                          </span>
                          {order.transactionId && (
                            <span className="text-[9px] font-mono text-cyan-400">
                              UTR: {order.transactionId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 shrink-0" style={{
                            color: order.status === "Delivered" ? "#10b981"
                              : order.status === "Cancelled" ? "#ef4444"
                              : order.status === "Shipped" ? "#f59e0b"
                              : "#6366f1"
                          }} />
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${STATUS_COLOR[order.status] || "bg-slate-800 text-slate-400 border-slate-700"}`}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/20">
                          {order.trackingId || "TRK-PENDING"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order._id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-white text-[10px] rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:bg-slate-700 transition-all"
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => window.location.assign(`/admin/tracking/${order._id}`)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-[10px] font-black transition-all"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Live Map</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(order.date || order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short"
                        })}
                      </td>
                    </tr>

                    {/* Expanded row with items */}
                    {expandedOrder === order._id && (
                      <tr>
                        <td colSpan={8} className="px-4 pb-4">
                          <div className="bg-slate-800/60 rounded-xl p-3 space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Order Items</p>
                            {(order.items || []).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                {item.image?.[0] && (
                                  <img src={item.image[0]} alt={item.name} className="w-8 h-8 object-cover rounded-lg" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-white font-medium truncate">{item.name}</p>
                                  <p className="text-[10px] text-slate-500">
                                    Qty: {item.quantity} · Size: {item.size || "—"} · {currency}{item.price}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-slate-700 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-[10px] text-slate-400">
                                  <span className="font-bold text-white">Ship to:</span>{" "}
                                  {order.address?.firstName} {order.address?.lastName},{" "}
                                  {order.address?.street}, {order.address?.city},{" "}
                                  {order.address?.state} - {order.address?.zipcode}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  <span className="font-bold text-white">Phone:</span> {order.address?.phone}
                                </p>
                              </div>
                              {order.transactionId && (
                                <div className="text-right">
                                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/50 block">
                                    UPI Ref / UTR: {order.transactionId}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;

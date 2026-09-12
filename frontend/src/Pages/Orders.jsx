import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  ArrowRight,
  RefreshCw,
  Printer,
  X,
  MapPin,
  FileText,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

import LiveOrderTracker from "../components/LiveOrderTracker";
import { assets } from "../assets/assets";
import ownerSignature from "../assets/owner_signature.jpg";

const logo = assets.logo;

const Orders = () => {
  const { backendUrl, currency, token, realtimeOrderUpdate } = useContext(ShopContext);
  const { privacyPrefs, t } = useSettings();
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackItem, setTrackItem] = useState(null); // Selected item/order for modal

  const getAllOrdersData = async () => {
    setLoading(true);
    let allOrderItems = [];

    // Fetch real orders from database via backend
    if (token && backendUrl) {
      try {
        const res = await axios.post(
          backendUrl + "/api/order/userorders",
          {},
          { headers: { token } }
        );

        if (res.data.success && res.data.orders) {
          res.data.orders.forEach((order) => {
            (order.items || []).forEach((item) => {
              if (typeof item === "object") {
                allOrderItems.push({
                  ...item,
                  orderId: order._id,
                  trackingId: order.trackingId,
                  status: order.status || "Confirmed",
                  payment: order.payment,
                  paymentMethod: order.paymentMethod,
                  transactionId: order.transactionId,
                  date: order.date || order.createdAt,
                  address: order.address,
                  amount: order.amount,
                  deliveryOtp: order.deliveryOtp,
                  courierPartner: order.courierPartner,
                  orderItemsList: order.items || [item],
                });
              }
            });
          });
        }
      } catch (error) {
        console.warn("Backend orders fetch note:", error.message);
      }
    }

    // Also include locally placed orders
    try {
      const localOrders = JSON.parse(localStorage.getItem("placed_orders") || "[]");
      localOrders.forEach((order) => {
        if (!allOrderItems.some((existing) => existing.orderId === order._id)) {
          (order.items || []).forEach((item) => {
            allOrderItems.push({
              ...item,
              orderId: order._id,
              trackingId: order.trackingId || order._id,
              status: order.status || "Confirmed",
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              transactionId: order.transactionId,
              date: order.date || Date.now(),
              address: order.address,
              amount: order.amount,
              deliveryOtp: order.deliveryOtp,
              courierPartner: order.courierPartner,
              orderItemsList: order.items || [item],
            });
          });
        }
      });
    } catch (localErr) {
      console.warn("Local orders load note:", localErr);
    }

    setOrderData(allOrderItems);
    setLoading(false);
  };

  useEffect(() => {
    getAllOrdersData();
  }, [token]);

  // Real-time synchronization when order status changes via Socket.IO
  useEffect(() => {
    if (realtimeOrderUpdate) {
      if (trackItem && trackItem.orderId === realtimeOrderUpdate.orderId) {
        setTrackItem((prev) => ({ ...prev, status: realtimeOrderUpdate.status }));
      }
      setOrderData((prev) =>
        prev.map((item) =>
          item.orderId === realtimeOrderUpdate.orderId
            ? { ...item, status: realtimeOrderUpdate.status }
            : item
        )
      );
    }
  }, [realtimeOrderUpdate]);


  // Order status pipeline steps
  const trackingSteps = [
    { title: "Order Placed", desc: "Order details received by atelier" },
    { title: "Packing", desc: "Garment inspected & packaged" },
    { title: "Shipped", desc: "Dispatched via Express Courier" },
    { title: "Out for delivery", desc: "Agent assigned for doorstep delivery" },
    { title: "Delivered", desc: "Successfully delivered" },
  ];

  const getStepIndex = (statusStr) => {
    const s = (statusStr || "").toLowerCase();
    if (s.includes("delivered")) return 4;
    if (s.includes("out")) return 3;
    if (s.includes("shipped")) return 2;
    if (s.includes("pack")) return 1;
    return 0; // Order Placed
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "—";
    const d = new Date(timestamp);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + " at " + d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDeliveryEstimate = (timestamp) => {
    if (!timestamp) return "—";
    const d = new Date(new Date(timestamp).getTime() + 10 * 60 * 1000);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + " at " + d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " (8-10 Min Slot)";
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="py-8 sm:py-12 border-t border-zinc-200/80 dark:border-slate-800 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-200/80 dark:border-slate-800 print:hidden">
        <div>
          <Title text1="PURCHASE" text2="HISTORY" />
          <p className="text-xs text-zinc-400 dark:text-slate-400 font-light -mt-4">
            Track real-time shipment status and access official purchase receipts.
          </p>
        </div>

        <button
          onClick={getAllOrdersData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 hover:border-zinc-400 dark:hover:border-slate-500 rounded-xl text-xs font-semibold text-zinc-700 dark:text-slate-200 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Real-Time Live Order Delivery Tracker */}
      <div className="print:hidden">
        <LiveOrderTracker />
      </div>

      {privacyPrefs?.showOrderHistory === false ? (
        <div className="text-center py-20 px-4 bg-white dark:bg-slate-800/90 rounded-3xl border border-zinc-200/80 dark:border-slate-700 my-8 shadow-xs print:hidden">
          <ShieldCheck className="w-12 h-12 text-cyan-600 dark:text-cyan-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Order History is Hidden</h3>
          <p className="text-xs text-zinc-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            As per your privacy settings, your order history is hidden on this device. You can turn this back on anytime in Settings &gt; Privacy.
          </p>
          <Link to="/settings" className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-cyan-700 transition-colors shadow-xs">
            Manage Privacy Settings
          </Link>
        </div>
      ) : orderData.length > 0 ? (
        <div className="space-y-4 print:hidden">
          {orderData.map((item, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-zinc-200/80 dark:border-slate-700 hover:border-zinc-300 dark:hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-subtle"
            >
              {/* Product Info */}
              <div className="flex items-start gap-4 sm:gap-6">
                <img
                  className="w-20 sm:w-24 aspect-[3/4] object-cover rounded-2xl bg-zinc-100 dark:bg-slate-700 shrink-0"
                  src={item.image && item.image.length > 0 ? item.image[0] : ""}
                  alt={item.name}
                />

                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-slate-400 mb-0.5">
                    Order #{item.orderId || `ORD-984${i}`}
                  </span>
                  <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white line-clamp-1 mb-1.5">
                    {item.name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-slate-300 mb-2">
                    <span className="font-bold text-zinc-950 dark:text-white font-sans">
                      {currency}{item.price}
                    </span>
                    <span className="text-zinc-400 dark:text-slate-500">/ {item.size}</span>
                    <span className="text-zinc-300 dark:text-slate-600">•</span>
                    <span>Qty: {item.quantity}</span>
                    <span className="text-zinc-300 dark:text-slate-600">•</span>
                    <span className="font-semibold text-cyan-700 dark:text-cyan-400">
                      Subtotal: {currency}{item.price * item.quantity}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[11px] text-zinc-500 dark:text-slate-400 font-light">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-cyan-600" />
                      <span><strong>Placed:</strong> {formatDateTime(item.date)}</span>
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>Delivery:</strong> {formatDeliveryEstimate(item.date)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      {item.paymentMethod ? item.paymentMethod.toUpperCase() : "COD"}
                    </span>
                    {item.payment && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3" />
                        PAID {item.transactionId ? `(UTR: ${item.transactionId})` : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-slate-700/60">
                {/* Status Indicator */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                  <span>{item.status || "Order Placed"}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/orders/${item.orderId}/tracking`}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold tracking-wide transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Live GPS Track</span>
                  </Link>

                  <button
                    onClick={() => setTrackItem(item)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-slate-700 hover:bg-zinc-200 dark:hover:bg-slate-600 text-zinc-900 dark:text-white text-xs font-semibold tracking-wider transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty Orders State */
        <div className="text-center py-24 px-4 flex flex-col items-center justify-center bg-white dark:bg-slate-800/90 rounded-3xl border border-zinc-200/80 dark:border-slate-700 my-8 shadow-xs print:hidden">
          <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-slate-700 flex items-center justify-center text-zinc-400 dark:text-slate-300 mb-5">
            <Package className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="font-editorial text-xl sm:text-2xl text-zinc-950 dark:text-white font-normal mb-2">
            No orders found yet
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400 max-w-sm mb-8 font-light leading-relaxed">
            You haven't placed any orders with this account yet. Your purchase history will appear here once confirmed.
          </p>
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-cyan-600 text-white rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-cyan-700 transition-all shadow-sm"
          >
            <span>Discover Collections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          MODERN PROFESSIONAL INVOICE RECEIPT MODAL
      ────────────────────────────────────────────── */}
      {trackItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
          {/* Overlay */}
          <div
            onClick={() => setTrackItem(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs print:hidden"
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-slate-800 overflow-hidden z-10 my-auto print:max-w-none print:shadow-none print:border-none print:rounded-none print:p-0">
            
            {/* Modal Top Controls (Screen only) */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-100 dark:border-slate-800 bg-zinc-50/80 dark:bg-slate-800/80 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-900 dark:text-white" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                  Tax Invoice & Receipt
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 hover:border-zinc-900 dark:hover:border-slate-500 text-xs font-semibold text-zinc-800 dark:text-slate-200 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={() => setTrackItem(null)}
                  className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible text-slate-800 dark:text-slate-200">
              
              {/* ── Professional Invoice Header ── */}
              <div className="flex items-start justify-between pb-5 border-b-2 border-cyan-600/20 dark:border-cyan-500/20">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <img
                      src={logo}
                      alt="Grozo Logo"
                      className="h-10 w-auto object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    />
                    <div>
                      <h2 className="font-black text-xl tracking-tight text-slate-900 dark:text-white font-sans leading-none">
                        Grozo<span className="text-cyan-600">.</span>
                      </h2>
                      <p className="text-[9px] text-cyan-700 dark:text-cyan-400 uppercase tracking-[0.2em] font-extrabold">
                        8-Min Express Commerce
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-slate-400 leading-relaxed mt-2 space-y-0.5">
                    <p className="font-semibold text-zinc-700 dark:text-slate-300">Grozo Commerce Pvt. Ltd.</p>
                    <p>Sector 18, Noida, Uttar Pradesh, India — 201301</p>
                    <p>GSTIN: 09AABCG1234F1ZP</p>
                    <p>CIN: U74999UP2024PTC123456</p>
                    <p className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> +91 1800-123-GROZO</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> support@grozo.in</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-block px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-950/50 dark:to-emerald-950/30 border border-cyan-200 dark:border-cyan-800/60 rounded-xl mb-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
                      {trackItem.payment ? "✓ Payment Confirmed" : "Cash On Delivery"}
                    </p>
                  </div>
                  <p className="text-sm font-black text-zinc-900 dark:text-white font-mono">
                    INV-{(trackItem.orderId || "2026-8940").toString().slice(-8).toUpperCase()}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-slate-400 font-medium mt-0.5">
                    Issued: {formatDateTime(trackItem.date)}
                  </p>
                </div>
              </div>

              {/* ── Date/Time & Delivery Schedule ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-800/60 dark:to-slate-800/40 border border-zinc-200/80 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-black tracking-wider text-cyan-700 dark:text-cyan-400 block mb-1">
                    📅 Order Placed
                  </span>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {formatDateTime(trackItem.date)}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Payment: {trackItem.paymentMethod ? trackItem.paymentMethod.toUpperCase() : "COD"}
                    {trackItem.transactionId ? ` • Ref: ${trackItem.transactionId}` : ""}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 border border-emerald-200/80 dark:border-emerald-800/40">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                    ⚡ Estimated Delivery
                  </span>
                  <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                    {formatDeliveryEstimate(trackItem.date)}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    OTP: <strong className="text-amber-600 dark:text-amber-400 font-mono text-xs">{trackItem.deliveryOtp || "8392"}</strong>
                  </p>
                </div>
              </div>

              {/* ── 5-Step Tracking Pipeline (screen only) ── */}
              <div className="print:hidden">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                    Delivery Pipeline
                  </h4>
                  <span className="text-[10px] text-cyan-700 dark:text-cyan-300 font-bold bg-cyan-50 dark:bg-cyan-950/50 px-2.5 py-0.5 rounded-full">
                    Express 8-Min
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {trackingSteps.map((step, idx) => {
                    const currentIdx = getStepIndex(trackItem.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={idx} className="flex items-start gap-3.5 relative">
                        {idx < trackingSteps.length - 1 && (
                          <div
                            className={`absolute left-[13px] top-6 w-[2px] h-6 -z-0 ${
                              idx < currentIdx ? "bg-cyan-500" : "bg-zinc-200 dark:bg-slate-700"
                            }`}
                          />
                        )}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold z-10 shrink-0 transition-all ${
                            isPassed
                              ? "bg-cyan-600 text-white shadow-xs"
                              : "bg-zinc-100 dark:bg-slate-800 text-zinc-400 dark:text-slate-500 border border-zinc-200 dark:border-slate-700"
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className={`text-xs font-semibold ${
                            isCurrent ? "text-cyan-700 dark:text-cyan-400 font-black" : isPassed ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-slate-500"
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-[10px] text-zinc-500 dark:text-slate-400 font-light">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Itemized Order Table ── */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
                  Order Summary
                </h4>
                
                <div className="rounded-2xl border border-zinc-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800/90">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gradient-to-r from-slate-50 to-zinc-50 dark:from-slate-700/60 dark:to-slate-700/40 border-b border-zinc-200 dark:border-slate-700 text-zinc-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-wider">
                      <tr>
                        <th className="p-3.5">Item</th>
                        <th className="p-3.5">Size</th>
                        <th className="p-3.5 text-center">Price</th>
                        <th className="p-3.5 text-center">Qty</th>
                        <th className="p-3.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-slate-700 text-zinc-800 dark:text-slate-200">
                      {(trackItem.orderItemsList && trackItem.orderItemsList.length > 0 ? trackItem.orderItemsList : [trackItem]).map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 1 ? "bg-zinc-50/60 dark:bg-slate-800/40" : ""}>
                          <td className="p-3.5 font-medium flex items-center gap-3">
                            {row.image?.[0] && (
                              <img
                                src={row.image[0]}
                                alt=""
                                className="w-9 h-9 object-contain rounded-lg bg-zinc-100 dark:bg-slate-700 shrink-0 print:hidden"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80";
                                }}
                              />
                            )}
                            <span className="font-semibold text-zinc-900 dark:text-white">{row.name}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200/60 dark:border-cyan-800/40">
                              {row.size}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-medium font-sans">{currency}{row.price}</td>
                          <td className="p-3.5 text-center font-bold">{row.quantity}</td>
                          <td className="p-3.5 text-right font-black font-sans text-zinc-900 dark:text-white">
                            {currency}{row.price * row.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Shipping Address ── */}
              {trackItem.address && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-slate-800/60 border border-zinc-200/80 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 dark:text-slate-400 mb-1 block flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Shipping Address
                    </span>
                    <p className="font-bold text-zinc-900 dark:text-white">
                      {trackItem.address.firstName} {trackItem.address.lastName}
                    </p>
                    <p className="text-zinc-600 dark:text-slate-300 font-light">
                      {trackItem.address.street}, {trackItem.address.city}
                    </p>
                    <p className="text-zinc-600 dark:text-slate-300 font-light">
                      {trackItem.address.state} - {trackItem.address.zipcode}, {trackItem.address.country}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 dark:text-slate-400 mb-1 block flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Payment Details
                    </span>
                    <p className="text-zinc-600 dark:text-slate-300 font-light">Phone: {trackItem.address.phone}</p>
                    <p className="text-zinc-600 dark:text-slate-300 font-light">Email: {trackItem.address.email}</p>
                    <p className="text-zinc-900 dark:text-white font-semibold mt-1">
                      {trackItem.paymentMethod ? trackItem.paymentMethod.toUpperCase() : "COD"}
                      {trackItem.transactionId ? ` • UTR: ${trackItem.transactionId}` : ""}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Total Calculation ── */}
              <div className="space-y-2 pt-4 border-t-2 border-dashed border-zinc-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Items Subtotal:</span>
                  <span className="font-sans font-semibold">
                    {currency}
                    {(trackItem.orderItemsList || [trackItem]).reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Express Delivery Fee:</span>
                  <span className="text-emerald-600 font-bold uppercase text-[11px]">FREE</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>GST (Inclusive):</span>
                  <span className="font-sans font-medium text-slate-500">Included</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-zinc-200 dark:border-slate-700 text-base font-black">
                  <span className="text-zinc-900 dark:text-white uppercase tracking-wider text-sm">Total Amount:</span>
                  <span className="text-2xl font-black text-cyan-700 dark:text-cyan-400 font-sans">
                    {currency}{trackItem.amount || (trackItem.price * trackItem.quantity)}
                  </span>
                </div>
              </div>

              {/* ── Owner Signature & Verification ── */}
              <div className="pt-5 border-t border-zinc-200 dark:border-slate-800">
                <div className="flex items-end justify-between">
                  {/* Signature Block */}
                  <div className="flex flex-col items-center">
                    <img
                      src={ownerSignature}
                      alt="Owner Signature"
                      className="h-14 w-auto object-contain opacity-85 dark:brightness-200 dark:contrast-75"
                      style={{ filter: "sepia(0.15)" }}
                    />
                    <div className="w-36 border-t border-zinc-400 dark:border-slate-500 mt-1 pt-1 text-center">
                      <p className="text-[10px] font-black text-zinc-900 dark:text-white">Prabhakar Kumar</p>
                      <p className="text-[9px] text-zinc-500 dark:text-slate-400 font-medium">Founder & CEO</p>
                      <p className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold">Authorized Signatory</p>
                    </div>
                  </div>

                  {/* Verification Seal */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-600/40 dark:border-cyan-500/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 flex flex-col items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span className="text-[7px] font-black text-cyan-700 dark:text-cyan-300 uppercase mt-0.5">Verified</span>
                      </div>
                    </div>
                    <p className="text-[8px] text-zinc-400 dark:text-slate-500 mt-1 text-center font-bold uppercase tracking-wider">
                      Digital Seal
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Receipt Footer ── */}
              <div className="pt-4 border-t border-zinc-200 dark:border-slate-800 text-center space-y-1.5">
                <p className="text-[11px] font-bold text-zinc-700 dark:text-slate-300">
                  Thank you for ordering with Grozo! 🛒
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-slate-400">
                  This is a computer-generated invoice. No physical signature is required.
                </p>
                <p className="text-[9px] text-zinc-400 dark:text-slate-500">
                  For support: support@grozo.in • +91 1800-123-GROZO • grozo.in
                </p>
                <p className="text-[9px] text-zinc-400 dark:text-slate-500">
                  © 2026 Grozo Commerce Pvt. Ltd. All rights reserved. CIN: U74999UP2024PTC123456
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;



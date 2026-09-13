import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useLocation, useSearchParams } from "react-router-dom";
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
  const { backendUrl, currency, token, realtimeOrderUpdate, products } = useContext(ShopContext);
  const { privacyPrefs, t } = useSettings();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackItem, setTrackItem] = useState(null); // Selected item/order for modal

  // Helper to normalize receipt items and ensure complete product data and prices
  const getReceiptItems = (order) => {
    if (!order) return [];
    const rawItems =
      order.orderItemsList && order.orderItemsList.length > 0
        ? order.orderItemsList
        : order.items && order.items.length > 0
        ? order.items
        : [order];

    return rawItems.map((item, index) => {
      // Find matching product in catalog
      const matched = (products || []).find(
        (p) =>
          String(p._id) === String(item.productId || item._id) ||
          p.name?.toLowerCase() === item.name?.toLowerCase()
      );

      const name =
        item.name && item.name !== "Item"
          ? item.name
          : matched?.name || item.name || "Grocery Essential";

      const price = Number(
        item.price != null && item.price > 0
          ? item.price
          : matched?.price || 0
      );

      const quantity = Math.max(1, Number(item.quantity || 1));
      const size = item.size || item.packSize || matched?.sizes?.[0] || "Standard";
      const image =
        item.image && item.image.length > 0
          ? Array.isArray(item.image)
            ? item.image[0]
            : item.image
          : matched?.image && matched.image.length > 0
          ? Array.isArray(matched.image)
            ? matched.image[0]
            : matched.image
          : "";

      return {
        key: item._id || item.productId || `item-${index}`,
        name,
        size,
        price,
        quantity,
        subtotal: price * quantity,
        image,
      };
    });
  };

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

    const targetOrderId = location.state?.showReceiptForOrderId || searchParams.get("receipt");
    if (targetOrderId && allOrderItems.length > 0) {
      const match = allOrderItems.find(
        (o) => String(o.orderId) === String(targetOrderId) || String(o._id) === String(targetOrderId)
      );
      if (match) {
        setTrackItem(match);
      }
    }
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

  useEffect(() => {
    const targetOrderId = location.state?.showReceiptForOrderId || searchParams.get("receipt");
    if (targetOrderId && orderData.length > 0 && !trackItem) {
      const match = orderData.find(
        (o) => String(o.orderId) === String(targetOrderId) || String(o._id) === String(targetOrderId)
      );
      if (match) {
        setTrackItem(match);
      }
    }
  }, [location.state, searchParams, orderData]);


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

  const receiptItems = trackItem ? getReceiptItems(trackItem) : [];
  const itemsSubtotal = receiptItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const orderAmount = Number(trackItem?.amount || itemsSubtotal || 0);
  const discountAmount = Number(
    trackItem?.discountAmount || (itemsSubtotal > orderAmount ? itemsSubtotal - orderAmount : 0)
  );

  return (
    <div className="py-8 sm:py-12 border-t border-zinc-200/80 dark:border-slate-800 animate-fade-in">
      
      {/* ── Main Order History View (Hidden when printing invoice) ── */}
      <div className="print:hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-200/80 dark:border-slate-800">
          <div>
            <Title text1="PURCHASE" text2="HISTORY" />
            <p className="text-xs text-zinc-400 dark:text-slate-400 font-light -mt-4">
              Track real-time shipment status and access official purchase receipts.
            </p>
          </div>

          <button
            onClick={getAllOrdersData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 hover:border-zinc-400 dark:hover:border-slate-500 rounded-xl text-xs font-semibold text-zinc-700 dark:text-slate-200 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Real-Time Live Order Delivery Tracker */}
        <div>
          <LiveOrderTracker />
        </div>

        {privacyPrefs?.showOrderHistory === false ? (
          <div className="text-center py-20 px-4 bg-white dark:bg-slate-800/90 rounded-3xl border border-zinc-200/80 dark:border-slate-700 my-8 shadow-xs">
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
          <div className="space-y-4">
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
                  <div className="space-y-2 flex-1">
                    <div>
                      <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase">
                        Order #{item.trackingId ? item.trackingId.slice(-8) : item.orderId ? item.orderId.slice(-8) : "2026"}
                      </p>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                        {item.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-slate-300">
                      <span className="font-semibold text-zinc-900 dark:text-white font-sans text-sm">
                        {currency}{item.price}
                      </span>
                      <span>•</span>
                      <span>Qty: {item.quantity}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-slate-700 text-zinc-800 dark:text-slate-200 text-[10px] font-medium">
                        {item.size}
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
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    <span>{item.status || "Order Placed"}</span>
                  </div>

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
                      className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-slate-700 hover:bg-zinc-200 dark:hover:bg-slate-600 text-zinc-900 dark:text-white text-xs font-semibold tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
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
          <div className="text-center py-24 px-4 flex flex-col items-center justify-center bg-white dark:bg-slate-800/90 rounded-3xl border border-zinc-200/80 dark:border-slate-700 my-8 shadow-xs">
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
      </div>

      {/* ─────────────────────────────────────────────
          MODERN OFFICIAL 1-PAGE TAX RECEIPT MODAL
      ────────────────────────────────────────────── */}
      {trackItem && (
        <div 
          id="receipt-modal-wrapper"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in print:static print:inset-auto print:p-0 print:m-0 print:overflow-visible print:bg-white print:block"
        >
          {/* Backdrop Overlay (Screen only) */}
          <div
            onClick={() => setTrackItem(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs print:hidden"
          />

          {/* Printable Invoice Card */}
          <div 
            id="printable-receipt-card"
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-slate-800 overflow-hidden z-10 my-auto print:max-w-none print:shadow-none print:border-none print:rounded-none print:p-0 print:m-0 print:bg-white print:text-black"
          >
            
            {/* Modal Top Controls Bar (Screen only) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-100 dark:border-slate-800 bg-zinc-50/80 dark:bg-slate-800/80 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-900 dark:text-white" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                  Tax Invoice & Official Receipt
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={() => setTrackItem(null)}
                  className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Content Container (Compact for 1-Page Print) */}
            <div className="p-4 sm:p-6 space-y-3 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 print:space-y-2 text-slate-800 dark:text-slate-200 print:text-black">
              
              {/* ── Header: Brand + Company + Invoice ID ── */}
              <div className="flex items-start justify-between pb-3 border-b-2 border-cyan-600/30 print:border-cyan-600/60 print:pb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={logo}
                      alt="Grozo"
                      className="h-8 sm:h-9 w-auto object-contain print:h-7"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    />
                    <div>
                      <h2 className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white print:text-black font-sans leading-none">
                        Grozo<span className="text-cyan-600">.</span>
                      </h2>
                      <p className="text-[8px] sm:text-[9px] text-cyan-700 dark:text-cyan-400 print:text-cyan-800 uppercase tracking-[0.2em] font-extrabold">
                        8-Min Express Commerce
                      </p>
                    </div>
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-slate-400 print:text-zinc-700 leading-tight space-y-0.5">
                    <p className="font-semibold text-zinc-700 dark:text-slate-300 print:text-black">Grozo Commerce Pvt. Ltd. • GSTIN: 09AABCG1234F1ZP</p>
                    <p>Sector 18, Noida, Uttar Pradesh, India — 201301</p>
                    <p>support@grozo.in • +91 1800-123-GROZO • grozo.in</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-block px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/50 print:bg-cyan-50 border border-cyan-200 dark:border-cyan-800/60 print:border-cyan-300 rounded-lg mb-1">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-cyan-800 dark:text-cyan-300 print:text-cyan-900">
                      {trackItem.payment ? "✓ Payment Confirmed" : "Cash On Delivery"}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white print:text-black font-mono">
                    INV-{(trackItem.orderId || trackItem._id || "2026-8940").toString().slice(-8).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-slate-400 print:text-zinc-600 font-medium">
                    Issued: {formatDateTime(trackItem.date)}
                  </p>
                </div>
              </div>

              {/* ── Quick Order & Dispatch Metadata Strip ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 print:bg-slate-50 border border-slate-200/80 dark:border-slate-700 print:border-slate-300 text-[10px] sm:text-[11px]">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 print:text-zinc-600 block">
                    Order Ref
                  </span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white print:text-black truncate">
                    {(trackItem.orderId || trackItem._id || "—").toString().slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 print:text-zinc-600 block">
                    Placed Date
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                    {formatDateTime(trackItem.date)}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    Delivery Slot
                  </span>
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 print:text-emerald-800">
                    8-10 Min Express
                  </p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-amber-700 dark:text-amber-400 block">
                    Delivery OTP
                  </span>
                  <p className="font-mono font-black text-amber-600 dark:text-amber-400 print:text-amber-800">
                    {trackItem.deliveryOtp || "8392"}
                  </p>
                </div>
              </div>

              {/* ── 5-Step Delivery Pipeline (Screen only) ── */}
              <div className="print:hidden p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                    Live Order Pipeline
                  </h4>
                  <span className="text-[9px] text-cyan-700 dark:text-cyan-300 font-bold bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded-full">
                    Express 8-Min
                  </span>
                </div>

                <div className="space-y-2 pt-0.5">
                  {trackingSteps.map((step, idx) => {
                    const currentIdx = getStepIndex(trackItem.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={idx} className="flex items-start gap-2.5 relative">
                        {idx < trackingSteps.length - 1 && (
                          <div
                            className={`absolute left-[11px] top-5 w-[2px] h-4 -z-0 ${
                              idx < currentIdx ? "bg-cyan-500" : "bg-zinc-200 dark:bg-slate-700"
                            }`}
                          />
                        )}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold z-10 shrink-0 transition-all ${
                            isPassed
                              ? "bg-cyan-600 text-white shadow-xs"
                              : "bg-zinc-100 dark:bg-slate-800 text-zinc-400 dark:text-slate-500 border border-zinc-200 dark:border-slate-700"
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className={`text-[11px] font-semibold ${
                            isCurrent ? "text-cyan-700 dark:text-cyan-400 font-black" : isPassed ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-slate-500"
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-[9px] text-zinc-500 dark:text-slate-400 font-light">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Itemized Product Table (Filled with product data & price) ── */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white print:text-black">
                    Itemized Products ({receiptItems.length} {receiptItems.length === 1 ? "Item" : "Items"})
                  </h4>
                  <span className="text-[10px] text-zinc-400 dark:text-slate-400 print:hidden">
                    Prices in Indian Rupee ({currency})
                  </span>
                </div>
                
                <div className="rounded-xl border border-zinc-200 dark:border-slate-700 print:border-slate-300 overflow-hidden bg-white dark:bg-slate-800/90 print:bg-white">
                  <table className="w-full text-left text-xs print:text-[11px]">
                    <thead className="bg-slate-50 dark:bg-slate-700/60 print:bg-slate-100 border-b border-zinc-200 dark:border-slate-700 print:border-slate-300 text-zinc-600 dark:text-slate-400 print:text-black uppercase text-[9px] sm:text-[10px] font-black tracking-wider">
                      <tr>
                        <th className="py-2 px-3">Product Description</th>
                        <th className="py-2 px-2 text-center">Pack</th>
                        <th className="py-2 px-2 text-center">Unit Price</th>
                        <th className="py-2 px-2 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-slate-700 print:divide-slate-200 text-zinc-800 dark:text-slate-200 print:text-black">
                      {receiptItems.map((row, rIdx) => (
                        <tr key={row.key || rIdx} className={rIdx % 2 === 1 ? "bg-zinc-50/40 dark:bg-slate-800/30 print:bg-slate-50/50" : ""}>
                          <td className="py-1.5 sm:py-2 px-3 font-medium flex items-center gap-2">
                            {row.image && (
                              <img
                                src={row.image}
                                alt=""
                                className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-md bg-zinc-100 dark:bg-slate-700 print:hidden shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <span className="font-semibold text-zinc-900 dark:text-white print:text-black line-clamp-1">{row.name}</span>
                          </td>
                          <td className="py-1.5 sm:py-2 px-2 text-center">
                            <span className="px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 print:bg-slate-100 text-cyan-800 dark:text-cyan-300 print:text-black text-[9px] font-bold border border-cyan-200/60 dark:border-cyan-800/40 print:border-slate-300">
                              {row.size}
                            </span>
                          </td>
                          <td className="py-1.5 sm:py-2 px-2 text-center font-medium font-sans">{currency}{row.price}</td>
                          <td className="py-1.5 sm:py-2 px-2 text-center font-bold">{row.quantity}</td>
                          <td className="py-1.5 sm:py-2 px-3 text-right font-black font-sans text-zinc-900 dark:text-white print:text-black">
                            {currency}{row.subtotal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Shipping Address & Payment Summary ── */}
              {trackItem.address && (
                <div className="grid grid-cols-2 gap-3 p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-slate-800/50 print:bg-slate-50 border border-zinc-200/80 dark:border-slate-700 print:border-slate-300 text-[10px] sm:text-[11px] leading-tight print:leading-snug">
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-zinc-400 dark:text-slate-400 print:text-zinc-600 mb-0.5 block flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> Delivery Address
                    </span>
                    <p className="font-bold text-zinc-900 dark:text-white print:text-black">
                      {trackItem.address.firstName} {trackItem.address.lastName}
                    </p>
                    <p className="text-zinc-600 dark:text-slate-300 print:text-zinc-700">
                      {trackItem.address.street}, {trackItem.address.city}
                    </p>
                    <p className="text-zinc-600 dark:text-slate-300 print:text-zinc-700">
                      {trackItem.address.state} - {trackItem.address.zipcode}, {trackItem.address.country}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-zinc-400 dark:text-slate-400 print:text-zinc-600 mb-0.5 block flex items-center gap-1">
                      <CreditCard className="w-2.5 h-2.5" /> Payment & Contact
                    </span>
                    <p className="text-zinc-600 dark:text-slate-300 print:text-zinc-700">
                      Phone: <span className="font-semibold text-zinc-800 dark:text-slate-200 print:text-black">{trackItem.address.phone || "—"}</span>
                    </p>
                    <p className="text-zinc-600 dark:text-slate-300 print:text-zinc-700 truncate">
                      Email: <span className="font-semibold text-zinc-800 dark:text-slate-200 print:text-black">{trackItem.address.email || "—"}</span>
                    </p>
                    <p className="font-bold text-zinc-900 dark:text-white print:text-black mt-0.5">
                      Method: {trackItem.paymentMethod ? trackItem.paymentMethod.toUpperCase() : "COD"}
                      {trackItem.transactionId ? ` • Ref: ${trackItem.transactionId}` : ""}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Total Calculation ── */}
              <div className="space-y-1 pt-2 border-t border-dashed border-zinc-200 dark:border-slate-700 print:border-slate-300 text-[11px] sm:text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300 print:text-black">
                  <span>Items Subtotal:</span>
                  <span className="font-sans font-bold">{currency}{itemsSubtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-cyan-700 dark:text-cyan-400 print:text-cyan-800 font-bold">
                    <span>Coupon Discount:</span>
                    <span>-{currency}{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-300 print:text-black">
                  <span>8-Min Express Delivery:</span>
                  <span className="text-emerald-600 font-bold uppercase text-[10px]">FREE</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 print:text-zinc-600 text-[10px]">
                  <span>Taxes & GST (Inclusive):</span>
                  <span>All taxes included</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-zinc-200 dark:border-slate-700 print:border-slate-400">
                  <span className="text-zinc-900 dark:text-white print:text-black uppercase tracking-wider text-xs font-black">Total Amount:</span>
                  <span className="text-lg sm:text-xl font-black text-cyan-700 dark:text-cyan-400 print:text-black font-sans">
                    {currency}{orderAmount}
                  </span>
                </div>
              </div>

              {/* ── Authorized Signatory & Verification Seal ── */}
              <div className="pt-2 border-t border-zinc-200 dark:border-slate-700 print:border-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={ownerSignature}
                    alt="Authorized Signatory"
                    className="h-9 sm:h-10 w-auto object-contain opacity-90 print:opacity-100"
                    style={{ filter: "sepia(0.15)" }}
                  />
                  <div className="text-left border-l border-zinc-300 dark:border-slate-600 print:border-slate-400 pl-2.5">
                    <p className="text-[10px] font-black text-zinc-900 dark:text-white print:text-black leading-tight">Prabhakar Kumar</p>
                    <p className="text-[8px] text-zinc-500 dark:text-slate-400 print:text-zinc-600 font-medium">Founder & CEO • Authorized Signatory</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-dashed border-cyan-600/40 print:border-cyan-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-cyan-600 print:text-cyan-800" />
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-wider text-cyan-800 dark:text-cyan-400 print:text-cyan-900">
                      Verified Invoice
                    </p>
                    <p className="text-[7px] text-zinc-400 dark:text-slate-500 print:text-zinc-600">Digital Tax Seal</p>
                  </div>
                </div>
              </div>

              {/* ── Receipt Footer ── */}
              <div className="pt-1.5 border-t border-zinc-100 dark:border-slate-800 print:border-slate-300 text-center text-[8px] text-zinc-400 dark:text-slate-500 print:text-zinc-600 leading-tight">
                <p className="font-semibold text-zinc-600 dark:text-slate-400 print:text-black">
                  Thank you for shopping with Grozo Express! 🛒
                </p>
                <p>
                  Computer-generated tax invoice under IT Act 2000. For support: support@grozo.in • 1800-123-GROZO
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



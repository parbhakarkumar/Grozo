import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
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

const Orders = () => {
  const { backendUrl, currency, token, realtimeOrderUpdate } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackItem, setTrackItem] = useState(null); // Selected item/order for modal

  const getAllOrdersData = async () => {
    setLoading(true);
    let allOrderItems = [];

    // 1. Fetch from Local Storage first
    try {
      const localOrders = JSON.parse(localStorage.getItem("placed_orders") || "[]");
      localOrders.forEach((order, idx) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            allOrderItems.push({
              ...item,
              orderId: order._id || `ORD-984${idx}`,
              status: order.status || "Order Placed",
              payment: order.payment,
              paymentMethod: order.paymentMethod || "COD",
              date: order.date || Date.now(),
              address: order.address,
              amount: order.amount,
            });
          });
        }
      });
    } catch (e) {
      console.warn("Error reading local orders:", e);
    }

    // 2. If token and backendUrl, fetch from server and merge
    if (token && backendUrl) {
      try {
        const res = await axios.post(
          backendUrl + "/api/order/userorders",
          {},
          { headers: { token } }
        );

        if (res.data.success && res.data.orders) {
          res.data.orders.forEach((order) => {
            order.items.forEach((item) => {
              if (typeof item === "object") {
                allOrderItems.push({
                  ...item,
                  orderId: order._id,
                  status: order.status || "Order Placed",
                  payment: order.payment,
                  paymentMethod: order.paymentMethod,
                  date: order.date,
                  address: order.address,
                  amount: order.amount,
                });
              }
            });
          });
        }
      } catch (error) {
        console.warn("Backend orders sync note:", error.message);
      }
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

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="py-8 sm:py-12 border-t border-zinc-200/80 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-200/80 print:hidden">
        <div>
          <Title text1="PURCHASE" text2="HISTORY" />
          <p className="text-xs text-zinc-400 font-light -mt-4">
            Track real-time shipment status and access official purchase receipts.
          </p>
        </div>

        <button
          onClick={getAllOrdersData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl text-xs font-semibold text-zinc-700 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {orderData.length > 0 ? (
        <div className="space-y-4 print:hidden">
          {orderData.map((item, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-zinc-200/80 hover:border-zinc-300 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-subtle"
            >
              {/* Product Info */}
              <div className="flex items-start gap-4 sm:gap-6">
                <img
                  className="w-20 sm:w-24 aspect-[3/4] object-cover rounded-2xl bg-zinc-100 shrink-0"
                  src={item.image && item.image.length > 0 ? item.image[0] : ""}
                  alt={item.name}
                />

                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-0.5">
                    Order #{item.orderId || `ORD-984${i}`}
                  </span>
                  <h4 className="text-sm sm:text-base font-semibold text-zinc-900 line-clamp-1 mb-1.5">
                    {item.name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 mb-2">
                    <span className="font-bold text-zinc-950 font-sans">
                      {currency}{item.price}
                    </span>
                    <span className="text-zinc-300">•</span>
                    <span>Qty: {item.quantity}</span>
                    <span className="text-zinc-300">•</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-medium">
                      Size: {item.size}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 font-light">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {item.paymentMethod ? item.paymentMethod.toUpperCase() : "COD"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100">
                {/* Status Indicator */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{item.status || "Order Placed"}</span>
                </div>

                {/* Track Order Button */}
                <button
                  onClick={() => setTrackItem(item)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold tracking-wider transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track & Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty Orders State */
        <div className="text-center py-24 px-4 flex flex-col items-center justify-center bg-white rounded-3xl border border-zinc-200/80 my-8 shadow-xs print:hidden">
          <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-5">
            <Package className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="font-editorial text-xl sm:text-2xl text-zinc-950 font-normal mb-2">
            No orders found yet
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mb-8 font-light leading-relaxed">
            You haven't placed any orders with this account yet. Your purchase history will appear here once confirmed.
          </p>
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-950 text-white rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-all shadow-sm"
          >
            <span>Discover Collections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          INTERACTIVE ORDER TRACKING & INVOICE RECEIPT MODAL
      ────────────────────────────────────────────── */}
      {trackItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
          {/* Overlay */}
          <div
            onClick={() => setTrackItem(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs print:hidden"
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden z-10 my-auto print:max-w-none print:shadow-none print:border-none print:rounded-none print:p-0">
            
            {/* Modal Top Controls (Screen only) */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-100 bg-zinc-50/80 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-900" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                  Shipment Tracking & Invoice
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-900 text-xs font-semibold text-zinc-800 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={() => setTrackItem(null)}
                  className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
              
              {/* Official Printable Invoice Header */}
              <div className="flex items-start justify-between pb-6 border-b border-zinc-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded bg-zinc-950 text-white flex items-center justify-center font-serif font-bold text-sm">
                      C
                    </div>
                    <span className="font-bold text-lg tracking-[0.2em] text-zinc-950 font-sans">
                      CARTIVO
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
                    Haute Couture • Tax Invoice
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold tracking-wider uppercase rounded-full mb-1">
                    {trackItem.payment ? "Payment Confirmed" : "Cash On Delivery"}
                  </span>
                  <p className="text-xs font-semibold text-zinc-900">
                    Invoice #{trackItem.orderId || "INV-2026-8940"}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-light">
                    Date: {new Date(trackItem.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* 5-Step Visual Tracking Stepper (Screen view) */}
              <div className="print:hidden">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Live Delivery Pipeline
                  </h4>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Estimated Delivery: 3-5 Business Days
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {trackingSteps.map((step, idx) => {
                    const currentIdx = getStepIndex(trackItem.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={idx} className="flex items-start gap-4 relative">
                        {/* Connecting Line */}
                        {idx < trackingSteps.length - 1 && (
                          <div
                            className={`absolute left-[15px] top-6 w-[2px] h-8 -z-0 ${
                              idx < currentIdx ? "bg-emerald-500" : "bg-zinc-200"
                            }`}
                          />
                        )}

                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 shrink-0 transition-all ${
                            isPassed
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>

                        <div className="flex-1 pt-1">
                          <p
                            className={`text-xs font-semibold ${
                              isCurrent
                                ? "text-emerald-700 font-bold"
                                : isPassed
                                ? "text-zinc-900"
                                : "text-zinc-400"
                            }`}
                          >
                            {step.title}
                          </p>
                          <p className="text-[11px] text-zinc-500 font-light">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Itemized Order Details Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3">
                  Itemized Order Summary
                </h4>
                
                <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="p-3.5">Item Description</th>
                        <th className="p-3.5">Size</th>
                        <th className="p-3.5">Qty</th>
                        <th className="p-3.5 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-800">
                      <tr>
                        <td className="p-3.5 font-medium flex items-center gap-3">
                          {trackItem.image?.[0] && (
                            <img
                              src={trackItem.image[0]}
                              alt=""
                              className="w-10 h-12 object-cover rounded bg-zinc-100 shrink-0 print:hidden"
                            />
                          )}
                          <span>{trackItem.name}</span>
                        </td>
                        <td className="p-3.5 font-semibold">{trackItem.size}</td>
                        <td className="p-3.5">{trackItem.quantity}</td>
                        <td className="p-3.5 text-right font-bold font-sans">
                          {currency}{trackItem.price}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Shipping Address & Customer Info */}
              {trackItem.address && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-1 block">
                      Billed & Shipped To
                    </span>
                    <p className="font-semibold text-zinc-900">
                      {trackItem.address.firstName} {trackItem.address.lastName}
                    </p>
                    <p className="text-zinc-600 font-light">
                      {trackItem.address.street}, {trackItem.address.city}
                    </p>
                    <p className="text-zinc-600 font-light">
                      {trackItem.address.state} - {trackItem.address.zipcode}, {trackItem.address.country}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-1 block">
                      Contact & Payment
                    </span>
                    <p className="text-zinc-600 font-light">Phone: {trackItem.address.phone}</p>
                    <p className="text-zinc-600 font-light">Email: {trackItem.address.email}</p>
                    <p className="text-zinc-900 font-semibold mt-1">
                      Gateway: {trackItem.paymentMethod ? trackItem.paymentMethod.toUpperCase() : "COD"}
                    </p>
                  </div>
                </div>
              )}

              {/* Total Calculation Row */}
              <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Total Paid Amount
                </span>
                <span className="text-xl font-extrabold text-zinc-950 font-sans">
                  {currency}{trackItem.amount || trackItem.price * trackItem.quantity}
                </span>
              </div>

              {/* Printable footer disclaimer */}
              <div className="hidden print:block pt-6 border-t border-zinc-200 text-center text-[10px] text-zinc-500">
                Thank you for shopping with Cartivo Haute Couture. For inquiries, contact concierge@cartivo.studio
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;



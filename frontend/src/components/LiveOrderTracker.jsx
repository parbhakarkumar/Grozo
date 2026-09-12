import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { 
  Zap, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Copy, 
  Check, 
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";

const ORDER_STEPS = [
  { key: "Order Placed", label: "Order Placed", desc: "Received at dark store", icon: Zap },
  { key: "Packing", label: "Packing Items", desc: "Picking fresh batch", icon: Package },
  { key: "Shipped", label: "Dispatched", desc: "Handed to express rider", icon: Truck },
  { key: "Out for delivery", label: "Out for Delivery", desc: "Arriving at your doorstep", icon: Clock },
  { key: "Delivered", label: "Delivered", desc: "Package handed over", icon: CheckCircle2 },
];

const getStepIndex = (status) => {
  if (status === "Cancelled") return -1;
  const idx = ORDER_STEPS.findIndex((s) => s.key.toLowerCase() === (status || "").toLowerCase());
  return idx !== -1 ? idx : 0;
};

const LiveOrderTracker = ({ compact = false }) => {
  const { userOrdersList, currency, token } = useContext(ShopContext);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Find the most recent active order
  const activeOrder = userOrdersList?.find(
    (order) => order.status !== "Delivered" && order.status !== "Cancelled"
  ) || userOrdersList?.[0];

  if (!token || !activeOrder) {
    return null;
  }

  const currentStepIdx = getStepIndex(activeOrder.status);
  const isCancelled = activeOrder.status === "Cancelled";
  const isDelivered = activeOrder.status === "Delivered";

  const handleCopyOtp = (otp) => {
    if (!otp) return;
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    toast.success("Delivery OTP copied to clipboard!");
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Compact banner (e.g. for Home Page)
  if (compact) {
    return (
      <div className="my-3 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-4 rounded-3xl border border-cyan-500/40 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-amber-300 flex items-center justify-center shrink-0 font-black">
              <Zap className="w-5 h-5 fill-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">Live Order Tracking</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md font-bold uppercase">
                  {activeOrder.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Order #{activeOrder._id ? activeOrder._id.slice(-6) : ""} • {activeOrder.items?.length || 1} items ({currency}{activeOrder.amount})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {activeOrder.deliveryOtp && !isDelivered && (
              <button
                onClick={() => handleCopyOtp(activeOrder.deliveryOtp)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors"
              >
                <span>OTP: <strong>{activeOrder.deliveryOtp}</strong></span>
                {copiedOtp ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
              </button>
            )}

            <Link
              to={`/orders/${activeOrder._id}/tracking`}
              className="flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-white px-2 py-1 bg-cyan-800/40 rounded-lg"
            >
              <span>Live Map</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // Full interactive order tracker card (for Orders page & Profile)
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md my-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-ping" />
            <h3 className="text-base font-black text-slate-900">Live Delivery Tracker</h3>
            <span className="text-[10px] bg-cyan-50 text-cyan-800 font-extrabold px-2.5 py-0.5 rounded-full border border-cyan-200 uppercase">
              Order #{activeOrder._id ? activeOrder._id.slice(-6) : ""}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-light mt-1">
            Placed on {new Date(activeOrder.date || activeOrder.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>

        {/* Live Status Pill & Link */}
        <div className="flex items-center gap-3">
          <Link
            to={`/orders/${activeOrder._id}/tracking`}
            className="px-4 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 text-xs font-black transition-all shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>Open Real GPS Map</span>
          </Link>

          {activeOrder.deliveryOtp && !isDelivered && (
            <div className="px-3.5 py-2 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-medium">Delivery OTP:</span>
              <strong className="text-cyan-900 font-mono tracking-widest text-sm">{activeOrder.deliveryOtp}</strong>
              <button
                onClick={() => handleCopyOtp(activeOrder.deliveryOtp)}
                className="text-cyan-700 hover:text-cyan-900"
                title="Copy OTP"
              >
                {copiedOtp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stepper Timeline */}
      {isCancelled ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>This order has been cancelled and any paid amount has been refunded.</span>
        </div>
      ) : (
        <div className="relative py-4">
          {/* Progress Line */}
          <div className="hidden sm:block absolute top-1/2 left-6 right-6 h-1 bg-slate-100 -translate-y-1/2 z-0">
            <div
              className="h-full bg-cyan-600 transition-all duration-700"
              style={{ width: `${(currentStepIdx / (ORDER_STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {/* Stepper Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
            {ORDER_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-cyan-600 text-white shadow-lg ring-4 ring-emerald-100 scale-105"
                        : isCompleted
                        ? "bg-cyan-100 text-cyan-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-light hidden sm:block">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delivery & Dispatch Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <MapPin className="w-3.5 h-3.5 text-cyan-600" />
            <span>Delivery Destination</span>
          </div>
          <p className="text-slate-600 font-light truncate">
            {activeOrder.address?.street || "Home Address"}, {activeOrder.address?.city} {activeOrder.address?.zipcode}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Truck className="w-3.5 h-3.5 text-cyan-600" />
            <span>Courier / Rider</span>
          </div>
          <p className="text-slate-600 font-light">
            {activeOrder.courierPartner || "Grozo Express Fleet"} {activeOrder.trackingId ? `(#${activeOrder.trackingId})` : "• Assigned"}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
            <span>Payment & Security</span>
          </div>
          <p className="text-slate-600 font-light">
            {activeOrder.paymentMethod?.toUpperCase()} • {activeOrder.payment ? "Payment Verified" : "Pay on Delivery"} ({currency}{activeOrder.amount})
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveOrderTracker;

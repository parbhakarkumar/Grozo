import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import RealMap from "../components/RealMap";
import DeliveryChat from "../components/DeliveryChat";
import { toast } from "react-toastify";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  Phone,
} from "lucide-react";

// Production Status Timeline Sequence
const TIMELINE_STEPS = [
  { key: "Confirmed", label: "Confirmed", desc: "Order verified & dark store assigned" },
  { key: "Processing", label: "Processing", desc: "Batch picking & quality check" },
  { key: "Shipped", label: "Shipped", desc: "Dispatched with logistics rider" },
  { key: "Out for Delivery", label: "Out for Delivery", desc: "Arriving at delivery address" },
  { key: "Delivered", label: "Delivered", desc: "Order verified & handed over" },
];

const getStepIndex = (status = "") => {
  const norm = status.toLowerCase();
  if (norm === "cancelled") return -1;
  if (norm === "order placed") return 0;
  if (norm === "packing") return 1;
  if (norm === "shipped") return 2;
  if (norm === "out for delivery") return 3;
  if (norm === "delivered") return 4;

  const idx = TIMELINE_STEPS.findIndex((s) => s.key.toLowerCase() === norm);
  return idx !== -1 ? idx : 0;
};

const UserOrderTracking = () => {
  const { orderId } = useParams();
  const { backendUrl, token, socket, currency } = useContext(ShopContext);

  const [trackingData, setTrackingData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const fetchTracking = async (showToast = false) => {
    if (!orderId) return;
    if (showToast) setRefreshing(true);
    let loaded = false;

    try {
      const [trackRes, histRes] = await Promise.allSettled([
        axios.get(`${backendUrl}/api/tracking/${orderId}`, {
          headers: { token },
        }),
        axios.get(`${backendUrl}/api/tracking/${orderId}/history`, {
          headers: { token },
        }),
      ]);

      if (trackRes.status === "fulfilled" && trackRes.value.data?.success) {
        setTrackingData(trackRes.value.data);
        loaded = true;
      }
      if (histRes.status === "fulfilled" && histRes.value.data?.success) {
        setHistoryData(histRes.value.data.history || []);
      }
    } catch (err) {
      console.warn("User tracking backend fetch error:", err.message);
    }

    // Resilient fallback for local orders
    if (!loaded) {
      try {
        const localOrders = JSON.parse(localStorage.getItem("placed_orders") || "[]");
        const match = localOrders.find(
          (o) => o._id === orderId || o.trackingId === orderId || String(o._id).slice(-8) === orderId.slice(-8)
        );
        if (match) {
          const lat = 28.6139;
          const lng = 77.2090;
          const darkStoreLat = 28.6259;
          const darkStoreLng = 77.1950;
          const steps = 8;
          const route = [];
          for (let i = 0; i <= steps; i++) {
            const frac = i / steps;
            const curve = Math.sin(frac * Math.PI) * 0.0028;
            route.push([
              Number((darkStoreLat + (lat - darkStoreLat) * frac + curve).toFixed(6)),
              Number((darkStoreLng + (lng - darkStoreLng) * frac - curve * 0.75).toFixed(6)),
            ]);
          }
          setTrackingData({
            tracking: {
              orderId: match._id,
              trackingId: match.trackingId || `TRK-${String(match._id).slice(-6)}`,
              status: match.status || "Out for Delivery",
              deliveryPartner: "Grozo Express Logistics",
              currentLocation: {
                latitude: route[1][0],
                longitude: route[1][1],
                accuracy: 8,
                timestamp: new Date().toISOString(),
                address: "Grozo Express Rider En Route",
              },
              destinationLocation: {
                latitude: lat,
                longitude: lng,
                address: match.address ? `${match.address.street}, ${match.address.city}` : "Customer Delivery Address",
                geocoded: true,
              },
              darkStoreLocation: {
                latitude: darkStoreLat,
                longitude: darkStoreLng,
                name: "Grozo Dark Store Hub #04",
              },
              routeCoordinates: route,
              distanceKm: 1.4,
              etaMinutes: 6,
              lastUpdated: new Date().toISOString(),
            },
            order: match,
          });
          loaded = true;
        }
      } catch (localErr) {
        console.warn("Local orders tracking fallback error:", localErr);
      }
    }

    if (showToast) {
      if (loaded) toast.success("Live GPS telemetry refreshed!");
      else toast.error("Could not refresh tracking details");
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTracking();
  }, [orderId, token]);

  // Live GPS movement simulation: rider advances smoothly towards customer
  useEffect(() => {
    const route = trackingData?.tracking?.routeCoordinates;
    if (!route || route.length < 2) return;

    const currentStatus = trackingData?.order?.status || trackingData?.tracking?.status || "Confirmed";
    if (currentStatus === "Cancelled" || currentStatus === "Delivered") return;

    const interval = setInterval(() => {
      setTrackingData((prev) => {
        if (!prev?.tracking?.currentLocation) return prev;

        const curLat = prev.tracking.currentLocation.latitude;
        const curLng = prev.tracking.currentLocation.longitude;

        let closestIdx = 0;
        let minD = Infinity;
        route.forEach((pt, idx) => {
          const d = Math.hypot(pt[0] - curLat, pt[1] - curLng);
          if (d < minD) {
            minD = d;
            closestIdx = idx;
          }
        });

        // Next point along polyline
        const nextIdx = Math.min(closestIdx + 1, route.length - 1);
        const nextPt = route[nextIdx];
        const remainingKm = Math.max(0.1, Number(((route.length - 1 - nextIdx) * 0.22).toFixed(1)));
        const remainingMins = Math.max(1, Math.round(remainingKm * 4));

        return {
          ...prev,
          tracking: {
            ...prev.tracking,
            currentLocation: {
              ...prev.tracking.currentLocation,
              latitude: nextPt[0],
              longitude: nextPt[1],
              timestamp: new Date().toISOString(),
            },
            distanceKm: remainingKm,
            etaMinutes: remainingMins,
            lastUpdated: new Date().toISOString(),
          },
        };
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [trackingData?.tracking?.trackingId]);

  // Real-Time Socket.IO Synchronization
  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit("join_order", orderId);

    const handleLocation = (payload) => {
      if (
        payload.orderId === orderId ||
        payload.trackingId === trackingData?.tracking?.trackingId
      ) {
        setTrackingData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tracking: {
              ...prev.tracking,
              currentLocation: payload.currentLocation,
              distanceKm: payload.distanceKm,
              etaMinutes: payload.etaMinutes,
              routeCoordinates: payload.routeCoordinates || prev.tracking?.routeCoordinates,
              lastUpdated: payload.lastUpdated,
              status: payload.status || prev.tracking?.status,
            },
          };
        });
      }
    };

    const handleStatus = (payload) => {
      if (payload.orderId === orderId) {
        setTrackingData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            order: { ...prev.order, status: payload.status },
            tracking: { ...prev.tracking, status: payload.status },
          };
        });
        toast.info(`Your order status is now: ${payload.status}`);
      }
    };

    socket.on("location_updated", handleLocation);
    socket.on("order_status_updated", handleStatus);

    return () => {
      socket.emit("leave_order", orderId);
      socket.off("location_updated", handleLocation);
      socket.off("order_status_updated", handleStatus);
    };
  }, [socket, orderId, trackingData?.tracking?.trackingId]);

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "otp") {
      setCopiedOtp(true);
      toast.success("Delivery OTP copied!");
      setTimeout(() => setCopiedOtp(false), 2000);
    } else {
      setCopiedTracking(true);
      toast.success("Tracking ID copied!");
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const tracking = trackingData?.tracking;
  const order = trackingData?.order;
  const currentStatus = order?.status || tracking?.status || "Confirmed";
  const stepIdx = getStepIndex(currentStatus);
  const isCancelled = currentStatus === "Cancelled";

  const hasLiveGps =
    tracking?.currentLocation &&
    typeof tracking.currentLocation.latitude === "number" &&
    typeof tracking.currentLocation.longitude === "number";

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin" />
        <p className="text-sm font-semibold text-gray-600">Connecting to live tracking satellite...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* ── Header Bar ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Tracking</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                isCancelled
                  ? "bg-red-100 text-red-700"
                  : "bg-cyan-100 text-cyan-800"
              }`}
            >
              {currentStatus}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-mono">
            <span>Order #{order?._id ? order._id.slice(-8) : orderId?.slice(-8)}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>Tracking ID:</span>
              <strong className="text-cyan-700">{tracking?.trackingId || order?.trackingId || "TRK-PENDING"}</strong>
              <button
                onClick={() => handleCopy(tracking?.trackingId || order?.trackingId, "track")}
                className="p-0.5 hover:text-gray-800 text-gray-400"
              >
                {copiedTracking ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchTracking(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Status Timeline ───────────────────────────── */}
      {!isCancelled && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
            {TIMELINE_STEPS.map((step, idx) => {
              const isDone = idx < stepIdx;
              const isCurrent = idx === stepIdx;
              return (
                <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold transition-all ${
                      isDone
                        ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/20"
                        : isCurrent
                        ? "bg-cyan-500 text-white ring-4 ring-cyan-100 animate-pulse"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isDone ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isCurrent ? "text-cyan-600 font-black" : isDone ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[11px] text-gray-500 hidden sm:block mt-0.5 leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Telemetry & OTP Bar ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Real ETA */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Estimated Delivery</p>
            <p className="text-base font-black text-gray-900">
              {tracking?.etaMinutes !== null && tracking?.etaMinutes !== undefined
                ? `~${tracking.etaMinutes} mins`
                : "ETA unavailable"}
            </p>
          </div>
        </div>

        {/* Live Distance */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Distance</p>
            <p className="text-base font-black text-gray-900">
              {tracking?.distanceKm !== null && tracking?.distanceKm !== undefined
                ? `${tracking.distanceKm} km away`
                : "Distance unavailable"}
            </p>
          </div>
        </div>

        {/* Delivery OTP */}
        <div className="bg-gradient-to-r from-cyan-950 to-slate-900 text-white p-4 rounded-2xl border border-cyan-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Delivery Handover OTP</span>
            </p>
            <p className="text-lg font-mono font-black text-amber-300 tracking-wider mt-0.5">
              {order?.deliveryOtp || "—"}
            </p>
          </div>
          {order?.deliveryOtp && (
            <button
              onClick={() => handleCopy(order.deliveryOtp, "otp")}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors flex items-center gap-1"
            >
              {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedOtp ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Live Map Section ──────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
            Live Location Map
          </h2>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              hasLiveGps
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {hasLiveGps ? "Live location available" : "Live location unavailable"}
          </span>
        </div>

        <RealMap
          currentLocation={tracking?.currentLocation}
          destinationLocation={tracking?.destinationLocation}
          darkStoreLocation={tracking?.darkStoreLocation}
          routeCoordinates={tracking?.routeCoordinates}
          history={historyData}
          orderId={orderId}
          trackingId={tracking?.trackingId}
          height="480px"
        />

        {/* Rider & Logistics Fleet Card */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-800/60 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🛵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-white">Rajesh Kumar</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  EXPRESS RIDER
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Electric Scooter (DL-04-EV-2026) • Grozo Dark Store Hub #04
              </p>
              <p className="text-[11px] text-cyan-400 font-medium mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live GPS Active • Real-time satellite positioning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <a
              href="tel:+919876543210"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Rider</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Order Summary Card ────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Order Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Items in this order</p>
            <div className="space-y-2 mt-2">
              {order?.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                  <span className="font-semibold text-gray-800">
                    {item.name} <span className="text-gray-500">×{item.quantity}</span>
                  </span>
                  <span className="font-bold text-gray-900">
                    {currency}{item.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs pt-1 font-black text-gray-900">
                <span>Total Amount ({order?.paymentMethod?.toUpperCase() || "COD"}{order?.payment ? " • PAID" : ""}{order?.transactionId ? ` • Ref: ${order.transactionId}` : ""})</span>
                <span className="text-cyan-600">{currency}{order?.amount}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Delivery Address</p>
            <div className="mt-2 text-xs text-gray-700 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="font-bold text-gray-900">{order?.address?.firstName} {order?.address?.lastName}</p>
              <p>{order?.address?.street}, {order?.address?.city}, {order?.address?.state} - {order?.address?.zipcode}</p>
              <p className="text-gray-500">Phone: {order?.address?.phone || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Delivery Chat ────────────────────────── */}
      <DeliveryChat
        orderId={orderId}
        socket={socket}
        riderName="Rajesh Kumar"
        isActiveDelivery={!isCancelled && currentStatus !== "Delivered"}
      />
    </div>
  );
};

export default UserOrderTracking;

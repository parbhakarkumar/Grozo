import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import RealMap from "../components/RealMap";
import { toast } from "react-toastify";
import {
  Truck,
  MapPin,
  Clock,
  Navigation,
  RefreshCw,
  Radio,
  RadioTower,
  ShieldCheck,
  User,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";

const AdminTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token, socket } = useContext(ShopContext);

  // States
  const [ordersList, setOrdersList] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(orderId || "");
  const [trackingData, setTrackingData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // GPS Broadcaster state (actual device geolocation)
  const [isBroadcastingGps, setIsBroadcastingGps] = useState(false);
  const [broadcastLog, setBroadcastLog] = useState("");
  const watchIdRef = useRef(null);

  // 1. Fetch Orders List for selector if not provided or to allow quick switching
  useEffect(() => {
    const fetchOrdersList = async () => {
      setLoadingOrders(true);
      try {
        const res = await axios.post(
          backendUrl + "/api/order/list",
          {},
          { headers: { token } }
        );
        if (res.data.success) {
          const list = res.data.orders || [];
          setOrdersList(list);
          // If no orderId in params, select the first active or recent order
          if (!orderId && list.length > 0) {
            setSelectedOrderId(list[0]._id);
          }
        }
      } catch (err) {
        console.warn("Failed to load orders list:", err.message);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrdersList();
  }, [backendUrl, token, orderId]);

  // Update selectedOrderId when route param changes
  useEffect(() => {
    if (orderId) {
      setSelectedOrderId(orderId);
    }
  }, [orderId]);

  // 2. Fetch Tracking Details for Selected Order
  const fetchTrackingDetails = async (idToFetch, showToast = false) => {
    if (!idToFetch) return;
    if (showToast) setRefreshing(true);
    try {
      const [trackRes, histRes] = await Promise.allSettled([
        axios.get(`${backendUrl}/api/tracking/${idToFetch}`, {
          headers: { token },
        }),
        axios.get(`${backendUrl}/api/tracking/${idToFetch}/history`, {
          headers: { token },
        }),
      ]);

      if (trackRes.status === "fulfilled" && trackRes.value.data.success) {
        setTrackingData(trackRes.value.data);
      } else {
        setTrackingData(null);
      }

      if (histRes.status === "fulfilled" && histRes.value.data.success) {
        setHistoryData(histRes.value.data.history || []);
      }

      if (showToast) toast.success("Location telemetry refreshed");
    } catch (err) {
      console.warn("Tracking fetch error:", err.message);
      if (showToast) toast.error("Failed to refresh tracking data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedOrderId) {
      setLoading(true);
      fetchTrackingDetails(selectedOrderId);
    }
  }, [selectedOrderId, backendUrl, token]);

  // 3. Socket.IO Real-Time Synchronization
  useEffect(() => {
    if (!socket || !selectedOrderId) return;

    socket.emit("join_admin");
    socket.emit("join_order", selectedOrderId);

    const handleLocationUpdate = (payload) => {
      if (
        payload.orderId === selectedOrderId ||
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

        // Append to local history trail
        if (payload.currentLocation?.latitude) {
          setHistoryData((prev) => [
            ...prev,
            {
              latitude: payload.currentLocation.latitude,
              longitude: payload.currentLocation.longitude,
              accuracy: payload.currentLocation.accuracy,
              timestamp: payload.currentLocation.timestamp,
            },
          ]);
        }
      }
    };

    const handleStatusUpdate = (payload) => {
      if (payload.orderId === selectedOrderId) {
        setTrackingData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            order: { ...prev.order, status: payload.status },
            tracking: { ...prev.tracking, status: payload.status },
          };
        });
        toast.info(`Order status updated to "${payload.status}"`);
      }
    };

    socket.on("location_updated", handleLocationUpdate);
    socket.on("order_status_updated", handleStatusUpdate);

    return () => {
      socket.emit("leave_order", selectedOrderId);
      socket.off("location_updated", handleLocationUpdate);
      socket.off("order_status_updated", handleStatusUpdate);
    };
  }, [socket, selectedOrderId, trackingData?.tracking?.trackingId]);

  // 4. GPS Broadcaster: Collect real hardware coordinates via browser Geolocation API
  const startGpsBroadcast = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation API is not supported by your device/browser.");
      return;
    }

    setIsBroadcastingGps(true);
    setBroadcastLog("Requesting GPS permission from device...");

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setBroadcastLog(
          `GPS lock: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${Math.round(
            accuracy
          )}m)`
        );

        try {
          await axios.post(
            `${backendUrl}/api/tracking/${selectedOrderId}/location`,
            {
              latitude,
              longitude,
              accuracy,
              deviceSession: "admin_driver_gps_session",
            },
            { headers: { token } }
          );
        } catch (postErr) {
          console.warn("GPS broadcast transmit error:", postErr.message);
        }
      },
      (err) => {
        console.warn("GPS error:", err.message);
        setBroadcastLog(`GPS Error: ${err.message}`);
        toast.error(`GPS Error: ${err.message}`);
        stopGpsBroadcast();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const stopGpsBroadcast = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsBroadcastingGps(false);
    setBroadcastLog("GPS transmission stopped.");
  };

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleCopyTracking = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedTracking(true);
    toast.success("Tracking ID copied!");
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const tracking = trackingData?.tracking;
  const order = trackingData?.order;

  return (
    <div className="space-y-6 max-w-[1500px]">
      {/* ── Top Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">Live Order Tracking Console</h1>
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase">
              Production GPS Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real GPS coordinate streaming, OSRM routing, and synchronized customer tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Order Selector Dropdown */}
          <select
            value={selectedOrderId}
            onChange={(e) => {
              const newId = e.target.value;
              setSelectedOrderId(newId);
              navigate(`/admin/tracking/${newId}`);
            }}
            className="bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-cyan-500 max-w-[220px]"
          >
            {ordersList.map((o) => (
              <option key={o._id} value={o._id}>
                #{o._id.slice(-6)} • {o.trackingId || "Pending Track ID"} ({o.status})
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchTrackingDetails(selectedOrderId, true)}
            disabled={refreshing || !selectedOrderId}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh Location</span>
          </button>
        </div>
      </div>

      {/* ── Split-Screen Content ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Column: Telemetry & Order Metadata (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-5">
          {/* Tracking Card */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Tracking ID
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base font-mono font-black text-cyan-400">
                    {tracking?.trackingId || order?.trackingId || "TRK-PENDING"}
                  </span>
                  <button
                    onClick={() => handleCopyTracking(tracking?.trackingId || order?.trackingId)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedTracking ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Status
                </span>
                <div className="mt-0.5">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 text-xs font-black">
                    {order?.status || tracking?.status || "Confirmed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Row: ETA & Distance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold uppercase">Estimated Time</span>
                </div>
                <p className="text-lg font-black text-white">
                  {tracking?.etaMinutes !== null && tracking?.etaMinutes !== undefined
                    ? `${tracking.etaMinutes} mins`
                    : "ETA unavailable"}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {tracking?.etaMinutes !== null ? "Calculated via OSRM" : "Awaiting live route"}
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase">Distance Remaining</span>
                </div>
                <p className="text-lg font-black text-white">
                  {tracking?.distanceKm !== null && tracking?.distanceKm !== undefined
                    ? `${tracking.distanceKm} km`
                    : "Distance unavailable"}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {tracking?.distanceKm !== null ? "Driving distance" : "Awaiting live GPS"}
                </p>
              </div>
            </div>

            {/* Telemetry Details */}
            <div className="space-y-2.5 text-xs text-slate-300 pt-1">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-500">Delivery Partner</span>
                <span className="font-bold text-white">
                  {tracking?.deliveryPartner || order?.courierPartner || "Grozo Express Logistics"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-500">Last GPS Fix</span>
                <span className="font-mono text-slate-300">
                  {tracking?.currentLocation?.timestamp
                    ? new Date(tracking.currentLocation.timestamp).toLocaleTimeString()
                    : "No GPS fix yet"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-500">GPS Accuracy</span>
                <span className="font-mono text-slate-300">
                  {tracking?.currentLocation?.accuracy
                    ? `±${Math.round(tracking.currentLocation.accuracy)} meters`
                    : "Unavailable"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Customer Handover OTP</span>
                <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {order?.deliveryOtp || "—"}
                </span>
              </div>
            </div>

            {/* Destination Address */}
            <div className="pt-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                Destination Address
              </span>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p className="font-bold text-white">
                    {order?.address?.firstName} {order?.address?.lastName}
                  </p>
                  <p className="text-slate-400">
                    {order?.address?.street}, {order?.address?.city}, {order?.address?.state}{" "}
                    {order?.address?.zipcode}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Phone: {order?.address?.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Real Device GPS Broadcaster Control ───────── */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RadioTower
                  className={`w-5 h-5 ${isBroadcastingGps ? "text-cyan-400 animate-pulse" : "text-slate-400"}`}
                />
                <h2 className="text-sm font-black text-white">Delivery Agent GPS Broadcaster</h2>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  isBroadcastingGps ? "bg-cyan-400 animate-ping" : "bg-slate-600"
                }`}
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Activate this device as the authorized delivery vehicle. When enabled, your device’s
              real hardware GPS position (<code className="text-cyan-400">navigator.geolocation</code>)
              is securely streamed to the backend and broadcast in real-time to both Admin and Customer tracking screens.
            </p>

            <div className="flex items-center gap-3">
              {!isBroadcastingGps ? (
                <button
                  onClick={startGpsBroadcast}
                  disabled={!selectedOrderId}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-all shadow-lg shadow-cyan-900/40 disabled:opacity-50"
                >
                  <Radio className="w-4 h-4" />
                  <span>Start Broadcasting Live Device GPS</span>
                </button>
              ) : (
                <button
                  onClick={stopGpsBroadcast}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition-all shadow-lg shadow-red-900/40"
                >
                  <Radio className="w-4 h-4 animate-spin" />
                  <span>Stop GPS Broadcast</span>
                </button>
              )}
            </div>

            {broadcastLog && (
              <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-2.5 text-[11px] font-mono text-cyan-300">
                {broadcastLog}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Real Interactive Leaflet Map (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Real Interactive Map View
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Delivery Vehicle</span>
              </span>
              <span className="flex items-center gap-1 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Customer Destination</span>
              </span>
            </div>
          </div>

          <RealMap
            currentLocation={tracking?.currentLocation}
            destinationLocation={tracking?.destinationLocation}
            darkStoreLocation={tracking?.darkStoreLocation}
            routeCoordinates={tracking?.routeCoordinates}
            history={historyData}
            orderId={selectedOrderId}
            trackingId={tracking?.trackingId}
            height="560px"
          />

          {/* Audit History Points Trail */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                GPS Audit Trail ({historyData.length} checkpoints recorded)
              </span>
            </div>

            {historyData.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                No location history available. Historical GPS points will be recorded as the delivery agent moves.
              </p>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
                {historyData
                  .slice()
                  .reverse()
                  .map((h, i) => (
                    <div
                      key={h._id || i}
                      className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-slate-950/60 border border-slate-800/60 font-mono text-slate-300"
                    >
                      <span>
                        Lat: {h.latitude.toFixed(5)}, Lng: {h.longitude.toFixed(5)}
                      </span>
                      <span className="text-slate-500">
                        {h.accuracy ? `±${Math.round(h.accuracy)}m • ` : ""}
                        {new Date(h.timestamp).toLocaleTimeString()}
                      </span>
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

export default AdminTracking;

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, MapPin, AlertTriangle, ShieldCheck } from "lucide-react";

// Fix standard Vite / Leaflet marker asset path resolution
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom HTML Pin for Delivery Driver / Agent
const createDeliveryIcon = () => {
  return L.divIcon({
    className: "custom-delivery-marker",
    html: `
      <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background: rgba(8, 145, 178, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #0891b2; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
          🛵
        </div>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
};

// Custom HTML Pin for Delivery Destination
const createDestinationIcon = () => {
  return L.divIcon({
    className: "custom-destination-marker",
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="width: 30px; height: 30px; border-radius: 50%; background: #ef4444; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
          📍
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 30],
  });
};

// Custom HTML Pin for Dark Store Fulfillment Hub
const createDarkStoreIcon = () => {
  return L.divIcon({
    className: "custom-darkstore-marker",
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="width: 30px; height: 30px; border-radius: 50%; background: #0f172a; border: 2.5px solid #38bdf8; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
          🏬
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const RealMap = ({
  currentLocation,
  destinationLocation,
  darkStoreLocation,
  routeCoordinates = [],
  history = [],
  orderId,
  trackingId,
  height = "460px",
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ delivery: null, dest: null, darkStore: null, polyline: null, historyLine: null });

  const hasDeliveryCoords =
    currentLocation &&
    typeof currentLocation.latitude === "number" &&
    typeof currentLocation.longitude === "number" &&
    !isNaN(currentLocation.latitude) &&
    !isNaN(currentLocation.longitude);

  const hasDestCoords =
    destinationLocation &&
    typeof destinationLocation.latitude === "number" &&
    typeof destinationLocation.longitude === "number" &&
    !isNaN(destinationLocation.latitude) &&
    !isNaN(destinationLocation.longitude);

  // Dark store coordinates from prop or start of route
  const darkStoreCoords =
    darkStoreLocation && typeof darkStoreLocation.latitude === "number"
      ? [darkStoreLocation.latitude, darkStoreLocation.longitude]
      : routeCoordinates && routeCoordinates.length > 0
      ? routeCoordinates[0]
      : null;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center if coordinates exist, else fallback view
    const initialLat = hasDeliveryCoords
      ? currentLocation.latitude
      : hasDestCoords
      ? destinationLocation.latitude
      : 28.6139; // Center of NCR/India
    const initialLng = hasDeliveryCoords
      ? currentLocation.longitude
      : hasDestCoords
      ? destinationLocation.longitude
      : 77.2090;
    const initialZoom = hasDeliveryCoords || hasDestCoords ? 14 : 12;

    // Initialize Leaflet map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: true,
      });

      // OpenStreetMap standard tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // ── Update Dark Store Marker ─────────────────
    if (darkStoreCoords) {
      if (!markersRef.current.darkStore) {
        markersRef.current.darkStore = L.marker(darkStoreCoords, { icon: createDarkStoreIcon() })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: system-ui; font-size: 12px; line-height: 1.4;">
              <strong style="color: #0284c7; font-size: 13px;">Grozo Dark Store Hub</strong><br/>
              <span style="color: #475569;">Fulfillment & Dispatch Center #04</span>
            </div>`
          );
      } else {
        markersRef.current.darkStore.setLatLng(darkStoreCoords);
      }
    } else if (markersRef.current.darkStore) {
      map.removeLayer(markersRef.current.darkStore);
      markersRef.current.darkStore = null;
    }

    // ── Update Delivery Marker ───────────────────
    if (hasDeliveryCoords) {
      const latLng = [currentLocation.latitude, currentLocation.longitude];
      if (!markersRef.current.delivery) {
        markersRef.current.delivery = L.marker(latLng, { icon: createDeliveryIcon() })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: system-ui; font-size: 12px; line-height: 1.4;">
              <strong style="color: #0891b2; font-size: 13px;">Live Delivery Partner 🛵</strong><br/>
              <span>Lat: ${currentLocation.latitude.toFixed(6)}</span><br/>
              <span>Lng: ${currentLocation.longitude.toFixed(6)}</span><br/>
              ${
                currentLocation.accuracy
                  ? `<span style="color: #64748b;">GPS Accuracy: ±${Math.round(
                      currentLocation.accuracy
                    )}m</span><br/>`
                  : ""
              }
              <span style="color: #94a3b8; font-size: 10px;">Updated: ${new Date(
                currentLocation.timestamp || Date.now()
              ).toLocaleTimeString()}</span>
            </div>`
          );
      } else {
        markersRef.current.delivery.setLatLng(latLng);
      }
    } else if (markersRef.current.delivery) {
      map.removeLayer(markersRef.current.delivery);
      markersRef.current.delivery = null;
    }

    // ── Update Destination Marker ────────────────
    if (hasDestCoords) {
      const destLatLng = [destinationLocation.latitude, destinationLocation.longitude];
      if (!markersRef.current.dest) {
        markersRef.current.dest = L.marker(destLatLng, { icon: createDestinationIcon() })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: system-ui; font-size: 12px;">
              <strong style="color: #ef4444; font-size: 13px;">Delivery Destination</strong><br/>
              <span style="color: #334155;">${destinationLocation.address || "Customer Address"}</span>
            </div>`
          );
      } else {
        markersRef.current.dest.setLatLng(destLatLng);
      }
    } else if (markersRef.current.dest) {
      map.removeLayer(markersRef.current.dest);
      markersRef.current.dest = null;
    }

    // ── Update Road Route Polyline ───────────────
    if (markersRef.current.polyline) {
      map.removeLayer(markersRef.current.polyline);
      markersRef.current.polyline = null;
    }

    if (routeCoordinates && routeCoordinates.length > 1) {
      markersRef.current.polyline = L.polyline(routeCoordinates, {
        color: "#0891b2",
        weight: 4,
        opacity: 0.85,
        dashArray: "8, 6",
      }).addTo(map);
    } else if (hasDeliveryCoords && hasDestCoords) {
      // Fallback straight line if road geometry not loaded
      markersRef.current.polyline = L.polyline(
        [
          [currentLocation.latitude, currentLocation.longitude],
          [destinationLocation.latitude, destinationLocation.longitude],
        ],
        {
          color: "#0891b2",
          weight: 3,
          dashArray: "6, 6",
          opacity: 0.6,
        }
      ).addTo(map);
    }

    // ── Update History Breadcrumbs ───────────────
    if (markersRef.current.historyLine) {
      map.removeLayer(markersRef.current.historyLine);
      markersRef.current.historyLine = null;
    }

    if (history && history.length > 1) {
      const historyPoints = history.map((h) => [h.latitude, h.longitude]);
      markersRef.current.historyLine = L.polyline(historyPoints, {
        color: "#10b981",
        weight: 3,
        opacity: 0.6,
      }).addTo(map);
    }

    // ── Fit Bounds to Markers ────────────────────
    const pointsToFit = [];
    if (hasDeliveryCoords) {
      pointsToFit.push([currentLocation.latitude, currentLocation.longitude]);
    }
    if (hasDestCoords) {
      pointsToFit.push([destinationLocation.latitude, destinationLocation.longitude]);
    }

    if (pointsToFit.length >= 2) {
      map.fitBounds(L.latLngBounds(pointsToFit), { padding: [50, 50], maxZoom: 16 });
    } else if (pointsToFit.length === 1) {
      map.setView(pointsToFit[0], 15);
    }
  }, [
    currentLocation?.latitude,
    currentLocation?.longitude,
    currentLocation?.timestamp,
    destinationLocation?.latitude,
    destinationLocation?.longitude,
    routeCoordinates,
    history,
  ]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-900">
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: "100%", height }} className="z-0" />

      {/* Connecting / Satellite Telemetry Banner if GPS pending */}
      {!hasDeliveryCoords && (
        <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md z-10 bg-slate-900/95 border border-cyan-500/40 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
              <Navigation className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                Connecting to GPS Satellite Network
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Transmitting real-time coordinates from Grozo Dark Store Hub #04 to your doorstep.
              </p>
              {hasDestCoords && (
                <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
                  ✓ Destination delivery address mapped at customer pin.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Telemetry Badge if GPS Available */}
      {hasDeliveryCoords && (
        <div className="absolute top-4 left-4 z-10 bg-slate-900/95 border border-cyan-500/40 backdrop-blur-md rounded-2xl px-3.5 py-2.5 shadow-2xl flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">Live GPS Active</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                REAL-TIME
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
              {currentLocation.accuracy ? ` (±${Math.round(currentLocation.accuracy)}m)` : ""}
            </p>
          </div>
        </div>
      )}

      {/* Map Provider Watermark / Attribution */}
      <div className="absolute bottom-2 left-2 z-10 bg-slate-900/80 px-2 py-1 rounded-md text-[10px] text-slate-400 border border-slate-800">
        OpenStreetMap • Leaflet Engine
      </div>
    </div>
  );
};

export default RealMap;

"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { TripPin } from "@/lib/tripPins";
import { fitBoundsFromPins } from "@/lib/tripPins";
import "leaflet/dist/leaflet.css";

function markerIcon(color: string, kind: TripPin["kind"]) {
  const label = kind === "hotel" ? "🏨" : "📍";
  return L.divIcon({
    className: "konnichi-pin",
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:34px;height:34px;border-radius:999px;
      background:${color};color:white;font-size:14px;
      border:2px solid rgba(255,255,255,.9);
      box-shadow:0 0 0 3px ${color}55, 0 10px 24px rgba(0,0,0,.35);
    ">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  });
}

export interface MapFocus {
  lat: number;
  lng: number;
  zoom: number;
}

function FitPins({
  pins,
  activeId,
  focus,
}: {
  pins: TripPin[];
  activeId: string | null;
  focus: MapFocus | null;
}) {
  const map = useMap();
  const focusLat = focus?.lat;
  const focusLng = focus?.lng;
  const focusZoom = focus?.zoom;

  useEffect(() => {
    if (activeId) {
      const pin = pins.find((p) => p.id === activeId);
      if (pin) {
        map.flyTo([pin.lat, pin.lng], 14, { duration: 0.7 });
        return;
      }
    }
    // District / place selection from dashboard (or empty trip overview)
    if (
      focusLat != null &&
      focusLng != null &&
      focusZoom != null
    ) {
      map.flyTo([focusLat, focusLng], focusZoom, { duration: 0.7 });
      return;
    }
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.flyTo([pins[0].lat, pins[0].lng], 13, { duration: 0.6 });
      return;
    }
    const bounds = L.latLngBounds(
      pins.map((p) => [p.lat, p.lng] as [number, number]),
    );
    map.fitBounds(bounds.pad(0.18), { animate: true, duration: 0.6 });
  }, [map, pins, activeId, focusLat, focusLng, focusZoom]);

  return null;
}

interface MultiPinMapProps {
  pins: TripPin[];
  activePinId: string | null;
  onSelectPin: (pin: TripPin) => void;
  /** When set (and no active pin), fly the map to this place — e.g. district cards. */
  focus?: MapFocus | null;
}

export function MultiPinMap({
  pins,
  activePinId,
  onSelectPin,
  focus = null,
}: MultiPinMapProps) {
  const focusLat = focus?.lat;
  const focusLng = focus?.lng;
  const focusZoom = focus?.zoom;

  const view = useMemo(() => {
    if (focusLat != null && focusLng != null && focusZoom != null) {
      return { center: { lat: focusLat, lng: focusLng }, zoom: focusZoom };
    }
    return fitBoundsFromPins(pins);
  }, [pins, focusLat, focusLng, focusZoom]);

  return (
    <MapContainer
      center={[view.center.lat, view.center.lng]}
      zoom={view.zoom}
      className="h-full w-full"
      zoomControl={false}
      attributionControl
      style={{ background: "#0b0f17" }}
    >
      <TileLayer
        url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        subdomains={["mt0", "mt1", "mt2", "mt3"]}
        attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
        maxZoom={20}
      />
      <FitPins pins={pins} activeId={activePinId} focus={focus} />
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          icon={markerIcon(pin.color, pin.kind)}
          eventHandlers={{
            click: () => onSelectPin(pin),
          }}
        >
          <Popup>
            <div
              style={{ minWidth: 140, direction: "rtl", fontFamily: "inherit" }}
            >
              <strong>{pin.title}</strong>
              <div style={{ fontSize: 12, marginTop: 4, color: "var(--muted)" }}>
                {pin.subtitle}
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pin.query)}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: "var(--terracotta)" }}
              >
                פתח ב־Google Maps
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

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
import {
  filterValidPins,
  fitBoundsFromPins,
} from "@/lib/tripPins";
import "leaflet/dist/leaflet.css";

const TOKYO: [number, number] = [35.68, 139.76];

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

function toFiniteNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function asLatLng(lat: unknown, lng: unknown): L.LatLng | null {
  const la = toFiniteNumber(lat);
  const ln = toFiniteNumber(lng);
  if (la == null || ln == null) return null;
  if (la < -90 || la > 90 || ln < -180 || ln > 180) return null;
  try {
    const ll = L.latLng(la, ln);
    if (!ll || Number.isNaN(ll.lat) || Number.isNaN(ll.lng)) return null;
    return ll;
  } catch {
    return null;
  }
}

/**
 * Leaflet sizes the map at init. If the container was display:none / zero-sized
 * (mobile רשימה|מפה tabs, PiP open animation), tiles stay black until invalidateSize.
 */
function InvalidateSizeOnVisible() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const invalidate = () => {
      try {
        map.invalidateSize({ animate: false });
      } catch {
        /* map may be unmounted */
      }
    };

    const scheduleInvalidate = () => {
      requestAnimationFrame(() => {
        invalidate();
        window.setTimeout(invalidate, 0);
        window.setTimeout(invalidate, 100);
      });
    };

    scheduleInvalidate();

    const ro = new ResizeObserver(() => {
      scheduleInvalidate();
    });
    ro.observe(container);
    const parent = container.parentElement;
    if (parent) ro.observe(parent);

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio > 0)) {
          scheduleInvalidate();
        }
      },
      { threshold: [0, 0.01, 0.1] },
    );
    io.observe(container);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [map]);

  return null;
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

  useEffect(() => {
    const moveTo = (lat: unknown, lng: unknown, zoom: number, duration: number) => {
      const ll = asLatLng(lat, lng);
      const z = toFiniteNumber(zoom) ?? 11;
      try {
        if (!ll) {
          map.setView(TOKYO, 11, { animate: false });
          return;
        }
        map.setView(ll, z, { animate: duration > 0 });
        if (duration > 0) {
          map.panTo(ll, { animate: true, duration });
        }
      } catch {
        try {
          map.setView(TOKYO, 11, { animate: false });
        } catch {
          /* map may be unmounted */
        }
      }
    };

    try {
      const valid = filterValidPins(pins).filter(
        (p) => asLatLng(p.lat, p.lng) != null,
      );

      if (activeId) {
        const pin = valid.find((p) => p.id === activeId);
        if (pin) {
          moveTo(pin.lat, pin.lng, 14, 0.7);
          return;
        }
      }

      const focusLl = focus ? asLatLng(focus.lat, focus.lng) : null;
      const focusZoom = focus ? toFiniteNumber(focus.zoom) : null;
      if (focusLl && focusZoom != null) {
        moveTo(focusLl.lat, focusLl.lng, focusZoom, 0.7);
        return;
      }

      if (valid.length === 0) {
        moveTo(TOKYO[0], TOKYO[1], 11, 0);
        return;
      }

      if (valid.length === 1) {
        moveTo(valid[0].lat, valid[0].lng, 13, 0.6);
        return;
      }

      const points = valid
        .map((p) => asLatLng(p.lat, p.lng))
        .filter((ll): ll is L.LatLng => ll != null);

      if (points.length < 2) {
        moveTo(TOKYO[0], TOKYO[1], 11, 0);
        return;
      }

      const bounds = L.latLngBounds(points);
      if (!bounds.isValid()) {
        moveTo(TOKYO[0], TOKYO[1], 11, 0);
        return;
      }
      map.fitBounds(bounds.pad(0.18), { animate: true, duration: 0.6 });
    } catch {
      moveTo(TOKYO[0], TOKYO[1], 11, 0);
    }
  }, [map, pins, activeId, focus]);

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
  const validPins = useMemo(
    () =>
      filterValidPins(pins).filter((p) => asLatLng(p.lat, p.lng) != null),
    [pins],
  );

  const focusLl = focus ? asLatLng(focus.lat, focus.lng) : null;
  const focusZoom = focus ? toFiniteNumber(focus.zoom) : null;
  const hasValidFocus = focusLl != null && focusZoom != null;

  const view = useMemo(() => {
    if (hasValidFocus && focusLl && focusZoom != null) {
      return {
        center: { lat: focusLl.lat, lng: focusLl.lng },
        zoom: focusZoom,
      };
    }
    return fitBoundsFromPins(validPins);
  }, [validPins, hasValidFocus, focusLl, focusZoom]);

  const mapCenter = useMemo((): [number, number] => {
    const ll = asLatLng(view.center.lat, view.center.lng);
    return ll ? [ll.lat, ll.lng] : TOKYO;
  }, [view.center.lat, view.center.lng]);

  const mapZoom =
    toFiniteNumber(view.zoom) != null && (view.zoom as number) > 0
      ? (view.zoom as number)
      : 11;

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      className="h-full w-full"
      zoomControl={false}
      attributionControl
      style={{ background: "var(--background, #1a1714)", minHeight: "100%" }}
    >
      <TileLayer
        url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        subdomains={["mt0", "mt1", "mt2", "mt3"]}
        attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
        maxZoom={20}
      />
      <InvalidateSizeOnVisible />
      <FitPins pins={validPins} activeId={activePinId} focus={focus} />
      {validPins.map((pin) => {
        const ll = asLatLng(pin.lat, pin.lng);
        if (!ll) return null;
        return (
          <Marker
            key={pin.id}
            position={ll}
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
                <div
                  style={{ fontSize: 12, marginTop: 4, color: "var(--muted)" }}
                >
                  {pin.subtitle}
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pin.query)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12, color: "var(--espresso)" }}
                >
                  פתח ב־Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

import type { EditorDay } from "@/types/editor";
import { CATEGORY_META } from "@/types/editor";
import { resolveCoords } from "@/data/placeCoords";
import type { MapPlace } from "@/lib/maps";

export type TripPinKind = "hotel" | "attraction";

export interface TripPin {
  id: string;
  kind: TripPinKind;
  title: string;
  subtitle: string;
  date: string;
  city: string;
  lat: number;
  lng: number;
  color: string;
  query: string;
}

/** Tokyo Station — safe fallback when no valid coords exist. */
export const DEFAULT_MAP_CENTER = { lat: 35.68, lng: 139.76 } as const;

export function isValidLatLng(
  lat: unknown,
  lng: unknown,
): lat is number {
  const la = typeof lat === "number" ? lat : Number(lat);
  const ln = typeof lng === "number" ? lng : Number(lng);
  return (
    Number.isFinite(la) &&
    Number.isFinite(ln) &&
    la >= -90 &&
    la <= 90 &&
    ln >= -180 &&
    ln <= 180
  );
}

export function filterValidPins(pins: TripPin[]): TripPin[] {
  return pins.flatMap((p) => {
    const lat = typeof p.lat === "number" ? p.lat : Number(p.lat);
    const lng = typeof p.lng === "number" ? p.lng : Number(p.lng);
    if (!isValidLatLng(lat, lng)) return [];
    return [{ ...p, lat, lng }];
  });
}

export function collectTripPins(days: EditorDay[]): TripPin[] {
  const pins: TripPin[] = [];
  const seenHotels = new Set<string>();

  for (const day of days) {
    if (day.hotel.name.trim()) {
      const hotelKey = day.hotel.name.trim().toLowerCase();
      const coords = resolveCoords(day.hotel.name, day.city, {
        lat: day.hotel.lat,
        lng: day.hotel.lng,
      });
      if (coords && !seenHotels.has(hotelKey)) {
        if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) continue;
        seenHotels.add(hotelKey);
        pins.push({
          id: `hotel-${hotelKey}`,
          kind: "hotel",
          title: day.hotel.name,
          subtitle: `לינה · ${day.hotel.status}`,
          date: day.date,
          city: day.city,
          lat: coords.lat,
          lng: coords.lng,
          color: "#b8735a",
          query: day.hotel.name,
        });
      }
    }

    for (const activity of day.activities) {
      const coords = resolveCoords(
        activity.location || activity.title,
        day.city,
        {
          lat: activity.lat,
          lng: activity.lng,
          mapsLink: activity.mapsLink,
          location: activity.location,
        },
      );
      if (!coords) continue;
      if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) continue;
      const meta = CATEGORY_META[activity.category];
      pins.push({
        id: `act-${activity.id}`,
        kind: "attraction",
        title: activity.title,
        subtitle: `${meta.emoji} ${meta.label} · ${day.date}`,
        date: day.date,
        city: day.city,
        lat: coords.lat,
        lng: coords.lng,
        color: "#6a8f84",
        query:
          activity.title ||
          activity.location ||
          `${coords.lat},${coords.lng}`,
      });
    }
  }

  return pins;
}

export function pinToMapPlace(pin: TripPin): MapPlace {
  return {
    id: pin.id,
    labelHe: pin.title,
    labelEn: pin.query,
    query: pin.query,
    lat: pin.lat,
    lng: pin.lng,
    zoom: pin.kind === "hotel" ? 15 : 14,
  };
}

export function fitBoundsFromPins(pins: TripPin[]) {
  const valid = filterValidPins(pins);
  if (valid.length === 0) {
    return { center: { ...DEFAULT_MAP_CENTER }, zoom: 11 };
  }
  if (valid.length === 1) {
    return { center: { lat: valid[0].lat, lng: valid[0].lng }, zoom: 13 };
  }
  const lats = valid.map((p) => p.lat);
  const lngs = valid.map((p) => p.lng);
  const center = {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
  const span = Math.max(
    Math.max(...lats) - Math.min(...lats),
    Math.max(...lngs) - Math.min(...lngs),
  );
  const zoom = span > 4 ? 6 : span > 1.5 ? 7 : span > 0.4 ? 10 : 12;
  return { center, zoom };
}

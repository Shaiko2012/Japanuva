import type { EditorCity } from "@/types/editor";
import { parseGoogleMapsInput } from "@/lib/mapsParse";

export const CITY_COORDS: Record<EditorCity, { lat: number; lng: number }> = {
  Tokyo: { lat: 35.6812, lng: 139.7671 },
  Kyoto: { lat: 35.0116, lng: 135.7681 },
  Osaka: { lat: 34.6937, lng: 135.5023 },
  Hakone: { lat: 35.2324, lng: 139.1069 },
  Nara: { lat: 34.6851, lng: 135.8048 },
  Other: { lat: 35.2, lng: 136.9 },
};

/** Lookup table for known hotels / attractions (lat, lng). */
export const KNOWN_PLACE_COORDS: Record<string, { lat: number; lng: number }> = {
  "hotel gracery shinjuku": { lat: 35.6955, lng: 139.7014 },
  "mitsui garden kyoto station": { lat: 34.9862, lng: 135.7578 },
  "cross hotel osaka": { lat: 34.6689, lng: 135.5016 },
  "haneda excel hotel tokyu": { lat: 35.5489, lng: 139.7833 },
  "נחיתה ב־haneda": { lat: 35.5494, lng: 139.7798 },
  haneda: { lat: 35.5494, lng: 139.7798 },
  hnd: { lat: 35.5494, lng: 139.7798 },
  "ערב רגוע בשינג'וקו": { lat: 35.6938, lng: 139.7034 },
  "שינג'וקו גיון": { lat: 35.6852, lng: 139.7101 },
  "shinjuku gyoen": { lat: 35.6852, lng: 139.7101 },
  "תצפית מגדל עיריית טוקיו": { lat: 35.6896, lng: 139.6917 },
  "מקדש סנסו־ג'י": { lat: 35.7148, lng: 139.7967 },
  asakusa: { lat: 35.7148, lng: 139.7967 },
  "teamlab planets": { lat: 35.6492, lng: 139.7895 },
  "פאשמי אינארי": { lat: 34.9671, lng: 135.7727 },
  "קיומיזו־דרה": { lat: 34.9949, lng: 135.785 },
  "אראשיאמה — חורשת במבוק": { lat: 35.017, lng: 135.6722 },
  "פארק הקופים איאוואטאיאמה": { lat: 35.0115, lng: 135.6761 },
  "universal studios japan": { lat: 34.6654, lng: 135.4323 },
  "tokyo disneysea": { lat: 35.6264, lng: 139.885 },
};

function coordsFromText(text?: string): { lat: number; lng: number } | null {
  if (!text?.trim()) return null;
  const parsed = parseGoogleMapsInput(text);
  if (parsed.lat == null || parsed.lng == null) return null;
  return { lat: parsed.lat, lng: parsed.lng };
}

export function resolveCoords(
  name: string,
  city?: EditorCity,
  explicit?: {
    lat?: number;
    lng?: number;
    mapsLink?: string;
    location?: string;
    allowCityFallback?: boolean;
  },
): { lat: number; lng: number } | null {
  if (
    explicit?.lat != null &&
    explicit?.lng != null &&
    !Number.isNaN(explicit.lat) &&
    !Number.isNaN(explicit.lng)
  ) {
    return { lat: explicit.lat, lng: explicit.lng };
  }

  for (const source of [explicit?.mapsLink, explicit?.location]) {
    const fromParse = coordsFromText(source);
    if (fromParse) return fromParse;
  }

  const key = name.trim().toLowerCase();
  if (KNOWN_PLACE_COORDS[key]) return KNOWN_PLACE_COORDS[key];

  if (explicit?.location) {
    const locKey = explicit.location.trim().toLowerCase();
    if (KNOWN_PLACE_COORDS[locKey]) return KNOWN_PLACE_COORDS[locKey];
  }

  if (explicit?.allowCityFallback && city) return CITY_COORDS[city];
  return null;
}

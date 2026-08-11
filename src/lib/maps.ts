import type { DistrictId } from "@/data/trip";

export interface MapPlace {
  id: string;
  labelHe: string;
  labelEn: string;
  query: string;
  lat: number;
  lng: number;
  zoom: number;
}

export const districtMapPlaces: Record<DistrictId, MapPlace> = {
  shinjuku: {
    id: "shinjuku",
    labelHe: "שינג'וקו",
    labelEn: "Shinjuku",
    query: "Shinjuku, Tokyo, Japan",
    lat: 35.6938,
    lng: 139.7034,
    zoom: 14,
  },
  shibuya: {
    id: "shibuya",
    labelHe: "שיבויה",
    labelEn: "Shibuya",
    query: "Shibuya Crossing, Tokyo, Japan",
    lat: 35.6595,
    lng: 139.7004,
    zoom: 15,
  },
  kyoto: {
    id: "kyoto",
    labelHe: "קיוטו",
    labelEn: "Kyoto",
    query: "Kyoto Station, Kyoto, Japan",
    lat: 34.9858,
    lng: 135.7588,
    zoom: 13,
  },
  osaka: {
    id: "osaka",
    labelHe: "אוסקה",
    labelEn: "Osaka",
    query: "Dotonbori, Osaka, Japan",
    lat: 34.6687,
    lng: 135.5013,
    zoom: 14,
  },
};

export const japanOverview: MapPlace = {
  id: "japan",
  labelHe: "יפן · מסלול הטיול",
  labelEn: "Japan Trip Overview",
  query: "Japan",
  lat: 35.2,
  lng: 136.9,
  zoom: 6,
};

/** Build a Google Maps embed URL (works with or without API key). */
export function buildGoogleMapsEmbedUrl(place: MapPlace): string {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (key) {
    const params = new URLSearchParams({
      key,
      q: place.query,
      zoom: String(place.zoom),
      language: "he",
    });
    return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
  }

  const params = new URLSearchParams({
    q: `${place.lat},${place.lng}`,
    z: String(place.zoom),
    hl: "he",
    output: "embed",
  });
  return `https://maps.google.com/maps?${params.toString()}`;
}

export function buildGoogleMapsOpenUrl(place: MapPlace): string {
  const params = new URLSearchParams({
    api: "1",
    query: place.query,
  });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

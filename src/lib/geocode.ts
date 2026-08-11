import { parseGoogleMapsInput } from "@/lib/mapsParse";

export async function geocodePlace(
  input: string,
): Promise<{ lat: number; lng: number; query: string } | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parsed = parseGoogleMapsInput(trimmed);
  if (parsed.lat != null && parsed.lng != null) {
    return {
      lat: parsed.lat,
      lng: parsed.lng,
      query: parsed.query || trimmed,
    };
  }

  const query = parsed.query || trimmed;
  try {
    const res = await fetch(
      `/api/geocode?q=${encodeURIComponent(query)}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      lat?: number;
      lng?: number;
      query?: string;
    };
    if (data.lat == null || data.lng == null) return null;
    return { lat: data.lat, lng: data.lng, query: data.query || query };
  } catch {
    return null;
  }
}

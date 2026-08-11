import { NextResponse } from "next/server";
import { getGoogleMapsServerKey } from "@/lib/googleMapsKey";
import { buildMapsOpenUrl } from "@/lib/mapsParse";
import type { PlaceSearchResult } from "@/types/places";

interface GooglePlaceDetailsResponse {
  status: string;
  result?: {
    name?: string;
    formatted_address?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
  };
  error_message?: string;
}

export async function GET(request: Request) {
  const placeId = new URL(request.url).searchParams.get("placeId")?.trim();
  if (!placeId) {
    return NextResponse.json({ error: "missing placeId" }, { status: 400 });
  }

  const key = getGoogleMapsServerKey();
  if (!key) {
    return NextResponse.json({ error: "google unavailable" }, { status: 503 });
  }

  try {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json",
    );
    url.searchParams.set("place_id", placeId);
    url.searchParams.set(
      "fields",
      "name,formatted_address,geometry,place_id",
    );
    url.searchParams.set("key", key);
    url.searchParams.set("language", "he");

    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) {
      return NextResponse.json({ error: "details failed" }, { status: 502 });
    }

    const data = (await res.json()) as GooglePlaceDetailsResponse;
    if (data.status !== "OK" || !data.result) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const lat = data.result.geometry?.location?.lat;
    const lng = data.result.geometry?.location?.lng;
    if (lat == null || lng == null) {
      return NextResponse.json({ error: "no coordinates" }, { status: 404 });
    }

    const name = data.result.name ?? "";
    const address = data.result.formatted_address ?? name;
    const result: PlaceSearchResult = {
      name,
      address,
      lat,
      lng,
      mapsLink: buildMapsOpenUrl({
        name,
        address,
        placeId,
        lat,
        lng,
      }),
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "details failed" }, { status: 502 });
  }
}

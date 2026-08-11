import { NextResponse } from "next/server";
import { getGoogleMapsServerKey } from "@/lib/googleMapsKey";
import type { PlaceAutocompletePrediction } from "@/types/places";

interface GoogleAutocompleteResponse {
  status: string;
  predictions?: Array<{
    place_id: string;
    description: string;
    structured_formatting?: {
      main_text?: string;
      secondary_text?: string;
    };
  }>;
  error_message?: string;
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "missing query" }, { status: 400 });
  }

  const key = getGoogleMapsServerKey();
  if (!key) {
    return NextResponse.json({ available: false, predictions: [] });
  }

  try {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json",
    );
    url.searchParams.set("input", q);
    url.searchParams.set("key", key);
    url.searchParams.set("language", "he");
    url.searchParams.set("components", "country:jp");

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json(
        { available: false, predictions: [] },
        { status: 502 },
      );
    }

    const data = (await res.json()) as GoogleAutocompleteResponse;
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json({ available: false, predictions: [] });
    }

    const predictions: PlaceAutocompletePrediction[] = (data.predictions ?? []).map(
      (p) => ({
        placeId: p.place_id,
        name: p.structured_formatting?.main_text ?? p.description,
        address:
          p.structured_formatting?.secondary_text ??
          p.description.split(",").slice(1).join(",").trim() ??
          p.description,
      }),
    );

    return NextResponse.json({ available: true, predictions });
  } catch {
    return NextResponse.json(
      { available: false, predictions: [] },
      { status: 502 },
    );
  }
}

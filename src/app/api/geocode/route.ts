import { NextResponse } from "next/server";
import { parseGoogleMapsInput } from "@/lib/mapsParse";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "missing query" }, { status: 400 });
  }

  const parsed = parseGoogleMapsInput(q);
  if (parsed.lat != null && parsed.lng != null) {
    return NextResponse.json({
      lat: parsed.lat,
      lng: parsed.lng,
      query: parsed.query || q,
    });
  }

  const searchQuery = parsed.query || q;
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", `${searchQuery}, Japan`);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "he,en",
        "User-Agent": "Japanuva/1.0 (family trip planner)",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "geocode failed" }, { status: 502 });
    }

    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data[0]) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
      query: searchQuery,
    });
  } catch {
    return NextResponse.json({ error: "geocode failed" }, { status: 502 });
  }
}

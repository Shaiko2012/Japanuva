import { NextResponse } from "next/server";
import { buildMapsOpenUrl } from "@/lib/mapsParse";
import type { PlaceSearchResult } from "@/types/places";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "missing query" }, { status: 400 });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", `${q}, Japan`);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "he,en",
        "User-Agent": "Konnichimap/1.0 (family trip planner)",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "search failed" }, { status: 502 });
    }

    const data = (await res.json()) as NominatimResult[];
    const results: PlaceSearchResult[] = data.map((item) => {
      const lat = Number(item.lat);
      const lng = Number(item.lon);
      const name =
        item.name?.trim() ||
        item.display_name.split(",")[0]?.trim() ||
        q;
      return {
        name,
        address: item.display_name,
        lat,
        lng,
        mapsLink: buildMapsOpenUrl({
          name,
          address: item.display_name,
          lat,
          lng,
        }),
      };
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "search failed" }, { status: 502 });
  }
}

import { NextResponse } from "next/server";
import {
  estimateDurationMinutes,
  estimateJapanFareJpy,
  haversineKm,
  modeLabelHe,
  modeToGoogleTransitMode,
  modeToGoogleTravelMode,
  pickAutoMode,
} from "@/lib/transitMath";
import type { TransitMode } from "@/data/dayRoute";

interface GoogleDirectionsResponse {
  status: string;
  routes?: Array<{
    legs?: Array<{
      duration?: { value: number; text: string };
      distance?: { value: number; text: string };
      steps?: Array<{
        travel_mode?: string;
        transit_details?: {
          line?: {
            short_name?: string;
            name?: string;
            vehicle?: { type?: string; name?: string };
          };
          departure_stop?: { name?: string };
          arrival_stop?: { name?: string };
          headsign?: string;
        };
      }>;
    }>;
    fare?: { value?: number; currency?: string; text?: string };
  }>;
  error_message?: string;
}

type GoogleLeg = NonNullable<
  NonNullable<GoogleDirectionsResponse["routes"]>[0]["legs"]
>[0];

export interface TransitRouteResult {
  mode: TransitMode;
  modeLabelHe: string;
  durationMinutes: number;
  priceJpy: number;
  buyWhere: string;
  platformHint: string;
  lineHint: string;
  notes: string;
  source: "google" | "estimate";
  distanceKm?: number;
}

function inferModeFromGoogle(steps: GoogleLeg): TransitMode {
  const transitSteps =
    steps?.steps?.filter((s) => s.travel_mode === "TRANSIT") ?? [];
  if (transitSteps.length === 0) return "walk";

  const vehicle = transitSteps[0]?.transit_details?.line?.vehicle?.type ?? "";
  if (vehicle === "BUS" || vehicle === "INTERCITY_BUS") return "bus";
  if (vehicle === "SUBWAY" || vehicle === "TRAM") return "metro";
  if (
    vehicle === "HEAVY_RAIL" ||
    vehicle === "COMMUTER_TRAIN" ||
    vehicle === "HIGH_SPEED_TRAIN"
  ) {
    return "jr";
  }
  return "metro";
}

function extractLineHint(steps: GoogleLeg): string {
  const lines =
    steps?.steps
      ?.filter((s) => s.travel_mode === "TRANSIT")
      .map((s) => {
        const line = s.transit_details?.line;
        const name = line?.short_name || line?.name;
        const headsign = s.transit_details?.headsign;
        return headsign ? `${name ?? "קו"} → ${headsign}` : name;
      })
      .filter(Boolean) ?? [];

  return lines.length > 0 ? lines.join(" · ") : "—";
}

function extractPlatformHint(steps: GoogleLeg): string {
  const depart = steps?.steps?.find((s) => s.travel_mode === "TRANSIT")
    ?.transit_details?.departure_stop?.name;
  const arrive = steps?.steps
    ?.filter((s) => s.travel_mode === "TRANSIT")
    .at(-1)?.transit_details?.arrival_stop?.name;

  if (depart && arrive) return `${depart} → ${arrive}`;
  return depart ?? "—";
}

function buildNotes(
  source: "google" | "estimate",
  mode: TransitMode,
  distanceKm?: number,
): string {
  if (source === "google") {
    return mode === "walk"
      ? "מסלול הליכה מ-Google Maps"
      : "מסלול תחבורה ציבורית מ-Google Maps · שעות ורציפים עלולים להשתנות";
  }
  const dist =
    distanceKm != null ? ` · מרחק ישר ~${distanceKm.toFixed(1)} ק״מ` : "";
  return `הערכה לפי מרחק${dist} · לחצו «פתיחת מסלול» לנתונים מדויקים ב-Google Maps`;
}

function fallbackEstimate(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  preferred?: TransitMode,
  labelText = "",
): TransitRouteResult {
  const km = haversineKm(fromLat, fromLng, toLat, toLng);
  const mode = preferred ?? (pickAutoMode(km, labelText) as TransitMode);
  const durationMinutes = estimateDurationMinutes(km, mode);
  const priceJpy = estimateJapanFareJpy(km, mode);

  return {
    mode,
    modeLabelHe: modeLabelHe(mode),
    durationMinutes,
    priceJpy,
    buyWhere:
      mode === "walk"
        ? "—"
        : mode === "taxi"
          ? "אפליקציית מוניות / דגל בכביש"
          : "Suica/Pasmo בשער · או מכונת JR",
    platformHint: "—",
    lineHint: km >= 120 ? "Shinkansen / JR" : mode === "jr" ? "JR" : "—",
    notes: buildNotes("estimate", mode, km),
    source: "estimate",
    distanceKm: km,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fromLat = Number(url.searchParams.get("fromLat"));
  const fromLng = Number(url.searchParams.get("fromLng"));
  const toLat = Number(url.searchParams.get("toLat"));
  const toLng = Number(url.searchParams.get("toLng"));
  const preferred = url.searchParams.get("mode") as TransitMode | "auto" | null;
  const labels = url.searchParams.get("labels") ?? "";

  if ([fromLat, fromLng, toLat, toLng].some((n) => Number.isNaN(n))) {
    return NextResponse.json({ error: "invalid coordinates" }, { status: 400 });
  }

  const modePref =
    preferred && preferred !== "auto" ? preferred : undefined;

  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      fallbackEstimate(fromLat, fromLng, toLat, toLng, modePref, labels),
    );
  }

  const travelMode = modeToGoogleTravelMode(modePref ?? "metro");
  const params = new URLSearchParams({
    origin: `${fromLat},${fromLng}`,
    destination: `${toLat},${toLng}`,
    mode: travelMode,
    key: apiKey,
    language: "he",
    region: "jp",
  });

  if (travelMode === "transit") {
    params.set("transit_routing_preference", "fewer_transfers");
    const transitMode = modeToGoogleTransitMode(modePref ?? "metro");
    if (transitMode) params.set("transit_mode", transitMode);
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`,
      { next: { revalidate: 3600 } },
    );
    const data = (await res.json()) as GoogleDirectionsResponse;

    if (data.status !== "OK" || !data.routes?.[0]?.legs?.[0]) {
      return NextResponse.json(
        fallbackEstimate(fromLat, fromLng, toLat, toLng, modePref, labels),
      );
    }

    const route = data.routes[0];
    const leg = route.legs![0];
    const durationMinutes = Math.max(
      1,
      Math.round((leg.duration?.value ?? 0) / 60),
    );
    const distanceKm = leg.distance?.value
      ? leg.distance.value / 1000
      : haversineKm(fromLat, fromLng, toLat, toLng);

    let mode: TransitMode = modePref ?? "metro";
    if (!modePref) {
      if (travelMode === "walking") mode = "walk";
      else if (travelMode === "driving") mode = "taxi";
      else mode = inferModeFromGoogle(leg);
    }

    const priceJpy =
      route.fare?.currency === "JPY" && route.fare.value != null
        ? route.fare.value
        : estimateJapanFareJpy(distanceKm, mode);

    return NextResponse.json({
      mode,
      modeLabelHe: modeLabelHe(mode),
      durationMinutes,
      priceJpy,
      buyWhere:
        mode === "walk"
          ? "—"
          : mode === "taxi"
            ? "אפליקציית מוניות / דגל בכביש"
            : "Suica/Pasmo בשער · או מכונת JR",
      platformHint: extractPlatformHint(leg),
      lineHint: extractLineHint(leg),
      notes: buildNotes("google", mode, distanceKm),
      source: "google" as const,
      distanceKm,
    } satisfies TransitRouteResult);
  } catch {
    return NextResponse.json(
      fallbackEstimate(fromLat, fromLng, toLat, toLng, modePref, labels),
    );
  }
}

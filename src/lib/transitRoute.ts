import type { TransitMode } from "@/data/dayRoute";
import { buildMapsDirectionsUrl } from "@/lib/mapsParse";
import type { RouteStop } from "@/data/dayRoute";
import { stopMapsPoint } from "@/data/dayRoute";

export interface TransitLegEstimate {
  fromId: string;
  toId: string;
  mode: TransitMode;
  modeLabelHe: string;
  durationMinutes: number;
  priceJpy: number;
  buyWhere: string;
  platformHint: string;
  lineHint: string;
  notes: string;
  mapsDirUrl: string;
  source: "google" | "estimate" | "pending" | "missing_coords";
  distanceKm?: number;
}

export interface TransitRouteApiResult {
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

export function buildLegFromApi(
  from: RouteStop,
  to: RouteStop,
  api: TransitRouteApiResult,
): TransitLegEstimate {
  const travelmode =
    api.mode === "walk"
      ? "walking"
      : api.mode === "taxi"
        ? "driving"
        : "transit";

  return {
    fromId: from.id,
    toId: to.id,
    mode: api.mode,
    modeLabelHe: api.modeLabelHe,
    durationMinutes: api.durationMinutes,
    priceJpy: api.priceJpy,
    buyWhere: api.buyWhere,
    platformHint: api.platformHint,
    lineHint: api.lineHint,
    notes: api.notes,
    mapsDirUrl: buildMapsDirectionsUrl(
      stopMapsPoint(from),
      stopMapsPoint(to),
      travelmode,
    ),
    source: api.source,
    distanceKm: api.distanceKm,
  };
}

export function missingCoordsLeg(from: RouteStop, to: RouteStop): TransitLegEstimate {
  return {
    fromId: from.id,
    toId: to.id,
    mode: "metro",
    modeLabelHe: "—",
    durationMinutes: 0,
    priceJpy: 0,
    buyWhere: "—",
    platformHint: "—",
    lineHint: "—",
    notes: "לחצו «מצא» בכל תחנה כדי לקבל זמן ומחיר",
    mapsDirUrl: buildMapsDirectionsUrl(stopMapsPoint(from), stopMapsPoint(to)),
    source: "missing_coords",
  };
}

export async function fetchTransitLeg(
  from: RouteStop,
  to: RouteStop,
  mode: TransitMode | "auto",
): Promise<TransitLegEstimate> {
  if (
    from.lat == null ||
    from.lng == null ||
    to.lat == null ||
    to.lng == null
  ) {
    return missingCoordsLeg(from, to);
  }

  const params = new URLSearchParams({
    fromLat: String(from.lat),
    fromLng: String(from.lng),
    toLat: String(to.lat),
    toLng: String(to.lng),
    mode,
    labels: `${from.name} ${from.address} ${to.name} ${to.address}`,
  });

  const res = await fetch(`/api/transit-route?${params.toString()}`);
  if (!res.ok) return missingCoordsLeg(from, to);

  const data = (await res.json()) as TransitRouteApiResult;
  return buildLegFromApi(from, to, data);
}

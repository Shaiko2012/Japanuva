import { isBareCoordQuery } from "@/lib/mapsParse";

export type TransitMode = "walk" | "metro" | "jr" | "bus" | "taxi";

export interface RouteStop {
  id: string;
  name: string;
  address: string;
  /** Official place name from search — used when opening Google Maps. */
  searchName?: string;
  mapsLink?: string;
  lat?: number;
  lng?: number;
  arriveBy: string; // HH:mm
  stayMinutes: number;
}

function firstMapsLabel(...values: Array<string | undefined>) {
  for (const value of values) {
    const trimmed = value?.trim() ?? "";
    if (trimmed && !isBareCoordQuery(trimmed)) return trimmed;
  }
  return "";
}

export function stopMapsPoint(stop: RouteStop) {
  return {
    label: firstMapsLabel(stop.searchName, stop.address, stop.name),
  };
}

export function createEmptyDayRouteStops(): RouteStop[] {
  return [
    createStop({ name: "", address: "", arriveBy: "09:00" }),
    createStop({ name: "", address: "", arriveBy: "12:00" }),
  ];
}

export function isDemoDayRouteStops(stops: RouteStop[]): boolean {
  return stops.some((s) => s.id.startsWith("demo-"));
}

export function createStop(partial?: Partial<RouteStop>): RouteStop {
  return {
    id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    address: "",
    arriveBy: "10:00",
    stayMinutes: 90,
    ...partial,
  };
}

export const demoDayRouteStops: RouteStop[] = [
  createStop({
    id: "demo-1",
    name: "מלון בשינג'וקו",
    searchName: "Hotel Gracery Shinjuku",
    address: "Hotel Gracery Shinjuku, Tokyo",
    lat: 35.6955,
    lng: 139.7014,
    arriveBy: "08:30",
    stayMinutes: 30,
  }),
  createStop({
    id: "demo-2",
    name: "Tokyo DisneySea",
    searchName: "Tokyo DisneySea",
    address: "1-13 Maihama, Urayasu, Chiba",
    lat: 35.6264,
    lng: 139.885,
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Tokyo%20DisneySea",
    arriveBy: "10:00",
    stayMinutes: 420,
  }),
  createStop({
    id: "demo-3",
    name: "חזרה למלון",
    searchName: "Hotel Gracery Shinjuku",
    address: "Hotel Gracery Shinjuku, Tokyo",
    lat: 35.6955,
    lng: 139.7014,
    arriveBy: "19:30",
    stayMinutes: 60,
  }),
];

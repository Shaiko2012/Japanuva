const EARTH_RADIUS_KM = 6371;

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Rough Japan IC-card style fare from straight-line distance. */
export function estimateJapanFareJpy(km: number, mode: string): number {
  if (mode === "walk") return 0;
  if (mode === "taxi") return Math.round(730 + km * 420);
  if (km >= 120) return Math.round(8000 + km * 22);
  if (km >= 30) return Math.round(600 + km * 35);
  if (km >= 10) return Math.round(220 + km * 28);
  return Math.round(170 + km * 32);
}

export function estimateDurationMinutes(
  km: number,
  mode: string,
): number {
  if (mode === "walk") return Math.max(5, Math.round((km / 4.8) * 60));
  if (mode === "taxi") return Math.max(8, Math.round((km / 22) * 60) + 5);
  if (km >= 120) return Math.round((km / 240) * 60) + 25;
  if (km >= 30) return Math.round((km / 45) * 60) + 15;
  return Math.round((km / 28) * 60) + 8;
}

export function pickAutoMode(km: number, text: string): string {
  const lower = text.toLowerCase();
  if (km <= 0.8) return "walk";
  if (
    lower.includes("disney") ||
    lower.includes("דיסני") ||
    lower.includes("usj") ||
    lower.includes("airport") ||
    lower.includes("haneda") ||
    lower.includes("narita") ||
    km >= 25
  ) {
    return "jr";
  }
  if (km <= 3.5) return "metro";
  return "jr";
}

export function modeToGoogleTravelMode(
  mode: string,
): "transit" | "walking" | "driving" {
  if (mode === "walk") return "walking";
  if (mode === "taxi") return "driving";
  return "transit";
}

export function modeToGoogleTransitMode(
  mode: string,
): "bus" | "subway" | "train" | "rail" | undefined {
  if (mode === "bus") return "bus";
  if (mode === "metro") return "subway";
  if (mode === "jr") return "rail";
  return undefined;
}

export function modeLabelHe(mode: string): string {
  switch (mode) {
    case "walk":
      return "הליכה";
    case "taxi":
      return "מונית";
    case "bus":
      return "אוטובוס";
    case "jr":
      return "JR / רכבת";
    case "metro":
      return "מטרו / רכבת תחתית";
    default:
      return "תחבורה ציבורית";
  }
}

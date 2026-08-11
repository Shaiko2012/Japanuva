import type { EditorDay } from "@/types/editor";
import { seedEditorDays } from "@/data/editorSeed";

const DEMO_DAY_IDS = new Set(seedEditorDays.map((d) => d.id));

const DEMO_ACTIVITY_IDS = new Set(
  seedEditorDays.flatMap((d) => d.activities.map((a) => a.id)),
);

const DEMO_HOTEL_NAMES = new Set(
  seedEditorDays.map((d) => d.hotel.name.trim().toLowerCase()).filter(Boolean),
);

const DEMO_ACTIVITY_TITLES = new Set(
  seedEditorDays
    .flatMap((d) => d.activities.map((a) => a.title.trim().toLowerCase()))
    .filter(Boolean),
);

/** True when itinerary matches the bundled demo trip (Shinjuku, USJ, etc.). */
export function isBundledDemoItinerary(days: EditorDay[]): boolean {
  if (days.length === 0) return false;

  if (days.some((d) => DEMO_DAY_IDS.has(d.id))) return true;

  if (
    days.some((d) => DEMO_HOTEL_NAMES.has(d.hotel.name.trim().toLowerCase()))
  ) {
    return true;
  }

  if (
    days.some((d) =>
      d.activities.some((a) => DEMO_ACTIVITY_IDS.has(a.id)),
    )
  ) {
    return true;
  }

  const demoTitleHits = days.reduce(
    (n, d) =>
      n +
      d.activities.filter((a) =>
        DEMO_ACTIVITY_TITLES.has(a.title.trim().toLowerCase()),
      ).length,
    0,
  );
  if (demoTitleHits >= 2) return true;

  return false;
}

export function isEmptyPersonalItinerary(days: EditorDay[]): boolean {
  if (days.length === 0) return true;
  if (days.length > 1) return false;
  const day = days[0];
  return (
    day.activities.length === 0 &&
    !day.hotel.name.trim() &&
    day.hotel.status === "not_booked"
  );
}

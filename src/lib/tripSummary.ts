import { cityLabel, type EditorDay, type HotelStatus } from "@/types/editor";

export function formatDayHe(date: string, opts: Intl.DateTimeFormatOptions) {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat("he-IL", opts).format(d);
}

export interface DayCost {
  lodging: number;
  activities: number;
  food: number;
  total: number;
}

export function dayCost(day: EditorDay): DayCost {
  const lodging = day.hotel.name.trim() ? day.hotel.costPerNightJpy || 0 : 0;
  const activities = day.activities.reduce((sum, a) => sum + (a.priceJpy || 0), 0);
  const food = day.foodEstimateJpy || 0;
  return { lodging, activities, food, total: lodging + activities + food };
}

export function tripCost(days: EditorDay[]): DayCost {
  return days.reduce<DayCost>(
    (acc, day) => {
      const c = dayCost(day);
      return {
        lodging: acc.lodging + c.lodging,
        activities: acc.activities + c.activities,
        food: acc.food + c.food,
        total: acc.total + c.total,
      };
    },
    { lodging: 0, activities: 0, food: 0, total: 0 },
  );
}

export interface Stay {
  name: string;
  status: HotelStatus;
  fromDate: string;
  toDate: string;
  nights: number;
  costPerNightJpy: number;
  bookingLink?: string;
}

/** Consecutive itinerary days with the same hotel collapse into one stay. */
export function groupStays(days: EditorDay[]): Stay[] {
  const stays: Stay[] = [];
  for (const day of days) {
    const name = day.hotel.name.trim();
    if (!name) continue;
    const last = stays[stays.length - 1];
    if (last && last.name === name) {
      last.nights += 1;
      last.toDate = day.date;
      if (day.hotel.status === "not_booked") last.status = "not_booked";
      else if (day.hotel.status === "considering" && last.status === "booked") {
        last.status = "considering";
      }
      continue;
    }
    stays.push({
      name,
      status: day.hotel.status,
      fromDate: day.date,
      toDate: day.date,
      nights: 1,
      costPerNightJpy: day.hotel.costPerNightJpy,
      bookingLink: day.hotel.bookingLink,
    });
  }
  return stays;
}

/** Nights with no lodging. The final day is departure, so it never needs a hotel. */
export function nightsWithoutLodging(days: EditorDay[]): EditorDay[] {
  const nights = days.length > 1 ? days.slice(0, -1) : days;
  return nights.filter((d) => !d.hotel.name.trim());
}

/** Cities in visiting order, no repeats in a row. */
export function cityRoute(days: EditorDay[]): string[] {
  const out: string[] = [];
  for (const day of days) {
    const label = cityLabel(day);
    if (out[out.length - 1] !== label) out.push(label);
  }
  return out;
}

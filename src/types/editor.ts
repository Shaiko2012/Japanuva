export type EditorCity =
  | "Tokyo"
  | "Yokohama"
  | "Kamakura"
  | "Hakone"
  | "Kawaguchiko"
  | "Nikko"
  | "Sendai"
  | "Nagoya"
  | "Takayama"
  | "Kanazawa"
  | "Matsumoto"
  | "Kyoto"
  | "Nara"
  | "Osaka"
  | "Kobe"
  | "Himeji"
  | "Okayama"
  | "Hiroshima"
  | "Fukuoka"
  | "Nagasaki"
  | "Sapporo"
  | "Naha"
  | "Other";

export type HotelStatus = "booked" | "considering" | "not_booked";

export type ActivityCategory =
  | "culture"
  | "amusement"
  | "temple"
  | "food"
  | "nature"
  | "shopping"
  | "transit"
  | "other";

export type TicketStatus =
  | "booked"
  | "needs_reservation"
  | "free_entry"
  | "buy_on_site";

export type TimeSlot = "morning" | "afternoon" | "evening";

export interface HotelInfo {
  name: string;
  checkIn: string;
  checkOut: string;
  status: HotelStatus;
  costPerNightJpy: number;
  /** Street address or area, used for the map pin. */
  address?: string;
  mapsLink?: string;
  /** Airbnb listing or other booking page. */
  bookingLink?: string;
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  descriptionHe: string;
  category: ActivityCategory;
  timeSlot: TimeSlot;
  familyFriendly: boolean;
  ticketStatus: TicketStatus;
  durationHours: number;
  priceJpy: number;
  location?: string;
  mapsLink?: string;
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface EditorDay {
  id: string;
  date: string;
  city: EditorCity;
  /** Free-text city when `city` is Other. */
  cityCustom?: string;
  hotel: HotelInfo;
  activities: ActivityItem[];
  foodEstimateJpy: number;
}

export const CITY_LABELS: Record<EditorCity, string> = {
  Tokyo: "טוקיו",
  Yokohama: "יוקוהמה",
  Kamakura: "קמקורה",
  Hakone: "הקונה",
  Kawaguchiko: "קאוואגוצ'יקו",
  Nikko: "ניקו",
  Sendai: "סנדאי",
  Nagoya: "נגויה",
  Takayama: "טקאיאמה",
  Kanazawa: "קנאזאווה",
  Matsumoto: "מצסומוטו",
  Kyoto: "קיוטו",
  Nara: "נארה",
  Osaka: "אוסקה",
  Kobe: "קובה",
  Himeji: "הימג'י",
  Okayama: "אוקיאמה",
  Hiroshima: "הירושימה",
  Fukuoka: "פוקואוקה",
  Nagasaki: "נגסאקי",
  Sapporo: "סאפורו",
  Naha: "נאהה (אוקינאווה)",
  Other: "עיר אחרת",
};

export const CITY_OPTIONS = Object.keys(CITY_LABELS) as EditorCity[];

export function cityLabel(day: Pick<EditorDay, "city" | "cityCustom">): string {
  if (day.city === "Other") {
    const custom = day.cityCustom?.trim();
    return custom || CITY_LABELS.Other;
  }
  return CITY_LABELS[day.city] ?? day.city;
}

export const HOTEL_STATUS_LABELS: Record<HotelStatus, string> = {
  booked: "שמור",
  considering: "בבחינה",
  not_booked: "לא הוזמן",
};

export const CATEGORY_META: Record<ActivityCategory, { label: string }> = {
  culture: { label: "תרבות ומוזיאונים" },
  amusement: { label: "פארק שעשועים" },
  temple: { label: "מקדש" },
  food: { label: "אוכל" },
  nature: { label: "טבע" },
  shopping: { label: "קניות" },
  transit: { label: "מעבר ונסיעה" },
  other: { label: "אחר" },
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  booked: "כרטיסים הוזמנו",
  needs_reservation: "נדרש שריון מראש",
  free_entry: "כניסה חופשית",
  buy_on_site: "קנייה במקום",
};

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: "בוקר",
  afternoon: "צהריים",
  evening: "ערב",
};

/** Rough minutes between consecutive attractions in the same city day. */
export function estimateTransitMinutes(activityCount: number): number {
  if (activityCount <= 1) return 0;
  return (activityCount - 1) * 18;
}

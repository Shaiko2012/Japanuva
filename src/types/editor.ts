export type EditorCity =
  | "Tokyo"
  | "Kyoto"
  | "Osaka"
  | "Hakone"
  | "Nara"
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
  hotel: HotelInfo;
  activities: ActivityItem[];
  foodEstimateJpy: number;
}

export const CITY_LABELS: Record<EditorCity, string> = {
  Tokyo: "טוקיו",
  Kyoto: "קיוטו",
  Osaka: "אוסקה",
  Hakone: "הקונה",
  Nara: "נארה",
  Other: "אחר",
};

export const HOTEL_STATUS_LABELS: Record<HotelStatus, string> = {
  booked: "שמור",
  considering: "בבחינה",
  not_booked: "לא הוזמן",
};

export const CATEGORY_META: Record<
  ActivityCategory,
  { label: string; emoji: string }
> = {
  culture: { label: "תרבות", emoji: "🏛️" },
  amusement: { label: "פארק שעשועים", emoji: "🎢" },
  temple: { label: "מקדש", emoji: "⛩️" },
  food: { label: "אוכל", emoji: "🍱" },
  nature: { label: "טבע", emoji: "🌳" },
  shopping: { label: "קניות", emoji: "🛍️" },
  transit: { label: "מעבר", emoji: "🚅" },
  other: { label: "אחר", emoji: "✨" },
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

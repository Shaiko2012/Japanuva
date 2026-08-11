export type DistrictId = "shinjuku" | "shibuya" | "kyoto" | "osaka";

export type AccommodationStatus = "booked" | "pending" | "research";

export interface FamilyMemberCounts {
  adults: number;
  kids: number;
}

export interface District {
  id: DistrictId;
  nameHe: string;
  nameEn: string;
  vibe: string;
  days: string[];
  highlight: string;
  accent: string;
}

export interface DayPlan {
  id: string;
  date: string;
  title: string;
  city: string;
  districtId: DistrictId;
  accommodation: {
    name: string;
    status: AccommodationStatus;
  };
  tags: string[];
  activities: string[];
  transitMinutes: number;
  transitLabel: string;
}

export const tripMeta = {
  name: "Konnichimap",
  titleHe: "טיול משפחתי ליפן",
  startDate: "2027-10-05",
  endDate: "2027-10-19",
  destination: "יפן · טוקיו · קיוטו · אוסקה",
  exchangeRateIlsToJpy: 42.8,
};

export const defaultFamily: FamilyMemberCounts = {
  adults: 2,
  kids: 2,
};

export const districts: District[] = [
  {
    id: "shinjuku",
    nameHe: "שינג'וקו",
    nameEn: "Shinjuku",
    vibe: "רחובות עירוניים, גורדי שחקים ופארק ירוק",
    days: ["2027-10-05", "2027-10-06", "2027-10-07"],
    highlight: "בסיס משפחתי נוח עם תחבורה מצוינת",
    accent: "#c4451d",
  },
  {
    id: "shibuya",
    nameHe: "שיבויה",
    nameEn: "Shibuya",
    vibe: "אנרגיה צעירה, קניות ואוכל רחוב",
    days: ["2027-10-08", "2027-10-09"],
    highlight: "יום קל עם ילדים סביב פארק יויוגי",
    accent: "#65897f",
  },
  {
    id: "kyoto",
    nameHe: "קיוטו",
    nameEn: "Kyoto",
    vibe: "מקדשים, עלווה סתיו ומסלולי הליכה",
    days: ["2027-10-11", "2027-10-12", "2027-10-13", "2027-10-14"],
    highlight: "שיא ה-Koyo — עלים אדומים באראשיאמה",
    accent: "#c4451d",
  },
  {
    id: "osaka",
    nameHe: "אוסקה",
    nameEn: "Osaka",
    vibe: "אוכל רחוב, פארק שעשועים וקצב עירוני",
    days: ["2027-10-15", "2027-10-16", "2027-10-17"],
    highlight: "יום ב-USJ + טעימות בדוטנבורי",
    accent: "#8e9665",
  },
];

export const dailyItinerary: DayPlan[] = [
  {
    id: "d1",
    date: "2027-10-05",
    title: "נחיתה בטוקיו + התאקלמות",
    city: "טוקיו",
    districtId: "shinjuku",
    accommodation: { name: "Hotel Gracery Shinjuku", status: "booked" },
    tags: ["משפחתי", "קליל", "תחבורה"],
    activities: ["נחיתה ב-HND", "Suica במכונה", "ערב רגוע בשינג'וקו"],
    transitMinutes: 55,
    transitLabel: "מוניורייל / JR לשינג'וקו",
  },
  {
    id: "d2",
    date: "2027-10-06",
    title: "שינג'וקו גיון + תצפית",
    city: "טוקיו",
    districtId: "shinjuku",
    accommodation: { name: "Hotel Gracery Shinjuku", status: "booked" },
    tags: ["פארק", "תצפית", "משפחתי"],
    activities: ["שינג'וקו גיון", "תצפית מגדל עירייה", "קניות באיסטה"],
    transitMinutes: 25,
    transitLabel: "הליכה + מטרו קצר",
  },
  {
    id: "d3",
    date: "2027-10-07",
    title: "אסאקוסה וסנסוג'י",
    city: "טוקיו",
    districtId: "shinjuku",
    accommodation: { name: "Hotel Gracery Shinjuku", status: "booked" },
    tags: ["תרבות", "ילדים", "אוכל"],
    activities: ["מקדש סנסוג'י", "נאקמיסה", "שייט בסומידה"],
    transitMinutes: 40,
    transitLabel: "JR + מטרו",
  },
  {
    id: "d4",
    date: "2027-10-08",
    title: "שיבויה ויויוגי",
    city: "טוקיו",
    districtId: "shibuya",
    accommodation: { name: "Hotel Gracery Shinjuku", status: "booked" },
    tags: ["פארק", "קניות", "קליל"],
    activities: ["מעבר שיבויה", "פארק יויוגי", "האראג'וקו"],
    transitMinutes: 20,
    transitLabel: "JR יאמאנוטה",
  },
  {
    id: "d5",
    date: "2027-10-09",
    title: "צוקוג'י / טים לאב",
    city: "טוקיו",
    districtId: "shibuya",
    accommodation: { name: "Hotel Gracery Shinjuku", status: "booked" },
    tags: ["ילדים", "מוזיאון", "גשם-פלן"],
    activities: ["צוקוג'י / מוזיאון אינטראקטיבי", "קפה משפחתי", "מנוחה"],
    transitMinutes: 35,
    transitLabel: "מטרו",
  },
  {
    id: "d6",
    date: "2027-10-10",
    title: "שינקנסן לקיוטו",
    city: "קיוטו",
    districtId: "kyoto",
    accommodation: { name: "Mitsui Garden Kyoto Station", status: "booked" },
    tags: ["רכבת", "מעבר", "JR Pass"],
    activities: ["טוקיו סטיישן", "שינקנסן Nozomi", "צ'ק-אין בקיוטו"],
    transitMinutes: 140,
    transitLabel: "שינקנסן טוקיו → קיוטו",
  },
  {
    id: "d7",
    date: "2027-10-11",
    title: "פאשמי וקיומיזו",
    city: "קיוטו",
    districtId: "kyoto",
    accommodation: { name: "Mitsui Garden Kyoto Station", status: "booked" },
    tags: ["מקדשים", "הליכה", "Koyo"],
    activities: ["פאשמי אינארי", "קיומיזו-דרה", "סאנן"],
    transitMinutes: 50,
    transitLabel: "JR + אוטובוס",
  },
  {
    id: "d8",
    date: "2027-10-12",
    title: "אראשיאמה — עלים אדומים",
    city: "קיוטו",
    districtId: "kyoto",
    accommodation: { name: "Mitsui Garden Kyoto Station", status: "booked" },
    tags: ["Koyo", "טבע", "משפחתי"],
    activities: ["חורשת במבוק", "נהר קאטסורה", "קוף פארק"],
    transitMinutes: 45,
    transitLabel: "JR סאגאנו",
  },
  {
    id: "d9",
    date: "2027-10-13",
    title: "גיוון ופילוסופרס פאת'",
    city: "קיוטו",
    districtId: "kyoto",
    accommodation: { name: "Mitsui Garden Kyoto Station", status: "pending" },
    tags: ["תרבות", "צילום", "קליל"],
    activities: ["גיוון", "פילוסופרס פאת'", "גני כסף"],
    transitMinutes: 40,
    transitLabel: "אוטובוס עירוני",
  },
  {
    id: "d10",
    date: "2027-10-14",
    title: "יום חופשי / ניג'ו",
    city: "קיוטו",
    districtId: "kyoto",
    accommodation: { name: "Mitsui Garden Kyoto Station", status: "booked" },
    tags: ["גמיש", "טירה", "משפחתי"],
    activities: ["טירת ניג'ו", "שוק נישיקי", "מנוחה"],
    transitMinutes: 30,
    transitLabel: "הליכה + מטרו",
  },
  {
    id: "d11",
    date: "2027-10-15",
    title: "מעבר לאוסקה",
    city: "אוסקה",
    districtId: "osaka",
    accommodation: { name: "Cross Hotel Osaka", status: "research" },
    tags: ["מעבר", "אוכל", "עיר"],
    activities: ["JR לקיוטו→אוסקה", "טירת אוסקה", "דוטנבורי"],
    transitMinutes: 35,
    transitLabel: "JR Special Rapid",
  },
  {
    id: "d12",
    date: "2027-10-16",
    title: "Universal Studios Japan",
    city: "אוסקה",
    districtId: "osaka",
    accommodation: { name: "Cross Hotel Osaka", status: "research" },
    tags: ["ילדים", "פארק", "יום מלא"],
    activities: ["USJ", "Express Pass", "ערב רגוע"],
    transitMinutes: 25,
    transitLabel: "JR ל-Universal City",
  },
  {
    id: "d13",
    date: "2027-10-17",
    title: "קופאשי ומזכרות",
    city: "אוסקה",
    districtId: "osaka",
    accommodation: { name: "Cross Hotel Osaka", status: "research" },
    tags: ["קניות", "אוכל", "קליל"],
    activities: ["שוק קופאשי", "טאקויאקי", "אריזת מזוודות"],
    transitMinutes: 20,
    transitLabel: "מטרו",
  },
  {
    id: "d14",
    date: "2027-10-18",
    title: "שינקנסן חזרה לטוקיו",
    city: "טוקיו",
    districtId: "shinjuku",
    accommodation: { name: "Haneda Excel Hotel Tokyu", status: "pending" },
    tags: ["מעבר", "JR Pass", "מנוחה"],
    activities: ["אוסקה→טוקיו", "מלון ליד הנמל", "ארגון YCAT"],
    transitMinutes: 155,
    transitLabel: "שינקנסן + העברה ל-HND",
  },
  {
    id: "d15",
    date: "2027-10-19",
    title: "טיסת חזרה",
    city: "טוקיו",
    districtId: "shinjuku",
    accommodation: { name: "—", status: "booked" },
    tags: ["טיסה", "סיום"],
    activities: ["צ'ק-אין", "Duty Free קל", "נחיתה בישראל"],
    transitMinutes: 0,
    transitLabel: "העברה לנמל תעופה",
  },
];

/** Static packing / foliage tips — temperatures come from /api/weather. */
export const weatherTips = {
  monthHint: "אוקטובר",
  koyoPeak: "אמצע–סוף אוקטובר בקיוטו",
  notes: [
    "מזג אוויר נעים להליכה משפחתית (ממוצע עונתי)",
    "שכבות קלות בערב",
    "שיא עלווה סתיו באזור קנסאי",
  ],
};

export const navItems = [
  { href: "/", label: "סיכום הטיול", icon: "LayoutDashboard" as const },
  { href: "/itinerary", label: "המסלול שלי", icon: "CalendarDays" as const },
  { href: "/day-route", label: "מסלול ליום", icon: "Route" as const },
  { href: "/jr-pass", label: "JR Pass", icon: "TrainFront" as const },
  { href: "/transit", label: "Suica", icon: "CreditCard" as const },
  { href: "/luggage", label: "משלוח מזוודות", icon: "Luggage" as const },
  { href: "/vjw", label: "הצהרת כניסה", icon: "FileCheck2" as const },
  { href: "/tips", label: "טיפים לטיול", icon: "Lightbulb" as const },
];

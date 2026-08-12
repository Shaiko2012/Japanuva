export type JrCity = "Tokyo" | "Kyoto" | "Osaka" | "Nagoya" | "Hiroshima";

export interface JrLeg {
  id: string;
  from: JrCity;
  to: JrCity;
}

/** Approximate ordinary adult one-way shinkansen / JR fares in JPY (mock 2027). */
export const pointToPointFares: Record<string, number> = {
  "Tokyo-Kyoto": 13840,
  "Kyoto-Tokyo": 13840,
  "Tokyo-Osaka": 14520,
  "Osaka-Tokyo": 14520,
  "Kyoto-Osaka": 2280,
  "Osaka-Kyoto": 2280,
  "Tokyo-Nagoya": 11000,
  "Nagoya-Tokyo": 11000,
  "Nagoya-Kyoto": 5680,
  "Kyoto-Nagoya": 5680,
  "Nagoya-Osaka": 6380,
  "Osaka-Nagoya": 6380,
  "Osaka-Hiroshima": 10340,
  "Hiroshima-Osaka": 10340,
  "Kyoto-Hiroshima": 11090,
  "Hiroshima-Kyoto": 11090,
  "Tokyo-Hiroshima": 19000,
  "Hiroshima-Tokyo": 19000,
};

export const jrPassPrices = {
  7: 50000,
  14: 80000,
  21: 100000,
} as const;

export const jrCities: JrCity[] = [
  "Tokyo",
  "Kyoto",
  "Osaka",
  "Nagoya",
  "Hiroshima",
];

export const defaultJrRoute: JrLeg[] = [
  { id: "leg-1", from: "Tokyo", to: "Kyoto" },
  { id: "leg-2", from: "Kyoto", to: "Osaka" },
  { id: "leg-3", from: "Osaka", to: "Tokyo" },
];

export function fareForLeg(from: JrCity, to: JrCity): number {
  if (from === to) return 0;
  return pointToPointFares[`${from}-${to}`] ?? 12000;
}

export const suicaSteps = [
  {
    title: "בחרו Suica או Pasmo",
    detail:
      "שתיהן עובדות בטוקיו וברוב המטרו/JR. Welcome Suica מתאימה לתיירים ללא פיקדון.",
  },
  {
    title: "הנפקה בשדה / במכונה",
    detail:
      "ב-HND/NRT או בתחנות JR — מכונות כחולות. אפשר גם Apple/Google Wallet בחלק מהמכשירים.",
  },
  {
    title: "טעינה ראשונית",
    detail:
      "מומלץ 3,000–5,000 ¥ לאדם ליום־יומיים ראשונים. ילדים יכולים כרטיס נפרד.",
  },
  {
    title: "שימוש יומיומי",
    detail:
      "הצמידו לשערים ולמכונות שתייה/חנויות. בדקו יתרה במכונה או באפליקציה.",
  },
];

export const airportOptions = [
  {
    id: "hnd-monorail",
    airport: "HND",
    name: "Tokyo Monorail → JR",
    minutes: 35,
    costJpy: 660,
    familyNote: "נוח עם מזוודות קטנות, מעבר ב-Hamamatsucho",
    score: 88,
  },
  {
    id: "hnd-keikyu",
    airport: "HND",
    name: "Keikyu → Shinagawa",
    minutes: 28,
    costJpy: 420,
    familyNote: "מהיר וזול לשינג'וקו/שיבויה דרך JR",
    score: 92,
  },
  {
    id: "hnd-limousine",
    airport: "HND",
    name: "Airport Limousine Bus",
    minutes: 50,
    costJpy: 1300,
    familyNote: "ישירות למלון — אידיאלי עם ילדים ומזוודות",
    score: 85,
  },
  {
    id: "nrt-skyler",
    airport: "NRT",
    name: "Keisei Skyliner",
    minutes: 45,
    costJpy: 2570,
    familyNote: "מהיר ל-Ueno; נוח אם המלון בצפון טוקיו",
    score: 80,
  },
  {
    id: "nrt-nex",
    airport: "NRT",
    name: "Narita Express (N'EX)",
    minutes: 60,
    costJpy: 3220,
    familyNote: "ישיר לשינג'וקו/שיבויה, מקום למזוודות",
    score: 90,
  },
  {
    id: "nrt-bus",
    airport: "NRT",
    name: "Limousine / Access Bus",
    minutes: 90,
    costJpy: 3200,
    familyNote: "ללא החלפות — טוב למשפחה עייפה",
    score: 78,
  },
];

export const luggageRoutes = [
  {
    id: "tyo-kyo",
    from: "מלון בטוקיו",
    to: "מלון בקיוטו",
    baseJpy: 2500,
    days: 1,
  },
  {
    id: "kyo-osa",
    from: "מלון בקיוטו",
    to: "מלון באוסקה",
    baseJpy: 2200,
    days: 1,
  },
  {
    id: "osa-hnd",
    from: "מלון באוסקה",
    to: "Haneda (דלפק)",
    baseJpy: 2800,
    days: 2,
  },
  {
    id: "tyo-hnd",
    from: "מלון בטוקיו",
    to: "Haneda",
    baseJpy: 2300,
    days: 1,
  },
];

export const vjwChecklist = [
  {
    id: "account",
    title: "יצירת חשבון Visit Japan Web",
    detail: "הרשמה לכל מבוגר; אפשר לקשר ילדים תחת אותו חשבון.",
    category: "לפני הטיסה",
  },
  {
    id: "passport",
    title: "סריקת דרכון",
    detail: "צילום ברור של עמוד הפרטים לכל בן משפחה.",
    category: "לפני הטיסה",
  },
  {
    id: "flight",
    title: "פרטי טיסה וכניסה",
    detail: "מספר טיסה, תאריך נחיתה, ונמל (HND/NRT).",
    category: "לפני הטיסה",
  },
  {
    id: "immigration",
    title: "הצהרת הגירה דיגיטלית",
    detail: "מילוי Visit Japan Web במקום הטופס הצהוב בנייר.",
    category: "הצהרות",
  },
  {
    id: "customs",
    title: "הצהרת מכס",
    detail: "סימון מזומן/מוצרים לפי הצורך; קבלת QR נפרד.",
    category: "הצהרות",
  },
  {
    id: "qr",
    title: "שמירת קודי QR",
    detail: "הורדה למכשיר + צילום מסך גיבוי לכל נוסע.",
    category: "ביום הנחיתה",
  },
  {
    id: "landing",
    title: "הצגה בשערים",
    detail: "QR להגירה ולמכס — הילדים עם מבוגר מלווים.",
    category: "ביום הנחיתה",
  },
  {
    id: "backup",
    title: "גיבוי אופליין",
    detail: "PDF/תמונות בתיקייה משותפת למשפחה.",
    category: "ביום הנחיתה",
  },
];

export const tipCards = [
  {
    id: "vjw",
    title: "Visit Japan Web",
    summary: "סיימו הצהרות 48 שעות לפני הנחיתה.",
    body: "מלאו לכל בני המשפחה, שמרו QR באלבום ייעודי, והדפיסו עותק אחד ליתר ביטחון.",
    href: "/vjw",
    accent: "#b8735a",
  },
  {
    id: "suica",
    title: "Suica למשפחה",
    summary: "כרטיס אחד לכל נוסע — כולל ילדים.",
    body: "טענו מראש, בדקו תאימות לארנק דיגיטלי, והשאירו מזומן קטן למכונות ישנות.",
    href: "/transit",
    accent: "#6a8f84",
  },
  {
    id: "taku",
    title: "משלוח מזוודות",
    summary: "שלחו מזוודות בין ערים וסעו קל בשינקנסן.",
    body: "הזמינו בדלפק המלון יום לפני. לטיסת חזרה — משלוח לנמל יומיים מראש.",
    href: "/luggage",
    accent: "#8e9665",
  },
  {
    id: "airport",
    title: "HND מול NRT",
    summary: "השוו זמן, עלות ונוחות עם ילדים.",
    body: "Haneda קרוב יותר למרכז; Narita דורש N'EX או Skyliner. בדקו בלוגיסטיקת הנסיעות.",
    href: "/transit",
    accent: "#d09132",
  },
  {
    id: "jr",
    title: "JR Pass — מתי משתלם?",
    summary: "הריצו את המחשבון לפני ההזמנה.",
    body: "מסלול טוקיו–קיוטו–אוסקה–טוקיו למשפחה לרוב מצדיק 7 או 14 ימים.",
    href: "/jr-pass",
    accent: "#b8735a",
  },
  {
    id: "koyo",
    title: "טיולי Koyo עם ילדים",
    summary: "צאו מוקדם לאראשיאמה ולמקדשים.",
    body: "הזמינו מקדשים עמוסים בבוקר, תכננו הפסקות אוכל, ושמרו יום גיבוי לגשם.",
    href: "/itinerary",
    accent: "#f2b86e",
  },
];

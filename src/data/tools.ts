export type JrCity = "Tokyo" | "Nagoya" | "Kyoto" | "Osaka" | "Hiroshima";

export interface JrLeg {
  id: string;
  from: JrCity;
  to: JrCity;
}

export const JR_CITY_LABELS: Record<JrCity, string> = {
  Tokyo: "טוקיו",
  Nagoya: "נגויה",
  Kyoto: "קיוטו",
  Osaka: "אוסקה",
  Hiroshima: "הירושימה",
};

export const jrCities: JrCity[] = ["Tokyo", "Nagoya", "Kyoto", "Osaka", "Hiroshima"];

/**
 * Rounded one-way adult estimates for a reserved seat on Hikari/Sakura-class trains
 * (the trains the pass covers without a supplement). Kyoto-Osaka assumes the JR local
 * Special Rapid. Planning estimates only; real fares vary by train and season.
 */
const legFareEstimates: Record<string, number> = {
  "Kyoto|Tokyo": 14000,
  "Osaka|Tokyo": 14500,
  "Nagoya|Tokyo": 11100,
  "Hiroshima|Tokyo": 19000,
  "Kyoto|Nagoya": 5800,
  "Nagoya|Osaka": 6600,
  "Hiroshima|Nagoya": 14000,
  "Kyoto|Osaka": 600,
  "Hiroshima|Kyoto": 11400,
  "Hiroshima|Osaka": 10400,
};

/** Returns null when there is no estimate for the pair. */
export function fareForLeg(from: JrCity, to: JrCity): number | null {
  if (from === to) return 0;
  const key = [from, to].sort().join("|");
  return legFareEstimates[key] ?? null;
}

/** Official Ordinary (standard car) prices when bought on japanrailpass.net, checked April 2026. */
export const jrPassPrices = {
  7: { adult: 50000, child: 25000 },
  14: { adult: 80000, child: 40000 },
  21: { adult: 100000, child: 50000 },
} as const;

export type JrPassDuration = keyof typeof jrPassPrices;

export const jrPassFacts = [
  "ילדים בגילאי 6-11 משלמים חצי מחיר, גם על הכרטיס וגם על כרטיסים רגילים. ילדים מתחת לגיל 6 נוסעים בדרך כלל בחינם עם מבוגר.",
  "הכרטיס לא כולל את רכבות Nozomi ו־Mizuho בלי כרטיס מיוחד בתשלום נוסף. בחישוב כאן מניחים רכבות Hikari.",
  "רכישה דרך נציג מחוץ ליפן יקרה מעט יותר מהרכישה באתר הרשמי.",
];

export const officialLinks = {
  jrPass: "https://japanrailpass.net/en/purchase/price/",
  visitJapanWeb: "https://services.digital.go.jp/en/visit-japan-web/",
  yamato: "https://www.global-yamato.com/en/hands-free-travel/",
  narita: "https://www.narita-airport.jp/en/access/",
  nex: "https://www.jreast.co.jp/multi/en/nex/",
  skyliner: "https://www.keisei.co.jp/keisei/tetudou/skyliner/us/",
  limousine: "https://www.limousinebus.co.jp/en/",
  mofaVisa: "https://www.mofa.go.jp/j_info/visit/visa/",
} as const;

export const suicaSteps = [
  {
    title: "בחירת כרטיס",
    detail:
      "Suica ו־Pasmo עובדות בכל רכבות העיר ובאוטובוסים בטוקיו, וגם בקיוטו ובאוסקה. Welcome Suica מיועדת לתיירים, בלי פיקדון, ותקפה 28 יום.",
  },
  {
    title: "הנפקה בהגעה",
    detail:
      "בשדה התעופה או במכונות של JR בתחנות. במכשירי iPhone אפשר להוסיף Suica לארנק הדיגיטלי.",
  },
  {
    title: "טעינה ראשונה",
    detail:
      "טוענים במזומן במכונות שבתחנה. כדאי להתחיל בסכום קטן ולהטעין לפי הצורך. לילדים בגילאי 6-11 יש כרטיס ילד במחיר מוזל, שמונפק בדלפק עם הצגת דרכון.",
  },
  {
    title: "שימוש יומיומי",
    detail:
      "מצמידים בכניסה וביציאה מהשער. אותו כרטיס עובד גם במכונות שתייה ובחנויות נוחות. היתרה מוצגת בשער ובמכונות הטעינה.",
  },
];

export const airportOptions = [
  {
    id: "nrt-skyliner",
    name: "Keisei Skyliner",
    destination: "Ueno ו־Nippori",
    minutes: "כ־40",
    approxJpy: 2600,
    note: "המהיר ביותר לצפון טוקיו. מ־Ueno ממשיכים במטרו או במונית.",
    href: officialLinks.skyliner,
  },
  {
    id: "nrt-nex",
    name: "Narita Express (N'EX)",
    destination: "Tokyo, Shinjuku, Shibuya",
    minutes: "כ־55 עד Tokyo",
    approxJpy: 3100,
    note: "רכבת JR ישירה עם מקום למזוודות. נוח למלונות במרכז ובמערב העיר.",
    href: officialLinks.nex,
  },
  {
    id: "nrt-bus",
    name: "Airport Limousine Bus",
    destination: "מלונות ותחנות מרכזיות",
    minutes: "70-120, לפי התנועה",
    approxJpy: 3600,
    note: "מגיע עד חלק מהמלונות בלי החלפות. זמן הנסיעה תלוי בפקקים.",
    href: officialLinks.limousine,
  },
];

export const luggageRoutes = [
  { id: "tyo-kyo", from: "מלון בטוקיו", to: "מלון בקיוטו", largeJpy: 2500, days: "למחרת" },
  { id: "kyo-osa", from: "מלון בקיוטו", to: "מלון באוסקה", largeJpy: 2200, days: "למחרת" },
  { id: "tyo-nrt", from: "מלון בטוקיו", to: "שדה התעופה Narita", largeJpy: 2300, days: "שליחה יומיים לפני הטיסה" },
  { id: "osa-nrt", from: "מלון באוסקה", to: "שדה התעופה Narita", largeJpy: 2800, days: "שליחה יומיים־שלושה לפני הטיסה" },
];

export const luggageSizes = [
  { id: "large", label: "גדולה", detail: "סכום המידות עד 160 ס״מ, עד 25 ק״ג", factor: 1 },
  { id: "medium", label: "בינונית", detail: "סכום המידות עד 140 ס״מ, עד 20 ק״ג", factor: 0.9 },
] as const;

export const vjwChecklist = [
  {
    id: "account",
    title: "פתיחת חשבון ב־Visit Japan Web",
    detail: "חשבון אחד יכול לרשום גם את בני המשפחה שנוסעים איתכם.",
    category: "לפני הטיסה",
  },
  {
    id: "passport",
    title: "רישום הדרכונים",
    detail: "סורקים או מקלידים את פרטי הדרכון של כל נוסע, כולל ילדים.",
    category: "לפני הטיסה",
  },
  {
    id: "flight",
    title: "פרטי הטיסה והמגורים",
    detail: "מספר טיסה, תאריך הנחיתה ושדה התעופה, וכתובת הלינה הראשונה.",
    category: "לפני הטיסה",
  },
  {
    id: "immigration",
    title: "טופס הגירה",
    detail: "ממלאים את הצהרת הכניסה של כל נוסע במקום הטופס המודפס.",
    category: "הצהרות",
  },
  {
    id: "customs",
    title: "הצהרת מכס",
    detail: "אפשר להגיש הצהרה אחת למשפחה שנוסעת יחד.",
    category: "הצהרות",
  },
  {
    id: "qr",
    title: "שמירת קודי ה־QR",
    detail: "הקודים מוצגים מהטלפון. כדאי לשמור גם צילום מסך, למקרה שאין קליטה.",
    category: "ביום הנחיתה",
  },
  {
    id: "landing",
    title: "הצגה בהגירה ובמכס",
    detail: "מציגים את הקוד בעמדות ההגירה ואחר כך במכס. ילדים עוברים עם המבוגר.",
    category: "ביום הנחיתה",
  },
  {
    id: "backup",
    title: "גיבוי מודפס",
    detail: "עותק של פרטי הדרכון והטיסה בתיק היד, למקרה שהטלפון נכבה.",
    category: "ביום הנחיתה",
  },
];

/** Preparation timeline for /guide. Each entry links to the tool that handles it, if any. */
export const prepTimeline = [
  {
    id: "months",
    when: "חודשיים־שלושה לפני",
    items: [
      {
        title: "לבדוק את דרישות הכניסה",
        body: "תוקף הדרכון ודרישות הכניסה ליפן משתנים מעת לעת. בודקים באתר משרד החוץ של יפן או בשגרירות לפני שמזמינים.",
        href: officialLinks.mofaVisa,
        hrefLabel: "משרד החוץ של יפן",
        external: true,
      },
      {
        title: "לסגור לינה לכל הלילות",
        body: "מלונות משפחתיים בטוקיו ובקיוטו מתמלאים מוקדם, בעיקר בעונת השלכת. סמנו במסלול מה כבר שמור.",
        href: "/itinerary",
        hrefLabel: "למסלול",
      },
      {
        title: "להחליט על JR Pass",
        body: "הכרטיס משתלם רק כשיש כמה נסיעות ארוכות. בודקים לפי המסלול שלכם, לא לפי כלל אצבע.",
        href: "/jr-pass",
        hrefLabel: "לחישוב",
      },
    ],
  },
  {
    id: "weeks",
    when: "שבועיים לפני",
    items: [
      {
        title: "Visit Japan Web",
        body: "ממלאים את פרטי ההגירה והמכס לכל נוסע, ושומרים את קודי ה־QR בטלפון.",
        href: "/vjw",
        hrefLabel: "לרשימת השלבים",
      },
      {
        title: "לתכנן את הדרך מהשדה",
        body: "בוחרים רכבת או אוטובוס לפי מיקום המלון הראשון והשעה שבה נוחתים.",
        href: "/transit",
        hrefLabel: "להשוואה",
      },
      {
        title: "לשריין אטרקציות עם כרטיסים מראש",
        body: "חלק מהמקומות, כמו teamLab ומוזיאון ג׳יבלי, נמכרים מראש לתאריך ושעה. סמנו במסלול אילו פעילויות דורשות שריון.",
        href: "/itinerary",
        hrefLabel: "למסלול",
      },
    ],
  },
  {
    id: "there",
    when: "בזמן הטיול",
    items: [
      {
        title: "Suica לכל נוסע",
        body: "כרטיס נטען אחד לכל אחד, כולל כרטיס ילד לגילאי 6-11.",
        href: "/transit",
        hrefLabel: "איך מנפיקים",
      },
      {
        title: "לשלוח מזוודות בין ערים",
        body: "שולחים מהמלון ערב לפני המעבר ונוסעים ברכבת עם תיק קטן. לשדה התעופה שולחים יומיים־שלושה לפני הטיסה.",
        href: "/luggage",
        hrefLabel: "לאומדן",
      },
      {
        title: "להשאיר מרווח ביום",
        body: "עם ילדים, שתי אטרקציות גדולות ביום הן בדרך כלל המקסימום. כדאי להשאיר חצי יום פנוי לגשם או לעייפות.",
        href: "/day-route",
        hrefLabel: "לתכנון יום",
      },
    ],
  },
];

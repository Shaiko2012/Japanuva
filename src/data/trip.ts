export type DistrictId = "shinjuku" | "shibuya" | "kyoto" | "osaka";

export interface FamilyMemberCounts {
  adults: number;
  kids: number;
}

export const tripMeta = {
  name: "Japanuva",
  titleHe: "טיול משפחתי ליפן",
  startDate: "2027-10-05",
  endDate: "2027-10-19",
  destination: "טוקיו · הקונה · פוג'י · אוסקה",
  /** Offline fallback only the live rate comes from /api/exchange-rate. */
  exchangeRateIlsToJpy: 42.8,
};

export const defaultFamily: FamilyMemberCounts = {
  adults: 2,
  kids: 2,
};

/** Static foliage note temperatures come from /api/weather. */
export const weatherTips = {
  monthHint: "אוקטובר",
  koyo:
    "באוקטובר רוב העצים בטוקיו ובקיוטו עדיין ירוקים; השיא שם מגיע בדרך כלל מאמצע נובמבר. באזורים גבוהים, כמו ניקו, השלכת מתחילה כבר באוקטובר.",
  koyoCaveat: "הערכה עונתית כללית. מועדי השיא משתנים משנה לשנה.",
};

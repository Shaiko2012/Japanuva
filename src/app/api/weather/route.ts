import { NextResponse } from "next/server";

/** Tokyo city center — trip default destination. */
const DEFAULT_LAT = 35.6812;
const DEFAULT_LNG = 139.7671;
const FORECAST_HORIZON_DAYS = 16;

const MONTH_HE = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

type WeatherMode = "forecast" | "climate";

interface DailyPayload {
  time: string[];
  temperature_2m_max: (number | null)[];
  temperature_2m_min: (number | null)[];
  precipitation_sum: (number | null)[];
}

function parseDateOnly(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysUntil(date: Date): number {
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const targetUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return Math.floor((targetUtc - todayUtc) / 86_400_000);
}

function avg(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => typeof v === "number");
  if (!nums.length) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function sumRounded(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => typeof v === "number");
  if (!nums.length) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0));
}

function monthLabelHe(date: Date): string {
  return `${MONTH_HE[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function climateRangeFor(start: Date): { startDate: string; endDate: string } {
  const y = start.getUTCFullYear();
  const m = start.getUTCMonth();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    startDate: `${y}-${pad(m + 1)}-01`,
    endDate: `${y}-${pad(m + 1)}-${pad(lastDay)}`,
  };
}

async function fetchOpenMeteoDaily(
  url: string,
  revalidate: number,
): Promise<DailyPayload | null> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { daily?: DailyPayload };
  return data.daily ?? null;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const start = parseDateOnly(params.get("start"));
  const end = parseDateOnly(params.get("end")) ?? start;
  const lat = Number(params.get("lat") ?? DEFAULT_LAT);
  const lng = Number(params.get("lng") ?? DEFAULT_LNG);

  if (!start || !end) {
    return NextResponse.json({ error: "missing dates" }, { status: 400 });
  }

  const useForecast = daysUntil(start) <= FORECAST_HORIZON_DAYS;
  const mode: WeatherMode = useForecast ? "forecast" : "climate";

  try {
    let daily: DailyPayload | null = null;

    if (useForecast) {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(lat));
      url.searchParams.set("longitude", String(lng));
      url.searchParams.set("timezone", "Asia/Tokyo");
      url.searchParams.set(
        "daily",
        "temperature_2m_max,temperature_2m_min,precipitation_sum",
      );
      url.searchParams.set("start_date", start.toISOString().slice(0, 10));
      url.searchParams.set("end_date", end.toISOString().slice(0, 10));
      daily = await fetchOpenMeteoDaily(url.toString(), 3600);
    } else {
      const range = climateRangeFor(start);
      const url = new URL("https://climate-api.open-meteo.com/v1/climate");
      url.searchParams.set("latitude", String(lat));
      url.searchParams.set("longitude", String(lng));
      url.searchParams.set("start_date", range.startDate);
      url.searchParams.set("end_date", range.endDate);
      url.searchParams.set("models", "EC_Earth3P_HR");
      url.searchParams.set(
        "daily",
        "temperature_2m_max,temperature_2m_min,precipitation_sum",
      );
      daily = await fetchOpenMeteoDaily(url.toString(), 86_400);
    }

    if (!daily?.temperature_2m_max?.length) {
      return NextResponse.json({
        available: false,
        mode,
        monthLabel: monthLabelHe(start),
        messageHe: "מזג אוויר מדויק עדיין לא זמין לתאריכי הטיול",
      });
    }

    const avgHighC = avg(daily.temperature_2m_max);
    const avgLowC = avg(daily.temperature_2m_min);
    const rainfallMm = sumRounded(daily.precipitation_sum);

    if (avgHighC == null || avgLowC == null || rainfallMm == null) {
      return NextResponse.json({
        available: false,
        mode,
        monthLabel: monthLabelHe(start),
        messageHe: "מזג אוויר עדיין לא זמין",
      });
    }

    return NextResponse.json({
      available: true,
      mode,
      monthLabel: monthLabelHe(start),
      avgHighC,
      avgLowC,
      rainfallMm,
      locationLabelHe: "טוקיו",
      sourceLabelHe: useForecast ? "תחזית Open-Meteo" : "ממוצע עונתי · Open-Meteo",
      messageHe: useForecast
        ? null
        : "מזג אוויר מדויק עדיין לא זמין לתאריכי הטיול — מוצג ממוצע עונתי",
    });
  } catch {
    return NextResponse.json({
      available: false,
      mode,
      monthLabel: monthLabelHe(start),
      messageHe: "מזג אוויר עדיין לא זמין",
    });
  }
}

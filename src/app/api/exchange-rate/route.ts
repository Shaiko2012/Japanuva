import { NextResponse } from "next/server";
import { tripMeta } from "@/data/trip";

/** Fallback matches app convention: JPY per 1 ILS */
const FALLBACK_RATE_ILS_TO_JPY = tripMeta.exchangeRateIlsToJpy;
const REVALIDATE_SECONDS = 3600;
const HISTORY_DAYS = 13;

type FrankfurterLatest = {
  amount: number;
  base: string;
  date: string;
  rates: { JPY?: number };
};

type FrankfurterSeries = {
  amount: number;
  base: string;
  start_date: string;
  end_date: string;
  rates: Record<string, { JPY?: number }>;
};

type ExchangeRateResponse = {
  rateIlsToJpy: number;
  rateJpyToIls: number;
  updatedAt: string;
  source: string;
  fallback?: boolean;
  history?: number[];
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatUtcDate(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function roundRate(value: number) {
  return Math.round(value * 1000) / 1000;
}

function fallbackPayload(): ExchangeRateResponse {
  const rateIlsToJpy = FALLBACK_RATE_ILS_TO_JPY;
  return {
    rateIlsToJpy,
    rateJpyToIls: roundRate(1 / rateIlsToJpy),
    updatedAt: new Date().toISOString(),
    source: "fallback",
    fallback: true,
  };
}

export async function GET() {
  try {
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - HISTORY_DAYS);

    const latestUrl = "https://api.frankfurter.app/latest?from=ILS&to=JPY";
    const historyUrl = `https://api.frankfurter.app/${formatUtcDate(start)}..${formatUtcDate(end)}?from=ILS&to=JPY`;

    const [latestRes, historyRes] = await Promise.all([
      fetch(latestUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS },
      }),
      fetch(historyUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS },
      }),
    ]);

    if (!latestRes.ok) {
      return NextResponse.json(fallbackPayload());
    }

    const latest = (await latestRes.json()) as FrankfurterLatest;
    const raw = latest.rates?.JPY;
    if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) {
      return NextResponse.json(fallbackPayload());
    }

    const rateIlsToJpy = roundRate(raw);
    const rateJpyToIls = roundRate(1 / raw);

    let history: number[] | undefined;
    if (historyRes.ok) {
      const series = (await historyRes.json()) as FrankfurterSeries;
      const points = Object.keys(series.rates ?? {})
        .sort()
        .map((date) => series.rates[date]?.JPY)
        .filter((v): v is number => typeof v === "number" && Number.isFinite(v))
        .map(roundRate);
      if (points.length >= 2) history = points;
    }

    const payload: ExchangeRateResponse = {
      rateIlsToJpy,
      rateJpyToIls,
      updatedAt: latest.date
        ? `${latest.date}T12:00:00.000Z`
        : new Date().toISOString(),
      source: "frankfurter",
      history,
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(fallbackPayload());
  }
}

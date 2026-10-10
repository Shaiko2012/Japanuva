"use client";

import { useEffect, useState } from "react";
import { tripMeta } from "@/data/trip";

export interface ExchangeRateState {
  /** Yen per one shekel. */
  rate: number;
  loading: boolean;
  /** True when the live source failed and the bundled estimate is shown. */
  fallback: boolean;
  source: string;
  updatedAt: string | null;
  history: number[] | null;
}

type Payload = {
  rateIlsToJpy?: number;
  updatedAt?: string;
  source?: string;
  fallback?: boolean;
  history?: number[];
};

const FALLBACK: ExchangeRateState = {
  rate: tripMeta.exchangeRateIlsToJpy,
  loading: false,
  fallback: true,
  source: "fallback",
  updatedAt: null,
  history: null,
};

let cached: ExchangeRateState | null = null;
let inflight: Promise<ExchangeRateState> | null = null;

function load(): Promise<ExchangeRateState> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  inflight = fetch("/api/exchange-rate", { signal: controller.signal })
    .then((res) => res.json() as Promise<Payload>)
    .then((data): ExchangeRateState => {
      const rate = data.rateIlsToJpy;
      if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
        return FALLBACK;
      }
      return {
        rate,
        loading: false,
        fallback: Boolean(data.fallback),
        source: data.source ?? "frankfurter",
        updatedAt: data.updatedAt ?? null,
        history:
          Array.isArray(data.history) && data.history.length >= 2
            ? data.history
            : null,
      };
    })
    .catch(() => FALLBACK)
    .then((state) => {
      clearTimeout(timer);
      // Only cache live results so a transient failure can recover on the next page.
      if (!state.fallback) cached = state;
      inflight = null;
      return state;
    });

  return inflight;
}

/** Shared ILS→JPY rate. One request per session; falls back to the bundled estimate. */
export function useExchangeRate(): ExchangeRateState {
  const [state, setState] = useState<ExchangeRateState>(
    () => cached ?? { ...FALLBACK, loading: true },
  );

  useEffect(() => {
    let alive = true;
    void load().then((next) => {
      if (alive) setState(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

export function exchangeSourceLabel(state: ExchangeRateState) {
  if (state.loading) return "שער משוער עד לקבלת שער עדכני";
  if (state.fallback) return "שער משוער (המקור החי לא זמין)";
  const updated = state.updatedAt ? new Date(state.updatedAt) : null;
  const date =
    updated && !Number.isNaN(updated.getTime())
      ? new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "short" }).format(updated)
      : null;
  const source = state.source === "frankfurter" ? "Frankfurter (ECB)" : state.source;
  return date ? `${source} · עודכן ${date}` : source;
}

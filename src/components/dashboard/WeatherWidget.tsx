"use client";

import { useCallback, useEffect, useState } from "react";
import { weatherTips } from "@/data/trip";
import { useTripMetaStore } from "@/store/tripMeta";
import { SectionHead } from "@/components/ui/PageHeader";

type WeatherPayload = {
  available: boolean;
  mode?: "forecast" | "climate";
  monthLabel?: string;
  avgHighC?: number;
  avgLowC?: number;
  rainfallMm?: number;
  locationLabelHe?: string;
  sourceLabelHe?: string;
  messageHe?: string | null;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: WeatherPayload }
  | { status: "error" };

export function WeatherWidget() {
  const startDate = useTripMetaStore((s) => s.startDate);
  const endDate = useTripMetaStore((s) => s.endDate);
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${startDate}|${endDate}|${attempt}`;
  const [result, setResult] = useState<{ key: string; state: LoadState } | null>(null);
  const state: LoadState =
    result && result.key === requestKey ? result.state : { status: "loading" };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const key = `${startDate}|${endDate}|${attempt}`;

    void (async () => {
      try {
        const url = new URL("/api/weather", window.location.origin);
        url.searchParams.set("start", startDate);
        url.searchParams.set("end", endDate);
        const res = await fetch(url.toString(), { signal: controller.signal });
        const data = (await res.json()) as WeatherPayload;
        if (!cancelled) setResult({ key, state: { status: "ready", data } });
      } catch {
        if (!cancelled) setResult({ key, state: { status: "error" } });
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [startDate, endDate, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const data = state.status === "ready" ? state.data : null;
  const hasStats =
    data?.available && data.avgHighC != null && data.avgLowC != null;
  const climate = data?.mode === "climate";

  return (
    <section aria-labelledby="weather-title" aria-busy={state.status === "loading"}>
      <SectionHead
        as="h3"
        id="weather-title"
        title={`מזג האוויר ב${data?.locationLabelHe ?? "טוקיו"}`}
        meta={data?.monthLabel ?? weatherTips.monthHint}
      />

      {state.status === "loading" && (
        <div className="grid grid-cols-3 gap-4" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-8 w-14 animate-pulse bg-paper-sunk" />
              <div className="h-3 w-16 animate-pulse bg-paper-sunk" />
            </div>
          ))}
          <span className="sr-only">טוען נתוני מזג אוויר</span>
        </div>
      )}

      {state.status === "error" && (
        <div className="space-y-2">
          <p className="text-sm text-ink-soft">
            לא הצלחנו לטעון את נתוני מזג האוויר.
          </p>
          <button type="button" onClick={retry} className="btn btn-secondary btn-sm">
            ניסיון נוסף
          </button>
        </div>
      )}

      {data && hasStats && (
        <dl className="grid grid-cols-3 gap-4">
          <div className="flex flex-col-reverse gap-1.5">
            <dt className="t-meta">ממוצע ביום</dt>
            <dd className="t-num text-[2rem] leading-none">{data.avgHighC}°</dd>
          </div>
          <div className="flex flex-col-reverse gap-1.5">
            <dt className="t-meta">ממוצע בלילה</dt>
            <dd className="t-num text-[2rem] leading-none">{data.avgLowC}°</dd>
          </div>
          <div className="flex flex-col-reverse gap-1.5">
            <dt className="t-meta">
              {climate ? "גשם בכל החודש" : "גשם בימי הטיול"}
            </dt>
            <dd className="t-num text-[2rem] leading-none">
              {data.rainfallMm}
              <span className="ms-1 font-sans text-sm text-muted">מ״מ</span>
            </dd>
          </div>
        </dl>
      )}

      {data && !hasStats && (
        <p className="text-sm text-ink-soft">
          {data.messageHe ?? "נתוני מזג אוויר אינם זמינים כרגע."}
        </p>
      )}

      {data && hasStats && (
        <p className="t-meta mt-3">
          {climate
            ? "התאריכים רחוקים מטווח התחזית, לכן מוצג אומדן אקלימי לחודש (Open-Meteo)."
            : data.sourceLabelHe}
        </p>
      )}

      <div className="mt-5 border-t border-rule pt-4">
        <h4 className="t-label">עלי השלכת (Koyo)</h4>
        <p className="mt-1.5 text-sm leading-6 text-ink-soft">{weatherTips.koyo}</p>
        <p className="t-meta mt-1">{weatherTips.koyoCaveat}</p>
      </div>
    </section>
  );
}

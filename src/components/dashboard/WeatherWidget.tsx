"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSun,
  Leaf,
  Sun,
  Thermometer,
  Umbrella,
} from "lucide-react";
import { motion } from "framer-motion";
import { weatherTips } from "@/data/trip";
import { useTripMetaStore } from "@/store/tripMeta";
import { cn } from "@/lib/utils";

type WeatherPayload = {
  available: boolean;
  mode?: "forecast" | "climate";
  monthLabel?: string;
  avgHighC?: number;
  avgLowC?: number;
  rainfallMm?: number;
  sourceLabelHe?: string;
  messageHe?: string | null;
};

const KOYO_PCT = 78;

function weatherIconFor(rainfallMm?: number, avgHighC?: number) {
  if (rainfallMm != null && rainfallMm >= 120) {
    return { Icon: CloudRain, label: "גשום", tone: "text-sky" };
  }
  if (rainfallMm != null && rainfallMm >= 60) {
    return { Icon: Cloud, label: "מעונן", tone: "text-muted" };
  }
  if (avgHighC != null && avgHighC >= 22) {
    return { Icon: Sun, label: "בהיר", tone: "text-amber" };
  }
  return { Icon: CloudSun, label: "משתנה", tone: "text-sky" };
}

function KoyoGauge({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const status =
    pct < 40 ? "מוקדם" : pct < 70 ? "מתקרב לשיא" : pct < 90 ? "שיא" : "שיא גבוה";
  const statusColor =
    pct < 40
      ? "text-autumn-green"
      : pct < 70
        ? "text-autumn-yellow"
        : "text-autumn-red";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-muted">
          <Leaf className="h-3.5 w-3.5 text-autumn-green" strokeWidth={2.25} />
          שיא עלווה סתיו (Koyo)
        </span>
        <span className={cn("font-bold tabular-nums", statusColor)}>
          {pct}% · {status}
        </span>
      </div>
      <div
        className="relative h-3.5 rounded-full border border-border/70 bg-parchment-deep/80"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="מד Koyo"
      >
        <motion.div
          className="absolute inset-y-0 start-0 overflow-hidden rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        >
          <div
            className="h-full w-full min-w-[12rem] rounded-full"
            style={{
              background:
                "linear-gradient(to left, var(--autumn-green) 0%, var(--autumn-yellow) 48%, var(--autumn-red) 100%)",
            }}
          />
        </motion.div>
        <motion.span
          className="absolute top-1/2 z-10 h-4 w-1.5 -translate-y-1/2 rounded-full border border-border bg-parchment shadow-[0_1px_4px_color-mix(in_srgb,var(--espresso)_25%,transparent)]"
          style={{ insetInlineStart: `max(0px, calc(${pct}% - 3px))` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-medium text-muted">
        <span className="text-autumn-green">ירוק</span>
        <span className="text-autumn-yellow">צהוב</span>
        <span className="text-autumn-red">אדום סתיו</span>
      </div>
    </div>
  );
}

export function WeatherWidget() {
  const startDate = useTripMetaStore((s) => s.startDate);
  const endDate = useTripMetaStore((s) => s.endDate);
  const [weather, setWeather] = useState<WeatherPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    setWeather(null);

    void (async () => {
      try {
        const url = new URL("/api/weather", window.location.origin);
        url.searchParams.set("start", startDate);
        url.searchParams.set("end", endDate);
        const res = await fetch(url.toString());
        const data = (await res.json()) as WeatherPayload;
        if (!cancelled) setWeather(data);
      } catch {
        if (!cancelled) {
          setWeather({
            available: false,
            messageHe: "מזג אוויר עדיין לא זמין",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const showStats = weather?.available && weather.avgHighC != null;
  const sky = weatherIconFor(weather?.rainfallMm, weather?.avgHighC);
  const SkyIcon = sky.Icon;

  return (
    <div className="autumn-wash -m-1 flex h-full flex-col space-y-3 p-2.5 sm:p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-soft text-sky">
            <SkyIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          מזג אוויר ו-Koyo
        </div>
        <span className="text-xs font-medium text-muted">
          {weather?.monthLabel ?? weatherTips.monthHint}
        </span>
      </div>

      {!weather && (
        <p className="rounded-2xl border border-border bg-surface/70 px-3 py-2 text-sm text-muted">
          טוען מזג אוויר…
        </p>
      )}

      {weather && weather.messageHe && (
        <p className="rounded-2xl border border-border bg-surface/70 px-3 py-2 text-sm leading-6 text-muted">
          {weather.messageHe}
        </p>
      )}

      {showStats ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-border bg-surface/75 p-2.5 text-center">
              <Sun className="mx-auto mb-1 h-4 w-4 text-amber" strokeWidth={2.25} />
              <div className="font-[family-name:var(--font-quicksand)] text-lg font-bold tabular-nums text-foreground">
                {weather.avgHighC}°
              </div>
              <div className="text-[11px] text-muted">מקסימום</div>
            </div>
            <div className="rounded-2xl border border-border bg-surface/75 p-2.5 text-center">
              <Thermometer className="mx-auto mb-1 h-4 w-4 text-olive" strokeWidth={2.25} />
              <div className="font-[family-name:var(--font-quicksand)] text-lg font-bold tabular-nums text-foreground">
                {weather.avgLowC}°
              </div>
              <div className="text-[11px] text-muted">מינימום</div>
            </div>
            <div className="rounded-2xl border border-border bg-surface/75 p-2.5 text-center">
              <Umbrella className="mx-auto mb-1 h-4 w-4 text-sky" strokeWidth={2.25} />
              <div className="font-[family-name:var(--font-quicksand)] text-lg font-bold tabular-nums text-foreground">
                {weather.rainfallMm}
              </div>
              <div className="text-[11px] text-muted">מ״מ גשם</div>
            </div>
          </div>
          {weather.sourceLabelHe && (
            <p className="text-[11px] text-muted">{weather.sourceLabelHe}</p>
          )}
        </>
      ) : (
        weather &&
        !weather.messageHe && (
          <p className="rounded-2xl border border-border bg-surface/70 px-3 py-2 text-sm text-muted">
            מזג אוויר עדיין לא זמין
          </p>
        )
      )}

      <KoyoGauge value={KOYO_PCT} />
      <p className="text-sm leading-6 text-muted">{weatherTips.koyoPeak}</p>
      <ul className="mt-auto space-y-1.5">
        {weatherTips.notes.map((note) => (
          <li key={note} className="flex items-start gap-2 text-xs text-muted">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive/70" />
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}

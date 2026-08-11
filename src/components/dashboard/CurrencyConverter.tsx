"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, TrendingUp } from "lucide-react";
import { tripMeta } from "@/data/trip";
import { useTripMetaStore } from "@/store/tripMeta";
import { cn, formatNumber } from "@/lib/utils";

const QUICK_JPY = [1000, 5000, 10000] as const;
const FALLBACK_RATE = tripMeta.exchangeRateIlsToJpy;

type ExchangeRatePayload = {
  rateIlsToJpy: number;
  rateJpyToIls: number;
  updatedAt: string;
  source: string;
  fallback?: boolean;
  history?: number[];
};

function RateSparkline({ values, className }: { values: number[]; className?: string }) {
  const w = 88;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const last = values[values.length - 1];
  const prev = values[values.length - 2] ?? last;
  const up = last >= prev;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="overflow-visible"
        aria-hidden
      >
        <polyline
          fill="none"
          stroke={up ? "var(--olive)" : "var(--sky)"}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[10px] font-semibold",
          up ? "text-olive" : "text-sky",
        )}
      >
        <TrendingUp className={cn("h-3 w-3", !up && "rotate-180")} />
        {up ? "+" : ""}
        {(last - values[0]).toFixed(1)}
      </span>
    </div>
  );
}

function formatUpdatedHe(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
  }).format(d);
}

function sourceLabelHe(source: string, fallback?: boolean) {
  if (fallback || source === "fallback") return "שער משוער (גיבוי)";
  if (source === "frankfurter") return "Frankfurter";
  return source;
}

export function CurrencyConverter() {
  const ils = useTripMetaStore((s) => s.budgetIls);
  const setBudgetIls = useTripMetaStore((s) => s.setBudgetIls);

  const [rate, setRate] = useState(FALLBACK_RATE);
  const [history, setHistory] = useState<number[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [source, setSource] = useState("fallback");
  const [isFallback, setIsFallback] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/exchange-rate");
        const data = (await res.json()) as ExchangeRatePayload;
        if (cancelled) return;
        if (
          typeof data.rateIlsToJpy === "number" &&
          Number.isFinite(data.rateIlsToJpy) &&
          data.rateIlsToJpy > 0
        ) {
          setRate(data.rateIlsToJpy);
          setUpdatedAt(data.updatedAt ?? null);
          setSource(data.source ?? "frankfurter");
          setIsFallback(Boolean(data.fallback));
          setHistory(
            Array.isArray(data.history) && data.history.length >= 2
              ? data.history
              : null,
          );
        } else {
          setRate(FALLBACK_RATE);
          setIsFallback(true);
          setSource("fallback");
          setUpdatedAt(new Date().toISOString());
          setHistory(null);
        }
      } catch {
        if (cancelled) return;
        setRate(FALLBACK_RATE);
        setIsFallback(true);
        setSource("fallback");
        setUpdatedAt(new Date().toISOString());
        setHistory(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const jpy = useMemo(() => Math.round(ils * rate), [ils, rate]);
  const updatedLabel = updatedAt ? formatUpdatedHe(updatedAt) : null;

  function setFromIls(value: number) {
    setBudgetIls(Number.isFinite(value) ? value : 0);
  }

  function setFromJpy(value: number) {
    if (!Number.isFinite(value)) return;
    setBudgetIls(Math.round(value / rate));
  }

  return (
    <div className="flex h-full flex-col space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-soft text-wood">
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          המרת מטבע
        </div>
        <div className="text-end">
          <div className="text-[11px] font-medium text-muted">
            {loading ? <span>טוען שער…</span> : <span>1 ₪ ≈ {rate} ¥</span>}
          </div>
          {history && (
            <RateSparkline values={history} className="mt-1 justify-end" />
          )}
          <p className="mt-1 max-w-[11rem] text-[10px] leading-4 text-muted">
            {loading
              ? "מתחבר לשער חי…"
              : `${sourceLabelHe(source, isFallback)}${
                  updatedLabel ? ` · עודכן ${updatedLabel}` : ""
                }`}
          </p>
        </div>
      </div>

      <div className="ledger-frame rounded-2xl p-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="rounded-xl border border-border bg-surface/80 p-3 transition hover:border-olive/40">
            <div className="text-xs font-medium text-muted">שקלים (₪)</div>
            <input
              type="number"
              min={0}
              step={50}
              value={ils}
              onChange={(e) => setFromIls(Number(e.target.value))}
              className="mt-1 w-full bg-transparent font-[family-name:var(--font-quicksand)] text-xl font-bold tabular-nums text-foreground outline-none"
            />
          </label>
          <label className="rounded-xl border border-border bg-surface/80 p-3 transition hover:border-olive/40">
            <div className="text-xs font-medium text-muted">ין יפני (¥)</div>
            <input
              type="number"
              min={0}
              step={100}
              value={jpy}
              onChange={(e) => setFromJpy(Number(e.target.value))}
              className="mt-1 w-full bg-transparent font-[family-name:var(--font-quicksand)] text-xl font-bold tabular-nums text-foreground outline-none"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_JPY.map((amount) => {
          const active = jpy === amount;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => setFromJpy(amount)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                active
                  ? "border-terracotta/50 bg-terracotta text-parchment shadow-[0_4px_12px_var(--glow)]"
                  : "border-border bg-parchment-deep/60 text-muted hover:border-olive/45 hover:text-foreground",
              )}
            >
              ¥{formatNumber(amount)}
            </button>
          );
        })}
      </div>

      <input
        type="range"
        min={500}
        max={20000}
        step={100}
        value={Math.min(20000, Math.max(500, ils))}
        onChange={(e) => setFromIls(Number(e.target.value))}
        className="mt-auto h-1.5 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-[var(--olive)]"
        aria-label="סכום בשקלים"
      />
      <div className="flex justify-between text-[11px] text-muted">
        <span>בחירה מהירה או הקלדה</span>
        <span className="tabular-nums font-medium text-foreground/80">
          ≈ ₪{formatNumber(ils)} / ¥{formatNumber(jpy)}
        </span>
      </div>
    </div>
  );
}

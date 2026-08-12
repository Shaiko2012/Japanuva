"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CreditCard, Plane, WalletCards } from "lucide-react";
import { airportOptions, suicaSteps } from "@/data/tools";
import { formatNumber } from "@/lib/utils";
import {
  softEntranceProps,
  softInteractiveProps,
  softStagger,
  softTransition,
} from "@/lib/motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export function TransitHub() {
  const [airport, setAirport] = useState<"ALL" | "HND" | "NRT">("ALL");
  const [step, setStep] = useState(0);
  const reduceMotion = useReducedMotion();
  const cardMotion = softInteractiveProps(reduceMotion);

  const options = useMemo(
    () =>
      airport === "ALL"
        ? airportOptions
        : airportOptions.filter((o) => o.airport === airport),
    [airport],
  );

  return (
    <div className="space-y-4">
      <GlassCard strong>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="glow-accent flex h-12 w-12 items-center justify-center rounded-2xl bg-nav-bg text-nav-fg">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <h1 className="fluid-title font-[family-name:var(--font-readex)] font-bold">
                נסיעות ו-Suica
              </h1>
              <p className="mt-1 text-sm text-muted">
                מדריך הקמה לכרטיס תחבורה והשוואת מעברים מ־HND / NRT.
              </p>
            </div>
          </div>
          <StatusBadge tone="accent" label="Transit Hub" pulse />
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <WalletCards className="h-4 w-4 text-accent" />
            מדריך Suica / Pasmo
          </div>
          <div className="space-y-2">
            {suicaSteps.map((item, index) => {
              const active = step === index;
              return (
                <motion.button
                  key={item.title}
                  type="button"
                  {...softEntranceProps(reduceMotion, {
                    delay: softStagger(index, 0.05),
                    y: 8,
                  })}
                  {...cardMotion}
                  onClick={() => setStep(index)}
                  className={cn(
                    "w-full rounded-2xl border p-3 text-right transition",
                    active
                      ? "border-accent/45 bg-accent-soft"
                      : "border-border bg-background/30 hover:border-accent/30",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted">שלב {index + 1}</span>
                    {active && <StatusBadge tone="accent" label="פעיל" />}
                  </div>
                  <div className="mt-1 font-medium">{item.title}</div>
                  <AnimateText show={active} text={item.detail} reduceMotion={reduceMotion} />
                </motion.button>
              );
            })}
          </div>
          <div className="mt-4">
            <ProgressBar
              value={step + 1}
              max={suicaSteps.length}
              label="התקדמות במדריך"
            />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Plane className="h-4 w-4 text-accent" />
              השוואת מעבר משדה התעופה
            </div>
            <SegmentedTabs
              items={[
                { id: "ALL", label: "הכל" },
                { id: "HND", label: "HND" },
                { id: "NRT", label: "NRT" },
              ]}
              value={airport}
              onChange={setAirport}
              layoutId="transit-airport-pill"
              aria-label="סינון שדה תעופה"
              size="sm"
              className="rounded-full border border-border bg-background/35 p-0.5"
            />
          </div>

          <div className="space-y-3">
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                {...softEntranceProps(reduceMotion, {
                  delay: softStagger(index, 0.05),
                  y: 10,
                })}
                {...cardMotion}
                className="rounded-2xl border border-border bg-background/30 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-xs text-muted">{option.airport}</div>
                    <div className="font-semibold">{option.name}</div>
                  </div>
                  <StatusBadge
                    tone="muted"
                    label={`ציון משפחה ${option.score}`}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl border border-border bg-surface/60 px-3 py-2">
                    <div className="text-[11px] text-muted">זמן</div>
                    <div className="font-semibold tabular-nums">
                      ~{option.minutes} דק׳
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-surface/60 px-3 py-2">
                    <div className="text-[11px] text-muted">עלות לאדם</div>
                    <div className="font-semibold tabular-nums text-accent">
                      ¥{formatNumber(option.costJpy)}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted">
                  {option.familyNote}
                </p>
                <div className="mt-3">
                  <ProgressBar value={option.score} max={100} />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function AnimateText({
  show,
  text,
  reduceMotion,
}: {
  show: boolean;
  text: string;
  reduceMotion: boolean | null;
}) {
  if (!show) return null;
  return (
    <motion.p
      {...softEntranceProps(reduceMotion, { y: 8 })}
      transition={softTransition()}
      className="mt-2 text-xs leading-5 text-muted"
    >
      {text}
    </motion.p>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useTripMetaStore } from "@/store/tripMeta";

function getRemaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

const empty = { days: 0, hours: 0, minutes: 0, seconds: 0 };

function formatUnit(value: number) {
  return String(value).padStart(2, "0");
}

export function Countdown() {
  const startDate = useTripMetaStore((s) => s.startDate);
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState(empty);

  useEffect(() => {
    const target = new Date(`${startDate}T08:00:00`);
    setMounted(true);
    setRemaining(getRemaining(target));
    const id = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [startDate]);

  // Visual LTR: ימים · שעות · דק׳ · שנ׳ (days first). HeroBar keeps the box on the left.
  const units = [
    { label: "ימים", value: remaining.days },
    { label: "שעות", value: remaining.hours },
    { label: "דק׳", value: remaining.minutes },
    { label: "שנ׳", value: remaining.seconds },
  ];

  return (
    <div
      className="countdown-sign flex h-full w-full min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-2xl px-2.5 py-2.5 md:min-h-0 md:gap-2.5 md:px-3 md:py-3"
      dir="ltr"
      suppressHydrationWarning
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label="זמן עד ליציאה"
    >
      <div className="flex items-center gap-1.5 text-muted" dir="rtl">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-wood/15 text-wood"
          aria-hidden
        >
          <Clock className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
        <span className="whitespace-nowrap text-[11px] font-semibold tracking-wide">
          זמן עד ליציאה
        </span>
      </div>

      <div className="grid w-full min-w-0 grid-cols-4 gap-1 sm:gap-1.5">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg bg-parchment/55 px-0.5 py-1.5 sm:py-2"
          >
            <motion.span
              key={`${unit.label}-${mounted ? unit.value : "x"}-${startDate}`}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              className="max-w-full truncate font-[family-name:var(--font-quicksand)] text-sm font-bold tabular-nums leading-none text-foreground sm:text-base"
            >
              {mounted ? formatUnit(unit.value) : "--"}
            </motion.span>
            <span className="text-[10px] font-medium leading-none text-muted">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

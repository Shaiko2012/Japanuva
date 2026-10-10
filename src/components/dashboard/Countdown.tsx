"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useTripMetaStore, tripLengthDays } from "@/store/tripMeta";
import { FlipDigits } from "@/components/ui/Motion";
import { softEase } from "@/lib/motion";

function CountUp({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : Math.max(0, value - Math.min(40, value)));
  const rounded = useTransform(mv, (v) => String(Math.round(v)));

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: reduce ? 0 : 1.05,
      ease: softEase,
    });
    return controls.stop;
  }, [value, mv, reduce]);

  return <motion.span className={className}>{rounded}</motion.span>;
}

type Phase =
  | {
      kind: "before";
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
      today: boolean;
    }
  | { kind: "during"; day: number; total: number }
  | { kind: "after" }
  | { kind: "invalid" };

function parseDay(iso: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T${time}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function sameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function computePhase(startDate: string, endDate: string, now: number): Phase {
  const departure = parseDay(startDate, "08:00:00");
  const returnEnd = parseDay(endDate, "23:59:59");
  if (!departure || !returnEnd) return { kind: "invalid" };

  const diff = departure.getTime() - now;
  if (diff > 0) {
    return {
      kind: "before",
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff / 3_600_000) % 24),
      minutes: Math.floor((diff / 60_000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      today: sameCalendarDay(departure, new Date(now)),
    };
  }
  if (now <= returnEnd.getTime()) {
    const total = tripLengthDays(startDate, endDate);
    const day = Math.min(total, Math.floor((now - departure.getTime()) / 86_400_000) + 1);
    return { kind: "during", day, total };
  }
  return { kind: "after" };
}

function beforeLabel(days: number, today: boolean) {
  if (days <= 0) return today ? "הטיסה היום" : "הטיסה בעוד יום";
  if (days === 1) return "הטיסה בעוד יום";
  if (days === 2) return "יומיים עד היציאה";
  return "ימים עד היציאה";
}

function beforeAria(
  days: number,
  hours: number,
  minutes: number,
  today: boolean,
) {
  const clock = `${hours} שעות ו־${minutes} דקות`;
  if (days <= 0) {
    return today ? `הטיסה היום, עוד ${clock}` : `הטיסה בעוד יום, עוד ${clock}`;
  }
  if (days === 1) return `הטיסה בעוד יום, עוד ${clock}`;
  if (days === 2) return `יומיים עד היציאה, עוד ${clock}`;
  return `${days} ימים עד היציאה, עוד ${clock}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown() {
  const startDate = useTripMetaStore((s) => s.startDate);
  const endDate = useTripMetaStore((s) => s.endDate);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase = computePhase(startDate, endDate, now);

  if (phase.kind === "invalid") {
    return <p className="t-meta">הגדירו תאריך יציאה כדי לראות ספירה לאחור.</p>;
  }

  if (phase.kind === "during") {
    return (
      <div suppressHydrationWarning>
        <p className="t-num text-[clamp(3.5rem,2.5rem+4vw,6rem)] leading-[0.9]">
          <CountUp value={phase.day} />
          <span className="font-sans text-xl text-muted"> / {phase.total}</span>
        </p>
        <p className="mt-2 font-semibold">ימים בטיול</p>
      </div>
    );
  }

  if (phase.kind === "after") {
    return (
      <p className="t-h2" suppressHydrationWarning>
        הטיול הסתיים
      </p>
    );
  }

  const clock = `${pad(phase.hours)}:${pad(phase.minutes)}:${pad(phase.seconds)}`;
  const imminent = phase.days <= 0;

  return (
    <div
      role="timer"
      aria-label={beforeAria(phase.days, phase.hours, phase.minutes, phase.today)}
      suppressHydrationWarning
      className="lg:text-end"
    >
      {imminent ? (
        <p className="t-num text-[clamp(2.5rem,1.75rem+3vw,4.5rem)] leading-[0.9] text-vermilion">
          <span aria-hidden="true">
            <FlipDigits value={clock} />
          </span>
        </p>
      ) : (
        <p className="t-num text-[clamp(3.75rem,2.5rem+5vw,7rem)] leading-[0.85] text-vermilion">
          <CountUp value={phase.days} />
        </p>
      )}
      <p className="mt-3 font-semibold">{beforeLabel(phase.days, phase.today)}</p>
      {!imminent && (
        <p className="t-meta mt-1" aria-hidden="true">
          <FlipDigits value={clock} />
        </p>
      )}
    </div>
  );
}

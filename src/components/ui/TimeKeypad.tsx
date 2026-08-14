"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Delete, Eraser } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { softTapProps } from "@/lib/motion";
import { cn } from "@/lib/utils";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export interface TimeKeypadProps {
  /** HH:mm */
  value: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

function parseToDigits(value: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return "";
  const hh = m[1].padStart(2, "0");
  const mm = m[2];
  return `${hh}${mm}`.slice(0, 4);
}

function formatDigits(digits: string): string {
  const padded = digits.padEnd(4, "·");
  return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
}

function isValidTime(digits: string): boolean {
  if (digits.length !== 4) return false;
  const h = Number(digits.slice(0, 2));
  const m = Number(digits.slice(2, 4));
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

export function TimeKeypad({ value, onConfirm, onCancel }: TimeKeypadProps) {
  const reduceMotion = useReducedMotion();
  const tap = softTapProps(reduceMotion);
  const [digits, setDigits] = useState(() => parseToDigits(value));

  useEffect(() => {
    setDigits(parseToDigits(value));
  }, [value]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        setDigits((prev) => {
          if (prev.length >= 4) return prev;
          const next = prev + e.key;
          if (next.length === 1 && Number(next) > 2) return prev;
          if (next.length === 2) {
            const h = Number(next);
            if (h > 23) return prev;
          }
          if (next.length === 3 && Number(e.key) > 5) return prev;
          if (next.length === 4) {
            const m = Number(next.slice(2, 4));
            if (m > 59) return prev;
          }
          return next;
        });
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        setDigits((prev) => prev.slice(0, -1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (!isValidTime(digits)) return;
        onConfirm(`${digits.slice(0, 2)}:${digits.slice(2, 4)}`);
        return;
      }
      if (e.key === "Escape") {
        onCancel?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [digits, onConfirm, onCancel]);

  function pushDigit(d: string) {
    setDigits((prev) => {
      if (prev.length >= 4) return prev;
      const next = prev + d;
      if (next.length === 1 && Number(next) > 2) return prev;
      if (next.length === 2) {
        const h = Number(next);
        if (h > 23) return prev;
      }
      if (next.length === 3 && Number(d) > 5) return prev;
      if (next.length === 4) {
        const m = Number(next.slice(2, 4));
        if (m > 59) return prev;
      }
      return next;
    });
  }

  function backspace() {
    setDigits((prev) => prev.slice(0, -1));
  }

  function clear() {
    setDigits("");
  }

  function confirm() {
    if (!isValidTime(digits)) return;
    onConfirm(`${digits.slice(0, 2)}:${digits.slice(2, 4)}`);
  }

  const canConfirm = isValidTime(digits);
  const display = formatDigits(digits);
  const cursor = Math.min(digits.length, 3);

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl border border-border bg-background/50 px-4 py-4 text-center"
        aria-live="polite"
      >
        <div
          dir="ltr"
          className="font-[family-name:var(--font-quicksand)] text-4xl font-bold tabular-nums tracking-[0.12em]"
        >
          {display.split("").map((ch, i) => {
            const digitIndex = i < 2 ? i : i - 1;
            const active =
              ch !== ":" && digitIndex === cursor && digits.length < 4;
            return (
              <span
                key={`${i}-${ch}`}
                className={cn(
                  ch === "·" && "text-muted/45",
                  active &&
                    "rounded-md bg-yellow/50 px-0.5 text-foreground dark:bg-yellow/25",
                )}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-muted">שעה : דקה · HH:mm</p>
      </div>

      <div
        dir="ltr"
        style={{ direction: "ltr" }}
        className="grid grid-cols-3 gap-2 [direction:ltr]"
      >
        {DIGITS.map((d) => (
          <KeyBtn key={d} label={d} onClick={() => pushDigit(d)} reduceMotion={reduceMotion} />
        ))}
        <KeyBtn
          label="מחיקה"
          onClick={clear}
          muted
          icon={<Eraser className="h-4 w-4" />}
          reduceMotion={reduceMotion}
        />
        <KeyBtn label="0" onClick={() => pushDigit("0")} reduceMotion={reduceMotion} />
        <KeyBtn
          label="מחק"
          onClick={backspace}
          muted
          icon={<Delete className="h-4 w-4" />}
          reduceMotion={reduceMotion}
        />
      </div>

      <motion.button
        type="button"
        onClick={confirm}
        disabled={!canConfirm}
        className={cn(
          "flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold transition",
          canConfirm
            ? "bg-nav-bg text-nav-fg shadow-[0_8px_20px_var(--glow)]"
            : "cursor-not-allowed border border-border bg-surface text-muted opacity-60",
        )}
        {...tap}
      >
        אישור
      </motion.button>
    </div>
  );
}

function KeyBtn({
  label,
  onClick,
  muted,
  icon,
  reduceMotion,
}: {
  label: string;
  onClick: () => void;
  muted?: boolean;
  icon?: ReactNode;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      {...softTapProps(reduceMotion)}
      className={cn(
        "flex h-12 items-center justify-center gap-1.5 rounded-2xl border text-lg font-semibold tabular-nums transition sm:h-14",
        muted
          ? "border-border bg-surface text-muted"
          : "border-border/80 bg-[color-mix(in_srgb,var(--yellow)_35%,white)] text-foreground hover:bg-[color-mix(in_srgb,var(--yellow)_55%,white)] dark:bg-[color-mix(in_srgb,var(--yellow)_18%,transparent)] dark:hover:bg-[color-mix(in_srgb,var(--yellow)_28%,transparent)]",
      )}
      aria-label={label}
    >
      {icon}
      {(!icon || label.length > 1) && (
        <span className={icon ? "text-xs font-medium" : undefined}>{label}</span>
      )}
    </motion.button>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Delete, Eraser } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { softTapProps } from "@/lib/motion";
import { cn } from "@/lib/utils";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export interface NumberKeypadProps {
  value: number | string;
  onConfirm: (value: number) => void;
  onCancel?: () => void;
  allowDecimal?: boolean;
  maxDecimals?: number;
  min?: number;
  max?: number;
  /** Empty display when cleared */
  placeholder?: string;
}

function normalizeSeed(value: number | string): string {
  if (value === "" || value == null) return "";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value).replace(/[^\d.]/g, "");
  return String(n);
}

export function NumberKeypad({
  value,
  onConfirm,
  onCancel,
  allowDecimal = false,
  maxDecimals = 4,
  min,
  max,
  placeholder = "0",
}: NumberKeypadProps) {
  const reduceMotion = useReducedMotion();
  const tap = softTapProps(reduceMotion);
  const [draft, setDraft] = useState(() => normalizeSeed(value));
  const [seed, setSeed] = useState(value);
  if (value !== seed) {
    setSeed(value);
    setDraft(normalizeSeed(value));
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        setDraft((prev) => {
          if (prev === "0" && e.key !== "0" && !prev.includes(".")) return e.key;
          if (allowDecimal && prev.includes(".")) {
            const [, frac = ""] = prev.split(".");
            if (frac.length >= maxDecimals) return prev;
          }
          if (!allowDecimal && prev.length >= 12) return prev;
          if (prev.replace(".", "").length >= 12) return prev;
          return prev + e.key;
        });
        return;
      }
      if ((e.key === "." || e.key === ",") && allowDecimal) {
        e.preventDefault();
        setDraft((prev) => {
          if (prev.includes(".")) return prev;
          if (!prev) return "0.";
          return `${prev}.`;
        });
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        setDraft((prev) => prev.slice(0, -1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        let n = draft === "" || draft === "." ? 0 : Number(draft);
        if (!Number.isFinite(n)) n = 0;
        if (min != null) n = Math.max(min, n);
        if (max != null) n = Math.min(max, n);
        onConfirm(n);
        return;
      }
      if (e.key === "Escape") {
        onCancel?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [allowDecimal, maxDecimals, draft, min, max, onConfirm, onCancel]);

  function pushDigit(d: string) {
    setDraft((prev) => {
      if (prev === "0" && d !== "0" && !prev.includes(".")) return d;
      if (allowDecimal && prev.includes(".")) {
        const [, frac = ""] = prev.split(".");
        if (frac.length >= maxDecimals) return prev;
      }
      if (!allowDecimal && prev.length >= 12) return prev;
      if (prev.replace(".", "").length >= 12) return prev;
      return prev + d;
    });
  }

  function pushDecimal() {
    setDraft((prev) => {
      if (!allowDecimal) return prev;
      if (prev.includes(".")) return prev;
      if (!prev) return "0.";
      return `${prev}.`;
    });
  }

  function backspace() {
    setDraft((prev) => prev.slice(0, -1));
  }

  function clear() {
    setDraft("");
  }

  function confirm() {
    let n = draft === "" || draft === "." ? 0 : Number(draft);
    if (!Number.isFinite(n)) n = 0;
    if (min != null) n = Math.max(min, n);
    if (max != null) n = Math.min(max, n);
    onConfirm(n);
  }

  const display = draft === "" ? placeholder : draft;

  return (
    <div className="space-y-3">
      <div
        dir="ltr"
        className={cn(
          "border-b-2 border-rule-strong px-4 py-3 text-center",
          "t-num text-4xl",
          draft === "" && "text-muted",
        )}
        aria-live="polite"
      >
        {display}
      </div>

      <div
        dir="ltr"
        style={{ direction: "ltr" }}
        className="grid grid-cols-3 gap-2 [direction:ltr]"
      >
        {DIGITS.map((d) => (
          <KeyBtn key={d} label={d} onClick={() => pushDigit(d)} reduceMotion={reduceMotion} />
        ))}
        {allowDecimal ? (
          <KeyBtn label="." onClick={pushDecimal} muted reduceMotion={reduceMotion} />
        ) : (
          <KeyBtn
            label="מחיקה"
            onClick={clear}
            muted
            icon={<Eraser className="h-4 w-4" />}
            reduceMotion={reduceMotion}
          />
        )}
        <KeyBtn label="0" onClick={() => pushDigit("0")} reduceMotion={reduceMotion} />
        <KeyBtn
          label="מחק"
          onClick={backspace}
          muted
          icon={<Delete className="h-4 w-4" />}
          reduceMotion={reduceMotion}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        {allowDecimal && (
          <motion.button
            type="button"
            onClick={clear}
            className="btn btn-secondary col-span-2"
            {...tap}
          >
            <Eraser className="h-4 w-4" />
            מחיקה
          </motion.button>
        )}
        <motion.button
          type="button"
          onClick={confirm}
          className="btn btn-primary col-span-2 h-12"
          {...tap}
        >
          אישור
        </motion.button>
      </div>
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
        "flex h-12 items-center justify-center gap-1.5 rounded-[2px] border border-rule text-lg font-semibold tabular-nums transition-colors sm:h-14",
        muted
          ? "bg-paper-sunk text-ink-soft hover:border-ink-soft"
          : "bg-paper text-ink hover:border-ink",
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

"use client";

import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FamilyMemberCounts } from "@/data/trip";
import { softSpring } from "@/lib/motion";

interface FamilyCounterProps {
  value: FamilyMemberCounts;
  onChange: (next: FamilyMemberCounts) => void;
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="font-semibold">{label}</div>
        <div className="t-meta">{hint}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1" role="group" aria-label={label}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="btn btn-secondary btn-icon"
          aria-label={`הפחתת ${label}`}
        >
          <Minus aria-hidden />
        </button>
        <output aria-live="polite" className="t-num relative w-10 overflow-hidden text-center text-xl">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={reduce ? false : { y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: -12, opacity: 0 }}
              transition={reduce ? { duration: 0 } : softSpring}
              className="inline-block"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="btn btn-secondary btn-icon"
          aria-label={`הוספת ${label}`}
        >
          <Plus aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function FamilyCounter({ value, onChange }: FamilyCounterProps) {
  return (
    <div className="ruled border-y border-rule">
      <Stepper
        label="מבוגרים"
        hint="מגיל 12"
        value={value.adults}
        min={1}
        max={8}
        onChange={(adults) => onChange({ ...value, adults })}
      />
      <Stepper
        label="ילדים"
        hint="עד גיל 11"
        value={value.kids}
        min={0}
        max={8}
        onChange={(kids) => onChange({ ...value, kids })}
      />
    </div>
  );
}

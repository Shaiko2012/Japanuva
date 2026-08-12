"use client";

import { Baby, Minus, Plus, User, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FamilyMemberCounts } from "@/data/trip";
import { cn } from "@/lib/utils";

interface FamilyCounterProps {
  value: FamilyMemberCounts;
  onChange: (next: FamilyMemberCounts) => void;
}

function AvatarStack({
  count,
  kind,
}: {
  count: number;
  kind: "adult" | "child";
}) {
  const shown = Math.min(count, 5);
  const extra = count - shown;
  const Icon = kind === "adult" ? User : Baby;
  const tone =
    kind === "adult"
      ? "border-olive/35 bg-olive-soft text-olive"
      : "border-sky/40 bg-sky-soft text-sky";

  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={`${kind}-${i}`}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full border",
            tone,
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
      ))}
      {extra > 0 && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-parchment-deep text-[10px] font-bold text-muted">
          +{extra}
        </span>
      )}
      {count === 0 && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-border text-muted/50">
          <Icon className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
}

function CounterRow({
  label,
  value,
  kind,
  onDec,
  onInc,
}: {
  label: string;
  value: number;
  kind: "adult" | "child";
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2 rounded-2xl border border-border bg-parchment-deep/50 px-3 py-2.5 transition hover:border-olive/35 sm:gap-3">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <AvatarStack count={value} kind={kind} />
        <span className="truncate text-sm font-medium text-foreground">{label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onDec}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted hover:border-olive/40 hover:text-foreground sm:h-8 sm:w-8"
          aria-label={`הפחת ${label}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="w-6 text-center font-[family-name:var(--font-quicksand)] text-lg font-bold tabular-nums text-foreground"
          >
            {value}
          </motion.span>
        </AnimatePresence>
        <button
          type="button"
          onClick={onInc}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta text-parchment shadow-[0_3px_10px_var(--glow)] hover:brightness-105 sm:h-8 sm:w-8"
          aria-label={`הוסף ${label}`}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export function FamilyCounter({ value, onChange }: FamilyCounterProps) {
  const total = value.adults + value.kids;

  return (
    <div className="flex h-full flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-olive-soft text-olive">
            <Users className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          הרכב המשפחה
        </div>
        <span className="rounded-full border border-border bg-parchment-deep/70 px-2.5 py-1 text-xs font-bold tabular-nums text-foreground">
          סה״כ {total}
        </span>
      </div>
      <CounterRow
        label="מבוגרים"
        kind="adult"
        value={value.adults}
        onDec={() =>
          onChange({ ...value, adults: Math.max(1, value.adults - 1) })
        }
        onInc={() =>
          onChange({ ...value, adults: Math.min(8, value.adults + 1) })
        }
      />
      <CounterRow
        label="ילדים"
        kind="child"
        value={value.kids}
        onDec={() => onChange({ ...value, kids: Math.max(0, value.kids - 1) })}
        onInc={() => onChange({ ...value, kids: Math.min(8, value.kids + 1) })}
      />
    </div>
  );
}

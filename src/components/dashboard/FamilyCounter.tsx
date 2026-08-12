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
  // Cap visible faces so ± controls keep room in narrow 1/3 columns
  const shown = Math.min(count, 3);
  const extra = count - shown;
  const Icon = kind === "adult" ? User : Baby;
  const tone =
    kind === "adult"
      ? "border-olive/35 bg-olive-soft text-olive"
      : "border-[#E5D49A] bg-[#FBF3D4] text-[#A8944A]";

  return (
    <div className="flex min-w-0 shrink items-center" aria-hidden>
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={`${kind}-${i}`}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border sm:h-7 sm:w-7",
            i > 0 && "-ms-1.5",
            tone,
          )}
        >
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.25} />
        </span>
      ))}
      {extra > 0 && (
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-parchment-deep text-[10px] font-bold text-muted sm:h-7 sm:w-7",
            shown > 0 && "-ms-1.5",
          )}
        >
          +{extra}
        </span>
      )}
      {count === 0 && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border text-muted/50 sm:h-7 sm:w-7">
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
    <div className="flex min-w-0 items-center justify-between gap-2 rounded-2xl border border-border bg-parchment-deep/50 px-2.5 py-2.5 transition hover:border-yellow/40 sm:gap-3 sm:px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <AvatarStack count={value} kind={kind} />
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {label}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onDec}
          className="touch-target flex items-center justify-center rounded-full border border-border bg-surface text-muted hover:border-olive/40 hover:text-foreground"
          aria-label={`הפחת ${label}`}
        >
          <Minus className="h-3.5 w-3.5" aria-hidden />
        </button>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex w-7 items-center justify-center text-center font-[family-name:var(--font-quicksand)] text-lg font-bold tabular-nums text-foreground sm:w-8"
            aria-live="polite"
          >
            {value}
          </motion.span>
        </AnimatePresence>
        <button
          type="button"
          onClick={onInc}
          className="touch-target flex items-center justify-center rounded-full bg-nav-bg text-nav-fg shadow-[0_3px_10px_var(--glow)] transition hover:scale-105 hover:brightness-105"
          aria-label={`הוסף ${label}`}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function FamilyCounter({ value, onChange }: FamilyCounterProps) {
  const total = value.adults + value.kids;

  return (
    <div className="flex h-full min-w-0 flex-col gap-3">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-olive-soft text-olive">
            <Users className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <span className="min-w-0">הרכב המשפחה</span>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-parchment-deep/70 px-2.5 py-1 text-xs font-bold tabular-nums text-foreground">
          סה״כ {total}
        </span>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-3">
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
    </div>
  );
}

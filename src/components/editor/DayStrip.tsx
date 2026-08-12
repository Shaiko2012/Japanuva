"use client";

import { CalendarDays, Plus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useItineraryEditor } from "@/store/itineraryEditor";
import { tabPillMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function DayStrip() {
  const days = useItineraryEditor((s) => s.days);
  const selectedDayId = useItineraryEditor((s) => s.selectedDayId);
  const selectDay = useItineraryEditor((s) => s.selectDay);
  const addDay = useItineraryEditor((s) => s.addDay);
  const reduceMotion = useReducedMotion();
  const pillTransition = tabPillMotion(reduceMotion);

  return (
    <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain px-3 py-3.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days.map((day, index) => {
        const active = day.id === selectedDayId;
        return (
          <button
            key={day.id}
            type="button"
            onClick={() => selectDay(day.id)}
            className={cn(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
              active
                ? "text-background"
                : "border border-border bg-surface text-muted hover:border-accent/40 hover:text-foreground",
            )}
            aria-label={`יום ${index + 1}`}
            aria-current={active ? "true" : undefined}
          >
            {active && (
              <motion.span
                layoutId="editor-day-pill"
                className="absolute inset-0 rounded-full bg-foreground shadow-[0_0_0_3px_var(--accent-soft),0_4px_14px_color-mix(in_srgb,var(--foreground)_25%,transparent)]"
                transition={pillTransition}
                aria-hidden
              />
            )}
            <span className="relative z-10">{index + 1}</span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => addDay()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted hover:border-accent/40 hover:text-accent"
        aria-label="הוסף יום"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ItineraryPanelHeader() {
  const days = useItineraryEditor((s) => s.days);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-accent" />
        <h1 className="font-[family-name:var(--font-readex)] text-lg font-bold">
          מסלול הטיול
        </h1>
      </div>
      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
        {days.length} {days.length === 1 ? "יום" : "ימים"}
      </span>
    </div>
  );
}

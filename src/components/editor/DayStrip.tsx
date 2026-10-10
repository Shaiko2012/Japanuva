"use client";

import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useItineraryEditor } from "@/store/itineraryEditor";
import { formatDayHe } from "@/lib/tripSummary";
import { cn } from "@/lib/utils";
import { navPillTransition } from "@/lib/motion";

export function DayStrip() {
  const days = useItineraryEditor((s) => s.days);
  const selectedDayId = useItineraryEditor((s) => s.selectedDayId);
  const selectDay = useItineraryEditor((s) => s.selectDay);
  const addDay = useItineraryEditor((s) => s.addDay);
  const activeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedDayId]);

  return (
    <div className="flex items-center gap-1 overflow-x-auto overscroll-x-contain py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <LayoutGroup id="day-strip">
      <div role="tablist" aria-label="ימי הטיול" className="flex gap-1">
        <AnimatePresence initial={false}>
        {days.map((day, index) => {
          const active = day.id === selectedDayId;
          return (
            <motion.button
              key={day.id}
              ref={active ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectDay(day.id)}
              aria-label={`יום ${index + 1}, ${formatDayHe(day.date, { weekday: "long", day: "numeric", month: "long" })}`}
              initial={reduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
              whileTap={reduce ? undefined : { scale: 0.94 }}
              className={cn(
                "relative flex h-14 w-12 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border",
                active
                  ? "border-transparent text-on-ink"
                  : "border-rule text-ink-soft hover:border-ink hover:text-ink",
              )}
            >
              {active && (
                <motion.span
                  layoutId="day-strip-active"
                  className="absolute inset-0 bg-ink"
                  transition={reduce ? { duration: 0 } : navPillTransition}
                />
              )}
              <span className="t-num relative z-10 text-lg leading-none">{index + 1}</span>
              <span className={cn("relative z-10 mt-1 text-[0.68rem] leading-none", active ? "opacity-80" : "text-muted")}>
                {formatDayHe(day.date, { day: "numeric", month: "numeric" })}
              </span>
            </motion.button>
          );
        })}
        </AnimatePresence>
      </div>
      </LayoutGroup>
      <button
        type="button"
        onClick={() => addDay()}
        aria-label="הוספת יום"
        className="btn btn-secondary ms-1 h-14 shrink-0 border-dashed px-3"
      >
        <Plus aria-hidden />
        יום
      </button>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BedDouble,
  Clock3,
  Sparkles,
} from "lucide-react";
import {
  dailyItinerary,
  type DistrictId,
} from "@/data/trip";
import { usePersonalTrip } from "@/hooks/usePersonalTrip";
import {
  softEntranceProps,
  softExpandProps,
  softInteractiveProps,
  softStagger,
} from "@/lib/motion";
import { isBundledDemoItinerary } from "@/lib/demoDetect";
import { useItineraryEditor } from "@/store/itineraryEditor";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface DailyItineraryProps {
  selectedDistrict: DistrictId | null;
}

function formatDateHe(dateStr: string) {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${dateStr}T12:00:00`));
}

export function DailyItinerary({ selectedDistrict }: DailyItineraryProps) {
  const isPersonal = usePersonalTrip();
  const editorDays = useItineraryEditor((s) => s.days);
  const [openId, setOpenId] = useState<string | null>(null);

  const days = useMemo(() => {
    if (isPersonal) {
      const sourceDays = isBundledDemoItinerary(editorDays) ? [] : editorDays;
      return sourceDays.map((d) => ({
        id: d.id,
        date: d.date,
        title:
          d.activities[0]?.title ||
          (d.hotel.name ? `יום ב${d.city} · ${d.hotel.name}` : `יום ב${d.city}`),
        city: d.city,
        districtId: null as DistrictId | null,
        accommodation: d.hotel,
        tags: d.activities.slice(0, 3).map((a) => a.category),
        activities: d.activities.map((a) => a.title),
        transitMinutes: Math.max(0, (d.activities.length - 1) * 18),
        transitLabel: "לפי המסלול שלכם",
      }));
    }
    return selectedDistrict
      ? dailyItinerary.filter((d) => d.districtId === selectedDistrict)
      : dailyItinerary;
  }, [isPersonal, editorDays, selectedDistrict]);

  const reduceMotion = useReducedMotion();
  const expandMotion = softExpandProps(reduceMotion);
  const cardMotion = softInteractiveProps(reduceMotion);

  return (
    <GlassCard className="h-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-yellow" />
            {isPersonal ? "הימים שלכם" : "לוח זמנים לדוגמה · אוקטובר 2027"}
          </div>
          <p className="mt-1 text-xs text-muted">
            {isPersonal
              ? days.length
                ? `${days.length} ימים במסלול האישי`
                : "עדיין ריק — הוסיפו ימים בעריכת הטיול"
              : `${days.length} ימי דמו`}
          </p>
        </div>
        <StatusBadge
          tone={isPersonal ? "accent" : "pending"}
          label={isPersonal ? "אישי" : "דמו"}
          pulse
        />
      </div>

      <div className="max-h-[560px] space-y-3 overflow-y-auto pe-1 [scrollbar-gutter:stable]">
        <AnimatePresence mode="popLayout">
          {days.map((day, index) => {
            const open = openId === day.id;
            return (
              <motion.div
                key={day.id}
                {...softEntranceProps(reduceMotion, {
                  delay: softStagger(index, 0.05),
                  y: 10,
                })}
                {...cardMotion}
              >
                <article className="rounded-2xl border border-border bg-background/35 p-4 transition hover:border-accent/35">
                  <button
                    type="button"
                    className="w-full text-right"
                    onClick={() =>
                      setOpenId(open ? null : day.id)
                    }
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted">
                          {formatDateHe(day.date)} · {day.city}
                        </div>
                        <h3 className="mt-1 text-base font-semibold">
                          {day.title}
                        </h3>
                      </div>
                      {"status" in day.accommodation && (
                        <StatusBadge
                          status={
                            day.accommodation.status === "booked"
                              ? "booked"
                              : day.accommodation.status === "considering" ||
                                  day.accommodation.status === "pending"
                                ? "pending"
                                : "research"
                          }
                        />
                      )}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        {...expandMotion}
                      >
                        <div className="mt-3 space-y-2 border-t border-border pt-3">
                          {day.activities.length === 0 ? (
                            <p className="text-xs text-muted">אין אטרקציות עדיין</p>
                          ) : (
                            day.activities.map((activity) => (
                              <div
                                key={activity}
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                {activity}
                              </div>
                            ))
                          )}
                          <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted">
                            <span className="inline-flex items-center gap-1.5">
                              <BedDouble className="h-3.5 w-3.5" />
                              {day.accommodation.name || "ללא מלון"}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 className="h-3.5 w-3.5" />
                              {day.transitMinutes > 0
                                ? `${day.transitMinutes} דק׳ · ${day.transitLabel}`
                                : day.transitLabel}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {days.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            המסלול ריק — עברו ל״עריכת הטיול״ והתחילו למלא.
          </p>
        )}
      </div>
    </GlassCard>
  );
}

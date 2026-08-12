"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BedDouble,
  CalendarDays,
  ChevronDown,
  Clock3,
  Filter,
} from "lucide-react";
import { dailyItinerary, districts, type DistrictId } from "@/data/trip";
import {
  softEase,
  softEntranceProps,
  softExpandProps,
  softInteractiveProps,
  softStagger,
} from "@/lib/motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { StatusBadge } from "@/components/ui/StatusBadge";

function formatDateHe(dateStr: string) {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${dateStr}T12:00:00`));
}

const allTags = Array.from(
  new Set(dailyItinerary.flatMap((d) => d.tags)),
).sort();

export function InteractiveTimeline() {
  const [city, setCity] = useState<DistrictId | "all">("all");
  const [tag, setTag] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(dailyItinerary[0]?.id ?? null);
  const reduceMotion = useReducedMotion();
  const expandMotion = softExpandProps(reduceMotion);
  const cardMotion = softInteractiveProps(reduceMotion);

  const days = useMemo(() => {
    return dailyItinerary.filter((d) => {
      const cityOk = city === "all" || d.districtId === city;
      const tagOk = tag === "all" || d.tags.includes(tag);
      return cityOk && tagOk;
    });
  }, [city, tag]);

  return (
    <div className="space-y-4">
      <GlassCard strong>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="glow-accent flex h-12 w-12 items-center justify-center rounded-2xl bg-nav-bg text-nav-fg">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <h1 className="fluid-title font-[family-name:var(--font-readex)] font-bold">
                המסלול שלי
              </h1>
              <p className="mt-1 text-sm text-muted">
                טיימליין אינטראקטיבי לאוקטובר 2027 — סינון, פתיחת ימים וסטטוס לינה.
              </p>
            </div>
          </div>
          <StatusBadge tone="accent" label={`${days.length} ימים`} pulse />
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4 text-accent" />
          סינון מסלול
        </div>
        <SegmentedTabs
          items={[
            { id: "all" as const, label: "כל האזורים" },
            ...districts.map((d) => ({ id: d.id, label: d.nameHe })),
          ]}
          value={city}
          onChange={setCity}
          layoutId="timeline-city-pill"
          aria-label="סינון לפי אזור"
          equalWidth={false}
          size="sm"
          className="rounded-2xl border border-border bg-background/35 p-1"
        />
        <SegmentedTabs
          items={[
            { id: "all", label: "כל התגיות" },
            ...allTags.map((t) => ({ id: t, label: t })),
          ]}
          value={tag}
          onChange={setTag}
          layoutId="timeline-tag-pill"
          aria-label="סינון לפי תגית"
          equalWidth={false}
          size="sm"
          className="mt-3 rounded-2xl border border-border bg-background/35 p-1"
        />
      </GlassCard>

      <div className="relative space-y-3 pe-2">
        <div className="absolute bottom-4 top-4 start-5 w-px bg-gradient-to-b from-accent via-accent/40 to-transparent" />
        <AnimatePresence mode="popLayout">
          {days.map((day, index) => {
            const open = openId === day.id;
            return (
              <motion.article
                key={day.id}
                {...softEntranceProps(reduceMotion, {
                  delay: softStagger(index, 0.05),
                  y: 10,
                })}
                className="relative"
              >
                <div className="absolute start-3.5 top-5 z-10 h-3 w-3 rounded-full border-2 border-accent bg-background shadow-[0_0_12px_var(--glow)]" />
                <div className="ms-10">
                  <motion.button
                    type="button"
                    {...cardMotion}
                    onClick={() => setOpenId(open ? null : day.id)}
                    className="glass w-full rounded-2xl p-4 text-right transition hover:border-accent/35"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted">
                          {formatDateHe(day.date)} · {day.city}
                        </div>
                        <h2 className="mt-1 text-base font-semibold">
                          {day.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={day.accommodation.status} />
                        <motion.span
                          animate={{ rotate: open ? 180 : 0 }}
                          transition={{ duration: 0.22, ease: softEase }}
                          className="inline-flex"
                        >
                          <ChevronDown className="h-4 w-4 text-muted" />
                        </motion.span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {day.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border bg-background/40 px-2.5 py-1 text-[11px] text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        {...expandMotion}
                      >
                        <div className="mt-2 rounded-2xl border border-border bg-background/35 p-4">
                          <ul className="space-y-1.5">
                            {day.activities.map((activity) => (
                              <li
                                key={activity}
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3 text-xs text-muted">
                            <span className="inline-flex items-center gap-1.5">
                              <BedDouble className="h-3.5 w-3.5" />
                              {day.accommodation.name}
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
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
        {days.length === 0 && (
          <GlassCard>
            <p className="text-sm text-muted">אין ימים שמתאימים לסינון הנוכחי.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

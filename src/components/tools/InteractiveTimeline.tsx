"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  CalendarDays,
  ChevronDown,
  Clock3,
  Filter,
} from "lucide-react";
import { dailyItinerary, districts, type DistrictId } from "@/data/trip";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

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
            <span className="glow-accent flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-[family-name:var(--font-readex)] text-2xl font-bold">
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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCity("all")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              city === "all"
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-border text-muted hover:border-accent/30",
            )}
          >
            כל האזורים
          </button>
          {districts.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setCity(d.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition",
                city === d.id
                  ? "border-accent/40 bg-accent-soft text-accent"
                  : "border-border text-muted hover:border-accent/30",
              )}
            >
              {d.nameHe}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTag("all")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              tag === "all"
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-border text-muted hover:border-accent/30",
            )}
          >
            כל התגיות
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition",
                tag === t
                  ? "border-accent/40 bg-accent-soft text-accent"
                  : "border-border text-muted hover:border-accent/30",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="relative space-y-3 pe-2">
        <div className="absolute bottom-4 top-4 start-5 w-px bg-gradient-to-b from-accent via-accent/40 to-transparent" />
        <AnimatePresence mode="popLayout">
          {days.map((day, index) => {
            const open = openId === day.id;
            return (
              <motion.article
                key={day.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: Math.min(index * 0.03, 0.2) }}
                className="relative"
              >
                <div className="absolute start-3.5 top-5 z-10 h-3 w-3 rounded-full border-2 border-accent bg-background shadow-[0_0_12px_rgba(255,42,95,0.55)]" />
                <div className="ms-10">
                  <button
                    type="button"
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
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted transition",
                            open && "rotate-180",
                          )}
                        />
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
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
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

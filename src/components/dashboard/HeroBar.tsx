"use client";

import { useState } from "react";
import { CalendarRange, Pencil } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { tripMeta } from "@/data/trip";
import { useFamilyStore } from "@/store/family";
import { usePersonalTrip } from "@/hooks/usePersonalTrip";
import {
  heroCascadeDelay,
  softEntranceProps,
  softInteractiveProps,
  softStagger,
  softTapProps,
  useSoftEntrance,
} from "@/lib/motion";
import {
  formatTripRangeHe,
  useTripMetaStore,
} from "@/store/tripMeta";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TripSetupWizard } from "@/components/auth/TripSetupWizard";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { Countdown } from "./Countdown";
import { CurrencyConverter } from "./CurrencyConverter";
import { FamilyCounter } from "./FamilyCounter";
import { WeatherWidget } from "./WeatherWidget";

export function HeroBar() {
  const family = useFamilyStore((s) => s.family);
  const setFamily = useFamilyStore((s) => s.setFamily);
  const startDate = useTripMetaStore((s) => s.startDate);
  const endDate = useTripMetaStore((s) => s.endDate);
  const setDates = useTripMetaStore((s) => s.setDates);
  const isPersonal = usePersonalTrip();
  const [editOpen, setEditOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const sectionEntrance = useSoftEntrance({ y: 10 });
  const chipMotion = softInteractiveProps(reduceMotion);
  const tapMotion = softTapProps(reduceMotion);

  return (
    <motion.section
      {...sectionEntrance}
      className="space-y-4 sm:space-y-5"
    >
      {!isPersonal && (
        <motion.div
          {...softEntranceProps(reduceMotion, {
            delay: heroCascadeDelay(0),
            y: 8,
          })}
          className="rounded-full border border-yellow/40 bg-yellow-soft px-3.5 py-2.5 text-sm text-foreground"
        >
          זהו <strong>פרויקט דוגמה</strong> עם נתונים מוכנים. כשתירשמו עם Google —
          המסלול האישי שלכם יתחיל <strong>ריק</strong> ותמלאו בעצמכם.
        </motion.div>
      )}

      <GlassCard strong className="autumn-wash overflow-x-clip overflow-y-visible">
        <div className="relative overflow-visible">
          <div className="pointer-events-none absolute -end-8 -top-10 h-36 w-36 rounded-full bg-yellow/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -start-6 h-32 w-32 rounded-full bg-yellow/15 blur-3xl" />
          <div className="pointer-events-none absolute start-1/2 top-0 h-28 w-28 -translate-x-1/2 rounded-full bg-yellow/20 blur-3xl" />

          {/* Title; then countdown stretches to edit/meta on md+ */}
          <div className="relative flex min-w-0 flex-col gap-4 overflow-visible">
            <div className="min-w-0">
              <motion.div
                {...softEntranceProps(reduceMotion, {
                  delay: heroCascadeDelay(1),
                  y: 12,
                })}
              >
                <p className="font-[family-name:var(--font-quicksand)] text-sm font-extrabold tracking-tight text-foreground sm:text-base">
                  {tripMeta.name}
                </p>
                <h1 className="fluid-title mt-1.5 font-[family-name:var(--font-quicksand)] font-bold tracking-tight text-foreground/90">
                  {tripMeta.titleHe}
                </h1>
              </motion.div>
            </div>

            <motion.div
              {...softEntranceProps(reduceMotion, {
                delay: heroCascadeDelay(2),
                y: 10,
              })}
              className="flex min-w-0 flex-col gap-3 md:flex-row md:items-stretch md:gap-3"
            >
              {/*
                Mobile: countdown on top (order-1), meta chips below (order-2).
                md+ RTL row: meta first at inline-start (order-1), countdown flex-1 fills toward it.
              */}
              <div
                className="order-2 flex w-full shrink-0 flex-wrap items-center gap-2 md:order-1 md:w-[12.5rem] md:flex-col md:items-stretch md:justify-center lg:w-[13.5rem]"
                role="group"
                aria-label="פרטי הטיול"
              >
                <motion.button
                  type="button"
                  {...chipMotion}
                  onClick={() => setCalOpen((v) => !v)}
                  aria-expanded={calOpen}
                  aria-controls="trip-date-calendar"
                  className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-border bg-surface-strong px-3.5 py-2 text-xs font-bold text-foreground shadow-[var(--card-shadow)] transition hover:border-yellow/50 hover:shadow-[var(--card-shadow-hover)] md:w-full md:justify-center"
                >
                  <CalendarRange
                    className="h-3.5 w-3.5 shrink-0 text-foreground"
                    aria-hidden
                  />
                  <span className="min-w-0 truncate">
                    {formatTripRangeHe(startDate, endDate)}
                  </span>
                </motion.button>

                <StatusBadge
                  tone={isPersonal ? "booked" : "pending"}
                  label={isPersonal ? "חשבון אישי" : "מצב דמו"}
                  className="min-h-11 px-3 py-2 md:w-full md:justify-center"
                />

                <motion.button
                  type="button"
                  {...tapMotion}
                  onClick={() => setEditOpen(true)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-surface-strong/80 px-3.5 py-2 text-xs font-semibold text-muted transition hover:border-foreground/25 hover:text-foreground md:w-full md:justify-center"
                >
                  <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>עריכה</span>
                </motion.button>
              </div>

              <div className="order-1 flex min-w-0 w-full flex-1 overflow-visible md:order-2 md:self-stretch">
                <Countdown />
              </div>
            </motion.div>

            {calOpen && (
              <div
                id="trip-date-calendar"
                className="w-full max-w-md min-w-0"
              >
                <DateRangeCalendar
                  startDate={startDate}
                  endDate={endDate}
                  onChange={setDates}
                />
              </div>
            )}

            <motion.div
              {...softEntranceProps(reduceMotion, {
                delay: heroCascadeDelay(3),
                y: 8,
              })}
            >
              <p className="max-w-xl text-sm leading-6 text-muted">
                לוח בקרה לתכנון משפחתי: מסלול, תחבורה, תקציב ולוגיסטיקה ליפן —
                הכל במקום אחד.
              </p>
              <p className="mt-1.5 text-xs font-semibold text-muted">
                {tripMeta.destination}
              </p>
            </motion.div>
          </div>
        </div>
      </GlassCard>

      {/* md+: 3 equal-height columns; mobile: single stack */}
      <div className="dashboard-widget-grid">
        <motion.div
          {...softEntranceProps(reduceMotion, {
            delay: heroCascadeDelay(4, 0.12, 0.07),
            y: 10,
          })}
          className="min-h-0 h-full"
        >
          <GlassCard interactive className="flex h-full flex-col">
            <FamilyCounter value={family} onChange={setFamily} />
          </GlassCard>
        </motion.div>
        <motion.div
          {...softEntranceProps(reduceMotion, {
            delay: softStagger(1, 0.07, 0.5) + heroCascadeDelay(4, 0.12, 0.07),
            y: 10,
          })}
          className="min-h-0 h-full"
        >
          <GlassCard interactive className="flex h-full flex-col">
            <CurrencyConverter />
          </GlassCard>
        </motion.div>
        <motion.div
          {...softEntranceProps(reduceMotion, {
            delay: softStagger(2, 0.07, 0.5) + heroCascadeDelay(4, 0.12, 0.07),
            y: 10,
          })}
          className="min-h-0 h-full"
        >
          <GlassCard interactive className="flex h-full flex-col">
            <WeatherWidget />
          </GlassCard>
        </motion.div>
      </div>

      <TripSetupWizard
        open={editOpen}
        allowSkip
        onClose={() => setEditOpen(false)}
        onFinished={() => setEditOpen(false)}
        title="עריכת תאריכים והרכב משפחה"
      />
    </motion.section>
  );
}

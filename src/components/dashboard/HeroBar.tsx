"use client";

import { useState } from "react";
import { CalendarRange, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { tripMeta } from "@/data/trip";
import { useFamilyStore } from "@/store/family";
import { usePersonalTrip } from "@/hooks/usePersonalTrip";
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-4"
    >
      {!isPersonal && (
        <div className="rounded-2xl border border-amber/35 bg-amber-soft px-3.5 py-2.5 text-sm text-wood">
          זהו <strong>פרויקט דוגמה</strong> עם נתונים מוכנים. כשתירשמו עם Google —
          המסלול האישי שלכם יתחיל <strong>ריק</strong> ותמלאו בעצמכם.
        </div>
      )}

      <GlassCard strong className="overflow-hidden">
        <div className="relative">
          <div className="pointer-events-none absolute -end-10 -top-12 h-28 w-28 rounded-full bg-olive/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-14 -start-8 h-32 w-32 rounded-full bg-sky/14 blur-3xl" />
          <div className="pointer-events-none absolute start-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full bg-amber/10 blur-3xl" />

          {/* dir=ltr: countdown visual-left, title/meta visual-right */}
          <div
            className="relative flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4"
            dir="ltr"
          >
            <div className="w-full shrink-0 sm:w-[12.5rem] sm:self-stretch lg:w-[14rem]">
              <Countdown />
            </div>

            <div className="min-w-0 flex-1" dir="rtl">
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted hover:border-olive/40 hover:text-foreground"
                >
                  <Pencil className="h-3 w-3" />
                  שינוי תאריכים / משפחה
                </button>
                <StatusBadge
                  tone={isPersonal ? "booked" : "pending"}
                  label={isPersonal ? "חשבון אישי" : "מצב דמו"}
                />
                <button
                  type="button"
                  onClick={() => setCalOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-parchment-deep/70 px-3 py-1 text-xs font-semibold text-foreground hover:border-olive/45 hover:bg-parchment-deep"
                >
                  <CalendarRange className="h-3.5 w-3.5 text-olive" />
                  {formatTripRangeHe(startDate, endDate)}
                </button>
              </div>

              {calOpen && (
                <div className="ms-auto mt-3 max-w-md">
                  <DateRangeCalendar
                    startDate={startDate}
                    endDate={endDate}
                    onChange={setDates}
                  />
                </div>
              )}

              <div className="mt-2.5 text-right">
                <p className="font-[family-name:var(--font-quicksand)] text-xs font-semibold uppercase tracking-[0.16em] text-olive">
                  {tripMeta.name}
                </p>
                <h1 className="mt-1 font-[family-name:var(--font-quicksand)] text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                  {tripMeta.titleHe}
                </h1>
                <p className="mt-2 ms-auto max-w-xl text-sm leading-6 text-muted">
                  לוח בקרה חמים לתכנון משפחתי: מסלול, תחבורה, תקציב ולוגיסטיקה
                  ליפן — באווירת סטודיו ג׳יבלי.
                </p>
                <p className="mt-1.5 text-xs text-muted">{tripMeta.destination}</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="dashboard-widget-grid">
        <GlassCard interactive className="flex h-full flex-col">
          <FamilyCounter value={family} onChange={setFamily} />
        </GlassCard>
        <GlassCard interactive className="flex h-full flex-col">
          <CurrencyConverter />
        </GlassCard>
        <GlassCard interactive className="flex h-full flex-col">
          <WeatherWidget />
        </GlassCard>
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

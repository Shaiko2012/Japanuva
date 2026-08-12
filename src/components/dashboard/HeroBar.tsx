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
            className="relative flex min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4"
            dir="ltr"
          >
            <div className="w-full min-w-0 shrink-0 sm:w-[min(100%,12.5rem)] sm:self-stretch lg:w-[14rem]">
              <Countdown />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden" dir="rtl">
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border px-3 py-2 text-[11px] font-medium text-muted hover:border-olive/40 hover:text-foreground sm:min-h-0 sm:py-1"
                >
                  <Pencil className="h-3 w-3 shrink-0" />
                  <span className="max-w-[11rem] truncate sm:max-w-none">
                    שינוי תאריכים / משפחה
                  </span>
                </button>
                <StatusBadge
                  tone={isPersonal ? "booked" : "pending"}
                  label={isPersonal ? "חשבון אישי" : "מצב דמו"}
                />
                <button
                  type="button"
                  onClick={() => setCalOpen((v) => !v)}
                  className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-border bg-parchment-deep/70 px-3 py-2 text-xs font-semibold text-foreground hover:border-olive/45 hover:bg-parchment-deep sm:min-h-0 sm:py-1"
                >
                  <CalendarRange className="h-3.5 w-3.5 shrink-0 text-olive" />
                  <span className="min-w-0 truncate">
                    {formatTripRangeHe(startDate, endDate)}
                  </span>
                </button>
              </div>

              {calOpen && (
                <div className="ms-auto mt-3 w-full max-w-md min-w-0">
                  <DateRangeCalendar
                    startDate={startDate}
                    endDate={endDate}
                    onChange={setDates}
                  />
                </div>
              )}

              <div className="mt-2.5 min-w-0 text-right">
                <p className="font-[family-name:var(--font-quicksand)] text-xs font-semibold uppercase tracking-[0.16em] text-olive">
                  {tripMeta.name}
                </p>
                <h1 className="fluid-title mt-1 font-[family-name:var(--font-quicksand)] font-bold tracking-tight text-foreground">
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

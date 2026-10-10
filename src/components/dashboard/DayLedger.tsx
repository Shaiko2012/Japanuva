"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { cityLabel, TIME_SLOT_LABELS, type EditorDay } from "@/types/editor";
import { dayCost, formatDayHe } from "@/lib/tripSummary";
import { formatNumber } from "@/lib/utils";
import { SectionHead } from "@/components/ui/PageHeader";
import { HotelStatusLabel } from "@/components/ui/StatusLabel";
import { motion, useReducedMotion } from "framer-motion";
import { softEase } from "@/lib/motion";

function dayTitle(day: EditorDay) {
  return day.activities[0]?.title || `יום ב${cityLabel(day)}`;
}

export function DayLedger({
  days,
  isDemo,
  isEmpty,
}: {
  days: EditorDay[];
  isDemo: boolean;
  isEmpty: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="days-title" className="max-w-5xl">
      <SectionHead
        id="days-title"
        title="המסלול, יום אחר יום"
        meta={
          !isDemo && (
            <Link href="/itinerary" className="link-nav">
              עריכת המסלול
              <ArrowLeft aria-hidden />
            </Link>
          )
        }
      />

      {isEmpty || days.length === 0 ? (
        <div className="max-w-xl py-4">
          <p className="t-h3">המסלול עדיין ריק</p>
          <p className="mt-2 leading-7 text-ink-soft">
            התחילו מהיום הראשון: הוסיפו את המלון ואת מה שתרצו לראות. כל יום
            שתמלאו יופיע כאן, יחד עם הלינה והעלות המשוערת.
          </p>
          <Link href="/itinerary" className="btn btn-primary mt-5">
            בניית היום הראשון
          </Link>
        </div>
      ) : (
        <ol className="border-b border-rule">
          {days.map((day, index) => {
            const cost = dayCost(day);
            const hasHotel = Boolean(day.hotel.name.trim());
            return (
              <motion.li
                key={day.id}
                className="border-t border-rule first:border-t-0"
                initial={reduce ? false : { opacity: 0, x: 12 }}
                whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, ease: softEase, delay: Math.min(index * 0.05, 0.35) }}
              >
                <details className="group">
                  <summary className="grid cursor-pointer list-none grid-cols-[4.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-4 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] [&::-webkit-details-marker]:hidden">
                    <span className="flex flex-col">
                      <span className="t-num text-2xl leading-none">{index + 1}</span>
                      <span className="t-meta mt-1">
                        {formatDayHe(day.date, { weekday: "short", day: "numeric", month: "short" })}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="t-h3 block truncate">{dayTitle(day)}</span>
                      <span className="t-meta mt-0.5 block">
                        {cityLabel(day)}
                        {day.activities.length > 0 &&
                          ` · ${day.activities.length} ${day.activities.length === 1 ? "פעילות" : "פעילויות"}`}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <HotelStatusLabel
                        status={day.hotel.status}
                        hasHotel={hasHotel || index === days.length - 1}
                        className="hidden sm:inline-flex"
                      />
                      <ChevronDown
                        className="h-4 w-4 text-muted transition-transform group-open:rotate-180"
                        aria-hidden
                      />
                    </span>
                  </summary>

                  <div className="grid gap-6 pb-6 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-x-4">
                    <div className="hidden sm:block" />
                    <div className="space-y-4">
                      {day.activities.length > 0 ? (
                        <ul className="space-y-2">
                          {day.activities.map((activity) => (
                            <li key={activity.id} className="flex gap-3 text-[0.9375rem]">
                              <span className="w-14 shrink-0 text-muted">
                                {TIME_SLOT_LABELS[activity.timeSlot]}
                              </span>
                              <span className="min-w-0">{activity.title}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted">אין פעילויות ליום הזה.</p>
                      )}
                      <dl className="flex flex-wrap gap-x-6 gap-y-1 border-t border-rule pt-3 text-sm">
                        <div className="flex gap-2">
                          <dt className="text-muted">לינה</dt>
                          <dd>{hasHotel ? day.hotel.name : "לא הוגדרה"}</dd>
                        </div>
                        {cost.total > 0 && (
                          <div className="flex gap-2">
                            <dt className="text-muted">עלות משוערת</dt>
                            <dd className="tabular">¥{formatNumber(cost.total)}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </details>
              </motion.li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

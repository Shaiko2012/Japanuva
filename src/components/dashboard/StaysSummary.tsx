"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { EditorDay } from "@/types/editor";
import { formatDayHe, groupStays, nightsWithoutLodging } from "@/lib/tripSummary";
import { formatNumber } from "@/lib/utils";
import { SectionHead } from "@/components/ui/PageHeader";
import { HotelStatusLabel } from "@/components/ui/StatusLabel";

const short = (d: string) => formatDayHe(d, { day: "numeric", month: "short" });

export function StaysSummary({ days, isDemo }: { days: EditorDay[]; isDemo: boolean }) {
  const stays = groupStays(days);
  const missing = nightsWithoutLodging(days);
  const nights = stays.reduce((n, s) => n + s.nights, 0);

  return (
    <section aria-labelledby="stays-title">
      <SectionHead
        as="h3"
        id="stays-title"
        title="לינה"
        meta={
          stays.length > 0 &&
          `${stays.length} ${stays.length === 1 ? "מקום" : "מקומות"} · ${nights} לילות`
        }
      />

      {stays.length === 0 ? (
        <div>
          <p className="leading-7 text-ink-soft">
            עוד לא נוספה לינה. כל יום במסלול מקבל את המלון של אותו לילה.
          </p>
          <Link href="/itinerary" className="link-nav mt-3 inline-flex">
            הוספת לינה במסלול
            <ArrowLeft aria-hidden />
          </Link>
        </div>
      ) : (
        <ul className="border-b border-rule">
          {stays.map((stay) => (
            <li
              key={`${stay.name}-${stay.fromDate}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1 border-t border-rule py-4 first:border-t-0"
            >
              <div className="min-w-0">
                <p className="t-h3 truncate" dir="auto">
                  {stay.name}
                </p>
                <p className="t-meta mt-0.5">
                  {stay.fromDate === stay.toDate
                    ? short(stay.fromDate)
                    : `${short(stay.fromDate)} - ${short(stay.toDate)}`}
                  {" · "}
                  {stay.nights} {stay.nights === 1 ? "לילה" : "לילות"}
                  {stay.costPerNightJpy > 0 &&
                    ` · ¥${formatNumber(stay.costPerNightJpy)} ללילה`}
                </p>
              </div>
              <div className="self-center">
                <HotelStatusLabel status={stay.status} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {missing.length > 0 && stays.length > 0 && !isDemo && (
        <p className="note mt-5 text-[0.9375rem] leading-7">
          ל־{missing.length} {missing.length === 1 ? "לילה" : "לילות"} עדיין אין
          לינה ({missing.map((d) => short(d.date)).join(", ")}).{" "}
          <Link href="/itinerary" className="link-inline font-semibold">
            השלמה במסלול
          </Link>
        </p>
      )}
    </section>
  );
}

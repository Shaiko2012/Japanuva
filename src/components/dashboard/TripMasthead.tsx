"use client";

import { useState } from "react";
import { tripMeta } from "@/data/trip";
import { useFamilyStore } from "@/store/family";
import {
  formatTripRangeHe,
  tripLengthDays,
  useTripMetaStore,
} from "@/store/tripMeta";
import { cityRoute } from "@/lib/tripSummary";
import type { EditorDay } from "@/types/editor";
import { TripSetupWizard } from "@/components/auth/TripSetupWizard";
import { Countdown } from "./Countdown";
import { RiseIn } from "@/components/ui/Motion";

export function TripMasthead({
  days,
  isDemo,
}: {
  days: EditorDay[];
  isDemo: boolean;
}) {
  const family = useFamilyStore((s) => s.family);
  const startDate = useTripMetaStore((s) => s.startDate);
  const endDate = useTripMetaStore((s) => s.endDate);
  const [editOpen, setEditOpen] = useState(false);

  const route = cityRoute(days);
  const length = tripLengthDays(startDate, endDate);

  return (
    <header className="pt-8 sm:pt-14">
      <RiseIn delay={0.02}>
        <p className="t-kicker">{isDemo ? "טיול לדוגמה" : "יומן הטיול"}</p>
      </RiseIn>

      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <RiseIn delay={0.08} y={22}>
            <h1 className="t-display max-w-[14ch]">{tripMeta.titleHe}</h1>
          </RiseIn>
          <RiseIn delay={0.16}>
            <p className="t-lede mt-5">
              {route.length > 1 ? route.join(" · ") : tripMeta.destination}
            </p>
          </RiseIn>
        </div>
        <RiseIn delay={0.12} y={10}>
          <Countdown />
        </RiseIn>
      </div>

      <RiseIn delay={0.22}>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-y border-rule py-3">
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-[0.9375rem]">
          <div className="flex gap-2">
            <dt className="text-muted">תאריכים</dt>
            <dd className="font-semibold">{formatTripRangeHe(startDate, endDate)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">משך</dt>
            <dd className="font-semibold tabular">{length} ימים</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">נוסעים</dt>
            <dd className="font-semibold">
              {family.adults} מבוגרים
              {family.kids > 0 ? ` · ${family.kids} ילדים` : ""}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="btn btn-secondary btn-sm"
        >
          עריכת תאריכים ונוסעים
        </button>
      </div>
      </RiseIn>

      {isDemo && (
        <p className="note mt-6 max-w-3xl text-[0.9375rem] leading-7">
          אתם צופים בטיול לדוגמה. אחרי הגדרת הטיול או התחברות, המסלול האישי
          שלכם מתחיל ריק ונבנה רק ממה שתזינו.
        </p>
      )}

      <TripSetupWizard
        open={editOpen}
        allowSkip
        onClose={() => setEditOpen(false)}
        onFinished={() => setEditOpen(false)}
        title="תאריכים ונוסעים"
      />
    </header>
  );
}

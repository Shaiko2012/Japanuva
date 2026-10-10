"use client";

import { useState } from "react";
import {
  selectSelectedDay,
  useItineraryEditor,
} from "@/store/itineraryEditor";
import { CITY_LABELS, CITY_OPTIONS, type EditorCity } from "@/types/editor";
import { dayCost, formatDayHe } from "@/lib/tripSummary";
import { formatNumber, cn } from "@/lib/utils";
import { DateField } from "@/components/ui/DateField";
import { KeypadField } from "@/components/ui/KeypadField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DayStrip } from "./DayStrip";
import { AccommodationManager } from "./AccommodationManager";
import { ActivitiesBuilder } from "./ActivitiesBuilder";
import { ItineraryActions } from "./ItineraryActions";

function DayHeader() {
  const days = useItineraryEditor((s) => s.days);
  const day = useItineraryEditor(selectSelectedDay);
  const updateDayCity = useItineraryEditor((s) => s.updateDayCity);
  const updateDayCityCustom = useItineraryEditor((s) => s.updateDayCityCustom);
  const updateDayDate = useItineraryEditor((s) => s.updateDayDate);
  const removeDay = useItineraryEditor((s) => s.removeDay);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!day) return null;
  const index = days.findIndex((d) => d.id === day.id);
  const canRemove = days.length > 1;
  const contentCount = day.activities.length + (day.hotel.name.trim() ? 1 : 0);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="t-h2">
          יום {index + 1}
          <span className="ms-3 font-sans text-base font-normal text-ink-soft">
            {formatDayHe(day.date, { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </h2>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={!canRemove}
          title={canRemove ? undefined : "במסלול חייב להישאר לפחות יום אחד"}
          className="btn btn-tertiary btn-sm text-danger"
        >
          מחיקת היום
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <DateField
          label="תאריך"
          value={day.date}
          onChange={(date) => updateDayDate(day.id, date)}
        />
        <div>
          <label className="field-label" htmlFor="day-city">
            עיר
          </label>
          <select
            id="day-city"
            className="field"
            value={CITY_LABELS[day.city] ? day.city : "Other"}
            onChange={(e) => updateDayCity(day.id, e.target.value as EditorCity)}
          >
            {CITY_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {CITY_LABELS[key]}
              </option>
            ))}
          </select>
          {day.city === "Other" && (
            <input
              id="day-city-custom"
              className="field mt-2"
              value={day.cityCustom ?? ""}
              onChange={(e) => updateDayCityCustom(day.id, e.target.value)}
              placeholder="שם העיר"
              autoComplete="off"
              autoFocus
              aria-label="שם העיר"
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`למחוק את יום ${index + 1}?`}
        description={
          contentCount > 0
            ? `היום הזה כולל ${day.activities.length} פעילויות${day.hotel.name.trim() ? " ולינה" : ""}. כל הפרטים יימחקו ואי אפשר לבטל.`
            : "היום ריק. הוא יוסר מהמסלול."
        }
        confirmLabel="מחיקת היום"
        onConfirm={() => removeDay(day.id)}
      />
    </div>
  );
}

function DayBudget() {
  const day = useItineraryEditor(selectSelectedDay);
  const updateFoodEstimate = useItineraryEditor((s) => s.updateFoodEstimate);
  if (!day) return null;
  const cost = dayCost(day);

  return (
    <section aria-labelledby="day-budget-title" className="border-t-2 border-rule-strong pt-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="day-budget-title" className="t-label">
          עלות משוערת ליום
        </h3>
        <p className="t-num text-xl">¥{formatNumber(cost.total)}</p>
      </div>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_9rem] items-end gap-4">
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">לינה</dt>
            <dd className="tabular">¥{formatNumber(cost.lodging)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">פעילויות</dt>
            <dd className="tabular">¥{formatNumber(cost.activities)}</dd>
          </div>
        </dl>
        <KeypadField
          mode="number"
          label="אוכל (¥)"
          value={day.foodEstimateJpy}
          min={0}
          onChange={(value) => updateFoodEstimate(day.id, Math.max(0, value || 0))}
        />
      </div>
    </section>
  );
}

export function ItineraryEditorPanel({ className }: { className?: string }) {
  const days = useItineraryEditor((s) => s.days);
  const day = useItineraryEditor(selectSelectedDay);

  if (!day) return null;

  return (
    <div className={cn("flex flex-col bg-paper", className)}>
      <div className="shrink-0 border-b border-rule px-4 pb-3 pt-5 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="t-h1 text-[1.9rem]">המסלול</h1>
          <span className="t-meta tabular">
            {days.length} {days.length === 1 ? "יום" : "ימים"}
          </span>
        </div>
        <div className="mt-1">
          <ItineraryActions />
        </div>
        <div className="mt-3">
          <DayStrip />
        </div>
      </div>

      <div
        className="space-y-8 px-4 py-6 max-md:overflow-visible sm:px-6 md:min-h-0 md:flex-1 md:overflow-y-auto"
        data-lenis-prevent
      >
        <DayHeader />
        <AccommodationManager />
        <ActivitiesBuilder />
        <DayBudget />
      </div>
    </div>
  );
}

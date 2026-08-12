"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Users } from "lucide-react";
import { GlassModal } from "@/components/editor/GlassModal";
import { FamilyCounter } from "@/components/dashboard/FamilyCounter";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { useFamilyStore } from "@/store/family";
import { useItineraryEditor } from "@/store/itineraryEditor";
import {
  formatTripRangeHe,
  useTripMetaStore,
} from "@/store/tripMeta";

interface TripSetupWizardProps {
  open: boolean;
  onClose?: () => void;
  onFinished: () => void;
  /** If true, user can dismiss without completing (edit mode). */
  allowSkip?: boolean;
  title?: string;
}

export function TripSetupWizard({
  open,
  onClose,
  onFinished,
  allowSkip = false,
  title = "לפני שמתחילים · פרטי הטיול",
}: TripSetupWizardProps) {
  const family = useFamilyStore((s) => s.family);
  const setFamily = useFamilyStore((s) => s.setFamily);
  const startDate = useTripMetaStore((s) => s.startDate);
  const endDate = useTripMetaStore((s) => s.endDate);
  const setDates = useTripMetaStore((s) => s.setDates);
  const completeOnboarding = useTripMetaStore((s) => s.completeOnboarding);

  const [step, setStep] = useState<1 | 2>(1);
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setDraftStart(startDate);
    setDraftEnd(endDate);
  }, [open, startDate, endDate]);

  const datesValid = Boolean(draftStart && draftEnd && draftEnd >= draftStart);

  function saveDatesAndNext() {
    if (!datesValid) return;
    setDates(draftStart, draftEnd);
    setStep(2);
  }

  function finish() {
    setDates(draftStart, draftEnd);
    completeOnboarding();
    if (!allowSkip) {
      useItineraryEditor.getState().resetToEmpty(draftStart);
      useTripMetaStore.getState().markPersonalAccount();
    }
    onFinished();
  }

  return (
    <GlassModal
      open={open}
      onClose={() => {
        if (allowSkip) onClose?.();
      }}
      title={title}
      wide
    >
      <div className="mb-4 flex gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] ${
            step === 1
              ? "bg-accent-soft text-accent"
              : "bg-foreground/5 text-muted"
          }`}
        >
          1 · תאריכים
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] ${
            step === 2
              ? "bg-accent-soft text-accent"
              : "bg-foreground/5 text-muted"
          }`}
        >
          2 · משפחה
        </span>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="flex items-start gap-2 text-sm text-muted">
            <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <p>
              לחצו על יום בלוח השנה לבחירת יציאה וחזרה. אפשר לשנות גם אחר כך.
            </p>
          </div>

          <DateRangeCalendar
            startDate={draftStart}
            endDate={draftEnd}
            onChange={(start, end) => {
              setDraftStart(start);
              setDraftEnd(end);
            }}
          />

          {datesValid && (
            <p className="rounded-xl border border-border bg-background/35 px-3 py-2 text-xs text-muted">
              טווח נבחר:{" "}
              <span className="font-medium text-foreground">
                {formatTripRangeHe(draftStart, draftEnd)}
              </span>
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            {allowSkip && (
              <button
                type="button"
                onClick={() => onClose?.()}
                className="rounded-xl border border-border px-4 py-2 text-sm"
              >
                ביטול
              </button>
            )}
            <button
              type="button"
              disabled={!datesValid}
              onClick={saveDatesAndNext}
              className="rounded-xl bg-nav-bg px-4 py-2 text-sm font-medium text-nav-fg glow-accent disabled:opacity-40"
            >
              המשך להרכב המשפחה
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-2 text-sm text-muted">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <p>
              כמה מבוגרים וילדים בטיול? זה ישפיע על מחשבונים ושמירה בענן.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/35 p-3">
            <FamilyCounter value={family} onChange={setFamily} />
          </div>

          <div className="flex flex-wrap justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-border px-4 py-2 text-sm"
            >
              חזרה
            </button>
            <button
              type="button"
              onClick={finish}
              className="rounded-xl bg-nav-bg px-4 py-2 text-sm font-medium text-nav-fg glow-accent"
            >
              שמירה והמשך
            </button>
          </div>
        </div>
      )}
    </GlassModal>
  );
}

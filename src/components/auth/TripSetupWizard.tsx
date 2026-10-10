"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { FamilyCounter } from "@/components/dashboard/FamilyCounter";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { useFamilyStore } from "@/store/family";
import { useItineraryEditor } from "@/store/itineraryEditor";
import { formatTripRangeHe, tripLengthDays, useTripMetaStore } from "@/store/tripMeta";
import { cn } from "@/lib/utils";

interface TripSetupWizardProps {
  open: boolean;
  onClose?: () => void;
  onFinished: () => void;
  /** If true, user can dismiss without completing (edit mode). */
  allowSkip?: boolean;
  title?: string;
}

const STEPS = ["תאריכים", "נוסעים"] as const;

export function TripSetupWizard({
  open,
  onClose,
  onFinished,
  allowSkip = false,
  title = "לפני שמתחילים: פרטי הטיול",
}: TripSetupWizardProps) {
  const family = useFamilyStore((s) => s.family);
  const setFamily = useFamilyStore((s) => s.setFamily);
  const startDate = useTripMetaStore((s) => s.startDate);
  const endDate = useTripMetaStore((s) => s.endDate);
  const setDates = useTripMetaStore((s) => s.setDates);
  const completeOnboarding = useTripMetaStore((s) => s.completeOnboarding);

  const [step, setStep] = useState<0 | 1>(0);
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep(0);
      setDraftStart(startDate);
      setDraftEnd(endDate);
    }
  }

  const datesValid = Boolean(draftStart && draftEnd && draftEnd >= draftStart);

  function saveDatesAndNext() {
    if (!datesValid) return;
    setDates(draftStart, draftEnd);
    setStep(1);
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

  const footer =
    step === 0 ? (
      <>
        {allowSkip && (
          <button type="button" onClick={() => onClose?.()} className="btn btn-tertiary">
            ביטול
          </button>
        )}
        <button
          type="button"
          disabled={!datesValid}
          onClick={saveDatesAndNext}
          className="btn btn-primary"
        >
          המשך לנוסעים
        </button>
      </>
    ) : (
      <>
        <button type="button" onClick={() => setStep(0)} className="btn btn-secondary">
          חזרה לתאריכים
        </button>
        <button type="button" onClick={finish} className="btn btn-primary">
          {allowSkip ? "שמירה" : "התחלת התכנון"}
        </button>
      </>
    );

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (allowSkip) onClose?.();
      }}
      dismissible={allowSkip}
      title={title}
      wide
      footer={footer}
    >
      <ol className="mb-6 grid grid-cols-2 border-b border-rule" aria-label="שלבים">
        {STEPS.map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? "step" : undefined}
            className={cn(
              "relative pb-2.5 text-sm font-semibold",
              step === index ? "text-ink" : "text-muted",
            )}
          >
            <span className="t-num me-2">{index + 1}</span>
            {label}
            {step === index && (
              <span className="absolute inset-x-0 -bottom-px h-[2px] bg-vermilion" aria-hidden />
            )}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-ink-soft">
            בחרו בלוח את יום היציאה ואת יום החזרה. אפשר לשנות אחר כך מעמוד הסקירה.
          </p>
          <DateRangeCalendar
            startDate={draftStart}
            endDate={draftEnd}
            onChange={(start, end) => {
              setDraftStart(start);
              setDraftEnd(end);
            }}
          />
          {datesValid && (
            <p className="text-sm text-ink-soft">
              <span className="font-semibold text-ink">
                {formatTripRangeHe(draftStart, draftEnd)}
              </span>{" "}
              · {tripLengthDays(draftStart, draftEnd)} ימים
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-ink-soft">
            מספר הנוסעים משמש במחשבוני JR Pass ובאומדני העלות.
          </p>
          <FamilyCounter value={family} onChange={setFamily} />
        </div>
      )}
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useItineraryEditor } from "@/store/itineraryEditor";
import { useTripMetaStore } from "@/store/tripMeta";
import { useMapPip } from "@/store/mapPip";
import { useAuth } from "@/components/providers/AuthProvider";
import { saveItineraryToCloud } from "@/lib/cloudItinerary";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

function timeLabel(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

/** Save state (changes persist automatically) and the destructive reset. */
export function ItineraryActions() {
  const dirty = useItineraryEditor((s) => s.dirty);
  const lastSavedAt = useItineraryEditor((s) => s.lastSavedAt);
  const resetToEmpty = useItineraryEditor((s) => s.resetToEmpty);
  const saveChanges = useItineraryEditor((s) => s.saveChanges);
  const startDate = useTripMetaStore((s) => s.startDate);
  const markPersonalAccount = useTripMetaStore((s) => s.markPersonalAccount);
  const { user, configured } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cloud = configured && Boolean(user);
  const saved = timeLabel(lastSavedAt);
  const status = cloud
    ? dirty
      ? "שומר בענן…"
      : saved
        ? `נשמר בענן · ${saved}`
        : "מסונכרן לענן"
    : "נשמר במכשיר הזה";

  async function handleReset() {
    setError(null);
    resetToEmpty(startDate);
    markPersonalAccount();
    useMapPip.getState().setActivePinId(null);
    if (cloud && user) {
      try {
        const state = useItineraryEditor.getState();
        await saveItineraryToCloud(user.uid, {
          days: state.days,
          selectedDayId: state.selectedDayId,
          lastSavedAt: new Date().toISOString(),
        });
        saveChanges();
      } catch {
        setError("המסלול אופס במכשיר, אבל השמירה בענן נכשלה. ננסה שוב בשינוי הבא.");
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="t-meta" aria-live="polite">
        {status}
      </span>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="btn btn-tertiary btn-sm text-danger"
      >
        איפוס המסלול
      </button>
      {error && (
        <p role="alert" className="w-full text-sm text-danger">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="לאפס את כל המסלול?"
        description="כל הימים, המלונות והפעילויות יימחקו, ויישאר יום ריק אחד. אי אפשר לבטל את הפעולה."
        confirmLabel="מחיקת המסלול"
        onConfirm={handleReset}
      />
    </div>
  );
}

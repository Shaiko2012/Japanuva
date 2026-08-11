"use client";

import { useState } from "react";
import { Check, Cloud, RotateCcw, Save } from "lucide-react";
import { useItineraryEditor } from "@/store/itineraryEditor";
import { useTripMetaStore } from "@/store/tripMeta";
import { useMapPip } from "@/store/mapPip";
import { useAuth } from "@/components/providers/AuthProvider";
import { saveItineraryToCloud } from "@/lib/cloudItinerary";
import { cn } from "@/lib/utils";

export function EditorToolbarActions({ compact }: { compact?: boolean }) {
  const dirty = useItineraryEditor((s) => s.dirty);
  const days = useItineraryEditor((s) => s.days);
  const selectedDayId = useItineraryEditor((s) => s.selectedDayId);
  const saveChanges = useItineraryEditor((s) => s.saveChanges);
  const resetToEmpty = useItineraryEditor((s) => s.resetToEmpty);
  const startDate = useTripMetaStore((s) => s.startDate);
  const markPersonalAccount = useTripMetaStore((s) => s.markPersonalAccount);
  const { user, configured } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (configured && user) {
        await saveItineraryToCloud(user.uid, {
          days,
          selectedDayId,
          lastSavedAt: new Date().toISOString(),
        });
        saveChanges();
        flash("נשמר בענן");
      } else {
        saveChanges();
        flash("נשמר");
      }
    } catch {
      saveChanges();
      flash("נשמר מקומית");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (
      !window.confirm(
        "לאפס את כל המסלול ליום ריק אחד? כל הימים והפעילויות יימחקו.",
      )
    ) {
      return;
    }
    resetToEmpty(startDate);
    markPersonalAccount();
    useMapPip.getState().setActivePinId(null);
    if (configured && user) {
      const state = useItineraryEditor.getState();
      await saveItineraryToCloud(user.uid, {
        days: state.days,
        selectedDayId: state.selectedDayId,
        lastSavedAt: new Date().toISOString(),
      });
      saveChanges();
    }
    flash("הטיול אופס");
  }

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      {dirty && (
        <span className="text-[11px] text-warning">שינויים לא שמורים</span>
      )}
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground hover:border-accent/40",
          compact && "ms-auto",
        )}
      >
        {user ? <Cloud className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
        {saving ? "שומר..." : "שמירה"}
      </button>
      <button
        type="button"
        onClick={() => void handleReset()}
        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted hover:text-warning"
        title="איפוס טיול"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {!compact && "איפוס"}
      </button>
      {toast && (
        <span className="absolute -bottom-6 end-0 flex items-center gap-1 text-[11px] text-success">
          <Check className="h-3 w-3" />
          {toast}
        </span>
      )}
    </div>
  );
}

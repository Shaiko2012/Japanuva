"use client";

import { useState } from "react";
import { Check, Cloud, FileDown, Link2, RotateCcw, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { softTransition } from "@/lib/motion";
import { useItineraryEditor } from "@/store/itineraryEditor";
import { useFamilyStore } from "@/store/family";
import { useMapPip } from "@/store/mapPip";
import { useTripMetaStore } from "@/store/tripMeta";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  saveItineraryToCloud,
  savePreferencesToCloud,
} from "@/lib/cloudItinerary";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function EditorToolbar() {
  const dirty = useItineraryEditor((s) => s.dirty);
  const lastSavedAt = useItineraryEditor((s) => s.lastSavedAt);
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
    window.setTimeout(() => setToast(null), 2200);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (configured && user) {
        const map = useMapPip.getState();
        const trip = useTripMetaStore.getState();
        await Promise.all([
          saveItineraryToCloud(user.uid, {
            days,
            selectedDayId,
            lastSavedAt: new Date().toISOString(),
          }),
          savePreferencesToCloud(user.uid, {
            family: useFamilyStore.getState().family,
            map: {
              open: map.open,
              size: map.size,
              place: map.place,
              selectedDistrict: map.selectedDistrict,
              activePinId: map.activePinId,
              showPinList: map.showPinList,
            },
            trip: {
              startDate: trip.startDate,
              endDate: trip.endDate,
            },
            budgetIls: trip.budgetIls,
            isPersonalAccount: trip.isPersonalAccount,
          }),
        ]);
        saveChanges();
        flash("נשמר בענן Google");
      } else {
        saveChanges();
        flash(
          configured
            ? "נשמר במכשיר · התחברו ל־Google לשמירה בענן"
            : "השינויים נשמרו במכשיר",
        );
      }
    } catch (err) {
      saveChanges();
      flash(err instanceof Error ? err.message : "שמירה בענן נכשלה — נשמר מקומית");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetTrip() {
    const ok = window.confirm(
      "לאפס את כל המסלול ליום ריק אחד? פעולה זו תמחק את כל הימים, המלונות והאטרקציות.",
    );
    if (!ok) return;

    resetToEmpty(startDate);
    markPersonalAccount();
    useMapPip.getState().setActivePinId(null);

    if (configured && user) {
      setSaving(true);
      try {
        const state = useItineraryEditor.getState();
        await saveItineraryToCloud(user.uid, {
          days: state.days,
          selectedDayId: state.selectedDayId,
          lastSavedAt: new Date().toISOString(),
        });
        saveChanges();
        flash("הטיול אופס · נשמר בענן");
      } catch (err) {
        flash(err instanceof Error ? err.message : "איפוס מקומי — שמירה בענן נכשלה");
      } finally {
        setSaving(false);
      }
    } else {
      flash("הטיול אופס · התחילו למלא מחדש");
    }
  }

  function handleShare() {
    const payload = {
      name: "Japanuva Itinerary",
      days: days.length,
      updatedAt: new Date().toISOString(),
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const url = `${window.location.origin}/editor?share=${encoded.slice(0, 24)}`;
    void navigator.clipboard.writeText(url);
    flash("קישור לשיתוף הועתק");
  }

  function handleExport() {
    const lines = days.map((day, i) => {
      const acts = day.activities
        .map((a) => `  - [${a.timeSlot}] ${a.title} (¥${a.priceJpy})`)
        .join("\n");
      return `Day ${i + 1} · ${day.date} · ${day.city}\nHotel: ${day.hotel.name || "—"}\n${acts || "  (no activities)"}`;
    });
    const blob = new Blob(
      [
        "Japanuva · Trip Editor Export\n",
        `Generated: ${new Date().toLocaleString("he-IL")}\n\n`,
        lines.join("\n\n"),
      ],
      { type: "text/plain;charset=utf-8" },
    );
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "japanuva-itinerary.txt";
    a.click();
    URL.revokeObjectURL(href);
    flash("קובץ יומן יוצא (טקסט / PDF-ready)");
  }

  return (
    <div className="glass-strong relative flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl p-3 sm:p-4">
      <div className="min-w-0">
        <h1 className="fluid-title font-[family-name:var(--font-readex)] font-bold">
          עריכת הטיול
        </h1>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          בונה מסלול יומי — לינה, אטרקציות, תחבורה ותקציב · אוקטובר 2027
        </p>
      </div>

      <div className="flex max-w-full min-w-0 flex-wrap items-center gap-2">
        <StatusBadge
          tone={dirty ? "pending" : "booked"}
          label={dirty ? "שינויים לא שמורים" : "הכל שמור"}
          pulse={dirty}
        />
        {lastSavedAt && (
          <span className="hidden text-[11px] text-muted sm:inline">
            נשמר{" "}
            {new Date(lastSavedAt).toLocaleTimeString("he-IL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-nav-bg px-3 py-2 text-xs font-medium text-nav-fg glow-accent sm:min-h-0 sm:text-sm disabled:opacity-60"
        >
          {user ? <Cloud className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? "שומר..." : user ? "שמירה בענן" : "שמירת שינויים"}
        </button>
        <button
          type="button"
          onClick={() => void handleResetTrip()}
          disabled={saving}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-warning/35 bg-warning/10 px-3 py-2 text-xs text-warning sm:min-h-0 sm:text-sm"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          איפוס טיול
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs sm:min-h-0 sm:text-sm"
        >
          <Link2 className="h-3.5 w-3.5" />
          שיתוף קישור
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs sm:min-h-0 sm:text-sm"
        >
          <FileDown className="h-3.5 w-3.5" />
          ייצוא ל־PDF
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={softTransition()}
            className="absolute start-1/2 top-full z-20 mt-2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-success/30 bg-success/15 px-3 py-1.5 text-xs text-success backdrop-blur-md"
          >
            <Check className="h-3.5 w-3.5" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

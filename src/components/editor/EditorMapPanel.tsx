"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { collectTripPins, type TripPin } from "@/lib/tripPins";
import { isBundledDemoItinerary } from "@/lib/demoDetect";
import { useItineraryEditor } from "@/store/itineraryEditor";
import { cn } from "@/lib/utils";

const MultiPinMap = dynamic(
  () => import("@/components/maps/MultiPinMap").then((m) => m.MultiPinMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-paper-sunk text-sm text-muted">
        טוען מפה…
      </div>
    ),
  },
);

export function EditorMapPanel({ className }: { className?: string }) {
  const editorDays = useItineraryEditor((s) => s.days);
  const [activePinId, setActivePinId] = useState<string | null>(null);

  const days = useMemo(() => {
    if (!editorDays?.length || isBundledDemoItinerary(editorDays)) return [];
    return editorDays;
  }, [editorDays]);

  const pins = useMemo(() => collectTripPins(days), [days]);

  return (
    <div className={cn("editor-map-shell relative isolate overflow-hidden", className)}>
      <MultiPinMap
        pins={pins}
        activePinId={activePinId}
        onSelectPin={(pin: TripPin) => setActivePinId(pin.id)}
      />
      <div className="pointer-events-none absolute bottom-3 start-3 z-[3] flex gap-4 border border-rule bg-paper-raised px-3 py-1.5 text-[0.78rem] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[1px] bg-[#1f1d1a]" aria-hidden />
          לינה
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#b8432f]" aria-hidden />
          פעילות
        </span>
        {pins.length === 0 && <span>עדיין אין מקומות עם מיקום</span>}
      </div>
    </div>
  );
}

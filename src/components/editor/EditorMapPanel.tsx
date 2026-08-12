"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { collectTripPins, type TripPin } from "@/lib/tripPins";
import { isBundledDemoItinerary } from "@/lib/demoDetect";
import { useItineraryEditor } from "@/store/itineraryEditor";
import { cn } from "@/lib/utils";

const MultiPinMap = dynamic(
  () => import("@/components/maps/MultiPinMap").then((m) => m.MultiPinMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#eef1f6] text-sm text-muted dark:bg-[#1a1714]">
        טוען מפה...
      </div>
    ),
  },
);

export function EditorMapPanel({ className }: { className?: string }) {
  const editorDays = useItineraryEditor((s) => s.days);
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const days = useMemo(() => {
    if (!hydrated) return [];
    if (!editorDays?.length || isBundledDemoItinerary(editorDays)) return [];
    return editorDays;
  }, [hydrated, editorDays]);

  const pins = useMemo(() => collectTripPins(days), [days]);

  function handleSelectPin(pin: TripPin) {
    setActivePinId(pin.id);
  }

  return (
    <div
      className={cn(
        "editor-map-shell relative isolate overflow-hidden bg-[#eef1f6] dark:bg-[#1a1714]",
        className,
      )}
    >
      {hydrated ? (
        <MultiPinMap
          pins={pins}
          activePinId={activePinId}
          onSelectPin={handleSelectPin}
        />
      ) : null}
    </div>
  );
}

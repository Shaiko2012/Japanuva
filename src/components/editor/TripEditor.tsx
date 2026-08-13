"use client";

import { useEffect, useState } from "react";
import { List, MapPinned } from "lucide-react";
import { EditorMapPanel } from "./EditorMapPanel";
import { ItineraryEditorPanel } from "./ItineraryEditorPanel";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { cn } from "@/lib/utils";

type MobilePane = "list" | "map";

const MOBILE_PANES = [
  { id: "list" as const, label: "רשימה", icon: List },
  { id: "map" as const, label: "מפה", icon: MapPinned },
];

export function TripEditor() {
  const [hydrated, setHydrated] = useState(false);
  const [mobilePane, setMobilePane] = useState<MobilePane>("list");

  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted">
        טוען את עורך המסלול...
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div
        className={cn(
          "relative isolate overflow-hidden rounded-2xl border border-border bg-surface-strong shadow-[var(--card-shadow)]",
          "flex flex-col",
          // Mobile: card grows with content so Add attraction isn't clipped.
          // md+: fixed viewport with internal scroll + side-by-side map.
          "md:grid md:max-h-[calc(100dvh-9rem)] md:min-h-[calc(100dvh-9rem)] md:grid-cols-[minmax(280px,440px)_minmax(0,1fr)] md:grid-rows-1",
        )}
      >
        {/* Mobile only: רשימה | מפה */}
        <SegmentedTabs
          items={MOBILE_PANES}
          value={mobilePane}
          onChange={setMobilePane}
          layoutId="itinerary-view-pill"
          aria-label="תצוגת מסלול"
          className="shrink-0 border-b border-border bg-background/40 p-1.5 dark:bg-surface-strong/50 md:hidden"
        />

        {/*
          Wrappers keep `hidden` off panel roots (project `cn` does not merge
          Tailwind display utilities — ItineraryEditorPanel always sets `flex`).
          Mobile: show one pane via tabs. md+: both panes always visible as grid items.
        */}
        <div
          className={
            mobilePane === "list"
              ? "min-w-0 max-md:overflow-visible md:min-h-0 md:flex-1 md:overflow-hidden"
              : "hidden min-h-0 min-w-0 overflow-hidden md:block"
          }
        >
          <ItineraryEditorPanel className="relative z-20 max-md:h-auto max-md:overflow-visible md:h-full md:min-h-0 md:overflow-hidden" />
        </div>
        <div
          className={
            mobilePane === "map"
              ? "relative z-0 flex min-h-0 min-w-0 flex-1 flex-col"
              : "relative z-0 hidden min-h-0 min-w-0 md:block"
          }
        >
          <EditorMapPanel className="h-full min-h-[280px] min-w-0 flex-1" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { EditorMapPanel } from "./EditorMapPanel";
import { ItineraryEditorPanel } from "./ItineraryEditorPanel";
import { useHydrated } from "@/hooks/useHydrated";

type MobilePane = "list" | "map";

export function TripEditor() {
  const hydrated = useHydrated();
  const [mobilePane, setMobilePane] = useState<MobilePane>("list");

  if (!hydrated) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted" aria-busy="true">
        טוען את המסלול…
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6">
      <div role="tablist" aria-label="תצוגת המסלול" className="tabs mb-0 md:hidden">
        {(
          [
            { id: "list", label: "ימים" },
            { id: "map", label: "מפה" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mobilePane === tab.id}
            onClick={() => setMobilePane(tab.id)}
            className="tab flex-1 justify-center"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col border-border md:grid md:h-[calc(100dvh-var(--header-h)-var(--safe-top)-3rem)] md:min-h-[34rem] md:grid-cols-[minmax(20rem,30rem)_minmax(0,1fr)] md:overflow-hidden md:rounded-2xl md:border md:shadow-[var(--card-shadow)]">
        <div
          className={
            mobilePane === "list"
              ? "min-w-0 md:min-h-0 md:overflow-hidden md:border-e md:border-rule"
              : "hidden min-h-0 min-w-0 md:block md:overflow-hidden md:border-e md:border-rule"
          }
        >
          <ItineraryEditorPanel className="md:h-full md:min-h-0" />
        </div>
        <div
          className={
            mobilePane === "map"
              ? "relative z-0 flex h-[calc(100dvh-var(--header-h)-var(--tabbar-h)-6rem)] min-h-[22rem] min-w-0 flex-col"
              : "relative z-0 hidden min-h-0 min-w-0 md:block"
          }
        >
          <EditorMapPanel className="h-full min-h-[280px] min-w-0 flex-1" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  selectSelectedDay,
  useItineraryEditor,
} from "@/store/itineraryEditor";
import { DayStrip, ItineraryPanelHeader } from "./DayStrip";
import { AccommodationManager } from "./AccommodationManager";
import { ActivitiesBuilder } from "./ActivitiesBuilder";
import { EditorToolbarActions } from "./EditorToolbarActions";

function formatWeekdayDate(date: string) {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));
}

export function ItineraryEditorPanel({ className }: { className?: string }) {
  const [hydrated, setHydrated] = useState(false);
  const day = useItineraryEditor(selectSelectedDay);

  useEffect(() => setHydrated(true), []);

  if (!hydrated || !day) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted">
        טוען...
      </div>
    );
  }

  return (
    <div
      className={`relative z-20 flex h-full min-h-0 flex-col bg-surface-strong shadow-[2px_0_12px_rgba(0,0,0,0.06)] lg:shadow-[-2px_0_12px_rgba(0,0,0,0.06)] ${className ?? ""}`}
    >
      <ItineraryPanelHeader />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 space-y-3 border-b border-border px-4 py-4">
          <DayStrip />
          <p className="text-sm font-medium text-foreground">
            {formatWeekdayDate(day.date)}
          </p>
          <EditorToolbarActions compact />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <AccommodationManager variant="itinerary" />
          <div className="mt-4">
            <ActivitiesBuilder variant="itinerary" />
          </div>
        </div>
      </div>
    </div>
  );
}

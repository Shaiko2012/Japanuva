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
import { cn } from "@/lib/utils";

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
      className={cn(
        "relative z-20 flex flex-col bg-surface-strong shadow-[2px_0_12px_rgba(0,0,0,0.06)] lg:shadow-[-2px_0_12px_rgba(0,0,0,0.06)]",
        "max-md:h-auto md:h-full md:min-h-0",
        className,
      )}
    >
      <ItineraryPanelHeader />

      <div className="flex flex-col max-md:overflow-visible md:min-h-0 md:flex-1 md:overflow-hidden">
        <div className="shrink-0 space-y-3 border-b border-border px-4 py-4">
          <DayStrip />
          <p className="text-sm font-medium text-foreground">
            {formatWeekdayDate(day.date)}
          </p>
          <EditorToolbarActions compact />
        </div>

        <ActivitiesBuilder
          variant="itinerary"
          renderItinerary={({ cta, list }) => (
            <>
              <div className="shrink-0 space-y-3 px-4 pt-4">
                <AccommodationManager variant="itinerary" />
                {cta}
              </div>
              <div
                className="px-4 pb-4 pt-3 max-md:overflow-visible md:min-h-0 md:flex-1 md:overflow-y-auto"
                data-lenis-prevent
              >
                {list}
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
}

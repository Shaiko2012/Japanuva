"use client";

import { useMemo } from "react";
import { seedEditorDays } from "@/data/editorSeed";
import { isBundledDemoItinerary, isEmptyPersonalItinerary } from "@/lib/demoDetect";
import { useItineraryEditor } from "@/store/itineraryEditor";
import type { EditorDay } from "@/types/editor";
import { usePersonalTrip } from "./usePersonalTrip";

export interface TripDays {
  days: EditorDay[];
  /** Showing the bundled sample trip (before onboarding / sign-in). */
  isDemo: boolean;
  /** Personal itinerary with nothing filled in yet. */
  isEmpty: boolean;
}

/** One itinerary source for every read-only view: the editor store, or the sample trip in demo mode. */
export function useTripDays(): TripDays {
  const isPersonal = usePersonalTrip();
  const editorDays = useItineraryEditor((s) => s.days);

  return useMemo(() => {
    if (!isPersonal) {
      return { days: seedEditorDays, isDemo: true, isEmpty: false };
    }
    const days = isBundledDemoItinerary(editorDays) ? [] : editorDays;
    return { days, isDemo: false, isEmpty: isEmptyPersonalItinerary(days) };
  }, [isPersonal, editorDays]);
}

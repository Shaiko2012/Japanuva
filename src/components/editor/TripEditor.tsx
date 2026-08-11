"use client";

import { useEffect, useState } from "react";
import { EditorMapPanel } from "./EditorMapPanel";
import { ItineraryEditorPanel } from "./ItineraryEditorPanel";
import { cn } from "@/lib/utils";

export function TripEditor() {
  const [hydrated, setHydrated] = useState(false);

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
          "flex min-h-[calc(100vh-9rem)] flex-col",
          "lg:grid lg:max-h-[calc(100vh-9rem)] lg:grid-cols-[minmax(380px,440px)_minmax(0,1fr)] lg:grid-rows-1 lg:flex-none",
        )}
      >
        <ItineraryEditorPanel className="relative z-20 min-h-0 shrink-0 lg:min-h-0 lg:overflow-hidden" />
        <EditorMapPanel className="relative z-0 min-h-[280px] flex-1 lg:min-h-0" />
      </div>
    </div>
  );
}

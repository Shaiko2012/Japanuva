"use client";

import { useEffect, useState } from "react";
import { List, MapPinned } from "lucide-react";
import { EditorMapPanel } from "./EditorMapPanel";
import { ItineraryEditorPanel } from "./ItineraryEditorPanel";
import { cn } from "@/lib/utils";

type MobilePane = "list" | "map";

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
          "flex max-h-[calc(100dvh-9rem)] min-h-[calc(100dvh-9rem)] flex-col",
          "lg:grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:grid-rows-1 lg:flex-none",
        )}
      >
        {/* Mobile: tabs so list & map are both reachable (desktop keeps side-by-side). */}
        <div
          role="tablist"
          aria-label="תצוגת מסלול"
          className="grid shrink-0 grid-cols-2 gap-1 border-b border-border bg-background/40 p-1.5 lg:hidden"
        >
          {(
            [
              ["list", "רשימה", List],
              ["map", "מפה", MapPinned],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mobilePane === id}
              onClick={() => setMobilePane(id)}
              className={cn(
                "touch-target inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition",
                mobilePane === id
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        {/*
          Wrappers avoid display-class clashes (project `cn` does not merge Tailwind).
          `lg:contents` lets children become the desktop grid items.
        */}
        <div
          className={cn(
            "min-h-0 flex-1 overflow-hidden",
            mobilePane !== "list" && "hidden lg:contents",
          )}
        >
          <ItineraryEditorPanel className="relative z-20 h-full min-h-0 overflow-hidden" />
        </div>
        <div
          className={cn(
            "relative z-0 min-h-0 flex-1",
            mobilePane !== "map" && "hidden lg:contents",
          )}
        >
          <EditorMapPanel className="h-full min-h-0" />
        </div>
      </div>
    </div>
  );
}

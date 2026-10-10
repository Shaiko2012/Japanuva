"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChecklistState {
  vjw: Record<string, boolean>;
  toggleVjw: (id: string) => void;
  resetVjw: () => void;
}

/** Entry-checklist progress, kept on this device. */
export const useChecklists = create<ChecklistState>()(
  persist(
    (set) => ({
      vjw: {},
      toggleVjw: (id) => set((s) => ({ vjw: { ...s.vjw, [id]: !s.vjw[id] } })),
      resetVjw: () => set({ vjw: {} }),
    }),
    { name: "japanuva-checklists" },
  ),
);

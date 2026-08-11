"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultFamily, type FamilyMemberCounts } from "@/data/trip";

interface FamilyState {
  family: FamilyMemberCounts;
  setFamily: (family: FamilyMemberCounts) => void;
  hydrateFromCloud: (family: FamilyMemberCounts) => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set) => ({
      family: defaultFamily,
      setFamily: (family) =>
        set({
          family: {
            adults: Math.min(8, Math.max(1, family.adults)),
            kids: Math.min(8, Math.max(0, family.kids)),
          },
        }),
      hydrateFromCloud: (family) =>
        set({
          family: {
            adults: Math.min(8, Math.max(1, family.adults || 1)),
            kids: Math.min(8, Math.max(0, family.kids || 0)),
          },
        }),
    }),
    {
      name: "konnichimap-family",
      partialize: (s) => ({ family: s.family }),
    },
  ),
);

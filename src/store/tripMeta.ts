"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tripMeta as defaults } from "@/data/trip";

interface TripMetaState {
  startDate: string;
  endDate: string;
  budgetIls: number;
  onboardingCompleted: boolean;
  /** false = demo showcase data; true = user's real empty/filled trip */
  isPersonalAccount: boolean;
  setDates: (startDate: string, endDate: string) => void;
  setBudgetIls: (value: number) => void;
  completeOnboarding: () => void;
  markPersonalAccount: () => void;
  hydrateFromCloud: (payload: {
    startDate?: string;
    endDate?: string;
    budgetIls?: number;
    isPersonalAccount?: boolean;
  }) => void;
}

function normalizeRange(startDate: string, endDate: string) {
  if (!startDate) startDate = defaults.startDate;
  if (!endDate || endDate < startDate) endDate = startDate;
  return { startDate, endDate };
}

export const useTripMetaStore = create<TripMetaState>()(
  persist(
    (set) => ({
      startDate: defaults.startDate,
      endDate: defaults.endDate,
      budgetIls: 5000,
      onboardingCompleted: false,
      isPersonalAccount: false,

      setDates: (startDate, endDate) =>
        set(normalizeRange(startDate, endDate)),

      setBudgetIls: (value) =>
        set({ budgetIls: Math.min(50000, Math.max(0, value)) }),

      completeOnboarding: () => set({ onboardingCompleted: true }),

      markPersonalAccount: () => set({ isPersonalAccount: true }),

      hydrateFromCloud: (payload) =>
        set((s) => {
          const range = normalizeRange(
            payload.startDate ?? s.startDate,
            payload.endDate ?? s.endDate,
          );
          return {
            ...range,
            budgetIls:
              payload.budgetIls != null
                ? Math.min(50000, Math.max(0, payload.budgetIls))
                : s.budgetIls,
            isPersonalAccount:
              payload.isPersonalAccount ?? s.isPersonalAccount,
          };
        }),
    }),
    {
      name: "konnichimap-trip-meta",
      partialize: (s) => ({
        startDate: s.startDate,
        endDate: s.endDate,
        budgetIls: s.budgetIls,
        onboardingCompleted: s.onboardingCompleted,
        isPersonalAccount: s.isPersonalAccount,
      }),
    },
  ),
);

export function formatTripRangeHe(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    const monthYear = new Intl.DateTimeFormat("he-IL", {
      month: "long",
      year: "numeric",
    }).format(start);
    return `${start.getDate()}–${end.getDate()} ב${monthYear}`;
  }

  const fmt = new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

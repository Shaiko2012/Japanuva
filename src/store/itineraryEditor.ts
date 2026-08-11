"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { arrayMove } from "@dnd-kit/sortable";
import { createId, seedEditorDays } from "@/data/editorSeed";
import { isBundledDemoItinerary } from "@/lib/demoDetect";
import type {
  ActivityItem,
  EditorCity,
  EditorDay,
  HotelInfo,
} from "@/types/editor";
import { tripMeta } from "@/data/trip";

interface ItineraryEditorState {
  days: EditorDay[];
  selectedDayId: string;
  dirty: boolean;
  lastSavedAt: string | null;
  selectDay: (id: string) => void;
  addDay: (afterId?: string) => void;
  removeDay: (id: string) => void;
  reorderDays: (activeId: string, overId: string) => void;
  updateDayCity: (dayId: string, city: EditorCity) => void;
  updateDayDate: (dayId: string, date: string) => void;
  updateFoodEstimate: (dayId: string, value: number) => void;
  updateHotel: (dayId: string, hotel: Partial<HotelInfo>) => void;
  addActivity: (dayId: string, activity: Omit<ActivityItem, "id">) => void;
  updateActivity: (
    dayId: string,
    activityId: string,
    patch: Partial<ActivityItem>,
  ) => void;
  removeActivity: (dayId: string, activityId: string) => void;
  reorderActivities: (
    dayId: string,
    activeId: string,
    overId: string,
  ) => void;
  saveChanges: () => void;
  markClean: () => void;
  hydrateFromCloud: (payload: {
    days: EditorDay[];
    selectedDayId: string;
    lastSavedAt: string | null;
  }) => void;
  resetToEmpty: (startDate: string) => void;
  loadDemo: () => void;
  clearDemoIfPresent: (startDate: string) => boolean;
}

function nextDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function blankDay(date: string): EditorDay {
  return {
    id: createId("day"),
    date,
    city: "Tokyo",
    foodEstimateJpy: 12000,
    hotel: {
      name: "",
      checkIn: date,
      checkOut: nextDate(date),
      status: "not_booked",
      costPerNightJpy: 0,
      notes: "",
    },
    activities: [],
  };
}

function initialEditorState() {
  const day = blankDay(tripMeta.startDate);
  return {
    days: [day],
    selectedDayId: day.id,
  };
}

export const useItineraryEditor = create<ItineraryEditorState>()(
  persist(
    (set, get) => ({
      ...initialEditorState(),
      dirty: false,
      lastSavedAt: null,

      selectDay: (id) => set({ selectedDayId: id }),

      addDay: (afterId) => {
        const { days, selectedDayId } = get();
        const anchorId = afterId ?? selectedDayId;
        const idx = days.findIndex((d) => d.id === anchorId);
        const baseDate =
          idx >= 0 ? days[idx].date : tripMeta.startDate;
        const day = blankDay(nextDate(baseDate));
        const next = [...days];
        next.splice(idx >= 0 ? idx + 1 : next.length, 0, day);
        set({ days: next, selectedDayId: day.id, dirty: true });
      },

      removeDay: (id) => {
        const { days, selectedDayId } = get();
        if (days.length <= 1) return;
        const next = days.filter((d) => d.id !== id);
        set({
          days: next,
          selectedDayId:
            selectedDayId === id ? next[0].id : selectedDayId,
          dirty: true,
        });
      },

      reorderDays: (activeId, overId) => {
        const { days } = get();
        const oldIndex = days.findIndex((d) => d.id === activeId);
        const newIndex = days.findIndex((d) => d.id === overId);
        if (oldIndex < 0 || newIndex < 0) return;
        set({ days: arrayMove(days, oldIndex, newIndex), dirty: true });
      },

      updateDayCity: (dayId, city) =>
        set((s) => ({
          dirty: true,
          days: s.days.map((d) => (d.id === dayId ? { ...d, city } : d)),
        })),

      updateDayDate: (dayId, date) =>
        set((s) => ({
          dirty: true,
          days: s.days.map((d) => (d.id === dayId ? { ...d, date } : d)),
        })),

      updateFoodEstimate: (dayId, value) =>
        set((s) => ({
          dirty: true,
          days: s.days.map((d) =>
            d.id === dayId ? { ...d, foodEstimateJpy: value } : d,
          ),
        })),

      updateHotel: (dayId, hotel) =>
        set((s) => ({
          dirty: true,
          days: s.days.map((d) =>
            d.id === dayId ? { ...d, hotel: { ...d.hotel, ...hotel } } : d,
          ),
        })),

      addActivity: (dayId, activity) =>
        set((s) => ({
          dirty: true,
          days: s.days.map((d) =>
            d.id === dayId
              ? {
                  ...d,
                  activities: [
                    ...d.activities,
                    { ...activity, id: createId("act") },
                  ],
                }
              : d,
          ),
        })),

      updateActivity: (dayId, activityId, patch) =>
        set((s) => ({
          dirty: true,
          days: s.days.map((d) =>
            d.id === dayId
              ? {
                  ...d,
                  activities: d.activities.map((a) =>
                    a.id === activityId ? { ...a, ...patch } : a,
                  ),
                }
              : d,
          ),
        })),

      removeActivity: (dayId, activityId) =>
        set((s) => ({
          dirty: true,
          days: s.days.map((d) =>
            d.id === dayId
              ? {
                  ...d,
                  activities: d.activities.filter((a) => a.id !== activityId),
                }
              : d,
          ),
        })),

      reorderActivities: (dayId, activeId, overId) =>
        set((s) => ({
          dirty: true,
          days: s.days.map((d) => {
            if (d.id !== dayId) return d;
            const oldIndex = d.activities.findIndex((a) => a.id === activeId);
            const newIndex = d.activities.findIndex((a) => a.id === overId);
            if (oldIndex < 0 || newIndex < 0) return d;
            return {
              ...d,
              activities: arrayMove(d.activities, oldIndex, newIndex),
            };
          }),
        })),

      saveChanges: () =>
        set({ dirty: false, lastSavedAt: new Date().toISOString() }),

      markClean: () => set({ dirty: false }),

      hydrateFromCloud: (payload) =>
        set({
          days: payload.days,
          selectedDayId:
            payload.selectedDayId || payload.days[0]?.id || "",
          lastSavedAt: payload.lastSavedAt,
          dirty: false,
        }),

      resetToEmpty: (startDate) => {
        const day = blankDay(startDate);
        set({
          days: [day],
          selectedDayId: day.id,
          dirty: true,
          lastSavedAt: null,
        });
      },

      loadDemo: () =>
        set({
          days: seedEditorDays,
          selectedDayId: seedEditorDays[0]?.id ?? "",
          dirty: true,
          lastSavedAt: null,
        }),

      clearDemoIfPresent: (startDate: string) => {
        const { days } = get();
        if (!isBundledDemoItinerary(days)) return false;
        get().resetToEmpty(startDate);
        return true;
      },
    }),
    {
      name: "konnichimap-itinerary-editor",
      partialize: (s) => ({
        days: s.days,
        selectedDayId: s.selectedDayId,
        lastSavedAt: s.lastSavedAt,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<ItineraryEditorState> | undefined;
        const merged = { ...current, ...saved };
        if (saved?.days && isBundledDemoItinerary(saved.days)) {
          const day = blankDay(tripMeta.startDate);
          return {
            ...merged,
            days: [day],
            selectedDayId: day.id,
            lastSavedAt: null,
            dirty: true,
          };
        }
        return merged;
      },
    },
  ),
);

export function selectSelectedDay(state: ItineraryEditorState) {
  return (
    state.days.find((d) => d.id === state.selectedDayId) ?? state.days[0]
  );
}

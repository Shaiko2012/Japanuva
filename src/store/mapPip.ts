"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DistrictId } from "@/data/trip";
import {
  districtMapPlaces,
  japanOverview,
  type MapPlace,
} from "@/lib/maps";

export type PipSize = "mini" | "large";

interface MapPipState {
  open: boolean;
  size: PipSize;
  place: MapPlace;
  selectedDistrict: DistrictId | null;
  activePinId: string | null;
  showPinList: boolean;
  toggle: () => void;
  openPip: () => void;
  closePip: () => void;
  setSize: (size: PipSize) => void;
  focusDistrict: (id: DistrictId | null) => void;
  focusPlace: (place: MapPlace) => void;
  setActivePinId: (id: string | null) => void;
  togglePinList: () => void;
  hydrateFromCloud: (prefs: {
    open?: boolean;
    size?: PipSize;
    place?: MapPlace;
    selectedDistrict?: DistrictId | null;
    activePinId?: string | null;
    showPinList?: boolean;
  }) => void;
}

export const useMapPip = create<MapPipState>()(
  persist(
    (set) => ({
      open: false,
      size: "mini",
      place: japanOverview,
      selectedDistrict: null,
      activePinId: null,
      showPinList: true,

      toggle: () => set((s) => ({ open: !s.open })),
      openPip: () => set({ open: true }),
      closePip: () => set({ open: false }),
      setSize: (size) => set({ size }),
      setActivePinId: (id) => set({ activePinId: id }),
      togglePinList: () => set((s) => ({ showPinList: !s.showPinList })),

      focusDistrict: (id) =>
        set({
          selectedDistrict: id,
          place: id ? districtMapPlaces[id] : japanOverview,
          activePinId: null,
          open: true,
        }),

      focusPlace: (place) =>
        set({ place, open: true, activePinId: place.id }),

      hydrateFromCloud: (prefs) =>
        set((s) => ({
          open: prefs.open ?? s.open,
          size: prefs.size ?? s.size,
          place: prefs.place ?? s.place,
          selectedDistrict:
            prefs.selectedDistrict !== undefined
              ? prefs.selectedDistrict
              : s.selectedDistrict,
          activePinId:
            prefs.activePinId !== undefined
              ? prefs.activePinId
              : s.activePinId,
          showPinList: prefs.showPinList ?? s.showPinList,
        })),
    }),
    {
      name: "konnichimap-map-pip",
      partialize: (s) => ({
        open: s.open,
        size: s.size,
        place: s.place,
        selectedDistrict: s.selectedDistrict,
        activePinId: s.activePinId,
        showPinList: s.showPinList,
      }),
    },
  ),
);

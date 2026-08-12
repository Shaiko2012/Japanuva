"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { DistrictId } from "@/data/trip";
import { useMapPip } from "@/store/mapPip";
import { HeroBar } from "./HeroBar";
import { RouteMap } from "./RouteMap";
import { DailyItinerary } from "./DailyItinerary";

export function Dashboard() {
  const selectedDistrict = useMapPip((s) => s.selectedDistrict);
  const focusDistrict = useMapPip((s) => s.focusDistrict);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  function onSelect(id: DistrictId) {
    focusDistrict(selectedDistrict === id ? null : id);
  }

  return (
    <div className="space-y-4">
      <HeroBar />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.45 }}
        className="grid min-w-0 gap-3 lg:grid-cols-2 lg:gap-4"
      >
        <RouteMap
          selected={hydrated ? selectedDistrict : null}
          onSelect={onSelect}
        />
        <DailyItinerary
          selectedDistrict={hydrated ? selectedDistrict : null}
        />
      </motion.section>
    </div>
  );
}

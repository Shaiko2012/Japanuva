"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { DistrictId } from "@/data/trip";
import { useSoftEntrance } from "@/lib/motion";
import { useMapPip } from "@/store/mapPip";
import { HeroBar } from "./HeroBar";
import { RouteMap } from "./RouteMap";
import { DailyItinerary } from "./DailyItinerary";

export function Dashboard() {
  const selectedDistrict = useMapPip((s) => s.selectedDistrict);
  const focusDistrict = useMapPip((s) => s.focusDistrict);
  const [hydrated, setHydrated] = useState(false);
  const entrance = useSoftEntrance({ delay: 0.08, y: 10 });

  useEffect(() => setHydrated(true), []);

  function onSelect(id: DistrictId) {
    focusDistrict(selectedDistrict === id ? null : id);
  }

  return (
    <div className="space-y-5 pb-24 sm:space-y-6">
      <HeroBar />

      <motion.section
        {...entrance}
        className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-5"
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

"use client";

import { motion } from "framer-motion";
import { useSoftEntrance } from "@/lib/motion";
import { HeroBar } from "./HeroBar";
import { DailyItinerary } from "./DailyItinerary";

export function Dashboard() {
  const entrance = useSoftEntrance({ delay: 0.08, y: 10 });

  return (
    <div className="space-y-5 pb-24 sm:space-y-6">
      <HeroBar />

      <motion.section {...entrance} className="min-w-0">
        <DailyItinerary />
      </motion.section>
    </div>
  );
}

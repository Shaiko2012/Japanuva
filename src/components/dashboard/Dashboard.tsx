"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { useTripDays } from "@/hooks/useTripDays";
import { TripMasthead } from "./TripMasthead";
import { DayLedger } from "./DayLedger";
import { StaysSummary } from "./StaysSummary";
import { TripCosts } from "./TripCosts";
import { CurrencyConverter } from "./CurrencyConverter";
import { WeatherWidget } from "./WeatherWidget";
import { PrepStatus } from "./PrepStatus";
import { FadeIn } from "@/components/ui/Motion";

function OverviewSkeleton() {
  return (
    <div className="pt-14" aria-busy="true" aria-label="טוען את סקירת הטיול">
      <div className="h-4 w-24 animate-pulse bg-paper-sunk" />
      <div className="mt-6 h-16 w-3/4 max-w-xl animate-pulse bg-paper-sunk" />
      <div className="mt-10 h-12 w-full animate-pulse bg-paper-sunk" />
    </div>
  );
}

export function Dashboard() {
  const hydrated = useHydrated();
  const { days, isDemo, isEmpty } = useTripDays();

  if (!hydrated) return <OverviewSkeleton />;

  return (
    <div>
      <TripMasthead days={days} isDemo={isDemo} />

      <div className="mt-[var(--space-section)] space-y-16">
        <FadeIn delay={0.04}>
          <DayLedger days={days} isDemo={isDemo} isEmpty={isEmpty} />
        </FadeIn>

        <div className="grid items-start gap-x-12 gap-y-14 lg:grid-cols-2">
          <FadeIn delay={0.08} className="min-w-0">
            <StaysSummary days={days} isDemo={isDemo} />
          </FadeIn>
          <FadeIn delay={0.1} className="min-w-0">
            <PrepStatus days={days} isDemo={isDemo} />
          </FadeIn>
          <FadeIn delay={0.12} className="min-w-0">
            <TripCosts days={days} isEmpty={isEmpty} />
          </FadeIn>
          <FadeIn delay={0.14} className="min-w-0">
            <CurrencyConverter />
          </FadeIn>
        </div>

        <FadeIn delay={0.18}>
          <WeatherWidget />
        </FadeIn>
      </div>
    </div>
  );
}

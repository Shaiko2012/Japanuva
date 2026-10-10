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

      <div className="mt-[var(--space-section)] grid gap-x-14 gap-y-16 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-16">
          <FadeIn delay={0.04}>
            <DayLedger days={days} isDemo={isDemo} isEmpty={isEmpty} />
          </FadeIn>
          <FadeIn delay={0.08}>
            <StaysSummary days={days} isDemo={isDemo} />
          </FadeIn>
        </div>
        <aside className="min-w-0 space-y-14" aria-label="מידע משלים">
          <FadeIn delay={0.1}>
            <TripCosts days={days} isEmpty={isEmpty} />
          </FadeIn>
          <FadeIn delay={0.14}>
            <PrepStatus days={days} isDemo={isDemo} />
          </FadeIn>
          <FadeIn delay={0.18}>
            <CurrencyConverter />
          </FadeIn>
          <FadeIn delay={0.22}>
            <WeatherWidget />
          </FadeIn>
        </aside>
      </div>
    </div>
  );
}

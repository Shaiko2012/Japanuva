"use client";

import { useState } from "react";
import { TripSetupWizard } from "@/components/auth/TripSetupWizard";
import { useTripMetaStore } from "@/store/tripMeta";
import { useHydrated } from "@/hooks/useHydrated";

/** Shows trip setup (dates + family) once, before account creation / first use. */
export function OnboardingGate() {
  const onboardingCompleted = useTripMetaStore((s) => s.onboardingCompleted);
  const hydrated = useHydrated();
  const [finished, setFinished] = useState(false);

  if (!hydrated) return null;

  return (
    <TripSetupWizard
      open={!onboardingCompleted && !finished}
      allowSkip={false}
      onFinished={() => setFinished(true)}
      title="ברוכים הבאים ל־Japanuva"
    />
  );
}

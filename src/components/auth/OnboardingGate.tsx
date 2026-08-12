"use client";

import { useEffect, useState } from "react";
import { TripSetupWizard } from "@/components/auth/TripSetupWizard";
import { useTripMetaStore } from "@/store/tripMeta";

/** Shows trip setup (dates + family) once, before account creation / first use. */
export function OnboardingGate() {
  const onboardingCompleted = useTripMetaStore((s) => s.onboardingCompleted);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!onboardingCompleted) setOpen(true);
  }, [hydrated, onboardingCompleted]);

  if (!hydrated) return null;

  return (
    <TripSetupWizard
      open={open}
      allowSkip={false}
      onFinished={() => setOpen(false)}
      title="ברוכים הבאים ל־Japanuva"
    />
  );
}

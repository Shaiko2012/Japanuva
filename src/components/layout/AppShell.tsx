"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { GoogleMapPip } from "@/components/maps/GoogleMapPip";
import { OnboardingGate } from "@/components/auth/OnboardingGate";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideMapPip = pathname.startsWith("/itinerary");

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-50 dark:opacity-25" />
      <Navbar />
      <main
        className={`relative z-0 mx-auto w-full px-3 sm:px-5 ${
          hideMapPip
            ? "max-w-[1600px] pb-6 pt-4"
            : "max-w-7xl pb-24 pt-5 sm:pt-6"
        }`}
      >
        {children}
      </main>
      {!hideMapPip && <GoogleMapPip />}
      <OnboardingGate />
    </div>
  );
}

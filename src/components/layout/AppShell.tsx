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
    <div className="relative min-h-screen min-h-dvh min-w-0 overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-50 dark:opacity-25" />
      <Navbar />
      <main
        className={`relative z-0 mx-auto w-full min-w-0 max-w-full ps-[max(0.75rem,var(--safe-left))] pe-[max(0.75rem,var(--safe-right))] sm:ps-[max(1.25rem,var(--safe-left))] sm:pe-[max(1.25rem,var(--safe-right))] ${
          hideMapPip
            ? "max-w-[1600px] pb-[max(1.5rem,calc(var(--safe-bottom)+1rem))] pt-4"
            : "max-w-7xl pb-[max(6rem,calc(var(--safe-bottom)+5.5rem))] pt-5 sm:pt-6"
        }`}
      >
        {children}
      </main>
      {!hideMapPip && <GoogleMapPip />}
      <OnboardingGate />
    </div>
  );
}

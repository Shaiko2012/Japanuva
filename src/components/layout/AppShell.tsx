"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LayoutGroup } from "framer-motion";
import { Navbar } from "./Navbar";
import { OnboardingGate } from "@/components/auth/OnboardingGate";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const wide = pathname.startsWith("/itinerary");

  return (
    <div className="relative flex min-h-dvh min-w-0 flex-col overflow-x-clip">
      <a href="#main" className="skip-link">
        דילוג לתוכן
      </a>
      <Navbar />
      <main
        id="main"
        tabIndex={-1}
        className={
          "page relative min-w-0 flex-1 outline-none " +
          (wide ? "max-w-[100rem]" : "")
        }
      >
        <LayoutGroup id="section-tabs">{children}</LayoutGroup>
      </main>
      <footer className="page mt-16 pb-[calc(var(--tabbar-h)+var(--safe-bottom)+1.5rem)] md:pb-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-border pt-5 text-[0.8125rem] leading-6 text-muted">
          <p className="max-w-2xl">
            מחירים, זמני נסיעה ונתוני מזג אוויר באתר הם אומדנים לתכנון בלבד.
            לפני הזמנה בדקו מול המקור הרשמי.
          </p>
          <p dir="ltr" className="font-[family-name:var(--font-quicksand)] font-bold">
            Japanuva
          </p>
        </div>
      </footer>
      <OnboardingGate />
    </div>
  );
}

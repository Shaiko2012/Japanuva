"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  CreditCard,
  FileCheck2,
  LayoutDashboard,
  Lightbulb,
  Luggage,
  Leaf,
  Menu,
  PenSquare,
  Route,
  TrainFront,
  X,
} from "lucide-react";
import { useState } from "react";
import { navItems, tripMeta } from "@/data/trip";
import { cn } from "@/lib/utils";
import {
  navPillTransition,
  softExpandProps,
  softLogoHover,
  softSpring,
  softTap,
  softTapProps,
} from "@/lib/motion";
import { ThemeToggle } from "./ThemeToggle";
import { AuthButton } from "@/components/auth/AuthButton";

const iconMap = {
  LayoutDashboard,
  CalendarDays,
  PenSquare,
  Route,
  TrainFront,
  CreditCard,
  Luggage,
  FileCheck2,
  Lightbulb,
};

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const menuMotion = softExpandProps(reduceMotion);
  const menuBtnTap = softTapProps(reduceMotion);

  return (
    <header
      className="sticky top-0 z-50 bg-parchment/80 backdrop-blur-xl"
      style={{
        paddingTop: "max(0.75rem, var(--safe-top))",
        paddingBottom: "0.75rem",
        paddingInlineStart: "max(0.75rem, var(--safe-left))",
        paddingInlineEnd: "max(0.75rem, var(--safe-right))",
      }}
    >
      <div className="mx-auto flex max-w-7xl min-w-0 items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="group flex min-h-11 shrink-0 items-center gap-2.5 rounded-2xl sm:gap-3"
          aria-label={`${tripMeta.name} — דף הבית`}
        >
          {/* RTL: mark at inline-start, then Quicksand wordmark */}
          <motion.span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ADEBB3] text-[#0A0A0A] sm:h-11 sm:w-11"
            aria-hidden
            whileHover={reduceMotion ? undefined : softLogoHover}
            whileTap={reduceMotion ? undefined : softTap}
          >
            <Leaf className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.35} />
          </motion.span>
          <span className="flex flex-col leading-none">
            <span className="whitespace-nowrap font-[family-name:var(--font-quicksand)] text-[15px] font-bold tracking-tight text-foreground sm:text-lg">
              {tripMeta.name}
            </span>
            <span className="mt-0.5 hidden whitespace-nowrap text-[10px] leading-tight text-muted sm:block">
              תכנון טיול ליפן
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 lg:block">
          <div className="nav-pill-shell mx-auto w-fit max-w-full overflow-x-auto overscroll-x-contain px-1.5 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon = iconMap[item.icon];
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href} className="shrink-0">
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-xs transition sm:text-sm",
                        active
                          ? "font-bold text-[#0A0A0A]"
                          : "text-white/75 hover:text-white",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-pill"
                          className="nav-pill-active absolute inset-0"
                          transition={navPillTransition}
                          aria-hidden
                        />
                      )}
                      <Icon
                        className="relative z-10 h-3.5 w-3.5"
                        strokeWidth={2.2}
                        aria-hidden
                      />
                      <span className="relative z-10 whitespace-nowrap font-bold">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <AuthButton />
          <ThemeToggle />
          <motion.button
            type="button"
            {...menuBtnTap}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-strong text-foreground shadow-[var(--card-shadow)] transition hover:scale-[1.03] hover:shadow-[var(--card-shadow-hover)] lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="תפריט ניווט"
            aria-expanded={open}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "menu"}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, rotate: -40, scale: 0.7 }
                }
                animate={
                  reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, rotate: 0, scale: 1 }
                }
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, rotate: 40, scale: 0.7 }
                }
                transition={softSpring}
                className="flex"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            key="mobile-nav"
            {...menuMotion}
            className="mx-auto mt-3 w-full max-w-7xl overflow-hidden lg:hidden"
          >
            <div className="nav-mobile-menu">
              <ul className="flex flex-col gap-0.5">
                {navItems.map((item) => {
                  const Icon = iconMap[item.icon];
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <li key={item.href} className="relative">
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "relative flex min-h-11 items-center gap-2 rounded-full px-3.5 py-2.5 text-sm transition",
                          active
                            ? "font-bold text-[#0A0A0A]"
                            : "text-white/80 hover:text-white",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="nav-pill-mobile"
                            className="nav-pill-active absolute inset-0"
                            transition={navPillTransition}
                            aria-hidden
                          />
                        )}
                        <Icon className="relative z-10 h-4 w-4 shrink-0" />
                        <span className="relative z-10 min-w-0 font-semibold">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

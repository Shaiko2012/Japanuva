"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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

  return (
    <header
      className="sticky top-0 z-50 border-b border-border/80 bg-parchment/90 backdrop-blur-xl"
      style={{
        paddingTop: "max(0.625rem, var(--safe-top))",
        paddingBottom: "0.625rem",
        paddingInlineStart: "max(0.75rem, var(--safe-left))",
        paddingInlineEnd: "max(0.75rem, var(--safe-right))",
      }}
    >
      <div className="mx-auto flex max-w-7xl min-w-0 items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="group flex min-h-11 shrink-0 items-center gap-2 rounded-2xl sm:gap-2.5"
          aria-label={`${tripMeta.name} — דף הבית`}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-olive text-parchment shadow-[0_4px_12px_color-mix(in_srgb,var(--olive)_40%,transparent)]"
            aria-hidden
          >
            <Leaf className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <span className="flex flex-col leading-snug">
            <span className="whitespace-nowrap font-[family-name:var(--font-quicksand)] text-sm font-bold tracking-tight text-foreground sm:text-base">
              {tripMeta.name}
            </span>
            <span className="hidden whitespace-nowrap text-[10px] text-muted sm:block">
              תכנון טיול חמים ליפן
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] lg:block [&::-webkit-scrollbar]:hidden">
          <ul className="flex items-center justify-center gap-1.5">
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
                      "relative flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-xs transition sm:text-sm",
                      active
                        ? "text-espresso"
                        : "text-muted hover:bg-parchment-deep hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full border border-border bg-parchment-deep shadow-[0_2px_8px_rgba(44,34,30,0.06)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        aria-hidden
                      />
                    )}
                    <Icon className="relative z-10 h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    <span className="relative z-10 whitespace-nowrap font-semibold">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <AuthButton />
          <ThemeToggle />
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="תפריט ניווט"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="mx-auto mt-2 max-w-7xl border-t border-border/60 pt-2 lg:hidden">
          <ul className="flex flex-col gap-1 pb-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-2xl px-3 py-2.5 text-sm transition",
                      active
                        ? "border border-border bg-parchment-deep font-semibold text-foreground"
                        : "text-muted hover:bg-parchment-deep/70 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}

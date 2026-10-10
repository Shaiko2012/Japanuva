"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { navSections, sectionForPath } from "@/data/navigation";
import { tripMeta } from "@/data/trip";
import { AuthButton } from "@/components/auth/AuthButton";
import { ThemeToggle } from "./ThemeToggle";
import { navPillTransition } from "@/lib/motion";
import { useSlidingPill, type SlidingPillBox } from "@/hooks/useSlidingPill";

function Wordmark() {
  const reduce = useReducedMotion();
  return (
    <Link
      href="/"
      className="group flex min-h-11 shrink-0 items-center gap-3 text-foreground no-underline"
      aria-label={`${tripMeta.name}, סקירת הטיול`}
    >
      <motion.span
        dir="ltr"
        className="inline-block font-[family-name:var(--font-quicksand)] text-[1.4rem] font-bold leading-none tracking-[-0.02em]"
        whileHover={reduce ? undefined : { scale: 1.06, rotate: -3 }}
        whileTap={reduce ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
      >
        Japanuva
      </motion.span>
      <span className="hidden border-s border-border ps-3 text-[0.8125rem] leading-none text-muted lg:inline">
        תכנון טיול משפחתי
      </span>
    </Link>
  );
}

function Pill({
  box,
  reduce,
}: {
  box: SlidingPillBox | null;
  reduce: boolean | null;
}) {
  if (!box) return null;
  return (
    <motion.span
      aria-hidden
      className="nav-pill-active pointer-events-none absolute left-0 top-0 z-0"
      initial={false}
      animate={{ x: box.x, width: box.width }}
      transition={
        reduce
          ? { duration: 0 }
          : { x: navPillTransition, width: navPillTransition }
      }
      style={{ top: box.y, height: box.height, originX: 0 }}
    />
  );
}

export function Navbar() {
  const pathname = usePathname();
  const current = sectionForPath(pathname);
  const desktop = useSlidingPill(current.id);
  const mobile = useSlidingPill(
    current.id,
    "[aria-current='page'] span.relative.inline-flex",
  );

  return (
    <>
      <header
        className="nav-chrome sticky top-0 z-50 border-b"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="page flex h-[var(--header-h)] items-stretch gap-6 lg:gap-10">
          <div className="flex items-center">
            <Wordmark />
          </div>

          <nav aria-label="ניווט ראשי" className="hidden items-center md:flex">
            <ul ref={desktop.listRef} className="nav-pill-shell flex items-stretch">
              <Pill box={desktop.pill} reduce={desktop.reduce} />
              {navSections.map((section) => {
                const active = section.id === current.id;
                return (
                  <li key={section.id} className="relative z-10 flex">
                    <Link
                      href={section.href}
                      aria-current={active ? "page" : undefined}
                      className="relative flex items-center px-3.5 text-[0.9375rem] font-bold transition-colors"
                    >
                      <span
                        className={
                          active
                            ? "text-[#0a0a0a]"
                            : "rounded-full text-muted hover:text-foreground dark:text-[#f5f0e8]/80 dark:hover:text-[#f5f0e8]"
                        }
                      >
                        {section.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ms-auto flex items-center gap-1.5">
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Phones: thumb-reach section bar. Sub-pages live in each page's tabs. */}
      <nav
        aria-label="ניווט ראשי"
        className="nav-chrome fixed inset-x-0 bottom-0 z-50 overflow-hidden border-t md:hidden"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <ul ref={mobile.listRef} className="relative grid h-[var(--tabbar-h)] grid-cols-4 px-1.5">
          <Pill box={mobile.pill} reduce={mobile.reduce} />
          {navSections.map((section) => {
            const active = section.id === current.id;
            return (
              <li key={section.id} className="relative z-10 flex items-center justify-center">
                <Link
                  href={section.href}
                  aria-current={active ? "page" : undefined}
                  className="flex h-full w-full items-center justify-center text-[0.9375rem] font-bold"
                >
                  <span className="relative inline-flex items-center px-3 py-1">
                    <span
                      className={
                        active
                          ? "text-[#0a0a0a]"
                          : "text-muted dark:text-[#f5f0e8]/80"
                      }
                    >
                      {section.label}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { navPillTransition } from "@/lib/motion";
import type { NavPage } from "@/data/navigation";

type Pill = { x: number; width: number };

/** Survives page remounts so the mint pill can slide across /guide, /vjw, /luggage. */
let fromPill: { key: string; pill: Pill; until: number } | null = null;
let lastPill: { key: string; pill: Pill } | null = null;

function measureTab(list: HTMLElement, tab: HTMLElement): Pill {
  const listBox = list.getBoundingClientRect();
  const tabBox = tab.getBoundingClientRect();
  return {
    x: tabBox.left - listBox.left - list.clientLeft + list.scrollLeft,
    width: tabBox.width,
  };
}

function measureActive(list: HTMLElement): Pill | null {
  const tab = list.querySelector<HTMLElement>("[aria-current='page']");
  return tab ? measureTab(list, tab) : null;
}

export function SectionTabs({
  pages,
  label,
}: {
  pages: NavPage[];
  label: string;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const key = pages.map((page) => page.href).join("|");
  const [pill, setPill] = useState<Pill | null>(
    () => (lastPill?.key === key ? lastPill.pill : null),
  );

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const to = measureActive(list);
    if (!to) return;

    const now = Date.now();
    const from =
      fromPill && fromPill.key === key && fromPill.until > now
        ? fromPill.pill
        : lastPill?.key === key
          ? lastPill.pill
          : to;

    if (lastPill?.key === key) {
      fromPill = { key, pill: lastPill.pill, until: now + 800 };
    }
    lastPill = { key, pill: to };

    if (reduce || (Math.abs(from.x - to.x) < 1 && Math.abs(from.width - to.width) < 1)) {
      setPill(to);
      return;
    }

    setPill(from);
    const id = requestAnimationFrame(() => setPill(to));
    return () => cancelAnimationFrame(id);
  }, [pathname, key, reduce]);

  return (
    <nav aria-label={label} className="mt-7">
      <ul ref={listRef} className="tabs relative isolate">
        {pill && (
          <motion.span
            aria-hidden
            className="nav-pill-active pointer-events-none absolute top-1 bottom-1 left-0 z-0"
            initial={false}
            animate={{ x: pill.x, width: pill.width }}
            transition={reduce ? { duration: 0 } : navPillTransition}
            style={{ originX: 0 }}
          />
        )}
        {pages.map((page) => {
          const active = pathname === page.href;
          return (
            <li key={page.href} className="relative z-10 flex">
              <Link
                href={page.href}
                className="tab tab-motion"
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  if (page.href === pathname) return;
                  const list = listRef.current;
                  const current = pill ?? (list ? measureActive(list) : null);
                  if (!current) return;
                  fromPill = { key, pill: current, until: Date.now() + 800 };
                  lastPill = { key, pill: current };
                }}
              >
                <span className="relative z-10">{page.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

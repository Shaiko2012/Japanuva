"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InkPill, useSlidingPill } from "@/hooks/useSlidingPill";
import type { NavPage } from "@/data/navigation";

export function SectionTabs({
  pages,
  label,
}: {
  pages: NavPage[];
  label: string;
}) {
  const pathname = usePathname();
  const key = pages.map((page) => page.href).join("|");
  const { listRef, pill, reduce, snapshot } = useSlidingPill(
    pathname,
    "[aria-current='page']",
    key,
  );

  return (
    <nav aria-label={label} className="mt-7">
      <ul ref={listRef} className="tabs relative isolate">
        <InkPill box={pill} reduce={reduce} />
        {pages.map((page) => {
          const active = pathname === page.href;
          return (
            <li key={page.href} className="relative z-10 flex min-w-0 flex-1">
              <Link
                href={page.href}
                className="tab tab-motion w-full justify-center"
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  if (page.href !== pathname) snapshot();
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

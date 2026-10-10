"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { sectionForPath } from "@/data/navigation";
import { cn } from "@/lib/utils";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { RiseIn } from "./Motion";

interface PageHeaderProps {
  kicker?: string;
  title: string;
  lede?: ReactNode;
  /** Primary/secondary actions aligned to the end of the title row. */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Page opener: kicker, serif title, lede, then the section's sub-page tabs. */
export function PageHeader({
  kicker,
  title,
  lede,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const pathname = usePathname();
  const section = sectionForPath(pathname);

  return (
    <header className={cn("mb-8 pt-6 sm:mb-10 sm:pt-10", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0 max-w-3xl">
          {kicker && (
            <RiseIn delay={0.02}>
              <p className="t-kicker">{kicker}</p>
            </RiseIn>
          )}
          <RiseIn delay={0.08} y={16}>
            <h1 className="t-h1 mt-3">{title}</h1>
          </RiseIn>
          {lede && (
            <RiseIn delay={0.16}>
              <div className="t-lede mt-3 max-w-2xl">{lede}</div>
            </RiseIn>
          )}
        </div>
        {actions && (
          <RiseIn delay={0.12}>
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          </RiseIn>
        )}
      </div>
      {children}
      {section.pages && (
        <SectionTabs
          pages={section.pages}
          label={`עמודים ב${section.label}`}
        />
      )}
    </header>
  );
}

export function SectionHead({
  title,
  meta,
  id,
  as: Tag = "h2",
}: {
  title: string;
  meta?: ReactNode;
  id?: string;
  as?: "h2" | "h3";
}) {
  return (
    <div className="section-head">
      <Tag id={id} className={Tag === "h2" ? "t-h2" : "t-h3"}>
        {title}
      </Tag>
      {meta && <div className="t-meta">{meta}</div>}
    </div>
  );
}

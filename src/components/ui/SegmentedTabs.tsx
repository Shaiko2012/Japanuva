"use client";

import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { tabPillMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type SegmentedTabItem<T extends string = string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
};

type SegmentedTabsProps<T extends string> = {
  items: readonly SegmentedTabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Unique layoutId per tab group so pills don't cross-animate */
  layoutId: string;
  "aria-label": string;
  className?: string;
  /** Equal-width grid (default) vs wrapping chip row */
  equalWidth?: boolean;
  size?: "sm" | "md";
};

/**
 * Segmented control with a sliding ink pill (layoutId), matching the nav mint pill motion.
 * RTL-safe: Framer layoutId tracks element geometry, so the pill slides correctly in RTL.
 */
export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  layoutId,
  "aria-label": ariaLabel,
  className,
  equalWidth = true,
  size = "md",
}: SegmentedTabsProps<T>) {
  const reduceMotion = useReducedMotion();
  const transition = tabPillMotion(reduceMotion);

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative",
        equalWidth
          ? "grid gap-1"
          : "flex flex-wrap gap-1.5",
        equalWidth && items.length === 2 && "grid-cols-2",
        equalWidth && items.length === 3 && "grid-cols-3",
        equalWidth && items.length > 3 && "grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
        className,
      )}
    >
      {items.map((item) => {
        const active = value === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative inline-flex min-w-0 items-center justify-center gap-1.5 overflow-hidden font-semibold transition-colors",
              size === "md" && "min-h-11 rounded-full px-3 py-2.5 text-sm",
              size === "sm" && "min-h-8 rounded-full px-2.5 py-1.5 text-xs",
              active
                ? "text-background dark:text-[#141210]"
                : "text-muted hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-foreground shadow-sm dark:bg-yellow dark:shadow-[0_2px_8px_rgba(173,235,179,0.25)]"
                transition={transition}
                aria-hidden
              />
            )}
            {Icon ? (
              <Icon
                className={cn(
                  "relative z-10 shrink-0",
                  size === "md" ? "h-4 w-4" : "h-3.5 w-3.5",
                )}
                aria-hidden
              />
            ) : null}
            <span className="relative z-10 min-w-0 truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

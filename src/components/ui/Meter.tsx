"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { progressTransformOrigin, softEase } from "@/lib/motion";

/** Flat proportional bar. Decorative unless `label` is given. */
export function Meter({
  value,
  max,
  label,
  tone = "ink",
  className,
}: {
  value: number;
  max: number;
  label?: string;
  tone?: "ink" | "moss" | "vermilion";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const color =
    tone === "moss"
      ? "var(--moss)"
      : tone === "vermilion"
        ? "var(--vermilion)"
        : "var(--ink)";

  return (
    <div
      className={cn("meter", className)}
      role={label ? "progressbar" : undefined}
      aria-label={label}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? max : undefined}
      aria-valuenow={label ? value : undefined}
      aria-hidden={label ? undefined : true}
    >
      <motion.span
        style={{
          width: "100%",
          background: color,
          transformOrigin: progressTransformOrigin,
        }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: pct }}
        transition={{ duration: reduce ? 0 : 0.7, ease: softEase }}
      />
    </div>
  );
}

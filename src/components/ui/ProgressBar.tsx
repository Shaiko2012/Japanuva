"use client";

import { motion, useReducedMotion } from "framer-motion";
import { progressTransformOrigin, softProgressProps } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  label,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const reduceMotion = useReducedMotion();
  const fill = softProgressProps(pct, reduceMotion);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-foreground/10">
        <motion.div
          className={cn(
            "h-full w-full origin-right rounded-full bg-gradient-to-l from-accent to-apricot shadow-[0_0_16px_var(--glow)]",
            barClassName,
          )}
          style={{ transformOrigin: progressTransformOrigin }}
          {...fill}
        />
      </div>
    </div>
  );
}

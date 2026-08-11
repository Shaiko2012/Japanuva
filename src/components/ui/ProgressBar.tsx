"use client";

import { motion } from "framer-motion";
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
            "h-full rounded-full bg-gradient-to-l from-accent to-apricot shadow-[0_0_16px_var(--glow)]",
            barClassName,
          )}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

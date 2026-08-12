"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { softInteractiveProps } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  interactive?: boolean;
}

export function GlassCard({
  children,
  className,
  strong,
  interactive = false,
}: GlassCardProps) {
  const reduceMotion = useReducedMotion();
  const interactiveMotion = interactive
    ? softInteractiveProps(reduceMotion)
    : {};

  return (
    <motion.div
      {...interactiveMotion}
      className={cn(
        strong ? "glass-strong" : "glass",
        interactive && "glass-interactive",
        "rounded-[1.5rem] p-3.5 sm:p-4 min-w-0 max-w-full",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

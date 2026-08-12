"use client";

import { CloudMoon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { softHover, softSpring, softTap } from "@/lib/motion";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-11 w-11 rounded-full border border-border bg-surface-strong shadow-[var(--card-shadow)]" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      type="button"
      whileHover={reduceMotion ? undefined : softHover}
      whileTap={reduceMotion ? undefined : softTap}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-strong text-foreground shadow-[var(--card-shadow)] transition hover:border-yellow/50 hover:shadow-[var(--card-shadow-hover)]"
      aria-label={isDark ? "מצב בהיר" : "מצב ערב"}
    >
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={
          reduceMotion
            ? { opacity: 0 }
            : { rotate: -40, opacity: 0, scale: 0.6 }
        }
        animate={
          reduceMotion
            ? { opacity: 1 }
            : { rotate: 0, opacity: 1, scale: 1 }
        }
        transition={softSpring}
      >
        {isDark ? (
          <CloudMoon className="h-4 w-4 text-yellow" />
        ) : (
          <Sun className="h-4 w-4 text-foreground" />
        )}
      </motion.span>
    </motion.button>
  );
}

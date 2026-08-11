"use client";

import { CloudMoon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-full border border-border bg-surface" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:border-olive/50 hover:bg-parchment-deep hover:text-olive"
      aria-label={isDark ? "מצב בהיר" : "מצב ערב"}
    >
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -40, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
      >
        {isDark ? (
          <CloudMoon className="h-4 w-4 text-amber" />
        ) : (
          <Sun className="h-4 w-4 text-amber" />
        )}
      </motion.span>
    </motion.button>
  );
}

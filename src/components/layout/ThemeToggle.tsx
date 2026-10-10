"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useHydrated } from "@/hooks/useHydrated";
import { softSpring } from "@/lib/motion";

function applyThemeClass(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHydrated();
  const reduceMotion = useReducedMotion();

  if (!mounted) {
    return <span className="inline-block h-11 w-11" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    const root = document.documentElement;

    const apply = () => {
      root.classList.add("theme-switching");
      applyThemeClass(next);
      flushSync(() => setTheme(next));
    };

    const done = () => {
      window.setTimeout(() => root.classList.remove("theme-switching"), 40);
    };

    if (!reduceMotion && typeof document.startViewTransition === "function") {
      const vt = document.startViewTransition(apply);
      void vt.finished.finally(done);
      return;
    }

    apply();
    done();
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-icon text-foreground hover:text-yellow"
      aria-label={isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
      title={isDark ? "מצב בהיר" : "מצב כהה"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={reduceMotion ? { opacity: 0 } : { rotate: -80, scale: 0.5, opacity: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { rotate: 0, scale: 1, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { rotate: 80, scale: 0.5, opacity: 0 }}
          transition={reduceMotion ? { duration: 0.12 } : softSpring}
          className="inline-flex"
        >
          {isDark ? <Sun aria-hidden /> : <Moon aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

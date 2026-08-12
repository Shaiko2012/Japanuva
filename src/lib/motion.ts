"use client";

import { useReducedMotion, type Transition, type Variants } from "framer-motion";

/** Soft cubic ease — calm settle, no overshoot */
export const softEase = [0.22, 1, 0.36, 1] as const;

export const softDuration = 0.42;

/** Prefer for scroll-triggered card lists */
export const softViewport = { once: true, amount: 0.2 } as const;

/** Sliding mint nav pill — springy but calm */
export const navPillTransition: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.85,
};

/** Sliding ink tab pill (list|map, auth mode, filters) — same feel as nav */
export const tabPillTransition: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.85,
};

/** Instant when reduced motion; otherwise spring slide */
export function tabPillMotion(
  reduceMotion: boolean | null | undefined,
): Transition {
  if (reduceMotion) return { duration: 0 };
  return tabPillTransition;
}

/** Gentle spring for nav drawers / modals */
export const softSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  mass: 0.9,
};

/** Slightly softer spring for modal panels */
export const softModalSpring: Transition = {
  type: "spring",
  stiffness: 340,
  damping: 36,
  mass: 0.95,
};

/** Gentle card / chip hover (scale + settle) */
export const softHover = {
  scale: 1.015,
  y: -2,
  transition: { duration: 0.28, ease: softEase },
} as const;

export const softTap = {
  scale: 0.97,
  transition: { duration: 0.15, ease: softEase },
} as const;

/** Logo / icon mark — tiny lift, no travel spam */
export const softLogoHover = {
  scale: 1.06,
  rotate: -4,
  transition: { duration: 0.28, ease: softEase },
} as const;

export function softStagger(index: number, step = 0.06, max = 0.4) {
  return Math.min(index * step, max);
}

/** Hero cascade: title → meta → countdown → widgets */
export function heroCascadeDelay(index: number, base = 0.04, step = 0.07) {
  return base + index * step;
}

export function softTransition(delay = 0): Transition {
  return {
    duration: softDuration,
    ease: softEase,
    delay,
  };
}

type SoftEntranceOpts = {
  delay?: number;
  /** Upward settle distance in px (default 10) */
  y?: number;
};

/**
 * Shared fade + slight upward settle for cards/panels.
 * Honors prefers-reduced-motion (opacity only, no travel).
 */
export function softEntranceProps(
  reduceMotion: boolean | null | undefined,
  opts: SoftEntranceOpts = {},
) {
  const delay = opts.delay ?? 0;
  const y = opts.y ?? 10;

  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: softTransition(delay),
    };
  }

  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: Math.min(8, y) },
    transition: softTransition(delay),
  };
}

/** Soft expand/collapse for accordions (height + opacity) */
export function softExpandProps(reduceMotion: boolean | null | undefined) {
  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: softTransition(),
    };
  }

  return {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: softTransition(),
  };
}

/** Parent variants for staggered children */
export function softStaggerContainer(
  staggerChildren = 0.06,
  delayChildren = 0,
): Variants {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren, delayChildren },
    },
  };
}

/** Child variants paired with softStaggerContainer */
export function softStaggerItem(
  reduceMotion: boolean | null | undefined,
  y = 10,
): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: softTransition() },
    };
  }

  return {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: softTransition(),
    },
  };
}

/** Hover + tap for interactive cards/pills (skipped when reduced motion) */
export function softInteractiveProps(
  reduceMotion: boolean | null | undefined,
) {
  if (reduceMotion) return {};
  return {
    whileHover: softHover,
    whileTap: softTap,
  } as const;
}

/** Tap-only for dense controls / CTAs */
export function softTapProps(reduceMotion: boolean | null | undefined) {
  if (reduceMotion) return {};
  return { whileTap: softTap } as const;
}

/** Hook wrapper around softEntranceProps */
export function useSoftEntrance(opts: SoftEntranceOpts = {}) {
  const reduce = useReducedMotion();
  return softEntranceProps(reduce, opts);
}

/** Hook: interactive hover/tap that respects reduced motion */
export function useSoftInteractive() {
  const reduce = useReducedMotion();
  return softInteractiveProps(reduce);
}

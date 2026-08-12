"use client";

import { useReducedMotion, type Transition, type Variants } from "framer-motion";

/**
 * High-refresh (120Hz) motion defaults.
 * Prefer animating only `transform` + `opacity` — avoid height/width/top/left/margin.
 * `layout` / `layoutId` are reserved for sliding pills (nav, SegmentedTabs).
 */

/** Soft cubic ease — calm settle, no overshoot; samples cleanly at 120Hz */
export const softEase = [0.22, 1, 0.36, 1] as const;

/** Snappier than a long fade; still readable on 60Hz */
export const softDuration = 0.32;

/** Prefer for scroll-triggered card lists */
export const softViewport = { once: true, amount: 0.2 } as const;

/** Sliding mint nav pill — springy but calm (layoutId OK) */
export const navPillTransition: Transition = {
  type: "spring",
  stiffness: 480,
  damping: 38,
  mass: 0.75,
};

/** Sliding ink tab pill (list|map, auth mode, filters) — same feel as nav */
export const tabPillTransition: Transition = {
  type: "spring",
  stiffness: 480,
  damping: 38,
  mass: 0.75,
};

/** Instant when reduced motion; otherwise spring slide */
export function tabPillMotion(
  reduceMotion: boolean | null | undefined,
): Transition {
  if (reduceMotion) return { duration: 0 };
  return tabPillTransition;
}

/** Gentle spring for icon swaps / light panels (transform only) */
export const softSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 36,
  mass: 0.8,
};

/** Slightly softer spring for modal panels (y + opacity + scale) */
export const softModalSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 38,
  mass: 0.85,
};

/** Gentle card / chip hover (scale + settle) */
export const softHover = {
  scale: 1.015,
  y: -2,
  transition: { duration: 0.22, ease: softEase },
} as const;

export const softTap = {
  scale: 0.97,
  transition: { duration: 0.12, ease: softEase },
} as const;

/** Logo / icon mark — tiny lift, no travel spam */
export const softLogoHover = {
  scale: 1.06,
  rotate: -4,
  transition: { duration: 0.22, ease: softEase },
} as const;

export function softStagger(index: number, step = 0.05, max = 0.32) {
  return Math.min(index * step, max);
}

/** Hero cascade: title → meta → countdown → widgets */
export function heroCascadeDelay(index: number, base = 0.03, step = 0.055) {
  return base + index * step;
}

export function softTransition(delay = 0): Transition {
  return {
    duration: softDuration,
    ease: softEase,
    delay,
  };
}

/** Modal/sheet dim layer — fast + smooth (synced with panel open) */
export const softBackdropDuration = 0.12;

export function softBackdropTransition(): Transition {
  return {
    duration: softBackdropDuration,
    ease: [0.16, 1, 0.3, 1] as const,
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
 * GPU-friendly: opacity + transform only.
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

/**
 * Mobile nav open — animates height so page content is pushed down (not a teleport fade).
 */
export function softMenuProps(reduceMotion: boolean | null | undefined) {
  if (reduceMotion) {
    return {
      initial: { height: 0, opacity: 0 },
      animate: { height: "auto", opacity: 1 },
      exit: { height: 0, opacity: 0 },
      transition: softTransition(),
    };
  }

  return {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: {
      height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const },
      opacity: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const },
    },
  };
}

/**
 * Soft expand/collapse for accordions.
 * GPU-friendly: opacity + y (+ slight scale) — avoids animating `height: auto`.
 * Tradeoff: parent box size changes instantly; siblings may jump unless
 * they use `layout="position"` for filter reordering (keep layout off expand itself).
 */
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
    initial: { opacity: 0, y: -6, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -4, scale: 0.99 },
    transition: softTransition(),
  };
}

/**
 * Progress / meter fill via scaleX (transform) instead of width.
 * Use with `style={{ transformOrigin: "inline-start" }}` for RTL-safe growth.
 */
export function softProgressProps(
  pct: number,
  reduceMotion: boolean | null | undefined,
) {
  const clamped = Math.min(1, Math.max(0, pct / 100));
  if (reduceMotion) {
    return {
      initial: false as const,
      animate: { scaleX: clamped },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { scaleX: 0 },
    animate: { scaleX: clamped },
    transition: { duration: 0.55, ease: softEase },
  };
}

/** Parent variants for staggered children */
export function softStaggerContainer(
  staggerChildren = 0.05,
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

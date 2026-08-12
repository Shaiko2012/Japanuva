"use client";

import { useReducedMotion, type Transition } from "framer-motion";

/** Soft cubic ease — calm settle, no overshoot */
export const softEase = [0.22, 1, 0.36, 1] as const;

export const softDuration = 0.42;

/** Prefer for scroll-triggered card lists */
export const softViewport = { once: true, amount: 0.2 } as const;

export function softStagger(index: number, step = 0.06, max = 0.4) {
  return Math.min(index * step, max);
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

/** Hook wrapper around softEntranceProps */
export function useSoftEntrance(opts: SoftEntranceOpts = {}) {
  const reduce = useReducedMotion();
  return softEntranceProps(reduce, opts);
}

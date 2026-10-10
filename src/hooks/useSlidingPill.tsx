"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { navPillTransition } from "@/lib/motion";

export type SlidingPillBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const pillCache = new Map<string, SlidingPillBox>();
let frozenFrom: { key: string; box: SlidingPillBox; until: number } | null =
  null;

function measureTab(list: HTMLElement, selector: string): SlidingPillBox | null {
  const tab = list.querySelector<HTMLElement>(selector);
  if (!tab) return null;
  const listBox = list.getBoundingClientRect();
  const tabBox = tab.getBoundingClientRect();
  return {
    x: tabBox.left - listBox.left - list.clientLeft + list.scrollLeft,
    y: tabBox.top - listBox.top - list.clientTop + list.scrollTop,
    width: tabBox.width,
    height: tabBox.height,
  };
}

function boxesClose(a: SlidingPillBox, b: SlidingPillBox) {
  return (
    Math.abs(a.x - b.x) < 1 &&
    Math.abs(a.y - b.y) < 1 &&
    Math.abs(a.width - b.width) < 1 &&
    Math.abs(a.height - b.height) < 1
  );
}

function readFrozen(persistKey: string | undefined): SlidingPillBox | null {
  if (!persistKey) return null;
  if (frozenFrom && frozenFrom.key === persistKey && frozenFrom.until > Date.now()) {
    return frozenFrom.box;
  }
  return pillCache.get(persistKey) ?? null;
}

export function InkPill({
  box,
  reduce,
}: {
  box: SlidingPillBox | null;
  reduce: boolean | null;
}) {
  if (!box) return null;
  return (
    <motion.span
      aria-hidden
      className="nav-pill-active pointer-events-none absolute left-0 top-0 z-0"
      initial={false}
      animate={{ x: box.x, width: box.width }}
      transition={
        reduce
          ? { duration: 0 }
          : { x: navPillTransition, width: navPillTransition }
      }
      style={{ top: box.y, height: box.height, originX: 0 }}
    />
  );
}

export function useSlidingPill(
  activeKey: string,
  selector = "[aria-current='page']",
  persistKey?: string,
) {
  const listRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const [pill, setPill] = useState<SlidingPillBox | null>(() =>
    readFrozen(persistKey),
  );

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const persist = (box: SlidingPillBox) => {
      if (persistKey) pillCache.set(persistKey, box);
    };

    const to = measureTab(list, selector);
    if (!to) return undefined;

    const from = readFrozen(persistKey);
    const skipSlide = !from || reduce || boxesClose(from, to);

    let frame = 0;
    let sliding = !skipSlide;
    if (skipSlide) {
      setPill(to);
      persist(to);
    } else {
      setPill(from);
      frame = requestAnimationFrame(() => {
        setPill(to);
        persist(to);
        sliding = false;
      });
    }

    const ro = new ResizeObserver(() => {
      if (sliding) return;
      const box = measureTab(list, selector);
      if (!box) return;
      setPill(box);
      persist(box);
    });
    ro.observe(list);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [activeKey, selector, persistKey, reduce]);

  const snapshot = useCallback(() => {
    const list = listRef.current;
    if (!persistKey || !list) return;
    const box = measureTab(list, selector);
    if (!box) return;
    frozenFrom = { key: persistKey, box, until: Date.now() + 800 };
    pillCache.set(persistKey, box);
  }, [persistKey, selector]);

  return { listRef, pill, reduce, snapshot };
}

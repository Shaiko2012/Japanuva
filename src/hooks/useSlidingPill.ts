"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export type SlidingPillBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function useSlidingPill(activeKey: string, selector = "[aria-current='page']") {
  const listRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const [pill, setPill] = useState<SlidingPillBox | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
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
    };

    const next = measure();
    if (next) setPill(next);

    const ro = new ResizeObserver(() => {
      const box = measure();
      if (box) setPill(box);
    });
    ro.observe(list);
    return () => ro.disconnect();
  }, [activeKey, selector]);

  return { listRef, pill, reduce };
}

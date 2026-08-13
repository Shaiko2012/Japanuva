"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Mouse-wheel smoothing matching the SmoothScroll extension profile:
 * step 100px · animation 700ms · accel 3× / 50ms · pulse scale 4 ·
 * keyboard 100px · easing on · touchpad off (native).
 * Same physics on the page and inside dialogs / sheets / nested lists.
 */

const STEP_PX = 100;
const ANIMATION_MS = 700;
const ACCELERATION_MAX = 3;
const ACCELERATION_DELTA_MS = 50;
const PULSE_SCALE = 4;
const ARROW_STEP_PX = 100;
const KEYBOARD = true;

const RICH_QUERY = "(prefers-reduced-motion: no-preference)";

type ScrollRoot = Window | HTMLElement;

type Queued = {
  y: number;
  lastY: number;
  start: number;
};

type Engine = {
  queue: Queued[];
  raf: number;
  lastScrollAt: number;
  direction: number;
};

function pulse(t: number) {
  if (t >= 1) return 1;
  if (t <= 0) return 0;
  let x = t * PULSE_SCALE;
  let val: number;
  if (x < 1) {
    val = x - (1 - Math.exp(-x));
  } else {
    const start = Math.exp(-1);
    x -= 1;
    val = start + (1 - Math.exp(-x)) * (1 - start);
  }
  return val / pulseRaw(1);
}

function pulseRaw(t: number) {
  let x = t * PULSE_SCALE;
  if (x < 1) return x - (1 - Math.exp(-x));
  const start = Math.exp(-1);
  x -= 1;
  return start + (1 - Math.exp(-x)) * (1 - start);
}

function isTrackpad(event: WheelEvent) {
  if (event.ctrlKey) return true;
  if (event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) return false;
  const absY = Math.abs(event.deltaY);
  const absX = Math.abs(event.deltaX);
  if (absX > absY && absY < 50) return true;
  return absY > 0 && absY < 50;
}

function isEditable(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return el.isContentEditable;
}

function isWindow(root: ScrollRoot): root is Window {
  return root === window;
}

function scrollTopOf(root: ScrollRoot) {
  return isWindow(root) ? window.scrollY : root.scrollTop;
}

function scrollMaxOf(root: ScrollRoot) {
  if (isWindow(root)) {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }
  return Math.max(0, root.scrollHeight - root.clientHeight);
}

function addScroll(root: ScrollRoot, dy: number) {
  if (isWindow(root)) window.scrollBy(0, dy);
  else root.scrollTop += dy;
}

function isMarkedScroller(node: HTMLElement) {
  return (
    node.hasAttribute("data-lenis-prevent") ||
    node.hasAttribute("data-lenis-prevent-wheel")
  );
}

function isVerticalScroller(node: HTMLElement) {
  if (node.hasAttribute("data-lenis-prevent-horizontal")) return false;
  const { overflowY } = getComputedStyle(node);
  return overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
}

/** Innermost vertical pane (modal/list) or the window. */
function findScrollRoot(start: EventTarget | null, deltaY: number): ScrollRoot {
  let node: Node | null = start instanceof Node ? start : null;
  while (node && node !== document.body && node !== document.documentElement) {
    if (node instanceof HTMLElement) {
      const marked = isMarkedScroller(node);
      const pane = marked || isVerticalScroller(node);
      if (pane) {
        const max = node.scrollHeight - node.clientHeight;
        if (max > 1) {
          const room = deltaY > 0 ? max - node.scrollTop > 1 : node.scrollTop > 1;
          if (room || marked) return node;
        }
      }
    }
    node = node.parentElement;
  }

  const dialog = document.querySelector('[role="dialog"]');
  if (dialog instanceof HTMLElement) {
    const pane =
      dialog.querySelector<HTMLElement>("[data-lenis-prevent]") ?? dialog;
    if (pane.scrollHeight - pane.clientHeight > 1) return pane;
  }

  return window;
}

function pageTravel(root: ScrollRoot) {
  const view = isWindow(root) ? window.innerHeight : root.clientHeight;
  return Math.max(160, Math.round(view * 0.86));
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia(RICH_QUERY);
    const html = document.documentElement;
    let enabled = false;
    const engines = new Map<ScrollRoot, Engine>();
    let atmRaf = 0;

    const syncAtmosphere = () => {
      const y = window.scrollY;
      const max = Math.max(1, scrollMaxOf(window));
      html.style.setProperty("--scroll-y", y.toFixed(1));
      html.style.setProperty("--scroll-progress", Math.min(1, y / max).toFixed(4));
    };

    const onNativeScroll = () => {
      if (atmRaf) return;
      atmRaf = requestAnimationFrame(() => {
        atmRaf = 0;
        syncAtmosphere();
      });
    };

    const engineOf = (root: ScrollRoot) => {
      let eng = engines.get(root);
      if (!eng) {
        eng = { queue: [], raf: 0, lastScrollAt: 0, direction: 0 };
        engines.set(root, eng);
      }
      return eng;
    };

    const tick = (root: ScrollRoot, now: number) => {
      const eng = engineOf(root);
      let dy = 0;
      for (let i = 0; i < eng.queue.length; i++) {
        const item = eng.queue[i];
        const elapsed = now - item.start;
        const finished = elapsed >= ANIMATION_MS;
        let pos = finished ? 1 : elapsed / ANIMATION_MS;
        pos = pulse(pos);
        const y = item.y * pos - item.lastY;
        dy += y;
        item.lastY += y;
        if (finished) {
          eng.queue.splice(i, 1);
          i -= 1;
        }
      }
      if (dy) addScroll(root, dy);
      if (isWindow(root)) syncAtmosphere();
      if (eng.queue.length) eng.raf = requestAnimationFrame((t) => tick(root, t));
      else eng.raf = 0;
    };

    const enqueue = (root: ScrollRoot, rawY: number) => {
      const eng = engineOf(root);
      const sign = rawY > 0 ? 1 : -1;
      if (eng.direction !== sign) {
        eng.queue = [];
        eng.lastScrollAt = 0;
        eng.direction = sign;
      }

      let y = rawY;
      const now = performance.now();
      const elapsed = now - eng.lastScrollAt;
      if (eng.lastScrollAt && elapsed < ACCELERATION_DELTA_MS) {
        const factor = Math.min(ACCELERATION_MAX, (1 + 50 / Math.max(elapsed, 1)) / 2);
        if (factor > 1) y *= factor;
      }
      eng.lastScrollAt = now;

      const yNow = scrollTopOf(root);
      const limit = scrollMaxOf(root);
      if ((y > 0 && yNow >= limit - 0.5) || (y < 0 && yNow <= 0.5)) return;

      eng.queue.push({
        y,
        lastY: y < 0 ? 0.99 : -0.99,
        start: now,
      });
      if (!eng.raf) eng.raf = requestAnimationFrame((t) => tick(root, t));
    };

    const onWheel = (event: WheelEvent) => {
      if (!enabled || event.defaultPrevented || event.ctrlKey) return;
      if (isTrackpad(event)) return;
      if (
        event.target instanceof Element &&
        event.target.closest(".leaflet-container, .gm-style")
      ) {
        return;
      }

      const sign = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
      if (!sign) return;

      const root = findScrollRoot(event.target, event.deltaY);
      event.preventDefault();
      enqueue(root, sign * STEP_PX);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!enabled || !KEYBOARD || event.defaultPrevented) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditable(event.target)) return;

      const probe =
        event.key === "ArrowUp" || event.key === "PageUp" || event.key === "Home"
          ? -1
          : 1;
      const root = findScrollRoot(event.target, probe);

      let y = 0;
      switch (event.key) {
        case "ArrowDown":
          y = ARROW_STEP_PX;
          break;
        case "ArrowUp":
          y = -ARROW_STEP_PX;
          break;
        case "PageDown":
          y = pageTravel(root);
          break;
        case "PageUp":
          y = -pageTravel(root);
          break;
        case " ":
          y = event.shiftKey ? -pageTravel(root) : pageTravel(root);
          break;
        case "Home":
          y = -scrollTopOf(root);
          break;
        case "End":
          y = scrollMaxOf(root) - scrollTopOf(root);
          break;
        default:
          return;
      }

      if (!y) return;
      event.preventDefault();
      enqueue(root, y);
    };

    const stopAll = () => {
      engines.forEach((eng) => {
        eng.queue = [];
        if (eng.raf) cancelAnimationFrame(eng.raf);
        eng.raf = 0;
      });
      engines.clear();
    };

    const apply = () => {
      const next = media.matches;
      if (next === enabled) return;
      enabled = next;
      html.classList.toggle("premium-scroll", enabled);
      if (!enabled) stopAll();
    };

    apply();
    syncAtmosphere();
    media.addEventListener("change", apply);
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("scroll", onNativeScroll, { passive: true });

    return () => {
      enabled = false;
      media.removeEventListener("change", apply);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onNativeScroll);
      stopAll();
      if (atmRaf) cancelAnimationFrame(atmRaf);
      html.classList.remove("premium-scroll");
      html.style.removeProperty("--scroll-y");
      html.style.removeProperty("--scroll-progress");
    };
  }, []);

  return children;
}

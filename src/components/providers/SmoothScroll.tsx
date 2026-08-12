"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [rich, setRich] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(
      "(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setRich(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  if (!rich) return children;

  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.075,
        duration: 1.2,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.88,
        touchMultiplier: 1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      {children}
    </ReactLenis>
  );
}

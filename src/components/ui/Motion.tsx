"use client";

import { type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import {
  navPillTransition,
  softEase,
  softEntranceProps,
  softInteractiveProps,
  softStagger,
  softTransition,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Fade + rise when the block enters the viewport. */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 16,
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
} & Omit<HTMLMotionProps<"div">, "children">) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      {...softEntranceProps(reduce, { delay, y })}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Immediate page-load cascade (not wait-for-scroll). */
export function RiseIn({
  children,
  className,
  delay = 0,
  y = 18,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: softEase, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  step = 0.07,
}: {
  children: ReactNode;
  className?: string;
  step?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -8% 0px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduce ? 0 : step,
            delayChildren: reduce ? 0 : 0.04,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={
        reduce
          ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
          : {
              hidden: { opacity: 0, y: 14, scale: 0.98 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.42, ease: softEase },
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}

/** Hover lift + tap squash for cards and chips. */
export function Pressable({
  children,
  className,
  ...rest
}: { children: ReactNode } & HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      {...softInteractiveProps(reduce)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Per-character flip good for clocks and counters. */
export function FlipDigits({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={cn("inline-flex tabular-nums", className)} dir="ltr">
      {value.split("").map((ch, i) => (
        <span key={i} className="relative inline-block overflow-hidden leading-none">
          {reduce ? (
            ch
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={ch}
                initial={{ y: "55%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-55%", opacity: 0 }}
                transition={{ duration: 0.22, ease: softEase }}
                className="inline-block"
              >
                {ch}
              </motion.span>
            </AnimatePresence>
          )}
        </span>
      ))}
    </span>
  );
}

/** Sliding mint pill for section tabs, auth mode, calendar range. */
export function SlidingPill({
  layoutId,
  className,
}: {
  layoutId: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      layoutId={layoutId}
      className={cn("nav-pill-active absolute inset-0", className)}
      transition={reduce ? { duration: 0 } : navPillTransition}
    />
  );
}

export { softStagger, softTransition };

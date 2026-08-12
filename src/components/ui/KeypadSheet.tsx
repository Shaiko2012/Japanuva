"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { X } from "lucide-react";
import {
  softBackdropTransition,
  softModalSpring,
  softTransition,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

interface KeypadSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const BACKDROP_BLUR = "blur(5px)";

const rootVariants: Variants = {
  open: { transition: { when: "beforeChildren" } },
  closed: { transition: { when: "afterChildren" } },
};

export function KeypadSheet({
  open,
  title,
  onClose,
  children,
  className,
}: KeypadSheetProps) {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!mounted) return null;

  const backdropVariants: Variants = reduceMotion
    ? {
        open: { opacity: 1, transition: softBackdropTransition() },
        closed: { opacity: 0, transition: softBackdropTransition() },
      }
    : {
        open: {
          opacity: 1,
          backdropFilter: BACKDROP_BLUR,
          transition: {
            opacity: softBackdropTransition(),
            backdropFilter: { duration: 0.12, ease: [0.16, 1, 0.3, 1] },
          },
        },
        closed: {
          opacity: 0,
          backdropFilter: "blur(0px)",
          transition: {
            opacity: softBackdropTransition(),
            backdropFilter: { duration: 0.1, ease: [0.16, 1, 0.3, 1] },
          },
        },
      };

  const panelVariants: Variants = reduceMotion
    ? {
        open: { opacity: 1, transition: softTransition() },
        closed: { opacity: 0, transition: softTransition() },
      }
    : {
        open: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: softModalSpring,
        },
        closed: {
          opacity: 0,
          y: 48,
          scale: 0.98,
          transition: softTransition(),
        },
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="keypad-sheet"
          className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6"
          style={{
            paddingTop: "max(0.75rem, var(--safe-top))",
            paddingBottom: "max(0.75rem, var(--safe-bottom))",
            paddingInlineStart: "max(0.75rem, var(--safe-left))",
            paddingInlineEnd: "max(0.75rem, var(--safe-right))",
          }}
          initial="closed"
          animate="open"
          exit="closed"
          variants={rootVariants}
        >
          <motion.button
            type="button"
            aria-label="סגירה"
            onClick={onClose}
            variants={backdropVariants}
            className="absolute inset-0 bg-[#141210]/55"
            style={
              reduceMotion
                ? undefined
                : {
                    transition:
                      "backdrop-filter 0.25s ease, -webkit-backdrop-filter 0.25s ease",
                  }
            }
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={panelVariants}
            className={cn(
              "glass-strong relative z-10 flex max-h-[min(92dvh,40rem)] w-full max-w-sm flex-col overflow-hidden rounded-t-[1.75rem] rounded-b-3xl border border-border sm:max-h-[min(88dvh,40rem)] sm:rounded-3xl",
              "bg-[color-mix(in_srgb,var(--parchment)_92%,white)] shadow-[0_20px_48px_rgba(10,10,10,0.18)]",
              "dark:bg-[color-mix(in_srgb,var(--surface-strong)_96%,black)]",
              className,
            )}
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-foreground/15 sm:hidden" />
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-3 sm:pt-4">
              <h2 className="min-w-0 font-[family-name:var(--font-readex)] text-base font-bold text-foreground">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="touch-target flex shrink-0 items-center justify-center rounded-full border border-border bg-surface hover:border-yellow/50"
                aria-label="סגור"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,var(--safe-bottom))] pt-1 sm:pb-5">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

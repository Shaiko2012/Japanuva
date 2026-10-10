"use client";

import { useEffect, type ReactNode } from "react";
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
import { useHydrated } from "@/hooks/useHydrated";

interface KeypadSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

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
  const mounted = useHydrated();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!mounted) return null;

  const backdropVariants: Variants = {
    open: { opacity: 1, transition: softBackdropTransition() },
    closed: { opacity: 0, transition: softBackdropTransition() },
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
            tabIndex={-1}
            className="scrim absolute inset-0 cursor-default"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={panelVariants}
            className={cn(
              "relative z-10 flex max-h-[min(92dvh,40rem)] w-full max-w-sm flex-col overflow-hidden glass-strong rounded-t-3xl sm:max-h-[min(88dvh,40rem)] sm:rounded-2xl",
              className,
            )}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 pb-2 pt-3 sm:pt-4">
              <h2 className="t-h3 min-w-0">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-icon -me-2 text-muted hover:text-foreground"
                aria-label="סגירה"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div
              data-lenis-prevent
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,var(--safe-bottom))] pt-3 sm:pb-5"
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

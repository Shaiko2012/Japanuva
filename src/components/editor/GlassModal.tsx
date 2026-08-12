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

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

const BACKDROP_BLUR = "blur(5px)";

const rootVariants: Variants = {
  open: { transition: { when: "beforeChildren" } },
  closed: { transition: { when: "afterChildren" } },
};

export function GlassModal({ open, title, onClose, children, wide }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

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
          transition: { ...softModalSpring, delay: 0.02 },
        },
        closed: {
          opacity: 0,
          y: 14,
          transition: softTransition(),
        },
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="glass-modal"
          className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6"
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
            className="absolute inset-0 bg-[#141210]/65"
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
            className={`glass-strong relative z-10 max-h-[min(90dvh,90vh)] w-full overflow-y-auto rounded-3xl p-4 sm:p-6 ${
              wide ? "max-w-2xl" : "max-w-lg"
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-[family-name:var(--font-readex)] text-xl font-bold">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface hover:border-accent/40 sm:h-9 sm:w-9"
                aria-label="סגור"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

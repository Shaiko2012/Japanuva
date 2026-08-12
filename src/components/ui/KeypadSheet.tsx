"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { softModalSpring, softTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface KeypadSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

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

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6"
          style={{
            paddingTop: "max(0.75rem, var(--safe-top))",
            paddingBottom: "max(0.75rem, var(--safe-bottom))",
            paddingInlineStart: "max(0.75rem, var(--safe-left))",
            paddingInlineEnd: "max(0.75rem, var(--safe-right))",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={softTransition()}
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#141210]/55 backdrop-blur-[2px]"
            aria-label="סגירה"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 48, scale: 0.98 }
            }
            animate={
              reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 28, scale: 0.98 }
            }
            transition={
              reduceMotion ? softTransition() : softModalSpring
            }
            className={cn(
              "glass-strong relative z-10 w-full max-w-sm overflow-hidden rounded-t-[1.75rem] rounded-b-3xl border border-border sm:rounded-3xl",
              "bg-[color-mix(in_srgb,var(--parchment)_92%,white)] shadow-[0_20px_48px_rgba(10,10,10,0.18)]",
              "dark:bg-[color-mix(in_srgb,var(--surface-strong)_96%,black)]",
              className,
            )}
          >
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-foreground/15 sm:hidden" />
            <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3 sm:pt-4">
              <h2 className="font-[family-name:var(--font-readex)] text-base font-bold text-foreground">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface hover:border-yellow/50"
                aria-label="סגור"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 pb-[max(1rem,var(--safe-bottom))] pt-1 sm:pb-5">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { softEntranceProps, softTransition } from "@/lib/motion";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

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

  const panel = softEntranceProps(reduceMotion, { y: 12 });

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6"
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
            className="absolute inset-0 bg-[#0b0f17]/65 backdrop-blur-sm"
            aria-label="סגירה"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            {...panel}
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

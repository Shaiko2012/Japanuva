"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { softModalSpring } from "@/lib/motion";

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Pinned under the scrolling body. Put the dialog's actions here. */
  footer?: ReactNode;
  description?: string;
  wide?: boolean;
  /** Blocks Escape / backdrop dismissal (e.g. mandatory onboarding). */
  dismissible?: boolean;
  role?: "dialog" | "alertdialog";
}

export function Dialog({
  open,
  title,
  onClose,
  children,
  footer,
  description,
  wide,
  dismissible = true,
  role = "dialog",
}: DialogProps) {
  const mounted = useHydrated();
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  const closeRef = useRef({ onClose, dismissible });
  useEffect(() => {
    closeRef.current = { onClose, dismissible };
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeRef.current.dismissible) {
        closeRef.current.onClose();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!mounted) return null;

  const fade = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 28, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 16, scale: 0.98 },
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="dialog"
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          style={{
            paddingTop: "max(0.75rem, var(--safe-top))",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={dismissible ? onClose : undefined}
            className="scrim absolute inset-0 cursor-default"
          />
          <motion.div
            ref={panelRef}
            role={role}
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            {...fade}
            transition={reduceMotion ? { duration: 0.16 } : softModalSpring}
            className={cn(
              "relative z-10 flex max-h-[min(92dvh,52rem)] w-full flex-col glass-strong text-foreground outline-none",
              "rounded-t-3xl sm:rounded-2xl",
              wide ? "sm:max-w-2xl" : "sm:max-w-lg",
            )}
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 pb-4 pt-5 sm:px-6">
              <div className="min-w-0">
                <h2 id={titleId} className="t-h2">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-1.5 text-sm leading-6 text-muted">
                    {description}
                  </p>
                )}
              </div>
              {dismissible && (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-tertiary btn-icon -me-2 no-underline"
                  aria-label="סגירה"
                >
                  <X aria-hidden />
                </button>
              )}
            </header>
            <div
              data-lenis-prevent
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
            >
              {children}
            </div>
            {footer && (
              <footer
                className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-3 sm:px-6"
                style={{ paddingBottom: "max(0.75rem, var(--safe-bottom))" }}
              >
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

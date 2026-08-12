"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Lightbulb, ArrowLeft } from "lucide-react";
import { tipCards } from "@/data/tools";
import { softEntranceProps, softStagger, softTransition } from "@/lib/motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export function TipsGrid() {
  const [openId, setOpenId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-4">
      <GlassCard strong>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="glow-accent flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
              <Lightbulb className="h-5 w-5" />
            </span>
            <div>
              <h1 className="fluid-title font-[family-name:var(--font-readex)] font-bold">
                טיפים לטיול
              </h1>
              <p className="mt-1 text-sm text-muted">
                כרטיסי פעולה אינטראקטיביים — פתחו, קראו, ועברו לכלי הרלוונטי.
              </p>
            </div>
          </div>
          <StatusBadge tone="accent" label={`${tipCards.length} טיפים`} pulse />
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tipCards.map((card, index) => {
          const open = openId === card.id;
          return (
            <motion.article
              key={card.id}
              {...softEntranceProps(reduceMotion, {
                delay: softStagger(index, 0.06),
                y: 10,
              })}
              className="glass h-full rounded-2xl p-4"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : card.id)}
                className="w-full text-right"
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="mt-1 h-2.5 w-2.5 rounded-full"
                    style={{ background: card.accent }}
                  />
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted transition",
                      open && "rotate-180",
                    )}
                  />
                </div>
                <h2 className="mt-3 text-lg font-semibold">{card.title}</h2>
                <p className="mt-1 text-sm text-muted">{card.summary}</p>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={
                      reduceMotion
                        ? { opacity: 0 }
                        : { height: 0, opacity: 0 }
                    }
                    animate={
                      reduceMotion
                        ? { opacity: 1 }
                        : { height: "auto", opacity: 1 }
                    }
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { height: 0, opacity: 0 }
                    }
                    transition={softTransition()}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 border-t border-border pt-3 text-sm leading-6 text-foreground/90">
                      {card.body}
                    </p>
                    <Link
                      href={card.href}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                    >
                      עברו לכלי
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Lightbulb, ArrowLeft } from "lucide-react";
import { tipCards } from "@/data/tools";
import {
  softEase,
  softEntranceProps,
  softExpandProps,
  softInteractiveProps,
  softStagger,
  softTapProps,
} from "@/lib/motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function TipsGrid() {
  const [openId, setOpenId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const expandMotion = softExpandProps(reduceMotion);
  const cardMotion = softInteractiveProps(reduceMotion);
  const linkTap = softTapProps(reduceMotion);

  return (
    <div className="space-y-4">
      <GlassCard strong>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="glow-accent flex h-12 w-12 items-center justify-center rounded-2xl bg-nav-bg text-nav-fg">
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
              {...cardMotion}
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
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: softEase }}
                    className="inline-flex"
                  >
                    <ChevronDown className="h-4 w-4 text-muted" />
                  </motion.span>
                </div>
                <h2 className="mt-3 text-lg font-semibold">{card.title}</h2>
                <p className="mt-1 text-sm text-muted">{card.summary}</p>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    {...expandMotion}
                  >
                    <p className="mt-3 border-t border-border pt-3 text-sm leading-6 text-foreground/90">
                      {card.body}
                    </p>
                    <motion.div {...linkTap} className="inline-flex">
                      <Link
                        href={card.href}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                      >
                        עברו לכלי
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </Link>
                    </motion.div>
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

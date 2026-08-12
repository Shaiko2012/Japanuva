"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Lightbulb, ArrowLeft } from "lucide-react";
import { tipCards } from "@/data/tools";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TiltCard } from "@/components/ui/TiltCard";
import { cn } from "@/lib/utils";

export function TipsGrid() {
  const [openId, setOpenId] = useState<string | null>(null);

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
            <TiltCard key={card.id}>
              <motion.article
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
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
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
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
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}

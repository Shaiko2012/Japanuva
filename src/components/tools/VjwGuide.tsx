"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileCheck2, RotateCcw } from "lucide-react";
import { vjwChecklist } from "@/data/tools";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

const categories = Array.from(
  new Set(vjwChecklist.map((item) => item.category)),
);

export function VjwGuide() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  const completed = useMemo(
    () => Object.values(done).filter(Boolean).length,
    [done],
  );

  function toggle(id: string) {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-4">
      <GlassCard strong>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="glow-accent flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
              <FileCheck2 className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-[family-name:var(--font-readex)] text-2xl font-bold">
                הצהרות וכניסה · VJW
              </h1>
              <p className="mt-1 text-sm text-muted">
                צ׳קליסט Visit Japan Web למשפחה — סמנו כל שלב עד לנחיתה חלקה.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDone({})}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:border-accent/40 hover:text-accent"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            איפוס
          </button>
        </div>
        <div className="mt-4">
          <ProgressBar
            value={completed}
            max={vjwChecklist.length}
            label={`${completed} / ${vjwChecklist.length} הושלמו`}
          />
        </div>
      </GlassCard>

      {categories.map((category) => (
        <GlassCard key={category}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">{category}</h2>
            <StatusBadge
              tone="muted"
              label={`${vjwChecklist.filter((i) => i.category === category && done[i.id]).length}/${vjwChecklist.filter((i) => i.category === category).length}`}
            />
          </div>
          <div className="space-y-2">
            {vjwChecklist
              .filter((item) => item.category === category)
              .map((item) => {
                const checked = Boolean(done[item.id]);
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    layout
                    onClick={() => toggle(item.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border p-3 text-right transition",
                      checked
                        ? "border-success/35 bg-success/10"
                        : "border-border bg-background/30 hover:border-accent/30",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                        checked
                          ? "border-success bg-success text-white"
                          : "border-border bg-surface",
                      )}
                    >
                      <AnimatePresence>
                        {checked && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <span>
                      <span
                        className={cn(
                          "block font-medium",
                          checked && "text-muted line-through",
                        )}
                      >
                        {item.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted">
                        {item.detail}
                      </span>
                    </span>
                  </motion.button>
                );
              })}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

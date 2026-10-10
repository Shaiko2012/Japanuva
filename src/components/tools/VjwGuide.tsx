"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { officialLinks, vjwChecklist } from "@/data/tools";
import { useChecklists } from "@/store/checklists";
import { useHydrated } from "@/hooks/useHydrated";
import { PageHeader, SectionHead } from "@/components/ui/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Meter } from "@/components/ui/Meter";
import { FadeIn } from "@/components/ui/Motion";
import { softEase, softStagger, softTap } from "@/lib/motion";

const categories = Array.from(new Set(vjwChecklist.map((item) => item.category)));

function VjwCheckRow({
  title,
  detail,
  checked,
  disabled,
  onToggle,
}: {
  title: string;
  detail: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.label
      className="flex cursor-pointer items-start gap-4 py-4"
      whileTap={reduce || disabled ? undefined : softTap}
    >
      <input
        type="checkbox"
        className="check mt-0.5"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
      />
      <span className="min-w-0">
        <span className="relative inline-block font-semibold">
          <motion.span
            className="block"
            initial={false}
            animate={{ color: checked ? "var(--muted)" : "var(--foreground)" }}
            transition={{ duration: reduce ? 0 : 0.22, ease: softEase }}
          >
            {title}
          </motion.span>
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[0.7em] h-px bg-current"
            initial={false}
            animate={{ scaleX: checked ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: softEase }}
            style={{ originX: 1, color: "var(--muted)" }}
          />
        </span>
        <motion.span
          className="mt-1 block text-[0.9375rem] leading-6 text-ink-soft"
          initial={false}
          animate={{ opacity: checked ? 0.65 : 1 }}
          transition={{ duration: reduce ? 0 : 0.22, ease: softEase }}
        >
          {detail}
        </motion.span>
      </span>
    </motion.label>
  );
}

export function VjwGuide() {
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const stored = useChecklists((s) => s.vjw);
  const toggle = useChecklists((s) => s.toggleVjw);
  const reset = useChecklists((s) => s.resetVjw);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const done = hydrated ? stored : {};
  const completed = vjwChecklist.filter((item) => done[item.id]).length;

  return (
    <div>
      <PageHeader
        kicker="הכנות"
        title="כניסה ליפן עם Visit Japan Web"
        lede="השירות הרשמי של ממשלת יפן להגירה ולמכס. ממלאים לפני הטיסה ומציגים קוד QR בנחיתה. השימוש לא חובה, אבל הוא מקצר את התהליך בשדה."
        actions={
          <a
            href={officialLinks.visitJapanWeb}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            לאתר Visit Japan Web
            <span className="sr-only"> (חלון חדש)</span>
          </a>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-10">
          {categories.map((category) => {
            const items = vjwChecklist.filter((item) => item.category === category);
            const doneHere = items.filter((item) => done[item.id]).length;
            return (
              <section key={category} aria-labelledby={`vjw-${category}`}>
                <SectionHead
                  id={`vjw-${category}`}
                  title={category}
                  meta={`${doneHere} מתוך ${items.length}`}
                />
                <ul className="ruled">
                  {items.map((item, index) => (
                    <li key={item.id}>
                      <FadeIn delay={softStagger(index)} y={10}>
                        <VjwCheckRow
                          title={item.title}
                          detail={item.detail}
                          checked={Boolean(done[item.id])}
                          disabled={!hydrated}
                          onToggle={() => toggle(item.id)}
                        />
                      </FadeIn>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
          <p className="t-label">ההתקדמות שלכם</p>
          <p className="mt-2">
            <motion.span
              key={completed}
              className="t-num inline-block text-4xl"
              initial={reduce ? false : { opacity: 0.45, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.28, ease: softEase }}
            >
              {completed}
            </motion.span>
            <span className="text-muted"> מתוך {vjwChecklist.length} שלבים</span>
          </p>
          <div className="mt-3">
            <Meter
              value={completed}
              max={vjwChecklist.length}
              label="שלבים שהושלמו"
              tone={completed === vjwChecklist.length ? "moss" : "ink"}
            />
          </div>
          <p className="t-meta mt-3">הסימונים נשמרים במכשיר הזה בלבד.</p>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={completed === 0}
            className="btn btn-tertiary btn-sm mt-4 text-danger"
          >
            ניקוי כל הסימונים
          </button>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="לנקות את כל הסימונים?"
        description="כל השלבים יסומנו מחדש כלא בוצעו. הפרטים שמילאתם באתר Visit Japan Web עצמו לא יושפעו."
        confirmLabel="ניקוי"
        onConfirm={reset}
      />
    </div>
  );
}

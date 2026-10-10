"use client";

import Link from "next/link";
import { prepTimeline } from "@/data/tools";
import { PageHeader } from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/ui/Motion";

export function PrepGuide() {
  return (
    <div>
      <PageHeader
        kicker="הכנות"
        title="לפני שיוצאים"
        lede="מה לסגור ומתי, מהחודשים שלפני הטיסה ועד הימים ביפן. כל שלב מוביל לכלי המתאים באתר או למקור הרשמי."
      />

      <ol className="space-y-12">
        {prepTimeline.map((phase, phaseIndex) => (
          <li key={phase.id} className="border-t-2 border-rule-strong pt-4">
            <FadeIn
              delay={phaseIndex * 0.08}
              className="grid gap-x-10 gap-y-3 md:grid-cols-[12rem_minmax(0,1fr)]"
            >
              <h2 className="t-h3 md:sticky md:top-[calc(var(--header-h)+1.5rem)] md:self-start">
                <span className="t-num me-2 text-vermilion">{phaseIndex + 1}</span>
                {phase.when}
              </h2>
              <ul className="ruled">
                {phase.items.map((item) => (
                  <li
                    key={item.title}
                    className="grid gap-x-8 gap-y-2 py-5 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
                  >
                    <div className="max-w-2xl">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-1.5 text-[0.9375rem] leading-7 text-ink-soft">{item.body}</p>
                    </div>
                    {"external" in item && item.external ? (
                      <a href={item.href} target="_blank" rel="noreferrer" className="link-nav">
                        {item.hrefLabel}
                        <span className="sr-only"> (חלון חדש)</span>
                      </a>
                    ) : (
                      <Link href={item.href} className="link-nav">
                        {item.hrefLabel}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </li>
        ))}
      </ol>
    </div>
  );
}

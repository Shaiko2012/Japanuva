"use client";

import { useState } from "react";
import { luggageRoutes, luggageSizes, officialLinks } from "@/data/tools";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { formatNumber, cn } from "@/lib/utils";
import { KeypadField } from "@/components/ui/KeypadField";
import { PageHeader, SectionHead } from "@/components/ui/PageHeader";

type SizeId = (typeof luggageSizes)[number]["id"];

function roundTo100(n: number) {
  return Math.round(n / 100) * 100;
}

export function LuggageEstimator() {
  const [routeId, setRouteId] = useState(luggageRoutes[0].id);
  const [sizeId, setSizeId] = useState<SizeId>("large");
  const [bags, setBags] = useState(3);
  const { rate } = useExchangeRate();

  const route = luggageRoutes.find((r) => r.id === routeId) ?? luggageRoutes[0];
  const size = luggageSizes.find((s) => s.id === sizeId) ?? luggageSizes[0];
  const perBag = roundTo100(route.largeJpy * size.factor);
  const total = perBag * bags;

  return (
    <div>
      <PageHeader
        kicker="הכנות"
        title="משלוח מזוודות בין ערים"
        lede="ביפן נהוג לשלוח את המזוודות מהמלון למלון הבא או לשדה, ולנסוע ברכבת עם תיק קטן. השירות נקרא Takkyubin ומוזמן בדלפק הקבלה."
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend className="section-head w-full">
              <span className="t-h2">מאיפה לאן</span>
            </legend>
            <div className="ruled">
              {luggageRoutes.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center gap-4 py-3.5"
                >
                  <input
                    type="radio"
                    name="luggage-route"
                    className="check"
                    value={item.id}
                    checked={routeId === item.id}
                    onChange={() => setRouteId(item.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">
                      {item.from} <span aria-hidden>←</span>
                      <span className="sr-only">אל</span> {item.to}
                    </span>
                    <span className="t-meta">{item.days}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="section-head w-full">
              <span className="t-h2">המזוודות</span>
            </legend>
            <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_10rem]">
              <div className="ruled">
                {luggageSizes.map((item) => (
                  <label key={item.id} className="flex cursor-pointer items-center gap-4 py-3.5">
                    <input
                      type="radio"
                      name="luggage-size"
                      className="check"
                      value={item.id}
                      checked={sizeId === item.id}
                      onChange={() => setSizeId(item.id)}
                    />
                    <span>
                      <span className="block font-semibold">{item.label}</span>
                      <span className="t-meta">{item.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
              <KeypadField
                mode="number"
                label="כמה מזוודות"
                value={bags}
                min={1}
                max={12}
                onChange={(n) => setBags(Math.min(12, Math.max(1, n || 1)))}
              />
            </div>
          </fieldset>
        </form>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
          <SectionHead title="אומדן גס" as="h3" />
          <p className="mt-3">
            <span className="t-num text-5xl">¥{formatNumber(total)}</span>
          </p>
          <p className="t-meta mt-2 tabular">
            ≈ ₪{formatNumber(Math.round(total / rate))} · ¥{formatNumber(perBag)} למזוודה
          </p>
          <dl className={cn("mt-6 space-y-2 border-t border-rule pt-4 text-sm")}>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">מסלול</dt>
              <dd className="text-end">{route.to}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">הגעה</dt>
              <dd className="text-end">{route.days}</dd>
            </div>
          </dl>
          <p className="note mt-6 text-sm leading-6">
            המחיר בפועל נקבע לפי סכום המידות והמשקל של כל מזוודה ולפי המרחק, ומשולם בדלפק.
            האומדן כאן נועד רק לתכנון התקציב.
          </p>
          <a href={officialLinks.yamato} target="_blank" rel="noreferrer" className="link-nav mt-5">
            השירות באתר Yamato
            <span className="sr-only"> (חלון חדש)</span>
          </a>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useTripMetaStore } from "@/store/tripMeta";
import { exchangeSourceLabel, useExchangeRate } from "@/hooks/useExchangeRate";
import { formatNumber } from "@/lib/utils";
import { KeypadField } from "@/components/ui/KeypadField";
import { SectionHead } from "@/components/ui/PageHeader";

const QUICK_JPY = [1000, 5000, 10000] as const;

export function CurrencyConverter() {
  const ils = useTripMetaStore((s) => s.budgetIls);
  const setBudgetIls = useTripMetaStore((s) => s.setBudgetIls);
  const fx = useExchangeRate();
  const rate = fx.rate;

  const jpy = useMemo(() => Math.round(ils * rate), [ils, rate]);

  function setFromIls(value: number) {
    setBudgetIls(Number.isFinite(value) ? value : 0);
  }

  function setFromJpy(value: number) {
    if (!Number.isFinite(value)) return;
    setBudgetIls(Math.round(value / rate));
  }

  return (
    <section aria-labelledby="fx-title">
      <SectionHead
        as="h3"
        id="fx-title"
        title="המרת מטבע"
        meta={
          <span className="tabular" dir="ltr">
            ₪1 ≈ ¥{rate.toFixed(1)}
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <KeypadField
            mode="number"
            label="שקלים"
            value={ils}
            min={0}
            title="סכום בשקלים"
            onChange={setFromIls}
            fieldClassName="field mt-1 t-num text-lg"
            prefix={<span className="text-muted">₪</span>}
          />
        </div>
        <div className="min-w-0">
          <KeypadField
            mode="number"
            label="ין יפני"
            value={jpy}
            min={0}
            title="סכום בין"
            onChange={setFromJpy}
            fieldClassName="field mt-1 t-num text-lg"
            prefix={<span className="text-muted">¥</span>}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-1 text-sm">
        <span className="text-muted">מהיר:</span>
        {QUICK_JPY.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setFromJpy(amount)}
            aria-pressed={jpy === amount}
            className="btn btn-tertiary btn-sm tabular aria-pressed:text-vermilion"
          >
            ¥{formatNumber(amount)}
          </button>
        ))}
      </div>

      <p className="t-meta mt-2" aria-live="polite">
        {exchangeSourceLabel(fx)}
      </p>
    </section>
  );
}

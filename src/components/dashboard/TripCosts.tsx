"use client";

import type { EditorDay } from "@/types/editor";
import { tripCost } from "@/lib/tripSummary";
import { formatNumber } from "@/lib/utils";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { SectionHead } from "@/components/ui/PageHeader";
import { Meter } from "@/components/ui/Meter";

export function TripCosts({ days, isEmpty = false }: { days: EditorDay[]; isEmpty?: boolean }) {
  const cost = tripCost(days);
  const fx = useExchangeRate();
  const ils = Math.round(cost.total / fx.rate);

  const rows = [
    { label: "לינה", value: cost.lodging },
    { label: "אטרקציות וכרטיסים", value: cost.activities },
    { label: "אוכל", value: cost.food },
  ];

  return (
    <section aria-labelledby="costs-title">
      <SectionHead as="h3" id="costs-title" title="עלות משוערת" meta="לפי המסלול" />

      {isEmpty || cost.total === 0 ? (
        <p className="text-sm leading-6 text-ink-soft">
          הוסיפו מחיר ללילה, מחירי כרטיסים או אומדן אוכל בימי המסלול, והסכום
          יחושב כאן.
        </p>
      ) : (
        <>
          <p className="t-num text-[2.5rem] leading-none">
            ¥{formatNumber(cost.total)}
          </p>
          <p className="t-meta mt-2 tabular">
            ≈ ₪{formatNumber(ils)}
            {fx.loading ? " (שער משוער)" : fx.fallback ? " (שער גיבוי)" : ""}
          </p>

          <dl className="mt-5 space-y-3">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <dt>{row.label}</dt>
                  <dd className="tabular font-semibold">¥{formatNumber(row.value)}</dd>
                </div>
                <Meter value={row.value} max={cost.total} className="mt-1.5" />
              </div>
            ))}
          </dl>
          <p className="t-meta mt-4 leading-5">
            סכום הערכים שהוזנו בכל יום. לא כולל טיסות ונסיעות בין ערים.
          </p>
        </>
      )}
    </section>
  );
}

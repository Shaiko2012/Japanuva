"use client";

import { TrainFront, Wallet } from "lucide-react";
import {
  selectSelectedDay,
  useItineraryEditor,
} from "@/store/itineraryEditor";
import { estimateTransitMinutes } from "@/types/editor";
import { tripMeta } from "@/data/trip";
import { formatNumber } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function DailySummaryWidget() {
  const day = useItineraryEditor(selectSelectedDay);
  const updateFoodEstimate = useItineraryEditor((s) => s.updateFoodEstimate);

  if (!day) return null;

  const attractions = day.activities.reduce((sum, a) => sum + a.priceJpy, 0);
  const hotel = day.hotel.costPerNightJpy;
  const food = day.foodEstimateJpy;
  const total = attractions + hotel + food;
  const ils = Math.round(total / tripMeta.exchangeRateIlsToJpy);
  const transit = estimateTransitMinutes(day.activities.length);
  const budgetCap = Math.max(total, 80000);

  return (
    <GlassCard>
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Wallet className="h-4 w-4 text-accent" />
        סיכום יומי · תחבורה ותקציב
      </div>

      <div className="mb-4 rounded-2xl border border-border bg-background/35 p-4">
        <div className="flex items-center gap-2 text-xs text-muted">
          <TrainFront className="h-3.5 w-3.5 text-accent" />
          זמן נסיעות משוער ביום זה
        </div>
        <p className="mt-2 text-sm leading-6">
          {transit === 0
            ? "אין מעברים משוערים — פחות מאטרקציה אחת."
            : `זמן נסיעות משוער ביום זה: ${transit} דקות ברכבת תחתית / JR מקומי בין האטרקציות.`}
        </p>
      </div>

      <label className="mb-4 block text-xs text-muted">
        אומדן אוכל ליום (¥): {formatNumber(food)}
        <input
          type="range"
          min={4000}
          max={30000}
          step={500}
          value={food}
          onChange={(e) =>
            updateFoodEstimate(day.id, Number(e.target.value))
          }
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-[var(--foreground)]"
        />
      </label>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-border bg-surface/50 px-2 py-3">
          <div className="text-[11px] text-muted">אטרקציות</div>
          <div className="mt-1 text-sm font-semibold tabular-nums">
            ¥{formatNumber(attractions)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface/50 px-2 py-3">
          <div className="text-[11px] text-muted">אוכל</div>
          <div className="mt-1 text-sm font-semibold tabular-nums">
            ¥{formatNumber(food)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface/50 px-2 py-3">
          <div className="text-[11px] text-muted">לינה</div>
          <div className="mt-1 text-sm font-semibold tabular-nums">
            ¥{formatNumber(hotel)}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-accent/35 bg-accent-soft p-4">
        <div className="text-xs text-accent/80">סה״כ צפוי ליום</div>
        <div className="mt-1 font-[family-name:var(--font-readex)] text-2xl font-bold tabular-nums text-accent">
          ¥{formatNumber(total)}
        </div>
        <div className="text-xs text-muted">≈ ₪{formatNumber(ils)}</div>
      </div>

      <div className="mt-4">
        <ProgressBar value={total} max={budgetCap} label="פס תקציב יומי" />
      </div>
    </GlassCard>
  );
}

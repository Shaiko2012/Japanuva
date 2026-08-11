"use client";

import { useMemo, useState } from "react";
import { Luggage } from "lucide-react";
import { luggageRoutes } from "@/data/tools";
import { tripMeta } from "@/data/trip";
import { formatNumber } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export function LuggageEstimator() {
  const [routeId, setRouteId] = useState(luggageRoutes[0].id);
  const [bags, setBags] = useState(3);
  const [weight, setWeight] = useState(20);

  const route = luggageRoutes.find((r) => r.id === routeId) ?? luggageRoutes[0];

  const estimate = useMemo(() => {
    const weightFactor = weight > 25 ? 1.25 : weight > 20 ? 1.1 : 1;
    const perBag = Math.round(route.baseJpy * weightFactor);
    const total = perBag * bags;
    const ils = Math.round(total / tripMeta.exchangeRateIlsToJpy);
    return { perBag, total, ils };
  }, [route, bags, weight]);

  return (
    <div className="space-y-4">
      <GlassCard strong>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="glow-accent flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
              <Luggage className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-[family-name:var(--font-readex)] text-2xl font-bold">
                משלוח מזוודות
              </h1>
              <p className="mt-1 text-sm text-muted">
                אומדן Takuhaibin בין מלונות ונמל תעופה — לפי מספר מזוודות ומשקל.
              </p>
            </div>
          </div>
          <StatusBadge tone="accent" label={`${route.days} ימי משלוח`} pulse />
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-3 text-sm font-semibold">בחירת מסלול</h2>
          <div className="space-y-2">
            {luggageRoutes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRouteId(item.id)}
                className={cn(
                  "w-full rounded-2xl border p-3 text-right transition",
                  routeId === item.id
                    ? "border-accent/45 bg-accent-soft"
                    : "border-border bg-background/30 hover:border-accent/30",
                )}
              >
                <div className="font-medium">
                  {item.from} → {item.to}
                </div>
                <div className="mt-1 text-xs text-muted">
                  בסיס ¥{formatNumber(item.baseJpy)} למזוודה · {item.days} יום
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-sm font-semibold">מחשבון עלות</h2>

          <label className="mb-4 block text-xs text-muted">
            מספר מזוודות: {bags}
            <input
              type="range"
              min={1}
              max={6}
              value={bags}
              onChange={(e) => setBags(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-[var(--terracotta)]"
            />
          </label>

          <label className="mb-5 block text-xs text-muted">
            משקל ממוצע (ק״ג): {weight}
            <input
              type="range"
              min={10}
              max={30}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-[var(--terracotta)]"
            />
          </label>

          <div className="rounded-2xl border border-accent/35 bg-accent-soft p-4">
            <div className="text-xs text-accent/80">אומדן כולל</div>
            <div className="mt-1 font-[family-name:var(--font-readex)] text-3xl font-bold tabular-nums text-accent">
              ¥{formatNumber(estimate.total)}
            </div>
            <div className="mt-1 text-xs text-muted">
              ≈ ₪{formatNumber(estimate.ils)} · ¥{formatNumber(estimate.perBag)}{" "}
              למזוודה
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar
              value={estimate.total}
              max={20000}
              label="יחס לתקציב לוגיסטיקה משוער"
            />
          </div>

          <ul className="mt-4 space-y-1.5 text-xs text-muted">
            <li>• הזמנה בדלפק המלון בערב שלפני המעבר</li>
            <li>• לנמל — שליחה לפחות יום־יומיים מראש</li>
            <li>• שמרו תעודת משלוח עד לקבלה</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

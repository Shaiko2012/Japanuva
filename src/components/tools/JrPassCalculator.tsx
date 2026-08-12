"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { ArrowDown, GripVertical, Plus, Trash2, TrainFront } from "lucide-react";
import {
  defaultJrRoute,
  fareForLeg,
  jrCities,
  jrPassPrices,
  type JrCity,
  type JrLeg,
} from "@/data/tools";
import { tripMeta } from "@/data/trip";
import { useFamilyStore } from "@/store/family";
import { formatNumber } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";

function SortableLeg({
  leg,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  leg: JrLeg;
  index: number;
  onChange: (id: string, patch: Partial<JrLeg>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: leg.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-border bg-background/40 p-3 ${
        isDragging ? "glow-accent z-10 opacity-95" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <button
            type="button"
            className="rounded-lg border border-border bg-surface p-1.5 touch-none"
            aria-label="גרור לסידור"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          קטע {index + 1}
        </div>
        <button
          type="button"
          disabled={!canRemove}
          onClick={() => onRemove(leg.id)}
          className="rounded-lg border border-border p-1.5 text-muted disabled:opacity-30 hover:border-accent/40 hover:text-accent"
          aria-label="מחק קטע"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
        <label className="text-xs text-muted">
          מ־
          <select
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground"
            value={leg.from}
            onChange={(e) =>
              onChange(leg.id, { from: e.target.value as JrCity })
            }
          >
            {jrCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end justify-center pb-2">
          <ArrowDown className="h-4 w-4 rotate-[-90deg] text-accent sm:rotate-0" />
        </div>
        <label className="text-xs text-muted">
          אל
          <select
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground"
            value={leg.to}
            onChange={(e) => onChange(leg.id, { to: e.target.value as JrCity })}
          >
            {jrCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-2 text-left text-sm font-semibold tabular-nums text-accent">
        ¥{formatNumber(fareForLeg(leg.from, leg.to))}
      </div>
    </div>
  );
}

export function JrPassCalculator() {
  const familyTotal = useFamilyStore(
    (s) => s.family.adults + s.family.kids,
  );
  const [legs, setLegs] = useState<JrLeg[]>(defaultJrRoute);
  const [travelers, setTravelers] = useState(familyTotal);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const perPersonTickets = useMemo(
    () => legs.reduce((sum, leg) => sum + fareForLeg(leg.from, leg.to), 0),
    [legs],
  );
  const ticketTotal = perPersonTickets * travelers;

  const comparisons = useMemo(() => {
    return ([7, 14, 21] as const).map((days) => {
      const passTotal = jrPassPrices[days] * travelers;
      const savings = ticketTotal - passTotal;
      return { days, passTotal, savings, worthIt: savings > 0 };
    });
  }, [ticketTotal, travelers]);

  const best = comparisons.reduce((a, b) =>
    b.savings > a.savings ? b : a,
  );

  const maxCompare = Math.max(
    ticketTotal,
    ...comparisons.map((c) => c.passTotal),
    1,
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLegs((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  return (
    <div className="space-y-4">
      <GlassCard strong>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="glow-accent flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white">
              <TrainFront className="h-5 w-5" />
            </span>
            <div>
              <h1 className="fluid-title font-[family-name:var(--font-readex)] font-bold">
                מחשבון JR Pass
              </h1>
              <p className="mt-1 text-sm text-muted">
                גררו קטעים, עדכנו ערים, והשוו מול כרטיסים נקודה־לנקודה בזמן אמת.
              </p>
            </div>
          </div>
          <StatusBadge
            tone={best.worthIt ? "booked" : "pending"}
            label={
              best.worthIt
                ? `כדאי · ${best.days} ימים`
                : "כרטיסים רגילים זולים יותר"
            }
            pulse
          />
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassCard>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">בונה מסלול</h2>
            <label className="flex items-center gap-2 text-xs text-muted">
              נוסעים
              <input
                type="number"
                min={1}
                max={10}
                value={travelers}
                onChange={(e) =>
                  setTravelers(Math.min(10, Math.max(1, Number(e.target.value) || 1)))
                }
                className="w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground"
              />
            </label>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={legs.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {legs.map((leg, index) => (
                  <SortableLeg
                    key={leg.id}
                    leg={leg}
                    index={index}
                    canRemove={legs.length > 1}
                    onChange={(id, patch) =>
                      setLegs((prev) =>
                        prev.map((item) =>
                          item.id === id ? { ...item, ...patch } : item,
                        ),
                      )
                    }
                    onRemove={(id) =>
                      setLegs((prev) => prev.filter((item) => item.id !== id))
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={() =>
              setLegs((prev) => [
                ...prev,
                {
                  id: `leg-${Date.now()}`,
                  from: prev[prev.length - 1]?.to ?? "Tokyo",
                  to: "Tokyo",
                },
              ])
            }
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-accent/40 bg-accent-soft px-4 py-3 text-sm font-medium text-accent transition hover:border-accent"
          >
            <Plus className="h-4 w-4" />
            הוסיפו קטע למסלול
          </button>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-sm font-semibold">השוואת עלויות</h2>

          <div className="mb-5 rounded-2xl border border-border bg-background/35 p-4">
            <div className="text-xs text-muted">סה״כ כרטיסים נקודה־לנקודה</div>
            <div className="mt-1 font-[family-name:var(--font-readex)] text-3xl font-bold tabular-nums text-accent">
              ¥{formatNumber(ticketTotal)}
            </div>
            <div className="mt-1 text-xs text-muted">
              ¥{formatNumber(perPersonTickets)} לאדם · {travelers} נוסעים · שער דמו{" "}
              {tripMeta.exchangeRateIlsToJpy} ¥/₪
            </div>
            <div className="mt-3">
              <ProgressBar
                value={ticketTotal}
                max={maxCompare}
                label="כרטיסים רגילים"
              />
            </div>
          </div>

          <div className="space-y-3">
            {comparisons.map((row) => (
              <motion.div
                key={row.days}
                layout
                className={`rounded-2xl border p-4 ${
                  row.days === best.days && row.worthIt
                    ? "border-accent/45 bg-accent-soft"
                    : "border-border bg-background/30"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-semibold">JR Pass {row.days} ימים</span>
                  <span className="text-sm tabular-nums">
                    ¥{formatNumber(row.passTotal)}
                  </span>
                </div>
                <ProgressBar
                  value={row.passTotal}
                  max={maxCompare}
                  barClassName={
                    row.worthIt
                      ? undefined
                      : "from-info to-sky shadow-[0_0_16px_color-mix(in_srgb,var(--sky)_45%,transparent)]"
                  }
                />
                <div
                  className={`mt-2 text-xs ${
                    row.savings > 0 ? "text-success" : "text-warning"
                  }`}
                >
                  {row.savings > 0
                    ? `חיסכון משוער ¥${formatNumber(row.savings)}`
                    : `יקר יותר ב־¥${formatNumber(Math.abs(row.savings))}`}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

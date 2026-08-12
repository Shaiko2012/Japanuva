"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
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
import {
  ExternalLink,
  GripVertical,
  Plus,
  Route,
  Trash2,
  TrainFront,
} from "lucide-react";
import {
  createEmptyDayRouteStops,
  createStop,
  demoDayRouteStops,
  isDemoDayRouteStops,
  stopMapsPoint,
  type RouteStop,
  type TransitMode,
} from "@/data/dayRoute";
import { geocodePlace } from "@/lib/geocode";
import { buildMapsDayRouteUrl, parseGoogleMapsInput } from "@/lib/mapsParse";
import {
  fetchTransitLeg,
  type TransitLegEstimate,
} from "@/lib/transitRoute";
import { usePersonalTrip } from "@/hooks/usePersonalTrip";
import { useAuth } from "@/components/providers/AuthProvider";
import { PlaceSearchPicker } from "@/components/maps/PlaceSearchPicker";
import { GlassCard } from "@/components/ui/GlassCard";
import { KeypadField } from "@/components/ui/KeypadField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { PlaceSearchResult } from "@/types/places";

const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50";

function SortableStop({
  stop,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  stop: RouteStop;
  index: number;
  onChange: (id: string, patch: Partial<RouteStop>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const [resolving, setResolving] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.id });

  async function resolveLocation() {
    const input = stop.address || stop.name;
    if (!input.trim()) return;
    setResolving(true);
    try {
      const parsed = parseGoogleMapsInput(input);
      let lat = parsed.lat;
      let lng = parsed.lng;
      let address = parsed.query || input;

      if (lat == null || lng == null) {
        const geocoded = await geocodePlace(input);
        if (geocoded) {
          lat = geocoded.lat;
          lng = geocoded.lng;
          address = geocoded.query;
        }
      }

      onChange(stop.id, {
        address,
        mapsLink: parsed.mapsLink,
        name: stop.name || parsed.titleHint || stop.name,
        lat,
        lng,
      });
    } finally {
      setResolving(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`rounded-2xl border border-border bg-background/35 p-3 ${
        isDragging ? "glow-accent z-10" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <button
            type="button"
            className="rounded-lg border border-border p-1.5 touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          תחנה {index + 1}
        </div>
        <button
          type="button"
          disabled={!canRemove}
          onClick={() => onRemove(stop.id)}
          className="rounded-lg border border-border p-1.5 text-muted disabled:opacity-30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-muted">
          שם המקום
          <input
            className={inputClass}
            value={stop.name}
            onChange={(e) => onChange(stop.id, { name: e.target.value })}
            placeholder="DisneySea / מלון / מסעדה"
          />
        </label>
        <KeypadField
          mode="time"
          label="שעת הגעה רצויה"
          value={stop.arriveBy}
          onChange={(arriveBy) => onChange(stop.id, { arriveBy })}
        />
      </div>

      <PlaceSearchPicker
        className="mt-2"
        label="חיפוש מקום"
        placeholder="חפשו תחנה, מסעדה, אטרקציה…"
        onSelect={(place: PlaceSearchResult) =>
          onChange(stop.id, {
            name: stop.name || place.name,
            address: place.address || place.name,
            mapsLink: place.mapsLink,
            lat: place.lat,
            lng: place.lng,
          })
        }
      />

      <label className="mt-2 block text-xs text-muted">
        כתובת / קישור Google Maps
        <div className="mt-1 flex gap-2">
          <input
            className={inputClass + " !mt-0"}
            value={stop.address}
            onChange={(e) =>
              onChange(stop.id, {
                address: e.target.value,
                lat: undefined,
                lng: undefined,
              })
            }
            placeholder="הדביקו קישור מפות או כתבו כתובת"
          />
          <button
            type="button"
            onClick={() => void resolveLocation()}
            disabled={resolving || !(stop.address.trim() || stop.name.trim())}
            className="shrink-0 rounded-xl border border-accent/40 bg-accent-soft px-3 text-xs font-medium text-accent disabled:opacity-40"
          >
            {resolving ? "…" : "מצא"}
          </button>
        </div>
        {stop.lat != null && stop.lng != null && (
          <span className="mt-1 block text-[11px] text-success">
            מיקום מדויק: {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
          </span>
        )}
      </label>
      <label className="mt-2 block text-xs text-muted">
        זמן שהייה (דקות): {stop.stayMinutes}
        <input
          type="range"
          min={15}
          max={600}
          step={15}
          value={stop.stayMinutes}
          onChange={(e) =>
            onChange(stop.id, { stayMinutes: Number(e.target.value) })
          }
          className="mt-2 h-2 w-full accent-[var(--foreground)]"
        />
      </label>
    </div>
  );
}

export function DayRoutePlanner() {
  const { user, loading: authLoading } = useAuth();
  const isPersonal = usePersonalTrip();
  const [stops, setStops] = useState<RouteStop[]>(createEmptyDayRouteStops);
  const [modeOverride, setModeOverride] = useState<TransitMode | "auto">(
    "auto",
  );
  const [legs, setLegs] = useState<TransitLegEstimate[]>([]);
  const [loadingLegs, setLoadingLegs] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    const personal = isPersonal || Boolean(user);
    if (personal) {
      setStops((prev) =>
        isDemoDayRouteStops(prev) ? createEmptyDayRouteStops() : prev,
      );
    } else {
      setStops(demoDayRouteStops);
    }
  }, [authLoading, isPersonal, user]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const legKey = useMemo(
    () =>
      stops
        .map(
          (s) =>
            `${s.id}:${s.lat ?? ""}:${s.lng ?? ""}:${s.address}:${s.name}`,
        )
        .join("|") + `::${modeOverride}`,
    [stops, modeOverride],
  );

  useEffect(() => {
    if (stops.length < 2) {
      setLegs([]);
      return;
    }

    let cancelled = false;
    setLoadingLegs(true);

    void (async () => {
      const next: TransitLegEstimate[] = [];
      for (let i = 0; i < stops.length - 1; i++) {
        if (cancelled) return;
        const leg = await fetchTransitLeg(
          stops[i],
          stops[i + 1],
          modeOverride,
        );
        next.push(leg);
      }
      if (!cancelled) {
        setLegs(next);
        setLoadingLegs(false);
      }
    })();

    return () => {
      cancelled = true;
      setLoadingLegs(false);
    };
  }, [legKey]);

  const fullDayMapsUrl = useMemo(
    () => buildMapsDayRouteUrl(stops.map(stopMapsPoint), "transit"),
    [stops],
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setStops((items) => {
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
            <span className="glow-accent flex h-12 w-12 items-center justify-center rounded-2xl bg-nav-bg text-nav-fg">
              <Route className="h-5 w-5" />
            </span>
            <div>
              <h1 className="fluid-title font-[family-name:var(--font-readex)] font-bold">
                מסלול ליום
              </h1>
              <p className="mt-1 text-sm text-muted">
                בניית יום שלם: מקום → מקום, עם תחבורה מומלצת וקו —
                מבוסס Google Maps (כשיש מפתח API) או הערכה לפי מרחק.
              </p>
            </div>
          </div>
          <StatusBadge
            tone={isPersonal ? "accent" : "pending"}
            label={isPersonal ? "המסלול שלי" : "דוגמה · דיסני"}
            pulse
          />
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassCard>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">תחנות היום</h2>
            <label className="flex items-center gap-2 text-xs text-muted">
              מצב תחבורה
              <select
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-foreground"
                value={modeOverride}
                onChange={(e) =>
                  setModeOverride(e.target.value as TransitMode | "auto")
                }
              >
                <option value="auto">אוטומטי (מומלץ)</option>
                <option value="metro">מטרו</option>
                <option value="jr">JR</option>
                <option value="bus">אוטובוס</option>
                <option value="walk">הליכה</option>
                <option value="taxi">מונית</option>
              </select>
            </label>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={stops.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {stops.map((stop, index) => (
                  <SortableStop
                    key={stop.id}
                    stop={stop}
                    index={index}
                    canRemove={stops.length > 2}
                    onChange={(id, patch) =>
                      setStops((prev) =>
                        prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
                      )
                    }
                    onRemove={(id) =>
                      setStops((prev) => prev.filter((s) => s.id !== id))
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={() =>
              setStops((prev) => [
                ...prev,
                createStop({
                  arriveBy: "15:00",
                  name: "",
                  address: "",
                }),
              ])
            }
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-accent/40 bg-accent-soft px-4 py-3 text-sm font-medium text-accent"
          >
            <Plus className="h-4 w-4" />
            הוסיפו תחנה
          </button>
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <TrainFront className="h-4 w-4 text-accent" />
            תחבורה מומלצת בין התחנות
          </div>

          {stops.length >= 2 && (
            <a
              href={fullDayMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-4 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-nav-bg/40 bg-nav-bg px-5 py-5 text-base font-bold text-nav-fg shadow-[0_8px_24px_var(--glow)] transition hover:brightness-110"
            >
              <ExternalLink className="h-5 w-5" />
              פתיחה בגוגל · כל היום
            </a>
          )}

          <div className="space-y-3">
            {loadingLegs && legs.length === 0 && (
              <p className="rounded-2xl border border-border bg-background/30 p-4 text-center text-sm text-muted">
                מחשב מסלולי תחבורה…
              </p>
            )}
            {legs.map((leg, i) => (
              <div
                key={`${leg.fromId}-${leg.toId}-${leg.durationMinutes}`}
                className="rounded-2xl border border-border bg-background/30 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-muted">
                    {stops[i]?.name || `תחנה ${i + 1}`} →{" "}
                    {stops[i + 1]?.name || `תחנה ${i + 2}`}
                  </div>
                  {leg.source === "google" && (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
                      Google Maps
                    </span>
                  )}
                  {leg.source === "estimate" && (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      הערכה לפי מרחק
                    </span>
                  )}
                  {leg.source === "missing_coords" && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                      חסר מיקום
                    </span>
                  )}
                </div>
                <div className="mt-1 font-semibold">
                  {leg.source === "missing_coords" ? "—" : leg.modeLabelHe}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-border px-2 py-2">
                    <div className="text-muted">תחנות</div>
                    <div className="font-medium">{leg.platformHint}</div>
                  </div>
                  <div className="rounded-lg border border-border px-2 py-2">
                    <div className="text-muted">קו</div>
                    <div className="font-medium">{leg.lineHint}</div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted">
                  איפה קונים: {leg.buyWhere}
                </p>
                <p className="mt-1 text-xs text-muted">{leg.notes}</p>
                <a
                  href={leg.mapsDirUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-nav-bg/40 bg-nav-bg px-4 py-4 text-sm font-bold text-nav-fg shadow-[0_8px_24px_var(--glow)] transition hover:brightness-110"
                >
                  <ExternalLink className="h-4 w-4" />
                  פתיחת מסלול ב־Google Maps
                </a>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

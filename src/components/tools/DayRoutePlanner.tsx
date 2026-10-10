"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
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
import { buildMapsDayRouteUrl, isBareCoordQuery, parseGoogleMapsInput } from "@/lib/mapsParse";
import { fetchTransitLeg, type TransitLegEstimate } from "@/lib/transitRoute";
import { usePersonalTrip } from "@/hooks/usePersonalTrip";
import { useAuth } from "@/components/providers/AuthProvider";
import { PlaceSearchPicker } from "@/components/maps/PlaceSearchPicker";
import { KeypadField } from "@/components/ui/KeypadField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import type { PlaceSearchResult } from "@/types/places";
import { cn } from "@/lib/utils";

function routeKey(stops: RouteStop[], mode: TransitMode | "auto") {
  return (
    stops.map((s) => `${s.id}:${s.lat ?? ""}:${s.lng ?? ""}:${s.address}:${s.name}`).join("|") +
    `::${mode}`
  );
}

function stayLabel(minutes: number) {
  if (minutes < 60) return `${minutes} דק׳`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} ש׳ ${m} דק׳` : `${h} ש׳`;
}

function StopRow({
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
  const [editing, setEditing] = useState(!stop.name.trim());
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.id });

  async function resolveLocation() {
    const input = stop.address || stop.name;
    if (!input.trim()) return;
    setResolving(true);
    setResolveError(null);
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
        } else {
          setResolveError("לא נמצא מיקום. נסו שם מדויק יותר או קישור מ־Google Maps.");
        }
      }
      const searchLabel =
        parsed.titleHint ||
        (!isBareCoordQuery(address) ? address.split(",")[0]?.trim() : "") ||
        "";
      onChange(stop.id, {
        address,
        mapsLink: parsed.mapsLink,
        name: stop.name || parsed.titleHint || stop.name,
        searchName: searchLabel || stop.searchName,
        lat,
        lng,
      });
    } finally {
      setResolving(false);
    }
  }

  const label = stop.name.trim() || `תחנה ${index + 1}`;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("bg-paper", isDragging && "relative z-10 shadow-[var(--shadow-overlay)]")}
    >
      <div className="grid grid-cols-[2rem_4.25rem_minmax(0,1fr)_auto] items-center gap-x-2 py-3">
        <button
          type="button"
          className="flex h-11 w-8 cursor-grab touch-none items-center justify-center text-muted hover:text-ink"
          aria-label={`שינוי סדר: ${label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
        <span className="t-num text-xl" dir="ltr">
          {stop.arriveBy || "--:--"}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold" dir="auto">
            {label}
          </span>
          <span className="block truncate text-sm text-muted" dir="auto">
            {stop.address && !isBareCoordQuery(stop.address)
              ? stop.address
              : "ללא כתובת"}
            {" · "}
            {stayLabel(stop.stayMinutes)}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-expanded={editing}
          className="btn btn-tertiary btn-sm"
        >
          {editing ? "סגירה" : "עריכה"}
        </button>
      </div>

      {editing && (
        <div className="mb-4 space-y-4 border-s-2 border-rule-strong ps-4 sm:ms-10">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <div>
              <label className="field-label" htmlFor={`stop-name-${stop.id}`}>
                שם התחנה
              </label>
              <input
                id={`stop-name-${stop.id}`}
                className="field"
                value={stop.name}
                onChange={(e) => onChange(stop.id, { name: e.target.value })}
                placeholder="מלון, מסעדה, אטרקציה"
                dir="auto"
              />
            </div>
            <KeypadField
              mode="time"
              label="שעת הגעה"
              value={stop.arriveBy}
              onChange={(arriveBy) => onChange(stop.id, { arriveBy })}
            />
          </div>

          <PlaceSearchPicker
            label="חיפוש מקום"
            placeholder="שם המקום באנגלית מוצא יותר תוצאות"
            onSelect={(place: PlaceSearchResult) =>
              onChange(stop.id, {
                name: stop.name || place.name,
                searchName: place.name,
                address: place.address || place.name,
                mapsLink: place.mapsLink,
                lat: place.lat,
                lng: place.lng,
              })
            }
          />

          <details>
            <summary className="btn btn-tertiary btn-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              הדבקת קישור או כתובת
            </summary>
            <div className="mt-2 flex gap-2">
              <input
                className="field mt-0"
                value={stop.address}
                onChange={(e) =>
                  onChange(stop.id, {
                    address: e.target.value,
                    lat: undefined,
                    lng: undefined,
                    searchName: undefined,
                  })
                }
                placeholder="קישור Google Maps או כתובת"
                aria-label="קישור Google Maps או כתובת"
                dir="auto"
              />
              <button
                type="button"
                onClick={() => void resolveLocation()}
                disabled={resolving || !(stop.address.trim() || stop.name.trim())}
                className="btn btn-secondary shrink-0"
              >
                {resolving ? "מחפש…" : "איתור"}
              </button>
            </div>
            {resolveError && <p className="field-hint text-danger">{resolveError}</p>}
          </details>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <KeypadField
              mode="number"
              label="זמן במקום (דקות)"
              className="w-44"
              value={stop.stayMinutes}
              min={5}
              max={1440}
              onChange={(n) => onChange(stop.id, { stayMinutes: Math.max(5, Math.round(n || 5)) })}
            />
            <button
              type="button"
              disabled={!canRemove}
              onClick={() => (stop.name.trim() ? setConfirmOpen(true) : onRemove(stop.id))}
              className="btn btn-tertiary btn-sm text-danger"
            >
              הסרת התחנה
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`להסיר את "${label}"?`}
        description="התחנה תוסר מתכנון היום. המסלול הראשי לא ישתנה."
        confirmLabel="הסרה"
        onConfirm={() => onRemove(stop.id)}
      />
    </li>
  );
}

function LegRow({ leg, loading }: { leg?: TransitLegEstimate; loading: boolean }) {
  return (
    <li
      aria-label="נסיעה לתחנה הבאה"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 border-s-2 border-dashed border-rule py-2 ps-4 text-sm text-ink-soft ms-[3.1rem]"
    >
      {leg ? (
        <>
          <span className="font-medium text-ink">{leg.modeLabelHe}</span>
          {leg.source !== "missing_coords" && leg.durationMinutes > 0 && (
            <span className="tabular">כ־{leg.durationMinutes} דק׳</span>
          )}
          {leg.source === "estimate" && <span className="t-meta">הערכה לפי מרחק</span>}
          {leg.source === "missing_coords" && (
            <span className="t-meta">חסר מיקום מדויק</span>
          )}
          <a
            href={leg.mapsDirUrl}
            target="_blank"
            rel="noreferrer"
            className="link-inline ms-auto"
          >
            הוראות ב־Google Maps
            <span className="sr-only"> (חלון חדש)</span>
          </a>
        </>
      ) : (
        <span className="t-meta">{loading ? "מחשב נסיעה…" : ""}</span>
      )}
    </li>
  );
}

export function DayRoutePlanner() {
  const { user, loading: authLoading } = useAuth();
  const isPersonal = usePersonalTrip();
  const [stops, setStops] = useState<RouteStop[]>(createEmptyDayRouteStops);
  const [modeOverride, setModeOverride] = useState<TransitMode | "auto">("auto");
  const [legResult, setLegResult] = useState<{ key: string; legs: TransitLegEstimate[] }>({
    key: "",
    legs: [],
  });

  const audience = authLoading ? null : isPersonal || user ? "personal" : "demo";
  const [appliedAudience, setAppliedAudience] = useState<string | null>(null);
  if (audience && audience !== appliedAudience) {
    setAppliedAudience(audience);
    setStops((prev) =>
      audience === "demo"
        ? demoDayRouteStops
        : isDemoDayRouteStops(prev)
          ? createEmptyDayRouteStops()
          : prev,
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const legKey = routeKey(stops, modeOverride);
  const legs = stops.length >= 2 ? legResult.legs : [];
  const loadingLegs = stops.length >= 2 && legResult.key !== legKey;

  useEffect(() => {
    if (stops.length < 2) return;
    let cancelled = false;
    const key = routeKey(stops, modeOverride);
    const timer = window.setTimeout(() => {
      void (async () => {
        const next: TransitLegEstimate[] = [];
        for (let i = 0; i < stops.length - 1; i++) {
          if (cancelled) return;
          next.push(await fetchTransitLeg(stops[i], stops[i + 1], modeOverride));
        }
        if (!cancelled) setLegResult({ key, legs: next });
      })();
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [stops, modeOverride]);

  const fullDayMapsUrl = useMemo(
    () => buildMapsDayRouteUrl(stops.map(stopMapsPoint), "transit"),
    [stops],
  );
  const namedStops = stops.filter((s) => s.name.trim() || s.address.trim()).length;
  const demo = !isPersonal && !user && isDemoDayRouteStops(stops);

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
    <div>
      <PageHeader
        kicker="תחבורה"
        title="נסיעות ביום אחד"
        lede="רושמים את התחנות של היום לפי הסדר, ומקבלים את הנסיעה בין כל שתיים. התכנון הזה לא נשמר במסלול הראשי."
        actions={
          namedStops >= 2 ? (
            <a href={fullDayMapsUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
              פתיחת כל היום ב־Google Maps
              <span className="sr-only"> (חלון חדש)</span>
            </a>
          ) : undefined
        }
      />

      {demo && (
        <p className="note mb-6 max-w-2xl">
          זו דוגמה ליום בדיסני־סי. אחרי התחברות או הגדרת טיול, תתחילו מדף ריק.
        </p>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-labelledby="stops-title">
          <div className="section-head">
            <h2 id="stops-title" className="t-h2">
              התחנות
            </h2>
            <span className="t-meta">{stops.length} תחנות</span>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <ol className="mt-2">
                {stops.map((stop, index) => (
                  <Fragment key={stop.id}>
                    <StopRow
                      stop={stop}
                      index={index}
                      canRemove={stops.length > 2}
                      onChange={(id, patch) =>
                        setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
                      }
                      onRemove={(id) => setStops((prev) => prev.filter((s) => s.id !== id))}
                    />
                    {index < stops.length - 1 && (
                      <LegRow leg={legs[index]} loading={loadingLegs} />
                    )}
                  </Fragment>
                ))}
              </ol>
            </SortableContext>
          </DndContext>

          <div className="mt-2 border-t border-rule pt-4">
            <button
              type="button"
              onClick={() =>
                setStops((prev) => [...prev, createStop({ arriveBy: "15:00", name: "", address: "" })])
              }
              className="btn btn-secondary"
            >
              <Plus aria-hidden />
              הוספת תחנה
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <div>
            <label className="field-label" htmlFor="transit-mode">
              אמצעי תחבורה
            </label>
            <select
              id="transit-mode"
              className="field"
              value={modeOverride}
              onChange={(e) => setModeOverride(e.target.value as TransitMode | "auto")}
            >
              <option value="auto">לפי המרחק (מומלץ)</option>
              <option value="metro">מטרו</option>
              <option value="jr">רכבת JR</option>
              <option value="bus">אוטובוס</option>
              <option value="walk">הליכה</option>
              <option value="taxi">מונית</option>
            </select>
            <p className="field-hint">
              זמני הנסיעה מגיעים מ־Google כשיש חיבור לשירות, ואחרת הם הערכה לפי מרחק.
              הקישורים פותחים את הוראות הנסיעה המלאות.
            </p>
          </div>
          <div className="note-quiet text-sm leading-6">
            עם ילדים כדאי לתכנן עד שלוש־ארבע תחנות ביום, ולהוסיף כחצי שעה לכל מעבר בתחנות
            הגדולות.
          </div>
        </aside>
      </div>
    </div>
  );
}

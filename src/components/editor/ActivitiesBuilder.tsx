"use client";

import { useState } from "react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Baby,
  Clock3,
  ExternalLink,
  GripVertical,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  selectSelectedDay,
  useItineraryEditor,
} from "@/store/itineraryEditor";
import {
  CATEGORY_META,
  TICKET_STATUS_LABELS,
  TIME_SLOT_LABELS,
  type ActivityCategory,
  type ActivityItem,
  type TicketStatus,
  type TimeSlot,
} from "@/types/editor";
import { tripMeta } from "@/data/trip";
import { parseGoogleMapsInput, buildMapsOpenUrl } from "@/lib/mapsParse";
import { geocodePlace } from "@/lib/geocode";
import { formatNumber } from "@/lib/utils";
import { PlaceSearchPicker } from "@/components/maps/PlaceSearchPicker";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { PlaceSearchResult } from "@/types/places";
import { GlassModal } from "./GlassModal";

const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent/50";

const blankActivity = (): Omit<ActivityItem, "id"> => ({
  title: "",
  descriptionHe: "",
  category: "culture",
  timeSlot: "morning",
  familyFriendly: true,
  ticketStatus: "buy_on_site",
  durationHours: 2,
  priceJpy: 0,
  location: "",
  mapsLink: "",
  notes: "",
  lat: undefined,
  lng: undefined,
});

function ActivityFormFields({
  draft,
  setDraft,
  mapsPaste,
  setMapsPaste,
  resolvingMaps,
  setResolvingMaps,
}: {
  draft: Omit<ActivityItem, "id">;
  setDraft: (next: Omit<ActivityItem, "id">) => void;
  mapsPaste: string;
  setMapsPaste: (v: string) => void;
  resolvingMaps: boolean;
  setResolvingMaps: (v: boolean) => void;
}) {
  async function applyMapsPaste() {
    const raw = mapsPaste || draft.mapsLink || "";
    const parsed = parseGoogleMapsInput(raw);
    if (!parsed.query && !parsed.mapsLink) return;

    setResolvingMaps(true);
    try {
      // Prefer coords/query from the new paste — do not keep stale draft
      // lat/lng or location, or geocoding would be skipped for renamed places.
      let lat = parsed.lat;
      let lng = parsed.lng;
      let location = parsed.titleHint || parsed.query || draft.location;

      if (lat == null || lng == null) {
        const geocoded = await geocodePlace(raw);
        if (geocoded) {
          lat = geocoded.lat;
          lng = geocoded.lng;
          location = geocoded.query || location;
        }
      }

      const title = draft.title || parsed.titleHint || "";
      setDraft({
        ...draft,
        title: title || draft.title,
        location,
        mapsLink: buildMapsOpenUrl({
          name: location,
          address: location,
          lat,
          lng,
        }),
        lat,
        lng,
        descriptionHe:
          draft.descriptionHe ||
          (location ? `מיקום: ${location}` : ""),
      });
    } finally {
      setResolvingMaps(false);
    }
  }

  function applyPlaceSearch(place: PlaceSearchResult) {
    setDraft({
      ...draft,
      title: draft.title || place.name,
      location: place.address || place.name,
      mapsLink: place.mapsLink,
      lat: place.lat,
      lng: place.lng,
      descriptionHe:
        draft.descriptionHe ||
        (place.address ? `מיקום: ${place.address}` : ""),
    });
    setMapsPaste(place.mapsLink);
  }

  return (
    <div className="space-y-3">
      <PlaceSearchPicker
        label="חיפוש מקום במפות"
        placeholder="DisneySea, TeamLab, מלון בשינג'וקו…"
        onSelect={applyPlaceSearch}
      />

      <label className="block text-xs text-muted">
        קישור Google Maps / כתובת / שם מקום
        <div className="mt-1 flex gap-2">
          <input
            className={inputClass + " !mt-0"}
            value={mapsPaste}
            onChange={(e) => setMapsPaste(e.target.value)}
            placeholder="הדביקו קישור מפות, או כתבו DisneySea / כתובת…"
          />
          <button
            type="button"
            onClick={() => void applyMapsPaste()}
            disabled={resolvingMaps}
            className="shrink-0 rounded-xl border border-accent/40 bg-accent-soft px-3 text-xs font-medium text-accent disabled:opacity-40"
          >
            {resolvingMaps ? "…" : "מצא"}
          </button>
        </div>
        <span className="mt-1 block text-[11px] text-muted">
          אחרי “מצא” נמלא שם/מיקום/קישור · אם אין קואורדינטות בקישור — נחפש כתובת
          {draft.lat != null && draft.lng != null && (
            <span className="mt-0.5 block text-success">
              מיקום מדויק: {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
            </span>
          )}
        </span>
      </label>

      <label className="block text-xs text-muted">
        כותרת
        <input
          className={inputClass}
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="TeamLab Planets / מקדש סנסו־ג'י"
        />
      </label>
      <label className="block text-xs text-muted">
        תיאור בעברית
        <textarea
          className={`${inputClass} min-h-20`}
          value={draft.descriptionHe}
          onChange={(e) =>
            setDraft({ ...draft, descriptionHe: e.target.value })
          }
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-muted">
          קטגוריה
          <select
            className={inputClass}
            value={draft.category}
            onChange={(e) =>
              setDraft({
                ...draft,
                category: e.target.value as ActivityCategory,
              })
            }
          >
            {(Object.keys(CATEGORY_META) as ActivityCategory[]).map((key) => (
              <option key={key} value={key}>
                {CATEGORY_META[key].emoji} {CATEGORY_META[key].label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-muted">
          משבצת זמן
          <select
            className={inputClass}
            value={draft.timeSlot}
            onChange={(e) =>
              setDraft({ ...draft, timeSlot: e.target.value as TimeSlot })
            }
          >
            {(Object.keys(TIME_SLOT_LABELS) as TimeSlot[]).map((key) => (
              <option key={key} value={key}>
                {TIME_SLOT_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-muted">
          סטטוס כרטיסים
          <select
            className={inputClass}
            value={draft.ticketStatus}
            onChange={(e) =>
              setDraft({
                ...draft,
                ticketStatus: e.target.value as TicketStatus,
              })
            }
          >
            {(Object.keys(TICKET_STATUS_LABELS) as TicketStatus[]).map(
              (key) => (
                <option key={key} value={key}>
                  {TICKET_STATUS_LABELS[key]}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="mt-6 flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={draft.familyFriendly}
            onChange={(e) =>
              setDraft({ ...draft, familyFriendly: e.target.checked })
            }
            className="h-4 w-4 accent-[var(--terracotta)]"
          />
          מתאים למשפחה / ילדים
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-muted">
          משך (שעות)
          <input
            type="number"
            step="0.5"
            min={0.5}
            className={inputClass}
            value={draft.durationHours}
            onChange={(e) =>
              setDraft({
                ...draft,
                durationHours: Number(e.target.value) || 1,
              })
            }
          />
        </label>
        <label className="block text-xs text-muted">
          מחיר כרטיסים (¥)
          <input
            type="number"
            className={inputClass}
            value={draft.priceJpy}
            onChange={(e) =>
              setDraft({
                ...draft,
                priceJpy: Number(e.target.value) || 0,
              })
            }
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-muted">
          מיקום / כתובת
          <input
            className={inputClass}
            value={draft.location ?? ""}
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
          />
        </label>
        <label className="block text-xs text-muted">
          קישור מפות
          <input
            className={inputClass}
            value={draft.mapsLink ?? ""}
            onChange={(e) => setDraft({ ...draft, mapsLink: e.target.value })}
            placeholder="https://maps.google.com/..."
          />
        </label>
      </div>
      <label className="block text-xs text-muted">
        הערות פנימיות
        <textarea
          className={`${inputClass} min-h-20`}
          value={draft.notes ?? ""}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        />
      </label>
    </div>
  );
}

function SortableActivity({
  activity,
  onRemove,
  onEdit,
  compact,
}: {
  activity: ActivityItem;
  onRemove: () => void;
  onEdit: () => void;
  compact?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: activity.id });
  const meta = CATEGORY_META[activity.category];
  const ils = Math.round(activity.priceJpy / tripMeta.exchangeRateIlsToJpy);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`rounded-xl border border-border bg-background/35 p-3 ${
        isDragging ? "glow-accent z-10" : ""
      } ${compact ? "cursor-pointer hover:border-accent/30" : ""}`}
      onClick={compact ? onEdit : undefined}
      onKeyDown={
        compact
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onEdit();
              }
            }
          : undefined
      }
      role={compact ? "button" : undefined}
      tabIndex={compact ? 0 : undefined}
    >
      <div className="flex items-start gap-2">
        {!compact && (
          <button
            type="button"
            className="mt-1 rounded-lg border border-border p-1.5 text-muted touch-none"
            aria-label="גרור אטרקציה"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {!compact && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px]">
                {meta.emoji} {meta.label}
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                {TIME_SLOT_LABELS[activity.timeSlot]}
              </span>
              {activity.familyFriendly && (
                <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] text-success">
                  <Baby className="h-3 w-3" />
                  משפחתי
                </span>
              )}
            </div>
          )}
          {compact && (
            <span className="text-[11px] text-muted">
              {TIME_SLOT_LABELS[activity.timeSlot]} · {meta.emoji}
            </span>
          )}
          <h3 className={compact ? "mt-0.5 font-medium" : "mt-2 font-semibold"}>
            {activity.title}
          </h3>
          {!compact && (
            <p className="mt-1 text-xs leading-5 text-muted">
              {activity.descriptionHe}
            </p>
          )}
          {!compact && (
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted">
              <StatusBadge
                tone="muted"
                label={TICKET_STATUS_LABELS[activity.ticketStatus]}
              />
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
                <Clock3 className="h-3 w-3" />
                {activity.durationHours} שע׳
              </span>
              <span className="rounded-full border border-accent/30 bg-accent-soft px-2 py-1 text-accent">
                ¥{formatNumber(activity.priceJpy)} · ₪{formatNumber(ils)}
              </span>
              {activity.location && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
                  <MapPin className="h-3 w-3" />
                  {activity.location}
                </span>
              )}
              {activity.mapsLink && (
                <a
                  href={activity.mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-accent hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  מפות
                </a>
              )}
            </div>
          )}
        </div>
        {!compact && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-border p-1.5 text-muted hover:border-accent/40 hover:text-accent"
            aria-label="ערוך אטרקציה"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-border p-1.5 text-muted hover:border-accent/40 hover:text-accent"
            aria-label="מחק אטרקציה"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        )}
      </div>
    </div>
  );
}

export function ActivitiesBuilder({
  variant = "default",
}: {
  variant?: "default" | "itinerary";
}) {
  const day = useItineraryEditor(selectSelectedDay);
  const addActivity = useItineraryEditor((s) => s.addActivity);
  const updateActivity = useItineraryEditor((s) => s.updateActivity);
  const removeActivity = useItineraryEditor((s) => s.removeActivity);
  const reorderActivities = useItineraryEditor((s) => s.reorderActivities);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(blankActivity());
  const [mapsPaste, setMapsPaste] = useState("");
  const [resolvingMaps, setResolvingMaps] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  if (!day) return null;

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderActivities(day!.id, String(active.id), String(over.id));
  }

  function openCreate() {
    setEditingId(null);
    setDraft(blankActivity());
    setMapsPaste("");
    setOpen(true);
  }

  function openEdit(activity: ActivityItem) {
    const { id, ...rest } = activity;
    setEditingId(id);
    setDraft(rest);
    setMapsPaste(activity.mapsLink || activity.location || "");
    setOpen(true);
  }

  function save() {
    if (!draft.title.trim()) return;
    if (editingId) {
      updateActivity(day!.id, editingId, draft);
    } else {
      addActivity(day!.id, draft);
    }
    setDraft(blankActivity());
    setMapsPaste("");
    setEditingId(null);
    setOpen(false);
  }

  return (
    <>
      {variant === "itinerary" ? (
        <div className="flex min-h-0 flex-col">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={day.activities.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 pb-4">
                {day.activities.map((activity) => (
                  <SortableActivity
                    key={activity.id}
                    activity={activity}
                    onEdit={() => openEdit(activity)}
                    onRemove={() => removeActivity(day.id, activity.id)}
                    compact
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={openCreate}
            className="sticky bottom-0 mt-auto w-full rounded-xl bg-foreground px-4 py-3.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            הוסיפו פעילות ליום זה
          </button>
        </div>
      ) : (
        <GlassCard>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-accent" />
              ניהול אטרקציות
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1 rounded-full border border-accent/35 bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
            >
              <Plus className="h-3.5 w-3.5" />
              אטרקציה חדשה
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={day.activities.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {day.activities.map((activity) => (
                  <SortableActivity
                    key={activity.id}
                    activity={activity}
                    onEdit={() => openEdit(activity)}
                    onRemove={() => removeActivity(day.id, activity.id)}
                  />
                ))}
                {day.activities.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
                    אין אטרקציות ליום זה — הוסיפו עם קישור מפות או כתובת.
                  </p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </GlassCard>
      )}

      <GlassModal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "עריכת אטרקציה" : "הוספת אטרקציה חדשה"}
        wide
      >
        <ActivityFormFields
          draft={draft}
          setDraft={setDraft}
          mapsPaste={mapsPaste}
          setMapsPaste={setMapsPaste}
          resolvingMaps={resolvingMaps}
          setResolvingMaps={setResolvingMaps}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl border border-border px-4 py-2 text-sm"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white glow-accent"
          >
            {editingId ? "שמירת שינויים" : "הוספת אטרקציה"}
          </button>
        </div>
      </GlassModal>
    </>
  );
}

"use client";

import { useState } from "react";
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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink, GripVertical, Plus } from "lucide-react";
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
import { parseGoogleMapsInput, buildMapsOpenUrl } from "@/lib/mapsParse";
import { geocodePlace } from "@/lib/geocode";
import { formatNumber, cn } from "@/lib/utils";
import { PlaceSearchPicker } from "@/components/maps/PlaceSearchPicker";
import { KeypadField } from "@/components/ui/KeypadField";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TicketStatusLabel } from "@/components/ui/StatusLabel";
import type { PlaceSearchResult } from "@/types/places";

type Draft = Omit<ActivityItem, "id">;

const blankActivity = (): Draft => ({
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

function ActivityForm({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (next: Draft) => void;
}) {
  const [mapsPaste, setMapsPaste] = useState(draft.mapsLink || draft.location || "");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  async function applyMapsPaste() {
    const raw = mapsPaste.trim();
    const parsed = parseGoogleMapsInput(raw);
    if (!parsed.query && !parsed.mapsLink) return;
    setResolving(true);
    setResolveError(null);
    try {
      let lat = parsed.lat;
      let lng = parsed.lng;
      let location = parsed.titleHint || parsed.query || draft.location;
      if (lat == null || lng == null) {
        const geocoded = await geocodePlace(raw);
        if (geocoded) {
          lat = geocoded.lat;
          lng = geocoded.lng;
          location = geocoded.query || location;
        } else {
          setResolveError("לא נמצא מיקום. נסו שם מדויק יותר או קישור מ־Google Maps.");
        }
      }
      const title = draft.title || parsed.titleHint || "";
      setDraft({
        ...draft,
        title,
        location,
        mapsLink: buildMapsOpenUrl({
          name: title || (location && !/^-?\d+\.\d+\s*,/.test(location) ? location : undefined),
          address: location,
          lat,
          lng,
        }),
        lat,
        lng,
      });
    } finally {
      setResolving(false);
    }
  }

  function applyPlaceSearch(place: PlaceSearchResult) {
    setDraft({
      ...draft,
      title: draft.title || place.name,
      location: place.address || place.name,
      mapsLink: buildMapsOpenUrl({
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
      }),
      lat: place.lat,
      lng: place.lng,
    });
    setMapsPaste(place.mapsLink);
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="field-label" htmlFor="act-title">
          שם הפעילות
        </label>
        <input
          id="act-title"
          className="field"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="למשל: מקדש סנסו־ג׳י"
          dir="auto"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="act-slot">
            מתי ביום
          </label>
          <select
            id="act-slot"
            className="field"
            value={draft.timeSlot}
            onChange={(e) => setDraft({ ...draft, timeSlot: e.target.value as TimeSlot })}
          >
            {(Object.keys(TIME_SLOT_LABELS) as TimeSlot[]).map((key) => (
              <option key={key} value={key}>
                {TIME_SLOT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="act-category">
            סוג
          </label>
          <select
            id="act-category"
            className="field"
            value={draft.category}
            onChange={(e) =>
              setDraft({ ...draft, category: e.target.value as ActivityCategory })
            }
          >
            {(Object.keys(CATEGORY_META) as ActivityCategory[]).map((key) => (
              <option key={key} value={key}>
                {CATEGORY_META[key].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="space-y-3 border-t border-rule pt-4">
        <legend className="t-label float-start mb-3 w-full">מיקום</legend>
        <PlaceSearchPicker
          label="חיפוש במפות"
          placeholder="שם המקום, למשל TeamLab Planets"
          onSelect={applyPlaceSearch}
        />
        <details className="group">
          <summary className="btn btn-tertiary btn-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            הדבקת קישור או כתובת
          </summary>
          <div className="mt-2 flex gap-2">
            <input
              className="field"
              value={mapsPaste}
              onChange={(e) => setMapsPaste(e.target.value)}
              placeholder="קישור Google Maps או כתובת"
              aria-label="קישור Google Maps או כתובת"
              dir="auto"
            />
            <button
              type="button"
              onClick={() => void applyMapsPaste()}
              disabled={resolving || !mapsPaste.trim()}
              className="btn btn-secondary shrink-0"
            >
              {resolving ? "מחפש…" : "איתור"}
            </button>
          </div>
          {resolveError && <p className="field-hint text-danger">{resolveError}</p>}
        </details>
        {draft.location ? (
          <p className="text-sm text-ink-soft">
            {draft.location}
            {draft.lat != null && draft.lng != null && (
              <span className="t-meta ms-2">· מסומן במפה</span>
            )}
          </p>
        ) : (
          <p className="t-meta">ללא מיקום, הפעילות לא תופיע במפה.</p>
        )}
      </fieldset>

      <fieldset className="border-t border-rule pt-4">
        <legend className="t-label float-start mb-3 w-full">כרטיסים ומשך</legend>
        <div className="grid w-full gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="act-ticket">
              כרטיסים
            </label>
            <select
              id="act-ticket"
              className="field"
              value={draft.ticketStatus}
              onChange={(e) =>
                setDraft({ ...draft, ticketStatus: e.target.value as TicketStatus })
              }
            >
              {(Object.keys(TICKET_STATUS_LABELS) as TicketStatus[]).map((key) => (
                <option key={key} value={key}>
                  {TICKET_STATUS_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <KeypadField
            mode="number"
            label="מחיר כולל לכל המשפחה (¥)"
            value={draft.priceJpy}
            min={0}
            onChange={(priceJpy) => setDraft({ ...draft, priceJpy: priceJpy || 0 })}
          />
          <KeypadField
            mode="number"
            label="משך משוער (שעות)"
            value={draft.durationHours}
            allowDecimal
            maxDecimals={1}
            min={0.5}
            onChange={(durationHours) =>
              setDraft({ ...draft, durationHours: durationHours || 1 })
            }
          />
          <label className="flex min-h-11 items-center gap-3 self-end text-[0.9375rem]">
            <input
              type="checkbox"
              className="check"
              checked={draft.familyFriendly}
              onChange={(e) => setDraft({ ...draft, familyFriendly: e.target.checked })}
            />
            מתאים לילדים
          </label>
        </div>
      </fieldset>

      <details className="border-t border-rule pt-4">
        <summary className="btn btn-tertiary btn-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          תיאור והערות
        </summary>
        <div className="mt-3 space-y-4">
          <div>
            <label className="field-label" htmlFor="act-desc">
              תיאור
            </label>
            <textarea
              id="act-desc"
              className="field"
              value={draft.descriptionHe}
              onChange={(e) => setDraft({ ...draft, descriptionHe: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="act-notes">
              הערות פנימיות
            </label>
            <textarea
              id="act-notes"
              className="field"
              value={draft.notes ?? ""}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </div>
        </div>
      </details>
    </div>
  );
}

function ActivityRow({
  activity,
  onEdit,
}: {
  activity: ActivityItem;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: activity.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-stretch gap-1 border-t border-rule bg-paper-raised first:border-t-0",
        isDragging && "relative z-10 shadow-[var(--shadow-overlay)]",
      )}
    >
      <button
        type="button"
        className="flex w-8 shrink-0 cursor-grab touch-none items-center justify-center text-muted hover:text-ink"
        aria-label={`שינוי סדר: ${activity.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="group grid min-w-0 flex-1 grid-cols-[4rem_minmax(0,1fr)] gap-x-3 py-3 pe-1 text-start"
      >
        <span className="pt-0.5 text-sm text-muted">{TIME_SLOT_LABELS[activity.timeSlot]}</span>
        <span className="min-w-0">
          <span className="block font-semibold group-hover:underline" dir="auto">
            {activity.title}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>{CATEGORY_META[activity.category].label}</span>
            <span className="tabular">{activity.durationHours} ש׳</span>
            {activity.priceJpy > 0 && (
              <span className="tabular">¥{formatNumber(activity.priceJpy)}</span>
            )}
            {activity.ticketStatus === "needs_reservation" || activity.ticketStatus === "booked" ? (
              <TicketStatusLabel status={activity.ticketStatus} />
            ) : null}
          </span>
        </span>
      </button>
      {activity.mapsLink && (
        <a
          href={activity.mapsLink}
          target="_blank"
          rel="noreferrer"
          className="flex w-10 shrink-0 items-center justify-center text-muted hover:text-ink"
          aria-label={`פתיחת ${activity.title} במפות (חלון חדש)`}
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      )}
    </li>
  );
}

export function ActivitiesBuilder() {
  const day = useItineraryEditor(selectSelectedDay);
  const addActivity = useItineraryEditor((s) => s.addActivity);
  const updateActivity = useItineraryEditor((s) => s.updateActivity);
  const removeActivity = useItineraryEditor((s) => s.removeActivity);
  const reorderActivities = useItineraryEditor((s) => s.reorderActivities);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(blankActivity());
  const [formKey, setFormKey] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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
    setFormKey((k) => k + 1);
    setOpen(true);
  }

  function openEdit(activity: ActivityItem) {
    const { id, ...rest } = activity;
    setEditingId(id);
    setDraft(rest);
    setFormKey((k) => k + 1);
    setOpen(true);
  }

  function save() {
    if (!draft.title.trim()) return;
    const clean = { ...draft, title: draft.title.trim() };
    if (editingId) updateActivity(day!.id, editingId, clean);
    else addActivity(day!.id, clean);
    setOpen(false);
  }

  const editingTitle = editingId
    ? day.activities.find((a) => a.id === editingId)?.title
    : undefined;

  return (
    <section aria-labelledby="activities-title">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 id="activities-title" className="t-label">
          פעילויות
          {day.activities.length > 0 && (
            <span className="ms-2 font-normal text-muted">{day.activities.length}</span>
          )}
        </h3>
        {day.activities.length > 0 && (
          <button type="button" onClick={openCreate} className="btn btn-secondary btn-sm">
            <Plus aria-hidden />
            הוספה
          </button>
        )}
      </div>

      {day.activities.length === 0 ? (
        <div className="border-y border-rule py-5">
          <p className="text-sm leading-6 text-ink-soft">
            עדיין אין פעילויות ליום הזה. אפשר לחפש מקום במפות, והוא יסומן גם על
            המפה.
          </p>
          <button type="button" onClick={openCreate} className="btn btn-primary mt-3">
            <Plus aria-hidden />
            הוספת פעילות ראשונה
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={day.activities.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="border-y border-rule">
              {day.activities.map((activity) => (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  onEdit={() => openEdit(activity)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "עריכת פעילות" : "פעילות חדשה"}
        wide
        footer={
          <>
            {editingId && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="btn btn-tertiary me-auto text-danger"
              >
                מחיקת הפעילות
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">
              ביטול
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!draft.title.trim()}
              className="btn btn-primary"
            >
              {editingId ? "שמירת שינויים" : "הוספה ליום"}
            </button>
          </>
        }
      >
        <ActivityForm key={formKey} draft={draft} setDraft={setDraft} />
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="למחוק את הפעילות?"
        description={`"${editingTitle ?? ""}" תימחק מהיום הזה. אי אפשר לבטל את הפעולה.`}
        confirmLabel="מחיקה"
        onConfirm={() => {
          if (editingId) removeActivity(day.id, editingId);
          setEditingId(null);
          setOpen(false);
        }}
      />
    </section>
  );
}

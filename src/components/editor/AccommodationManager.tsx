"use client";

import { useState } from "react";
import { BedDouble, Link2, Pencil } from "lucide-react";
import {
  selectSelectedDay,
  useItineraryEditor,
} from "@/store/itineraryEditor";
import {
  HOTEL_STATUS_LABELS,
  type HotelInfo,
  type HotelStatus,
} from "@/types/editor";
import { tripMeta } from "@/data/trip";
import { formatNumber } from "@/lib/utils";
import { PlaceSearchPicker } from "@/components/maps/PlaceSearchPicker";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { PlaceSearchResult } from "@/types/places";
import { GlassModal } from "./GlassModal";

const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent/50";

const statusTone: Record<HotelStatus, "booked" | "pending" | "research"> = {
  booked: "booked",
  considering: "pending",
  not_booked: "research",
};

export function AccommodationManager({
  variant = "default",
}: {
  variant?: "default" | "itinerary";
}) {
  const day = useItineraryEditor(selectSelectedDay);
  const updateHotel = useItineraryEditor((s) => s.updateHotel);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<HotelInfo | null>(null);

  if (!day) return null;

  const ils = Math.round(
    day.hotel.costPerNightJpy / tripMeta.exchangeRateIlsToJpy,
  );

  function openModal() {
    setDraft({ ...day!.hotel });
    setOpen(true);
  }

  function save() {
    if (!draft) return;
    updateHotel(day!.id, draft);
    setOpen(false);
  }

  if (variant === "itinerary") {
    const hasHotel = Boolean(day.hotel.name.trim());

    return (
      <>
        {hasHotel ? (
          <button
            type="button"
            onClick={openModal}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background/40 px-4 py-3 text-right transition hover:border-accent/35"
          >
            <div className="min-w-0">
              <div className="text-[11px] text-muted">לינה</div>
              <div className="truncate font-medium">{day.hotel.name}</div>
            </div>
            <StatusBadge
              status={statusTone[day.hotel.status]}
              label={HOTEL_STATUS_LABELS[day.hotel.status]}
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/30 px-4 py-3 text-sm text-muted transition hover:border-accent/35 hover:text-foreground"
          >
            הוסף לינה
            <span className="text-lg leading-none">+</span>
          </button>
        )}

        <GlassModal
          open={open}
          onClose={() => setOpen(false)}
          title="הוספת / עריכת מלון"
          wide
        >
          {draft && (
            <div className="space-y-3">
              <PlaceSearchPicker
                label="חיפוש מלון"
                placeholder="Hotel Gracery Shinjuku, מלון בטוקיו…"
                onSelect={(place: PlaceSearchResult) =>
                  setDraft({
                    ...draft,
                    name: draft.name || place.name,
                    lat: place.lat,
                    lng: place.lng,
                  })
                }
              />

              <label className="block text-xs text-muted">
                שם המלון
                <input
                  className={inputClass}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="לדוגמה: Hotel Gracery Shinjuku"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-muted">
                  צ׳ק־אין
                  <input
                    type="date"
                    className={inputClass}
                    value={draft.checkIn}
                    onChange={(e) =>
                      setDraft({ ...draft, checkIn: e.target.value })
                    }
                  />
                </label>
                <label className="block text-xs text-muted">
                  צ׳ק־אאוט
                  <input
                    type="date"
                    className={inputClass}
                    value={draft.checkOut}
                    onChange={(e) =>
                      setDraft({ ...draft, checkOut: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-muted">
                  סטטוס הזמנה
                  <select
                    className={inputClass}
                    value={draft.status}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        status: e.target.value as HotelStatus,
                      })
                    }
                  >
                    {(Object.keys(HOTEL_STATUS_LABELS) as HotelStatus[]).map(
                      (key) => (
                        <option key={key} value={key}>
                          {HOTEL_STATUS_LABELS[key]}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label className="block text-xs text-muted">
                  עלות ללילה (¥)
                  <input
                    type="number"
                    className={inputClass}
                    value={draft.costPerNightJpy}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        costPerNightJpy: Number(e.target.value) || 0,
                      })
                    }
                  />
                </label>
              </div>
              <label className="block text-xs text-muted">
                קישור הזמנה
                <input
                  className={inputClass}
                  value={draft.bookingLink ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, bookingLink: e.target.value })
                  }
                  placeholder="https://"
                />
              </label>
              <label className="block text-xs text-muted">
                הערות
                <textarea
                  className={`${inputClass} min-h-24`}
                  value={draft.notes ?? ""}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  placeholder="חדר משפחתי, ליד JR, בקשות מיוחדות..."
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
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
                  שמירת מלון
                </button>
              </div>
            </div>
          )}
        </GlassModal>
      </>
    );
  }

  return (
    <>
      <GlassCard>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <BedDouble className="h-4 w-4 text-accent" />
            ניהול לינה
          </div>
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted hover:border-accent/40 hover:text-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
            עריכה / הוספה
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-background/35 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="text-xs text-muted">מלון ליום זה</div>
              <h3 className="mt-1 text-lg font-semibold">
                {day.hotel.name || "לא הוגדר מלון"}
              </h3>
            </div>
            <StatusBadge
              status={statusTone[day.hotel.status]}
              label={HOTEL_STATUS_LABELS[day.hotel.status]}
              pulse={day.hotel.status !== "booked"}
            />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface/50 px-3 py-2">
              <div className="text-[11px] text-muted">צ׳ק־אין</div>
              <div className="text-sm font-medium">{day.hotel.checkIn || "—"}</div>
            </div>
            <div className="rounded-xl border border-border bg-surface/50 px-3 py-2">
              <div className="text-[11px] text-muted">צ׳ק־אאוט</div>
              <div className="text-sm font-medium">
                {day.hotel.checkOut || "—"}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface/50 px-3 py-2">
              <div className="text-[11px] text-muted">עלות ללילה</div>
              <div className="text-sm font-semibold text-accent">
                ¥{formatNumber(day.hotel.costPerNightJpy)}
                <span className="ms-1 text-xs font-normal text-muted">
                  · ₪{formatNumber(ils)}
                </span>
              </div>
            </div>
          </div>

          {day.hotel.notes && (
            <p className="mt-3 text-xs leading-5 text-muted">{day.hotel.notes}</p>
          )}
          {day.hotel.bookingLink && (
            <a
              href={day.hotel.bookingLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
            >
              <Link2 className="h-3.5 w-3.5" />
              קישור הזמנה
            </a>
          )}
        </div>
      </GlassCard>

      <GlassModal
        open={open}
        onClose={() => setOpen(false)}
        title="הוספת / עריכת מלון"
        wide
      >
        {draft && (
          <div className="space-y-3">
            <PlaceSearchPicker
              label="חיפוש מלון"
              placeholder="Hotel Gracery Shinjuku, מלון בטוקיו…"
              onSelect={(place: PlaceSearchResult) =>
                setDraft({
                  ...draft,
                  name: draft.name || place.name,
                  lat: place.lat,
                  lng: place.lng,
                })
              }
            />

            <label className="block text-xs text-muted">
              שם המלון
              <input
                className={inputClass}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="לדוגמה: Hotel Gracery Shinjuku"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-muted">
                צ׳ק־אין
                <input
                  type="date"
                  className={inputClass}
                  value={draft.checkIn}
                  onChange={(e) =>
                    setDraft({ ...draft, checkIn: e.target.value })
                  }
                />
              </label>
              <label className="block text-xs text-muted">
                צ׳ק־אאוט
                <input
                  type="date"
                  className={inputClass}
                  value={draft.checkOut}
                  onChange={(e) =>
                    setDraft({ ...draft, checkOut: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-muted">
                סטטוס הזמנה
                <select
                  className={inputClass}
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      status: e.target.value as HotelStatus,
                    })
                  }
                >
                  {(Object.keys(HOTEL_STATUS_LABELS) as HotelStatus[]).map(
                    (key) => (
                      <option key={key} value={key}>
                        {HOTEL_STATUS_LABELS[key]}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label className="block text-xs text-muted">
                עלות ללילה (¥)
                <input
                  type="number"
                  className={inputClass}
                  value={draft.costPerNightJpy}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      costPerNightJpy: Number(e.target.value) || 0,
                    })
                  }
                />
              </label>
            </div>
            <label className="block text-xs text-muted">
              קישור הזמנה
              <input
                className={inputClass}
                value={draft.bookingLink ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, bookingLink: e.target.value })
                }
                placeholder="https://"
              />
            </label>
            <label className="block text-xs text-muted">
              הערות
              <textarea
                className={`${inputClass} min-h-24`}
                value={draft.notes ?? ""}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="חדר משפחתי, ליד JR, בקשות מיוחדות..."
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-muted">
                קו רוחב (lat)
                <input
                  type="number"
                  step="0.0001"
                  className={inputClass}
                  value={draft.lat ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      lat: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="35.6955"
                />
              </label>
              <label className="block text-xs text-muted">
                קו אורך (lng)
                <input
                  type="number"
                  step="0.0001"
                  className={inputClass}
                  value={draft.lng ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      lng: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="139.7014"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
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
                שמירת מלון
              </button>
            </div>
          </div>
        )}
      </GlassModal>
    </>
  );
}

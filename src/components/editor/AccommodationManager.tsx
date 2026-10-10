"use client";

import { useState } from "react";
import {
  selectSelectedDay,
  useItineraryEditor,
} from "@/store/itineraryEditor";
import { HOTEL_STATUS_LABELS, type HotelInfo, type HotelStatus } from "@/types/editor";
import { formatNumber } from "@/lib/utils";
import { PlaceSearchPicker } from "@/components/maps/PlaceSearchPicker";
import { DateField } from "@/components/ui/DateField";
import { KeypadField } from "@/components/ui/KeypadField";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HotelStatusLabel } from "@/components/ui/StatusLabel";
import type { PlaceSearchResult } from "@/types/places";

function emptyHotel(date: string, checkOut: string): Partial<HotelInfo> {
  return {
    name: "",
    status: "not_booked",
    costPerNightJpy: 0,
    bookingLink: "",
    notes: "",
    lat: undefined,
    lng: undefined,
    checkIn: date,
    checkOut,
  };
}

export function AccommodationManager() {
  const day = useItineraryEditor(selectSelectedDay);
  const updateHotel = useItineraryEditor((s) => s.updateHotel);
  const [open, setOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [draft, setDraft] = useState<HotelInfo | null>(null);

  if (!day) return null;
  const hasHotel = Boolean(day.hotel.name.trim());

  function openDialog() {
    setDraft({ ...day!.hotel });
    setOpen(true);
  }

  function save() {
    if (!draft) return;
    updateHotel(day!.id, { ...draft, name: draft.name.trim() });
    setOpen(false);
  }

  return (
    <section aria-labelledby="lodging-title">
      <h3 id="lodging-title" className="t-label mb-2">
        לינה בלילה הזה
      </h3>

      {hasHotel ? (
        <button
          type="button"
          onClick={openDialog}
          className="group flex w-full items-center justify-between gap-3 border-y border-rule py-3 text-start"
        >
          <span className="min-w-0">
            <span className="t-h3 block truncate group-hover:underline" dir="auto">
              {day.hotel.name}
            </span>
            {day.hotel.costPerNightJpy > 0 && (
              <span className="t-meta tabular">
                ¥{formatNumber(day.hotel.costPerNightJpy)} ללילה
              </span>
            )}
          </span>
          <HotelStatusLabel status={day.hotel.status} />
        </button>
      ) : (
        <button type="button" onClick={openDialog} className="btn btn-secondary btn-block">
          הוספת לינה
        </button>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={hasHotel ? "עריכת הלינה" : "הוספת לינה"}
        wide
        footer={
          <>
            {hasHotel && (
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="btn btn-tertiary me-auto text-danger"
              >
                הסרת הלינה מהיום
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">
              ביטול
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!draft?.name.trim()}
              className="btn btn-primary"
            >
              שמירה
            </button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <PlaceSearchPicker
              label="חיפוש מלון"
              placeholder="שם המלון או אזור, למשל Shinjuku"
              onSelect={(place: PlaceSearchResult) =>
                setDraft({
                  ...draft,
                  name: draft.name || place.name,
                  lat: place.lat,
                  lng: place.lng,
                })
              }
            />
            <div>
              <label className="field-label" htmlFor="hotel-name">
                שם המלון
              </label>
              <input
                id="hotel-name"
                className="field"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                dir="auto"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DateField
                label="צ׳ק־אין"
                value={draft.checkIn}
                onChange={(checkIn) => setDraft({ ...draft, checkIn })}
              />
              <DateField
                label="צ׳ק־אאוט"
                value={draft.checkOut}
                onChange={(checkOut) => setDraft({ ...draft, checkOut })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="hotel-status">
                  סטטוס הזמנה
                </label>
                <select
                  id="hotel-status"
                  className="field"
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({ ...draft, status: e.target.value as HotelStatus })
                  }
                >
                  {(Object.keys(HOTEL_STATUS_LABELS) as HotelStatus[]).map((key) => (
                    <option key={key} value={key}>
                      {HOTEL_STATUS_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
              <KeypadField
                mode="number"
                label="מחיר ללילה (¥)"
                value={draft.costPerNightJpy}
                min={0}
                onChange={(costPerNightJpy) =>
                  setDraft({ ...draft, costPerNightJpy: costPerNightJpy || 0 })
                }
              />
            </div>
            <div>
              <label className="field-label" htmlFor="hotel-link">
                קישור להזמנה
              </label>
              <input
                id="hotel-link"
                className="field"
                dir="ltr"
                inputMode="url"
                value={draft.bookingLink ?? ""}
                onChange={(e) => setDraft({ ...draft, bookingLink: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="hotel-notes">
                הערות
              </label>
              <textarea
                id="hotel-notes"
                className="field"
                value={draft.notes ?? ""}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="חדר משפחתי, קרוב לתחנה, בקשות מיוחדות"
              />
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        title="להסיר את הלינה מהיום?"
        description={`פרטי "${day.hotel.name}" יימחקו מהיום הזה בלבד. ימים אחרים לא ישתנו.`}
        confirmLabel="הסרת הלינה"
        onConfirm={() => {
          updateHotel(day.id, emptyHotel(day.date, day.hotel.checkOut));
          setOpen(false);
        }}
      />
    </section>
  );
}

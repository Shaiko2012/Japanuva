"use client";

import { useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
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
import { geocodePlace } from "@/lib/geocode";
import {
  buildMapsOpenUrl,
  hotelMapsUrl,
  isBareCoordQuery,
  parseGoogleMapsInput,
} from "@/lib/mapsParse";

function emptyHotel(date: string, checkOut: string): Partial<HotelInfo> {
  return {
    name: "",
    status: "not_booked",
    costPerNightJpy: 0,
    address: "",
    mapsLink: "",
    bookingLink: "",
    notes: "",
    lat: undefined,
    lng: undefined,
    checkIn: date,
    checkOut,
  };
}

function listingHref(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function isAirbnbUrl(raw: string) {
  try {
    const href = listingHref(raw);
    if (!href) return false;
    const host = new URL(href).hostname.replace(/^www\./, "");
    return host === "abnb.me" || /(^|\.)airbnb\./i.test(host);
  } catch {
    return false;
  }
}

function listingAria(url: string) {
  return isAirbnbUrl(url)
    ? "פתיחה באיירביאנבי (חלון חדש)"
    : "פתיחת קישור ההזמנה (חלון חדש)";
}

export function AccommodationManager() {
  const day = useItineraryEditor(selectSelectedDay);
  const updateHotel = useItineraryEditor((s) => s.updateHotel);
  const [open, setOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [draft, setDraft] = useState<HotelInfo | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  if (!day) return null;
  const hasHotel = Boolean(day.hotel.name.trim());
  const mapsHref = hotelMapsUrl(day.hotel);
  const stayHref = listingHref(day.hotel.bookingLink ?? "");

  function openDialog() {
    setDraft({ ...day!.hotel });
    setResolveError(null);
    setOpen(true);
  }

  function save() {
    if (!draft) return;
    updateHotel(day!.id, {
      ...draft,
      name: draft.name.trim(),
      address: draft.address?.trim() || "",
      mapsLink: draft.mapsLink?.trim() || "",
      bookingLink: draft.bookingLink?.trim() || "",
    });
    setOpen(false);
  }

  async function locateFromMapsOrAddress() {
    if (!draft) return;
    const raw = (draft.mapsLink || draft.address || "").trim();
    if (!raw) return;

    if (isAirbnbUrl(raw)) {
      setDraft({ ...draft, bookingLink: listingHref(raw) ?? raw, mapsLink: "" });
      setResolveError(null);
      return;
    }

    const parsed = parseGoogleMapsInput(raw);
    if (!parsed.query && !parsed.mapsLink) return;

    setResolving(true);
    setResolveError(null);
    try {
      let lat = parsed.lat;
      let lng = parsed.lng;
      let address =
        draft.address?.trim() ||
        (parsed.titleHint && !isBareCoordQuery(parsed.query)
          ? parsed.query
          : parsed.query);
      if (lat == null || lng == null) {
        const geocoded = await geocodePlace(raw);
        if (geocoded) {
          lat = geocoded.lat;
          lng = geocoded.lng;
          if (!draft.address?.trim() && geocoded.query && !isBareCoordQuery(geocoded.query)) {
            address = geocoded.query;
          }
        } else {
          setResolveError("לא נמצא מיקום. נסו כתובת מדויקת יותר או קישור מ־Google Maps.");
          return;
        }
      }
      const name = draft.name.trim() || parsed.titleHint || "";
      setDraft({
        ...draft,
        name,
        address,
        mapsLink: buildMapsOpenUrl({
          name: address ? undefined : name,
          address,
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

  return (
    <section aria-labelledby="lodging-title">
      <h3 id="lodging-title" className="t-label mb-2">
        לינה בלילה הזה
      </h3>

      {hasHotel ? (
        <div className="flex items-stretch border-y border-rule">
          <button
            type="button"
            onClick={openDialog}
            className="group flex min-w-0 flex-1 items-center justify-between gap-3 py-3 text-start"
          >
            <span className="min-w-0">
              <span className="t-h3 block truncate group-hover:underline" dir="auto">
                {day.hotel.name}
              </span>
              {day.hotel.address?.trim() && (
                <span className="t-meta mt-0.5 block truncate" dir="auto">
                  {day.hotel.address}
                </span>
              )}
              {day.hotel.costPerNightJpy > 0 && (
                <span className="t-meta tabular">
                  ¥{formatNumber(day.hotel.costPerNightJpy)} ללילה
                </span>
              )}
            </span>
            <HotelStatusLabel status={day.hotel.status} />
          </button>
          {mapsHref && (
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="flex w-10 shrink-0 items-center justify-center text-muted hover:text-ink"
              aria-label={`פתיחת ${day.hotel.name} במפות (חלון חדש)`}
            >
              <MapPin className="h-4 w-4" aria-hidden />
            </a>
          )}
          {stayHref && (
            <a
              href={stayHref}
              target="_blank"
              rel="noreferrer"
              className="flex w-10 shrink-0 items-center justify-center text-muted hover:text-ink"
              aria-label={listingAria(stayHref)}
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>
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
                  address: draft.address || place.address,
                  mapsLink: place.mapsLink,
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
            <div>
              <label className="field-label" htmlFor="hotel-address">
                כתובת
              </label>
              <input
                id="hotel-address"
                className="field"
                value={draft.address ?? ""}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                placeholder="רחוב, רובע, עיר"
                dir="auto"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="hotel-maps">
                קישור לגוגל מפות
              </label>
              <div className="flex gap-2">
                <input
                  id="hotel-maps"
                  className="field"
                  dir="ltr"
                  inputMode="url"
                  value={draft.mapsLink ?? ""}
                  onChange={(e) => setDraft({ ...draft, mapsLink: e.target.value })}
                  placeholder="https://maps.google.com/…"
                />
                <button
                  type="button"
                  onClick={() => void locateFromMapsOrAddress()}
                  disabled={resolving || !(draft.mapsLink?.trim() || draft.address?.trim())}
                  className="btn btn-secondary shrink-0"
                >
                  {resolving ? "מחפש…" : "איתור"}
                </button>
              </div>
              <p className="field-hint">
                הדביקו קישור ממפות או כתובת, ואיתור ימקם את המלון במפה.
              </p>
              {resolveError && <p className="field-hint text-danger">{resolveError}</p>}
              {draft.lat != null && draft.lng != null && !resolveError && (
                <p className="field-hint">מסומן במפה</p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="hotel-airbnb">
                קישור לאיירביאנבי / הזמנה
              </label>
              <input
                id="hotel-airbnb"
                className="field"
                dir="ltr"
                inputMode="url"
                value={draft.bookingLink ?? ""}
                onChange={(e) => setDraft({ ...draft, bookingLink: e.target.value })}
                placeholder="https://www.airbnb.com/rooms/…"
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

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import type {
  PlaceAutocompletePrediction,
  PlaceSearchResult,
} from "@/types/places";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 pe-10 text-sm text-foreground outline-none focus:border-accent/50";

type DropdownItem =
  | { kind: "google"; prediction: PlaceAutocompletePrediction }
  | { kind: "nominatim"; result: PlaceSearchResult };

export function PlaceSearchPicker({
  onSelect,
  placeholder = "חפשו מקום, מלון, אטרקציה…",
  label = "חיפוש מקום",
  hint,
  className,
}: {
  onSelect: (place: PlaceSearchResult) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  className?: string;
}) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<DropdownItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        try {
          const acRes = await fetch(
            `/api/places-autocomplete?q=${encodeURIComponent(trimmed)}`,
          );
          if (cancelled) return;

          if (acRes.ok) {
            const acData = (await acRes.json()) as {
              available?: boolean;
              predictions?: PlaceAutocompletePrediction[];
            };

            if (acData.available && (acData.predictions?.length ?? 0) > 0) {
              setGoogleAvailable(true);
              setItems(
                acData.predictions!.map((prediction) => ({
                  kind: "google" as const,
                  prediction,
                })),
              );
              setOpen(true);
              return;
            }

            if (acData.available === false) {
              setGoogleAvailable(false);
            }
          }

          const searchRes = await fetch(
            `/api/places-search?q=${encodeURIComponent(trimmed)}`,
          );
          if (cancelled) return;

          if (!searchRes.ok) {
            setItems([]);
            setOpen(false);
            return;
          }

          const searchData = (await searchRes.json()) as {
            results?: PlaceSearchResult[];
          };
          setItems(
            (searchData.results ?? []).map((result) => ({
              kind: "nominatim" as const,
              result,
            })),
          );
          setOpen((searchData.results?.length ?? 0) > 0);
        } catch {
          if (!cancelled) {
            setItems([]);
            setOpen(false);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  async function pickItem(item: DropdownItem) {
    if (item.kind === "nominatim") {
      onSelect(item.result);
      setQuery("");
      setItems([]);
      setOpen(false);
      return;
    }

    setResolving(true);
    try {
      const res = await fetch(
        `/api/places-details?placeId=${encodeURIComponent(item.prediction.placeId)}`,
      );
      if (!res.ok) return;
      const place = (await res.json()) as PlaceSearchResult;
      onSelect(place);
      setQuery("");
      setItems([]);
      setOpen(false);
    } finally {
      setResolving(false);
    }
  }

  const showDropdown = open && items.length > 0;
  const busy = loading || resolving;

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <label className="block text-xs text-muted">
        {label}
        <div className="relative mt-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className={inputClass + " ps-10"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (items.length > 0) setOpen(true);
            }}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-autocomplete="list"
            disabled={resolving}
          />
          {busy && (
            <Loader2 className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />
          )}

          {showDropdown && (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-surface shadow-lg"
            >
              {items.map((item, index) => {
                const name =
                  item.kind === "google"
                    ? item.prediction.name
                    : item.result.name;
                const address =
                  item.kind === "google"
                    ? item.prediction.address
                    : item.result.address;

                return (
                  <li key={index} role="option">
                    <button
                      type="button"
                      onClick={() => void pickItem(item)}
                      className="flex w-full items-start gap-2 border-b border-border/60 px-3 py-2.5 text-start text-sm last:border-b-0 hover:bg-accent-soft/60"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span className="min-w-0">
                        <span className="block font-medium text-foreground">
                          {name}
                        </span>
                        {address && (
                          <span className="mt-0.5 block text-xs text-muted">
                            {address}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {hint && (
          <span className="mt-1 block text-[11px] text-muted">{hint}</span>
        )}
        {googleAvailable === false && !hint && (
          <span className="mt-1 block text-[11px] text-muted">
            חיפוש דרך OpenStreetMap · הוספת מפתח Google Maps משפרת תוצאות
          </span>
        )}
      </label>
    </div>
  );
}

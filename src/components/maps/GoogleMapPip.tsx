"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BedDouble,
  ExternalLink,
  List,
  MapPinned,
  Maximize2,
  Minimize2,
  Sparkles,
  X,
} from "lucide-react";
import { buildGoogleMapsOpenUrl } from "@/lib/maps";
import { softEntranceProps } from "@/lib/motion";
import { collectTripPins, pinToMapPlace, type TripPin } from "@/lib/tripPins";
import { useItineraryEditor } from "@/store/itineraryEditor";
import { useMapPip } from "@/store/mapPip";
import { isBundledDemoItinerary } from "@/lib/demoDetect";
import { cn } from "@/lib/utils";

const MultiPinMap = dynamic(
  () =>
    import("@/components/maps/MultiPinMap").then((m) => m.MultiPinMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#0b0f17] text-xs text-muted">
        טוען מפת Google...
      </div>
    ),
  },
);

export function GoogleMapPip() {
  const open = useMapPip((s) => s.open);
  const size = useMapPip((s) => s.size);
  const place = useMapPip((s) => s.place);
  const selectedDistrict = useMapPip((s) => s.selectedDistrict);
  const activePinId = useMapPip((s) => s.activePinId);
  const showPinList = useMapPip((s) => s.showPinList);
  const toggle = useMapPip((s) => s.toggle);
  const closePip = useMapPip((s) => s.closePip);
  const setSize = useMapPip((s) => s.setSize);
  const setActivePinId = useMapPip((s) => s.setActivePinId);
  const focusPlace = useMapPip((s) => s.focusPlace);
  const togglePinList = useMapPip((s) => s.togglePinList);
  const editorDays = useItineraryEditor((s) => s.days);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const reduceMotion = useReducedMotion();

  const days = useMemo(() => {
    if (!hydrated) return [];
    if (!editorDays?.length || isBundledDemoItinerary(editorDays)) return [];
    return editorDays;
  }, [hydrated, editorDays]);
  const pins = useMemo(() => collectTripPins(days), [days]);

  const hotels = pins.filter((p) => p.kind === "hotel");
  const attractions = pins.filter((p) => p.kind === "attraction");
  const activePin = pins.find((p) => p.id === activePinId) ?? null;
  const title = activePin?.title ?? place.labelHe;
  const openUrl = buildGoogleMapsOpenUrl(
    activePin ? pinToMapPlace(activePin) : place,
  );
  const isLarge = size === "large";

  // Prefer an active pin; otherwise fly to district/place focus (cards set this).
  // When there are trip pins and no district selected, leave focus null so the map fits all pins.
  const mapFocus = useMemo(() => {
    if (activePinId) return null;
    if (selectedDistrict || pins.length === 0) {
      return { lat: place.lat, lng: place.lng, zoom: place.zoom };
    }
    return null;
  }, [
    activePinId,
    selectedDistrict,
    pins.length,
    place.lat,
    place.lng,
    place.zoom,
  ]);

  if (!hydrated) return null;

  function selectPin(pin: TripPin) {
    setActivePinId(pin.id);
    focusPlace(pinToMapPlace(pin));
  }

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            {...softEntranceProps(reduceMotion, { y: 10 })}
            onClick={toggle}
            className="glow-accent fixed z-[70] flex min-h-11 items-center gap-2 rounded-full border border-accent/40 bg-accent px-4 py-3 text-sm font-semibold text-white shadow-2xl"
            style={{
              bottom: "max(1.25rem, var(--safe-bottom))",
              insetInlineStart: "max(1.25rem, var(--safe-right))",
            }}
            aria-label="פתח מפת Google"
          >
            <MapPinned className="h-4 w-4" />
            מפת Google
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
              {pins.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            {...softEntranceProps(reduceMotion, { y: 12 })}
            className={cn(
              "glass-strong fixed z-[70] overflow-hidden rounded-2xl shadow-2xl",
              isLarge
                ? "h-[min(72dvh,640px)] w-[min(calc(100vw-1.5rem-var(--safe-left)-var(--safe-right)),720px)]"
                : "h-[min(42dvh,280px)] w-[min(calc(100vw-1.5rem-var(--safe-left)-var(--safe-right)),380px)]",
            )}
            style={{
              bottom: "max(1.25rem, var(--safe-bottom))",
              insetInlineStart: "max(0.75rem, var(--safe-right))",
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-strong/90 px-3 py-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <MapPinned className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="truncate">{title}</span>
                </div>
                <div className="truncate text-[10px] text-muted">
                  Google Maps · {hotels.length} מלונות · {attractions.length}{" "}
                  אטרקציות
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={togglePinList}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-lg border text-muted hover:border-accent/40 hover:text-accent sm:h-8 sm:w-8",
                    showPinList
                      ? "border-accent/40 bg-accent-soft text-accent"
                      : "border-border",
                  )}
                  aria-label="רשימת פינים"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <a
                  href={openUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-muted hover:border-accent/40 hover:text-accent sm:h-8 sm:w-8"
                  aria-label="פתח ב־Google Maps"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setSize(isLarge ? "mini" : "large")}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-muted hover:border-accent/40 hover:text-accent sm:h-8 sm:w-8"
                  aria-label={isLarge ? "מזער" : "הגדל"}
                >
                  {isLarge ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={closePip}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-muted hover:border-accent/40 hover:text-accent sm:h-8 sm:w-8"
                  aria-label="סגור מפה"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div
              className={cn(
                "relative grid h-[calc(100%-44px)] min-h-0",
                showPinList && isLarge
                  ? // Mobile: map on top + scrollable list sheet; sm+: side list like desktop
                    "grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(8rem,42%)] sm:grid-cols-[minmax(0,1fr)_minmax(0,11rem)] sm:grid-rows-1"
                  : "grid-cols-1",
              )}
            >
              <div className="relative min-h-0">
                <MultiPinMap
                  pins={pins}
                  activePinId={activePinId}
                  onSelectPin={selectPin}
                  focus={mapFocus}
                />
              </div>

              {showPinList && isLarge && (
                <aside className="min-h-0 overflow-y-auto overscroll-contain border-t border-border bg-surface-strong/95 p-2 sm:border-s sm:border-t-0">
                  <PinGroup
                    title="מלונות"
                    icon={<BedDouble className="h-3.5 w-3.5 text-accent" />}
                    pins={hotels}
                    activePinId={activePinId}
                    onSelect={selectPin}
                  />
                  <PinGroup
                    title="אטרקציות"
                    icon={<Sparkles className="h-3.5 w-3.5 text-info" />}
                    pins={attractions}
                    activePinId={activePinId}
                    onSelect={selectPin}
                  />
                </aside>
              )}
            </div>

            {showPinList && !isLarge && (
              <div className="absolute inset-x-0 bottom-0 max-h-[48%] overflow-y-auto overscroll-contain border-t border-border bg-surface-strong/95 p-2 backdrop-blur-md">
                <PinGroup
                  title="מלונות"
                  icon={<BedDouble className="h-3.5 w-3.5 text-accent" />}
                  pins={hotels}
                  activePinId={activePinId}
                  onSelect={selectPin}
                />
                <PinGroup
                  title="אטרקציות"
                  icon={<Sparkles className="h-3.5 w-3.5 text-info" />}
                  pins={attractions}
                  activePinId={activePinId}
                  onSelect={selectPin}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PinGroup({
  title,
  icon,
  pins,
  activePinId,
  onSelect,
}: {
  title: string;
  icon: React.ReactNode;
  pins: TripPin[];
  activePinId: string | null;
  onSelect: (pin: TripPin) => void;
}) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold text-muted">
        {icon}
        {title} ({pins.length})
      </div>
      <div className="space-y-1">
        {pins.map((pin) => (
          <button
            key={pin.id}
            type="button"
            onClick={() => onSelect(pin)}
            className={cn(
              "w-full rounded-xl border px-2 py-2.5 text-right transition sm:py-1.5",
              activePinId === pin.id
                ? "border-accent/45 bg-accent-soft"
                : "border-border bg-background/30 hover:border-accent/30",
            )}
          >
            <div className="truncate text-xs font-medium">{pin.title}</div>
            <div className="truncate text-[10px] text-muted">{pin.subtitle}</div>
          </button>
        ))}
        {pins.length === 0 && (
          <p className="px-1 text-[11px] text-muted">אין פריטים עדיין</p>
        )}
      </div>
    </div>
  );
}

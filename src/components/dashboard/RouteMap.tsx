"use client";

import { motion } from "framer-motion";
import { MapPinned, PictureInPicture2 } from "lucide-react";
import { districts, type DistrictId } from "@/data/trip";
import { useMapPip } from "@/store/mapPip";
import { cn } from "@/lib/utils";
import { TiltCard } from "@/components/ui/TiltCard";
import { GlassCard } from "@/components/ui/GlassCard";

interface RouteMapProps {
  selected: DistrictId | null;
  onSelect: (id: DistrictId) => void;
}

export function RouteMap({ selected, onSelect }: RouteMapProps) {
  const open = useMapPip((s) => s.open);
  const toggle = useMapPip((s) => s.toggle);
  const openPip = useMapPip((s) => s.openPip);

  return (
    <GlassCard className="h-full overflow-hidden p-0">
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPinned className="h-4 w-4 text-olive" />
              אזורים בטיול · Google Maps
            </div>
            <p className="mt-1 text-xs text-muted">
              בחרו אזור — המפה נפתחת כ־Picture in Picture
            </p>
          </div>
          <button
            type="button"
            onClick={() => (open ? toggle() : openPip())}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              open
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-border text-muted hover:border-accent/40 hover:text-accent",
            )}
          >
            <PictureInPicture2 className="h-3.5 w-3.5" />
            {open ? "הסתר מפה" : "הצג מפה"}
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--olive)_14%,transparent),transparent_42%),radial-gradient(circle_at_80%_70%,color-mix(in_srgb,var(--sky)_14%,transparent),transparent_45%),radial-gradient(circle_at_50%_100%,color-mix(in_srgb,var(--amber)_10%,transparent),transparent_50%)] px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded-full border border-border bg-surface/70 px-2.5 py-1">
            PiP קבוע בפינת המסך
          </span>
          <span className="rounded-full border border-border bg-surface/70 px-2.5 py-1">
            מזעור / הגדלה / פתיחה ב־Google
          </span>
        </div>
        <p className="mt-3 max-w-md text-sm leading-6 text-foreground/90">
          במקום מפה סטטית בדשבורד — Google Maps צפה מעל האפליקציה, כדי שתוכלו
          לנווט באזורים בזמן שאתם עוברים בין ימים וכלים.
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {districts.map((district, index) => {
          const dimmed = selected !== null && selected !== district.id;
          return (
            <TiltCard key={district.id}>
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => onSelect(district.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-right transition",
                  selected === district.id
                    ? "border-accent/50 bg-accent-soft"
                    : "border-border bg-background/30 hover:border-accent/30",
                  dimmed ? "opacity-45" : "opacity-100",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: district.accent }}
                  />
                  <span className="font-semibold">{district.nameHe}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted">{district.nameEn}</p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  {district.highlight}
                </p>
              </motion.button>
            </TiltCard>
          );
        })}
      </div>
    </GlassCard>
  );
}

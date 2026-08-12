"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

interface DateRangeCalendarProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseIso(iso: string) {
  return new Date(`${iso}T12:00:00`);
}

export function DateRangeCalendar({
  startDate,
  endDate,
  onChange,
}: DateRangeCalendarProps) {
  const initial = parseIso(startDate || toIso(new Date()));
  const [view, setView] = useState(
    () => new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const [picking, setPicking] = useState<"start" | "end">("start");

  const cells = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const items: Array<{ iso: string; day: number; inMonth: boolean }> = [];

    for (let i = 0; i < startPad; i++) {
      const d = new Date(year, month, -startPad + i + 1);
      items.push({ iso: toIso(d), day: d.getDate(), inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      items.push({ iso: toIso(d), day, inMonth: true });
    }
    while (items.length % 7 !== 0) {
      const last = parseIso(items[items.length - 1].iso);
      last.setDate(last.getDate() + 1);
      items.push({ iso: toIso(last), day: last.getDate(), inMonth: false });
    }
    return items;
  }, [view]);

  const monthLabel = new Intl.DateTimeFormat("he-IL", {
    month: "long",
    year: "numeric",
  }).format(view);

  function handleClick(iso: string) {
    if (picking === "start") {
      const nextEnd = endDate && endDate >= iso ? endDate : iso;
      onChange(iso, nextEnd);
      setPicking("end");
      return;
    }
    if (iso < startDate) {
      onChange(iso, startDate);
      setPicking("start");
      return;
    }
    onChange(startDate, iso);
    setPicking("start");
  }

  return (
    <div className="rounded-2xl border border-border bg-background/35 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border hover:border-accent/40 sm:h-8 sm:w-8 sm:p-1.5"
          onClick={() =>
            setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
          }
          aria-label="חודש קודם"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="min-w-0 truncate text-center text-sm font-semibold">{monthLabel}</div>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border hover:border-accent/40 sm:h-8 sm:w-8 sm:p-1.5"
          onClick={() =>
            setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
          }
          aria-label="חודש הבא"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 flex flex-wrap gap-2 text-[11px]">
        <button
          type="button"
          onClick={() => setPicking("start")}
          className={cn(
            "min-h-11 rounded-full border px-2.5 py-2 sm:min-h-0 sm:py-1",
            picking === "start"
              ? "border-accent/40 bg-accent-soft text-accent"
              : "border-border text-muted",
          )}
        >
          לחצו על יום יציאה
        </button>
        <button
          type="button"
          onClick={() => setPicking("end")}
          className={cn(
            "min-h-11 rounded-full border px-2.5 py-2 sm:min-h-0 sm:py-1",
            picking === "end"
              ? "border-accent/40 bg-accent-soft text-accent"
              : "border-border text-muted",
          )}
        >
          לחצו על יום חזרה
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const inRange =
            startDate &&
            endDate &&
            cell.iso >= startDate &&
            cell.iso <= endDate;
          const edge = cell.iso === startDate || cell.iso === endDate;
          return (
            <button
              key={`${cell.iso}-${cell.inMonth}`}
              type="button"
              onClick={() => handleClick(cell.iso)}
              className={cn(
                "aspect-square rounded-xl text-sm transition",
                !cell.inMonth && "opacity-35",
                inRange && !edge && "bg-accent-soft text-accent",
                edge && "bg-accent font-semibold text-white glow-accent",
                !inRange && "hover:bg-foreground/5",
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

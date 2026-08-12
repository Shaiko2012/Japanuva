"use client";

import { useId, useState } from "react";
import { CalendarDays } from "lucide-react";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { KeypadSheet } from "@/components/ui/KeypadSheet";
import { cn } from "@/lib/utils";

function formatDateHe(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

interface DateFieldProps {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
  title?: string;
  className?: string;
  fieldClassName?: string;
  emptyLabel?: string;
  "aria-label"?: string;
}

export function DateField({
  value,
  onChange,
  label,
  title,
  className,
  fieldClassName,
  emptyLabel = "בחרו תאריך",
  "aria-label": ariaLabel,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const sheetTitle = title || label || "בחירת תאריך";

  return (
    <div className={cn(label ? "block text-xs text-muted" : undefined, className)}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <button
        type="button"
        id={id}
        onClick={() => setOpen(true)}
        aria-label={ariaLabel || label || sheetTitle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "mt-1 flex w-full min-w-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-start text-sm text-foreground outline-none transition hover:border-yellow/45 focus-visible:border-accent/50",
          fieldClassName,
        )}
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted" />
        <span className={cn("min-w-0 flex-1 truncate", !value && "text-muted")}>
          {value ? formatDateHe(value) : emptyLabel}
        </span>
      </button>

      <KeypadSheet
        open={open}
        title={sheetTitle}
        onClose={() => setOpen(false)}
        className="max-w-md"
      >
        <DateRangeCalendar
          mode="single"
          value={value}
          onChange={(iso) => {
            onChange(iso);
            setOpen(false);
          }}
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl bg-nav-bg text-sm font-bold text-nav-fg shadow-[0_8px_20px_var(--glow)]"
        >
          אישור
        </button>
      </KeypadSheet>
    </div>
  );
}

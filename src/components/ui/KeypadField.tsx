"use client";

import { useId, useState, type ReactNode } from "react";
import { Clock3, Hash } from "lucide-react";
import { KeypadSheet } from "@/components/ui/KeypadSheet";
import { NumberKeypad } from "@/components/ui/NumberKeypad";
import { TimeKeypad } from "@/components/ui/TimeKeypad";
import { cn, formatNumber } from "@/lib/utils";

type NumberMode = {
  mode: "number";
  value: number;
  onChange: (value: number) => void;
  allowDecimal?: boolean;
  maxDecimals?: number;
  min?: number;
  max?: number;
  /** Format display; default locale number */
  formatDisplay?: (value: number) => string;
  emptyLabel?: string;
};

type TimeMode = {
  mode: "time";
  value: string;
  onChange: (value: string) => void;
  emptyLabel?: string;
};

type KeypadFieldProps = (NumberMode | TimeMode) & {
  label?: string;
  title?: string;
  className?: string;
  fieldClassName?: string;
  /** Hide outer label wrapper styling */
  bare?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  "aria-label"?: string;
};

export function KeypadField(props: KeypadFieldProps) {
  const {
    label,
    title,
    className,
    fieldClassName,
    bare,
    prefix,
    suffix,
    "aria-label": ariaLabel,
  } = props;
  const [open, setOpen] = useState(false);
  const id = useId();

  const display =
    props.mode === "time"
      ? props.value || props.emptyLabel || "––:––"
      : props.value === 0 && props.emptyLabel
        ? props.emptyLabel
        : props.formatDisplay
          ? props.formatDisplay(props.value)
          : formatNumber(props.value);

  const sheetTitle =
    title ||
    label ||
    (props.mode === "time" ? "בחירת שעה" : "הזנת מספר");

  const trigger = (
    <button
      type="button"
      id={id}
      onClick={() => setOpen(true)}
      aria-label={ariaLabel || label || sheetTitle}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={cn(
        bare
          ? "mt-1 flex w-full min-w-0 items-center gap-2 bg-transparent text-start outline-none"
          : "mt-1 flex w-full min-w-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-start text-sm text-foreground outline-none transition hover:border-yellow/45 focus-visible:border-accent/50",
        fieldClassName,
      )}
    >
      {prefix ??
        (props.mode === "time" ? (
          <Clock3 className="h-3.5 w-3.5 shrink-0 text-muted" />
        ) : (
          <Hash className="h-3.5 w-3.5 shrink-0 text-muted" />
        ))}
      <span
        className={cn(
          "min-w-0 flex-1 truncate tabular-nums",
          props.mode === "time" && !props.value && "text-muted",
          props.mode === "number" &&
            props.value === 0 &&
            props.emptyLabel &&
            "text-muted",
        )}
      >
        {display}
      </span>
      {suffix}
    </button>
  );

  return (
    <div className={cn(label ? "block text-xs text-muted" : undefined, className)}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      {trigger}

      <KeypadSheet
        open={open}
        title={sheetTitle}
        onClose={() => setOpen(false)}
      >
        {props.mode === "time" ? (
          <TimeKeypad
            value={props.value}
            onConfirm={(v) => {
              props.onChange(v);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        ) : (
          <NumberKeypad
            value={props.value}
            allowDecimal={props.allowDecimal}
            maxDecimals={props.maxDecimals}
            min={props.min}
            max={props.max}
            onConfirm={(v) => {
              props.onChange(v);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </KeypadSheet>
    </div>
  );
}

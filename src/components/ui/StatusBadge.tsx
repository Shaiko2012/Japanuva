import { cn } from "@/lib/utils";

const tones = {
  booked: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  research: "bg-info/15 text-info border-info/30",
  accent: "bg-accent-soft text-accent border-accent/35",
  muted: "bg-foreground/5 text-muted border-border",
} as const;

const labels = {
  booked: "שמור",
  pending: "ממתין",
  research: "בבדיקה",
} as const;

interface StatusBadgeProps {
  status?: keyof typeof labels;
  tone?: keyof typeof tones;
  label?: string;
  className?: string;
  pulse?: boolean;
}

export function StatusBadge({
  status,
  tone,
  label,
  className,
  pulse,
}: StatusBadgeProps) {
  const resolvedTone = tone ?? status ?? "muted";
  const text = label ?? (status ? labels[status] : "");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[resolvedTone],
        className,
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {text}
    </span>
  );
}

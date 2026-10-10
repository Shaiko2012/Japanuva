import { cn } from "@/lib/utils";
import type { HotelStatus, TicketStatus } from "@/types/editor";
import { HOTEL_STATUS_LABELS, TICKET_STATUS_LABELS } from "@/types/editor";

export type StatusTone = "booked" | "pending" | "missing" | "neutral";

export function StatusLabel({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: string;
  className?: string;
}) {
  return (
    <span className={cn("status", `status-${tone}`, className)}>{children}</span>
  );
}

const HOTEL_TONE: Record<HotelStatus, StatusTone> = {
  booked: "booked",
  considering: "pending",
  not_booked: "missing",
};

export function HotelStatusLabel({
  status,
  hasHotel = true,
  className,
}: {
  status: HotelStatus;
  hasHotel?: boolean;
  className?: string;
}) {
  if (!hasHotel) {
    return (
      <StatusLabel tone="missing" className={className}>
        אין לינה
      </StatusLabel>
    );
  }
  return (
    <StatusLabel tone={HOTEL_TONE[status]} className={className}>
      {HOTEL_STATUS_LABELS[status]}
    </StatusLabel>
  );
}

const TICKET_TONE: Record<TicketStatus, StatusTone> = {
  booked: "booked",
  needs_reservation: "pending",
  free_entry: "neutral",
  buy_on_site: "neutral",
};

export function TicketStatusLabel({ status }: { status: TicketStatus }) {
  return (
    <StatusLabel tone={TICKET_TONE[status]}>
      {TICKET_STATUS_LABELS[status]}
    </StatusLabel>
  );
}

"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarPlus, GripVertical, Trash2 } from "lucide-react";
import {
  selectSelectedDay,
  useItineraryEditor,
} from "@/store/itineraryEditor";
import { CITY_LABELS } from "@/types/editor";
import { cn } from "@/lib/utils";

function formatShort(date: string) {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}

function SortableDayRow({
  id,
  index,
  date,
  city,
  active,
  onSelect,
  onRemove,
  canRemove,
}: {
  id: string;
  index: number;
  date: string;
  city: string;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "group flex items-center gap-1 rounded-xl border p-1.5",
        active
          ? "border-accent/45 bg-accent-soft glow-accent"
          : "border-border bg-background/30",
        isDragging && "z-10 opacity-90",
      )}
    >
      <button
        type="button"
        className="rounded-lg p-1.5 text-muted touch-none hover:text-foreground"
        aria-label="גרור יום"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 rounded-lg px-1.5 py-1 text-right"
      >
        <div className="text-xs font-semibold">יום {index + 1}</div>
        <div className="truncate text-[11px] text-muted">
          {formatShort(date)} · {city}
        </div>
      </button>
      <button
        type="button"
        disabled={!canRemove}
        onClick={onRemove}
        className="rounded-lg p-1.5 text-muted opacity-0 transition group-hover:opacity-100 disabled:opacity-20 hover:text-accent"
        aria-label="מחק יום"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function DaySidebar() {
  const days = useItineraryEditor((s) => s.days);
  const selected = useItineraryEditor(selectSelectedDay);
  const selectDay = useItineraryEditor((s) => s.selectDay);
  const addDay = useItineraryEditor((s) => s.addDay);
  const removeDay = useItineraryEditor((s) => s.removeDay);
  const reorderDays = useItineraryEditor((s) => s.reorderDays);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderDays(String(active.id), String(over.id));
  }

  return (
    <aside className="glass flex h-full flex-col rounded-2xl p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">ימי הטיול</h2>
        <button
          type="button"
          onClick={() => addDay()}
          className="inline-flex items-center gap-1 rounded-full border border-accent/35 bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          יום חדש
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pe-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={days.map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            {days.map((day, index) => (
              <SortableDayRow
                key={day.id}
                id={day.id}
                index={index}
                date={day.date}
                city={CITY_LABELS[day.city]}
                active={selected?.id === day.id}
                onSelect={() => selectDay(day.id)}
                onRemove={() => removeDay(day.id)}
                canRemove={days.length > 1}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </aside>
  );
}

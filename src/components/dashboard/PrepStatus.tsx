"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { vjwChecklist } from "@/data/tools";
import { useChecklists } from "@/store/checklists";
import type { EditorDay } from "@/types/editor";
import { nightsWithoutLodging } from "@/lib/tripSummary";
import { SectionHead } from "@/components/ui/PageHeader";
import { StatusLabel } from "@/components/ui/StatusLabel";

export function PrepStatus({ days, isDemo }: { days: EditorDay[]; isDemo: boolean }) {
  const vjw = useChecklists((s) => s.vjw);
  const vjwDone = vjwChecklist.filter((item) => vjw[item.id]).length;
  const missingNights = isDemo ? 0 : nightsWithoutLodging(days).length;

  const items = [
    {
      label: "Visit Japan Web",
      href: "/vjw",
      status:
        vjwDone === vjwChecklist.length ? (
          <StatusLabel tone="booked">הושלם</StatusLabel>
        ) : (
          <span className="t-meta tabular">
            {vjwDone} מתוך {vjwChecklist.length} שלבים
          </span>
        ),
    },
    {
      label: "לינה לכל הלילות",
      href: "/itinerary",
      status:
        missingNights === 0 ? (
          <StatusLabel tone="booked">מכוסה</StatusLabel>
        ) : (
          <StatusLabel tone="missing">{`חסרים ${missingNights}`}</StatusLabel>
        ),
    },
    {
      label: "האם JR Pass משתלם",
      href: "/jr-pass",
      status: <span className="t-meta">מחשבון</span>,
    },
    {
      label: "מהשדה אל המלון",
      href: "/transit",
      status: <span className="t-meta">השוואה</span>,
    },
  ];

  return (
    <section aria-labelledby="prep-title">
      <SectionHead
        as="h3"
        id="prep-title"
        title="לפני הטיסה"
        meta={
          <Link href="/guide" className="link-nav">
            כל ההכנות
            <ArrowLeft aria-hidden />
          </Link>
        }
      />
      <ul className="ruled border-b border-rule">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex min-h-12 items-center justify-between gap-3 py-2.5 hover:text-vermilion"
            >
              <span className="font-semibold">{item.label}</span>
              {item.status}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

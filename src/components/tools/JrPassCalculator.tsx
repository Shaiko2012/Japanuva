"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import {
  JR_CITY_LABELS,
  fareForLeg,
  jrCities,
  jrPassFacts,
  jrPassPrices,
  officialLinks,
  type JrCity,
  type JrLeg,
  type JrPassDuration,
} from "@/data/tools";
import { useFamilyStore } from "@/store/family";
import { useTripDays } from "@/hooks/useTripDays";
import { useHydrated } from "@/hooks/useHydrated";
import { formatDayHe } from "@/lib/tripSummary";
import { formatNumber, cn } from "@/lib/utils";
import { KeypadField } from "@/components/ui/KeypadField";
import { PageHeader, SectionHead } from "@/components/ui/PageHeader";
import { softEase } from "@/lib/motion";
import type { EditorCity, EditorDay } from "@/types/editor";

type Leg = JrLeg & { date?: string };

const DURATIONS: JrPassDuration[] = [7, 14, 21];

const defaultLegs: Leg[] = [
  { id: "leg-1", from: "Tokyo", to: "Kyoto" },
  { id: "leg-2", from: "Kyoto", to: "Osaka" },
  { id: "leg-3", from: "Osaka", to: "Tokyo" },
];

const CITY_TO_JR: Partial<Record<EditorCity, JrCity>> = {
  Tokyo: "Tokyo",
  Nagoya: "Nagoya",
  Kyoto: "Kyoto",
  Osaka: "Osaka",
  Hiroshima: "Hiroshima",
};

function legsFromItinerary(days: EditorDay[]): Leg[] {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const legs: Leg[] = [];
  let prev: JrCity | null = null;
  for (const day of sorted) {
    const city = CITY_TO_JR[day.city];
    if (!city) continue;
    if (prev && city !== prev) {
      legs.push({ id: `it-${day.id}`, from: prev, to: city, date: day.date });
    }
    prev = city;
  }
  return legs;
}

function daySpan(legs: Leg[]): number | null {
  const dates = legs.map((l) => l.date).filter(Boolean) as string[];
  if (dates.length < 2 || dates.length !== legs.length) return null;
  const sorted = [...dates].sort();
  const first = new Date(`${sorted[0]}T00:00:00`).getTime();
  const last = new Date(`${sorted[sorted.length - 1]}T00:00:00`).getTime();
  return Math.round((last - first) / 86_400_000) + 1;
}

function CitySelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: JrCity;
  onChange: (city: JrCity) => void;
}) {
  return (
    <select
      id={id}
      aria-label={label}
      className="field mt-0 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value as JrCity)}
    >
      {jrCities.map((city) => (
        <option key={city} value={city}>
          {JR_CITY_LABELS[city]}
        </option>
      ))}
    </select>
  );
}

export function JrPassCalculator() {
  const hydrated = useHydrated();
  const family = useFamilyStore((s) => s.family);
  const { days, isDemo } = useTripDays();
  const [legs, setLegs] = useState<Leg[]>(defaultLegs);
  const [adultsOverride, setAdultsOverride] = useState<number | null>(null);
  const [kidsOverride, setKidsOverride] = useState<number | null>(null);
  const [extraPerAdult, setExtraPerAdult] = useState(0);
  const [importNote, setImportNote] = useState<string | null>(null);

  const adults = adultsOverride ?? (hydrated ? family.adults : 2);
  const kids = kidsOverride ?? (hydrated ? family.kids : 0);

  const fares = legs.map((leg) => fareForLeg(leg.from, leg.to));
  const unknownCount = fares.filter((f) => f === null).length;
  const perAdult = fares.reduce<number>((sum, f) => sum + (f ?? 0), 0) + extraPerAdult;
  const ticketsTotal = Math.round(perAdult * adults + (perAdult / 2) * kids);
  const span = daySpan(legs);

  const rows = useMemo(
    () =>
      DURATIONS.map((d) => {
        const total = jrPassPrices[d].adult * adults + jrPassPrices[d].child * kids;
        return {
          days: d,
          total,
          diff: ticketsTotal - total,
          covers: span == null || span <= d,
        };
      }),
    [adults, kids, ticketsTotal, span],
  );

  const covering = rows.filter((r) => r.covers);
  const cheapestPass = covering.reduce<(typeof rows)[number] | null>(
    (best, r) => (best == null || r.total < best.total ? r : best),
    null,
  );
  const passWins = cheapestPass != null && cheapestPass.diff > 0;

  function updateLeg(id: string, patch: Partial<Leg>) {
    setLegs((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch, date: undefined } : l)));
  }

  function importFromItinerary() {
    const next = legsFromItinerary(days);
    if (next.length === 0) {
      setImportNote("במסלול אין עדיין מעבר בין טוקיו, קיוטו ואוסקה. אפשר להזין נסיעות ידנית.");
      return;
    }
    setLegs(next);
    setImportNote(
      `נוספו ${next.length} נסיעות מהמסלול${isDemo ? " לדוגמה" : ""}. הנסיעה מהשדה ואליו לא נכללת.`,
    );
  }

  let verdict: string;
  if (perAdult === 0) {
    verdict = "הוסיפו את הנסיעות הארוכות של הטיול כדי לקבל חישוב.";
  } else if (cheapestPass == null) {
    verdict = `הנסיעות פרוסות על ${span} ימים, יותר ממה ש־JR Pass מכסה. כנראה שכרטיסים רגילים מתאימים יותר.`;
  } else if (passWins) {
    verdict = `JR Pass ל־${cheapestPass.days} ימים יחסוך לכם כ־¥${formatNumber(cheapestPass.diff)}.`;
  } else {
    verdict = `כרטיסים רגילים יעלו לכם כ־¥${formatNumber(-cheapestPass.diff)} פחות מ־JR Pass.`;
  }

  return (
    <div>
      <PageHeader
        kicker="תחבורה"
        title="האם JR Pass משתלם?"
        lede="משווים את מחיר הכרטיס הארצי לסכום הכרטיסים הרגילים לנסיעות שאתם מתכננים, לכל המשפחה."
      />

      <section aria-live="polite" className="border-y-2 border-rule-strong py-6 sm:py-8">
        <p className="t-label">התשובה לפי הנתונים שהזנתם</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={verdict}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: softEase }}
            className="t-h2 mt-2 max-w-3xl text-balance"
          >
            {verdict}
          </motion.p>
        </AnimatePresence>
        <p className="t-meta mt-3">
          {adults} מבוגרים{kids > 0 ? ` ו־${kids} ילדים בגילאי 6-11` : ""} · אומדן, לא הצעת מחיר
        </p>
      </section>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <section aria-labelledby="legs-title">
          <SectionHead
            id="legs-title"
            title="הנסיעות הארוכות"
            meta={span ? `פרוסות על ${span} ימים` : undefined}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={importFromItinerary} className="btn btn-secondary btn-sm">
              ייבוא מהמסלול
            </button>
          </div>
          {importNote && <p className="t-meta mt-2">{importNote}</p>}

          <ol className="ruled mt-4 border-b border-rule">
            {legs.map((leg, index) => {
              const fare = fares[index];
              return (
                <li
                  key={leg.id}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2 py-3 sm:grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,1fr)_5.5rem_auto]"
                >
                  <span className="t-num hidden text-muted sm:block">{index + 1}</span>
                  <CitySelect
                    id={`from-${leg.id}`}
                    label={`נסיעה ${index + 1}, מוצא`}
                    value={leg.from}
                    onChange={(from) => updateLeg(leg.id, { from })}
                  />
                  <CitySelect
                    id={`to-${leg.id}`}
                    label={`נסיעה ${index + 1}, יעד`}
                    value={leg.to}
                    onChange={(to) => updateLeg(leg.id, { to })}
                  />
                  <span className="col-span-2 text-sm sm:col-span-1 sm:text-end">
                    {fare == null ? (
                      <span className="text-muted">אין אומדן</span>
                    ) : (
                      <span className="tabular">¥{formatNumber(fare)}</span>
                    )}
                    {leg.date && (
                      <span className="t-meta block">
                        {formatDayHe(leg.date, { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLegs((prev) => prev.filter((l) => l.id !== leg.id))}
                    disabled={legs.length <= 1}
                    aria-label={`הסרת נסיעה ${index + 1}`}
                    className="btn btn-tertiary btn-icon justify-self-end"
                  >
                    <X aria-hidden />
                  </button>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={() =>
              setLegs((prev) => [
                ...prev,
                {
                  id: `leg-${Date.now()}`,
                  from: prev[prev.length - 1]?.to ?? "Tokyo",
                  to: "Tokyo",
                },
              ])
            }
            className="btn btn-tertiary mt-2"
          >
            <Plus aria-hidden />
            הוספת נסיעה
          </button>

          {unknownCount > 0 && (
            <p className="note mt-4 text-sm">
              ל־{unknownCount} מהנסיעות אין אומדן מחיר, והן לא נכללות בחישוב.
            </p>
          )}

          <details className="mt-6 border-t border-rule pt-4">
            <summary className="btn btn-tertiary btn-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              נוסעים ונסיעות נוספות
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <KeypadField
                mode="number"
                label="מבוגרים (12+)"
                value={adults}
                min={1}
                max={10}
                onChange={(n) => setAdultsOverride(Math.min(10, Math.max(1, n || 1)))}
              />
              <KeypadField
                mode="number"
                label="ילדים 6-11"
                value={kids}
                min={0}
                max={10}
                onChange={(n) => setKidsOverride(Math.min(10, Math.max(0, n || 0)))}
              />
              <KeypadField
                mode="number"
                label="נסיעות JR נוספות (¥ למבוגר)"
                value={extraPerAdult}
                min={0}
                onChange={(n) => setExtraPerAdult(Math.max(0, n || 0))}
              />
            </div>
            <p className="field-hint">
              ילדים מתחת לגיל 6 לא נספרים. נסיעות נוספות הן למשל רכבות JR בתוך העיר או טיול יום
              לנארה.
            </p>
          </details>
        </section>

        <section aria-labelledby="compare-title">
          <SectionHead id="compare-title" title="השוואה לכל המשפחה" />
          <table className="table mt-3">
            <caption className="sr-only">עלות כרטיסים רגילים מול JR Pass</caption>
            <thead>
              <tr>
                <th scope="col">אפשרות</th>
                <th scope="col" className="text-end">
                  סה״כ
                </th>
                <th scope="col" className="text-end">
                  הפרש
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="font-semibold">
                  כרטיסים רגילים
                </th>
                <td className="tabular text-end">¥{formatNumber(ticketsTotal)}</td>
                <td className="text-end text-muted"></td>
              </tr>
              {rows.map((row) => {
                const best = passWins && cheapestPass?.days === row.days;
                return (
                  <tr key={row.days} className={cn(!row.covers && "text-muted")}>
                    <th scope="row" className="font-normal">
                      JR Pass {row.days} ימים
                      {best && <span className="status status-booked ms-2">משתלם</span>}
                      {!row.covers && <span className="t-meta block">קצר מדי לנסיעות שלכם</span>}
                    </th>
                    <td className="tabular text-end">¥{formatNumber(row.total)}</td>
                    <td className="tabular text-end">
                      {row.diff > 0 ? "חיסכון " : "תוספת "}¥{formatNumber(Math.abs(row.diff))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h3 className="t-label mt-8">מה חשוב לדעת</h3>
          <ul className="ruled mt-2 text-sm leading-6 text-ink-soft">
            {jrPassFacts.map((fact) => (
              <li key={fact} className="py-2">
                {fact}
              </li>
            ))}
          </ul>
          <p className="t-meta mt-4">
            מחירי הכרטיס: האתר הרשמי, לרכישה מקוונת, נכון לאפריל 2026. מחירי הנסיעות הם אומדן
            מעוגל לרכבת Hikari במושב שמור.
          </p>
          <a
            href={officialLinks.jrPass}
            target="_blank"
            rel="noreferrer"
            className="link-nav mt-4"
          >
            מחירים עדכניים באתר JR Pass
            <span className="sr-only"> (חלון חדש)</span>
          </a>
        </section>
      </div>
    </div>
  );
}

"use client";

import { airportOptions, officialLinks, suicaSteps } from "@/data/tools";
import { formatNumber } from "@/lib/utils";
import { PageHeader, SectionHead } from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/ui/Motion";

export function TransitHub() {
  return (
    <div>
      <PageHeader
        kicker="תחבורה"
        title="מהשדה לעיר, ו־Suica לכל הטיול"
        lede="שלוש דרכים להגיע מ־Narita למרכז טוקיו, ואיך מסדרים כרטיס נסיעה נטען לכל בני המשפחה."
      />

      <section aria-labelledby="airport-title">
        <SectionHead id="airport-title" title="מ־Narita למרכז טוקיו" meta="מחיר משוער למבוגר, בכיוון אחד" />

        <div className="mt-2 overflow-x-auto">
          <table className="table min-w-[38rem]">
            <caption className="sr-only">השוואת דרכי הגעה משדה התעופה Narita</caption>
            <thead>
              <tr>
                <th scope="col">אפשרות</th>
                <th scope="col">מגיע אל</th>
                <th scope="col">זמן (דקות)</th>
                <th scope="col" className="text-end">
                  מחיר
                </th>
              </tr>
            </thead>
            <tbody>
              {airportOptions.map((option) => (
                <tr key={option.id}>
                  <th scope="row" className="align-top">
                    <a
                      href={option.href}
                      target="_blank"
                      rel="noreferrer"
                      className="link-inline font-semibold"
                      dir="ltr"
                    >
                      {option.name}
                    </a>
                    <span className="sr-only"> (חלון חדש)</span>
                    <p className="mt-1 max-w-sm text-sm font-normal leading-6 text-ink-soft">
                      {option.note}
                    </p>
                  </th>
                  <td className="align-top" dir="auto">
                    {option.destination}
                  </td>
                  <td className="align-top">{option.minutes}</td>
                  <td className="tabular align-top text-end">≈ ¥{formatNumber(option.approxJpy)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="t-meta mt-3 max-w-2xl">
          המחירים מעוגלים ומשתנים מעת לעת. ילדים בגילאי 6-11 משלמים בדרך כלל כחצי מחיר. בדקו
          באתר המפעיל לפני הנסיעה.
        </p>
        <a href={officialLinks.narita} target="_blank" rel="noreferrer" className="link-nav mt-4">
          כל דרכי ההגעה באתר שדה התעופה
          <span className="sr-only"> (חלון חדש)</span>
        </a>
      </section>

      <section aria-labelledby="suica-title" className="mt-16">
        <SectionHead id="suica-title" title="Suica ו־Pasmo" meta="כרטיס נטען לרכבות, מטרו ואוטובוסים" />
        <ol className="mt-2 grid gap-x-10 sm:grid-cols-2">
          {suicaSteps.map((step, index) => (
            <li key={step.title} className="border-b border-rule">
              <FadeIn
                delay={index * 0.07}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-5"
              >
              <span className="t-num text-3xl leading-none text-vermilion" aria-hidden>
                {index + 1}
              </span>
              <div>
                <h3 className="t-h3">
                  <span className="sr-only">שלב {index + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[0.9375rem] leading-7 text-ink-soft">{step.detail}</p>
              </div>
              </FadeIn>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

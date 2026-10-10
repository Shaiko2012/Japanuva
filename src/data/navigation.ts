export interface NavPage {
  href: string;
  label: string;
}

export interface NavSection {
  id: "overview" | "itinerary" | "transport" | "prep";
  label: string;
  href: string;
  /** Sub-pages shown as tabs under the page header. */
  pages?: NavPage[];
}

export const navSections: NavSection[] = [
  { id: "overview", label: "סקירה", href: "/" },
  { id: "itinerary", label: "מסלול", href: "/itinerary" },
  {
    id: "transport",
    label: "תחבורה",
    href: "/transit",
    pages: [
      { href: "/transit", label: "מהשדה ו־Suica" },
      { href: "/jr-pass", label: "JR Pass" },
      { href: "/day-route", label: "נסיעות ביום" },
    ],
  },
  {
    id: "prep",
    label: "הכנות",
    href: "/guide",
    pages: [
      { href: "/guide", label: "לפני שיוצאים" },
      { href: "/vjw", label: "כניסה ליפן" },
      { href: "/luggage", label: "משלוח מזוודות" },
    ],
  },
];

export function sectionForPath(pathname: string): NavSection {
  if (pathname === "/") return navSections[0];
  return (
    navSections.find(
      (section) =>
        section.href !== "/" &&
        (pathname.startsWith(section.href) ||
          section.pages?.some((page) => pathname.startsWith(page.href))),
    ) ?? navSections[0]
  );
}

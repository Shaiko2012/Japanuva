"use client";

import { cn } from "@/lib/utils";

const TORII = (
  <g fill="#0A0A0A" transform="translate(64 64) scale(0.66) translate(-64 -76)">
    <path d="M18 34h92l5 12H13z" />
    <rect x="24" y="48" width="80" height="7" rx="1" />
    <rect x="36" y="48" width="11" height="70" rx="1.5" />
    <rect x="81" y="48" width="11" height="70" rx="1.5" />
    <rect x="36" y="84" width="56" height="8" rx="1" />
  </g>
);

/** Mint disc + ink torii, inset so the gate stays inside the circle */
export function LogoMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  const decorative = title === undefined;
  return (
    <svg
      viewBox="0 0 128 128"
      className={cn("block", className)}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
    >
      <circle cx="64" cy="64" r="64" fill="#ADEBB3" />
      {TORII}
    </svg>
  );
}

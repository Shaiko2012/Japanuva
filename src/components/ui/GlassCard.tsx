import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  interactive?: boolean;
}

export function GlassCard({
  children,
  className,
  strong,
  interactive = false,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        strong ? "glass-strong" : "glass",
        interactive && "glass-interactive",
        "rounded-[1.25rem] p-3.5 sm:p-4 min-w-0 max-w-full",
        className,
      )}
    >
      {children}
    </div>
  );
}

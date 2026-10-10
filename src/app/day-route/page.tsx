import type { Metadata } from "next";
import { DayRoutePlanner } from "@/components/tools/DayRoutePlanner";

export const metadata: Metadata = {
  title: "נסיעות ביום אחד",
};

export default function DayRoutePage() {
  return <DayRoutePlanner />;
}

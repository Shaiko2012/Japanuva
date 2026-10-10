import type { Metadata } from "next";
import { TransitHub } from "@/components/tools/TransitHub";

export const metadata: Metadata = {
  title: "מהשדה לעיר ו־Suica",
};

export default function TransitPage() {
  return <TransitHub />;
}

import type { Metadata } from "next";
import { VjwGuide } from "@/components/tools/VjwGuide";

export const metadata: Metadata = {
  title: "כניסה ליפן · Visit Japan Web",
};

export default function VjwPage() {
  return <VjwGuide />;
}

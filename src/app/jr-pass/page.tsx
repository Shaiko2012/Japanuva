import type { Metadata } from "next";
import { JrPassCalculator } from "@/components/tools/JrPassCalculator";

export const metadata: Metadata = {
  title: "האם JR Pass משתלם?",
};

export default function JrPassPage() {
  return <JrPassCalculator />;
}

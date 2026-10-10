import type { Metadata } from "next";
import { LuggageEstimator } from "@/components/tools/LuggageEstimator";

export const metadata: Metadata = {
  title: "משלוח מזוודות",
};

export default function LuggagePage() {
  return <LuggageEstimator />;
}

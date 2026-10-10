import type { Metadata } from "next";
import { TripEditor } from "@/components/editor/TripEditor";

export const metadata: Metadata = {
  title: "המסלול",
};

export default function ItineraryPage() {
  return <TripEditor />;
}

import type { Metadata } from "next";
import { PrepGuide } from "@/components/tools/PrepGuide";

export const metadata: Metadata = {
  title: "לפני שיוצאים",
  description: "מה לסגור ומתי לפני טיול משפחתי ביפן: לינה, JR Pass, Visit Japan Web, Suica ומשלוח מזוודות.",
};

export default function GuidePage() {
  return <PrepGuide />;
}

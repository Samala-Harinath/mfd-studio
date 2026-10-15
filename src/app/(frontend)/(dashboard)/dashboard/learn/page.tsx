import type { Metadata } from "next";
import { LearnScreen } from "@/components/dashboard/content-screens";

export const metadata: Metadata = { title: "Learn" };

export default function Page() {
  return <LearnScreen />;
}

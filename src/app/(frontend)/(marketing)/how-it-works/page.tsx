import type { Metadata } from "next";
import { HowItWorksScreen } from "@/components/marketing/info-screens";

export const metadata: Metadata = { title: "How it works" };

export default function Page() {
  return <HowItWorksScreen />;
}

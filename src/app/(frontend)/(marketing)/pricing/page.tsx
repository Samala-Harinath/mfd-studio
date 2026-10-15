import type { Metadata } from "next";
import { PricingScreen } from "@/components/marketing/info-screens";

export const metadata: Metadata = { title: "Pricing" };

export default function Page() {
  return <PricingScreen />;
}

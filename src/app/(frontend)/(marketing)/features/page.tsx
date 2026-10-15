import type { Metadata } from "next";
import { FeaturesScreen } from "@/components/marketing/info-screens";

export const metadata: Metadata = { title: "Features" };

export default function Page() {
  return <FeaturesScreen />;
}

import type { Metadata } from "next";
import { PrivacyScreen } from "@/components/marketing/info-screens";

export const metadata: Metadata = { title: "Privacy" };

export default function Page() {
  return <PrivacyScreen />;
}

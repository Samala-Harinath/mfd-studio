import type { Metadata } from "next";
import { TermsScreen } from "@/components/marketing/info-screens";

export const metadata: Metadata = { title: "Terms" };

export default function Page() {
  return <TermsScreen />;
}

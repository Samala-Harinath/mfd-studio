import type { Metadata } from "next";
import { FaqScreen } from "@/components/marketing/info-screens";

export const metadata: Metadata = { title: "FAQ" };

export default function Page() {
  return <FaqScreen />;
}

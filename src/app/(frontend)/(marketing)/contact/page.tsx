import type { Metadata } from "next";
import { ContactScreen } from "@/components/marketing/info-screens";

export const metadata: Metadata = { title: "Book a call" };

export default function Page() {
  return <ContactScreen />;
}

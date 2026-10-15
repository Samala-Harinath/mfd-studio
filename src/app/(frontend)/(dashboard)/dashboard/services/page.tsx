import type { Metadata } from "next";
import { ServicesScreen } from "@/components/dashboard/content-screens";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return <ServicesScreen />;
}

import type { Metadata } from "next";
import { BrandingScreen } from "@/components/dashboard/content-screens";

export const metadata: Metadata = { title: "Branding" };

export default function Page() {
  return <BrandingScreen />;
}

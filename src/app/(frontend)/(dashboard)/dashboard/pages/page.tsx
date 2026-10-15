import type { Metadata } from "next";
import { PagesScreen } from "@/components/dashboard/content-screens";

export const metadata: Metadata = { title: "Pages" };

export default function Page() {
  return <PagesScreen />;
}

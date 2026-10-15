import type { Metadata } from "next";
import { OverviewScreen } from "@/components/dashboard/overview";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return <OverviewScreen />;
}

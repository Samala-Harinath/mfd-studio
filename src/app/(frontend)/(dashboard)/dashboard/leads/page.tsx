import type { Metadata } from "next";
import { LeadsScreen } from "@/components/dashboard/operations";

export const metadata: Metadata = { title: "Leads" };

export default function Page() {
  return <LeadsScreen />;
}

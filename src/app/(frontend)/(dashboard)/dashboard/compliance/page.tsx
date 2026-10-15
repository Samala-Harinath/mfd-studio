import type { Metadata } from "next";
import { ComplianceScreen } from "@/components/dashboard/operations";

export const metadata: Metadata = { title: "Compliance" };

export default function Page() {
  return <ComplianceScreen />;
}

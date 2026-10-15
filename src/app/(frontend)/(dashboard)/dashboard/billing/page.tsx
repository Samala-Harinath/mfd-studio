import type { Metadata } from "next";
import { BillingScreen } from "@/components/dashboard/operations";

export const metadata: Metadata = { title: "Billing" };

export default function Page() {
  return <BillingScreen />;
}

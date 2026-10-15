import type { Metadata } from "next";
import { DomainScreen } from "@/components/dashboard/operations";

export const metadata: Metadata = { title: "Domain" };

export default function Page() {
  return <DomainScreen />;
}

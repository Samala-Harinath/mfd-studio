import type { Metadata } from "next";
import { CalculatorsScreen } from "@/components/dashboard/calculators-screen";

export const metadata: Metadata = { title: "Calculators" };

export default function Page() {
  return <CalculatorsScreen />;
}

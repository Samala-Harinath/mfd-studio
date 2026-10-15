import type { Metadata } from "next";
import { SettingsScreen } from "@/components/dashboard/operations";

export const metadata: Metadata = { title: "Account" };

export default function Page() {
  return <SettingsScreen />;
}

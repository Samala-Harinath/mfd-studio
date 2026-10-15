import type { Metadata } from "next";
import { SetupScreen } from "@/components/dashboard/setup";

export const metadata: Metadata = { title: "Setup" };

export default function Page() {
  return <SetupScreen />;
}

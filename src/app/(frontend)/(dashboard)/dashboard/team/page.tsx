import type { Metadata } from "next";
import { TeamScreen } from "@/components/dashboard/operations";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return <TeamScreen />;
}

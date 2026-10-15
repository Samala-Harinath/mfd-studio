import type { Metadata } from "next";
import { AchievementsScreen } from "@/components/dashboard/content-screens";

export const metadata: Metadata = { title: "Achievements" };

export default function Page() {
  return <AchievementsScreen />;
}

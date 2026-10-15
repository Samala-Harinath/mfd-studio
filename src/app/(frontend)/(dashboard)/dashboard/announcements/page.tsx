import type { Metadata } from "next";
import { AnnouncementsScreen } from "@/components/dashboard/content-screens";

export const metadata: Metadata = { title: "Announcements" };

export default function Page() {
  return <AnnouncementsScreen />;
}

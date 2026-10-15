import type { Metadata } from "next";
import { MediaScreen } from "@/components/dashboard/content-screens";

export const metadata: Metadata = { title: "Media" };

export default function Page() {
  return <MediaScreen />;
}

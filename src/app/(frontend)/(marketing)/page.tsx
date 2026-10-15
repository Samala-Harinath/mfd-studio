import type { Metadata } from "next";
import { HomeScreen } from "@/components/marketing/home-screen";

export const metadata: Metadata = {
  title: { absolute: "MFD Studio" },
};

export default function Page() {
  return <HomeScreen />;
}

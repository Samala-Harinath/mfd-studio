import type { Metadata } from "next";
import { SeoScreen } from "@/components/dashboard/operations";

export const metadata: Metadata = { title: "SEO" };

export default function Page() {
  return <SeoScreen />;
}

import type { Metadata } from "next";
import { PreviewScreen } from "@/components/dashboard/operations";

export const metadata: Metadata = { title: "Preview" };

export default function Page() {
  return <PreviewScreen />;
}

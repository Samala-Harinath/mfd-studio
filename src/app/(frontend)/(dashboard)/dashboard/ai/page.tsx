import type { Metadata } from "next";
import { AiScreen } from "@/components/dashboard/operations";

export const metadata: Metadata = { title: "AI answers" };

export default function Page() {
  return <AiScreen />;
}

import type { Metadata } from "next";
import { PageBuilderScreen } from "@/components/puck/page-builder";

export const metadata: Metadata = { title: "Page builder" };

export default function PageBuilderPage() {
  return <PageBuilderScreen />;
}

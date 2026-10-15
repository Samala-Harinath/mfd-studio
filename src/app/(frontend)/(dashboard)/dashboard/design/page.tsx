import type { Metadata } from "next";
import { DesignStudio } from "@/components/dashboard/design-studio";

export const metadata: Metadata = { title: "Design" };

export default function Page() {
  return <DesignStudio />;
}

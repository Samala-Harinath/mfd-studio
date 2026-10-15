import type { Metadata } from "next";
import { calculatorById } from "@/lib/calculator-catalog";
import { PublicView } from "@/components/website/public-site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  const item = calculatorById(tool);
  return { title: item?.label ?? "Calculator" };
}

export default function Page() {
  return <PublicView view="tools" />;
}

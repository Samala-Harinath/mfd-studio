import type { Metadata } from "next";
import { PublicView } from "@/components/website/public-site";

export const metadata: Metadata = { title: "Calculators" };

/** Older /tools address. The public nav now uses /calculators. */
export default function Page() {
  return <PublicView view="tools" />;
}

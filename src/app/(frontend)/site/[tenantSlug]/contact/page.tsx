import type { Metadata } from "next";
import { PublicView } from "@/components/website/public-site";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return <PublicView view="contact" />;
}

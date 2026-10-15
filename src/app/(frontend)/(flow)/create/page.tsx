import type { Metadata } from "next";
import { Suspense } from "react";
import { CreateWebsite } from "@/components/flow/create-website";

export const metadata: Metadata = { title: "Create your website" };

export default function Page() {
  return (
    <Suspense>
      <CreateWebsite />
    </Suspense>
  );
}

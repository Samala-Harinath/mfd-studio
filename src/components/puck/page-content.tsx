"use client";

import { Render } from "@measured/puck";
import { puckConfig } from "@/lib/puck/config";
import type { PageLayout } from "@/lib/puck/types";
import { PuckSiteProvider } from "@/components/puck/puck-site-context";

/** Draws saved Puck sections inside the public site theme (caller wraps with siteStyle). */
export function PuckPageContent({ layout, base }: { layout: PageLayout; base: string }) {
  return (
    <PuckSiteProvider base={base}>
      <Render config={puckConfig} data={layout} />
    </PuckSiteProvider>
  );
}

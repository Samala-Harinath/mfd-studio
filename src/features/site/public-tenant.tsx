"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Tenant } from "@/lib/sample-data";

type PublicSiteValue = {
  tenant: Tenant | null;
  /** Inside Payload live preview, the admin form wins over the owner's saved draft. */
  live: boolean;
};

const PublicSiteContext = createContext<PublicSiteValue>({ tenant: null, live: false });

/**
 * The published website is request-scoped render data. It stays in a tree provider so the
 * server can paint the right site, and so one visitor's page cannot leak into another's store.
 */
export function PublicTenantProvider({
  tenant,
  live = false,
  children,
}: {
  tenant: Tenant | null;
  live?: boolean;
  children: ReactNode;
}) {
  return <PublicSiteContext.Provider value={{ tenant, live }}>{children}</PublicSiteContext.Provider>;
}

export function usePublicSite() {
  return useContext(PublicSiteContext);
}

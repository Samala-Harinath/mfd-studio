"use client";

import { createContext, useContext } from "react";

const PuckSiteContext = createContext({ base: "" });

export function PuckSiteProvider({ base, children }: { base: string; children: React.ReactNode }) {
  return <PuckSiteContext.Provider value={{ base }}>{children}</PuckSiteContext.Provider>;
}

export function usePuckSite() {
  return useContext(PuckSiteContext);
}

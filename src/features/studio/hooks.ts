"use client";

import { useStore } from "react-redux";
import { usePublicSite } from "@/features/site/public-tenant";
import { getStudioActions } from "@/features/studio/actions";
import { useAppSelector } from "@/store/hooks";
import type { AppStore } from "@/store/store";

export function usePrototype() {
  const store = useStore() as AppStore;
  const actions = getStudioActions(store);
  const { status, user, tenant, sync, syncError } = useAppSelector((state) => state.studio);
  const canEditSite = user?.canEditSite ?? false;
  return {
    status,
    user,
    canEditSite,
    activeTenant: tenant,
    sync,
    syncError,
    refresh: actions.refresh,
    login: actions.login,
    logout: actions.logout,
    createWebsite: actions.createWebsite,
    updateActive: actions.updateActive,
    updatePage: actions.updatePage,
    setPageStatus: actions.setPageStatus,
    addPage: actions.addPage,
    removePage: actions.removePage,
    updateService: actions.updateService,
    addService: actions.addService,
    removeService: actions.removeService,
    moveService: actions.moveService,
    updateAchievement: actions.updateAchievement,
    addAchievement: actions.addAchievement,
    removeAchievement: actions.removeAchievement,
    addLead: actions.addLead,
    updateLead: actions.updateLead,
    setLeadStatus: actions.setLeadStatus,
  };
}

export function useRequiredTenant() {
  const value = usePrototype();
  if (!value.activeTenant) {
    throw new Error("Create a website before opening the dashboard.");
  }
  return { ...value, activeTenant: value.activeTenant };
}

/** The owner sees their live edits; everyone else sees the published copy from the server. */
export function useTenant(slug: string) {
  const activeTenant = useAppSelector((state) => state.studio.tenant);
  const { tenant: publicTenant, live } = usePublicSite();
  if (live) return publicTenant;
  const wanted = publicTenant?.slug ?? slug;
  if (activeTenant && activeTenant.slug === wanted) return activeTenant;
  return publicTenant;
}

import type { QueryClient } from "@tanstack/react-query";
import { slugify, type WebsiteDraft } from "@/lib/build-tenant";
import {
  createEnquiryRequest,
  loginRequest,
  logoutRequest,
  saveSiteRequest,
  signupRequest,
  type NewLead,
} from "@/lib/api/mfd";
import { starterLayout } from "@/lib/puck/defaults";
import { getPlan } from "@/lib/plans";
import type { Achievement, ContentStatus, Lead, LeadStatus, ServiceCard, SitePage, Tenant } from "@/lib/sample-data";
import { sessionQueryOptions } from "@/lib/query/options";
import { mfdKeys } from "@/lib/query/keys";
import { clearSession, hydrateSession, setSync, setSyncError, setTenant } from "@/store/slices/studio.slice";
import type { AppStore } from "@/store/store";

const SAVE_DELAY_MS = 700;

/** Folders under app/(frontend)/site/[tenantSlug]; a custom page with one of these names would never be reached. */
const BUILT_IN_ROUTES = new Set(["blog", "funds", "learn", "tools", "calculators", "about", "services", "achievements", "contact", "disclosures"]);

export type StudioMutationFns = {
  login: (input: { email: string; password: string }) => Promise<unknown>;
  logout: () => Promise<unknown>;
  signup: (input: { draft: WebsiteDraft; password: string }) => Promise<{ tenant: Tenant }>;
  save: (tenant: Tenant) => Promise<Tenant>;
  enquiry: (input: { slug: string; lead: NewLead }) => Promise<{ lead?: Lead }>;
};

export type StudioActions = {
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  createWebsite: (draft: WebsiteDraft, password: string) => Promise<{ tenant?: Tenant; error?: string }>;
  updateActive: (patch: Partial<Tenant>) => void;
  updatePage: (pageId: string, patch: Partial<SitePage>) => void;
  setPageStatus: (pageId: string, status: ContentStatus) => string | null;
  addPage: (title: string) => string | null;
  removePage: (pageId: string) => void;
  updateService: (serviceId: string, patch: Partial<ServiceCard>) => void;
  addService: () => void;
  removeService: (serviceId: string) => void;
  moveService: (serviceId: string, direction: -1 | 1) => void;
  updateAchievement: (id: string, patch: Partial<Achievement>) => void;
  addAchievement: () => void;
  removeAchievement: (id: string) => void;
  addLead: (slug: string, lead: NewLead) => Promise<string | null>;
  updateLead: (leadId: string, patch: Partial<Lead>) => void;
  setLeadStatus: (leadId: string, status: LeadStatus) => void;
  dispose: () => void;
};

const registry = new WeakMap<AppStore, StudioActions>();

export function registerStudioActions(store: AppStore, actions: StudioActions) {
  registry.set(store, actions);
}

export function getStudioActions(store: AppStore) {
  const actions = registry.get(store);
  if (!actions) throw new Error("usePrototype must be used inside AppProviders");
  return actions;
}

function publishedPageCount(tenant: Tenant) {
  return tenant.pages.filter((page) => page.status === "published").length;
}

export function createStudioActions(
  store: AppStore,
  queryClient: QueryClient,
  mutations: { current: StudioMutationFns },
): StudioActions {
  let version = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inFlight = false;
  let queued = false;

  const tenant = () => store.getState().studio.tenant;

  async function pullSession() {
    await queryClient.cancelQueries({ queryKey: mfdKeys.session });
    const session = await queryClient.fetchQuery({
      ...sessionQueryOptions(),
      staleTime: 0,
    });
    store.dispatch(hydrateSession(session));
  }

  async function flush() {
    const snapshot = tenant();
    if (!snapshot) return;
    if (inFlight) {
      queued = true;
      return;
    }
    const sentVersion = version;
    inFlight = true;
    store.dispatch(setSync("saving"));
    try {
      const saved = await mutations.current.save(snapshot);
      const current = tenant();
      if (version === sentVersion) {
        store.dispatch(setTenant(saved));
        queryClient.setQueryData(mfdKeys.session, {
          user: store.getState().studio.user,
          tenant: saved,
        });
      } else if (current) {
        store.dispatch(
          setTenant({
            ...current,
            logoDataUrl: current.logoDataUrl === snapshot.logoDataUrl ? saved.logoDataUrl : current.logoDataUrl,
            photoDataUrl: current.photoDataUrl === snapshot.photoDataUrl ? saved.photoDataUrl : current.photoDataUrl,
            heroImageDataUrl:
              current.heroImageDataUrl === snapshot.heroImageDataUrl ? saved.heroImageDataUrl : current.heroImageDataUrl,
            domainStatus: saved.domainStatus,
          }),
        );
      }
      store.dispatch(setSync("saved"));
    } catch (error) {
      store.dispatch(setSyncError(error instanceof Error ? error.message : "Could not save your changes."));
    } finally {
      inFlight = false;
      if (queued) {
        queued = false;
        void flush();
      }
    }
  }

  function save(next: Tenant) {
    version += 1;
    store.dispatch(setTenant(next));
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void flush(), SAVE_DELAY_MS);
  }

  function edit(change: (current: Tenant) => Tenant) {
    const current = tenant();
    const user = store.getState().studio.user;
    if (user && !user.canEditSite) {
      store.dispatch(setSyncError("View-only access. You cannot change the website."));
      return;
    }
    if (current) save(change(current));
  }

  return {
    refresh: () => pullSession(),
    login: async (email, password) => {
      try {
        await mutations.current.login({ email, password });
        await pullSession();
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : "That email and password do not match.";
      }
    },
    logout: async () => {
      await mutations.current.logout();
      queryClient.setQueryData(mfdKeys.session, { user: null, tenant: null });
      store.dispatch(clearSession());
    },
    createWebsite: async (draft, password) => {
      try {
        const created = await mutations.current.signup({ draft, password });
        if (!store.getState().studio.user) {
          try {
            await mutations.current.login({ email: draft.email.trim().toLowerCase(), password });
          } catch {
            return {
              tenant: created.tenant,
              error: "Website created. Log in with your email and password to open it.",
            };
          }
        }
        await pullSession();
        return { tenant: created.tenant };
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Could not create the website." };
      }
    },
    updateActive: (patch) => edit((current) => ({ ...current, ...patch })),
    updatePage: (pageId, patch) =>
      edit((current) => ({
        ...current,
        pages: current.pages.map((page) => (page.id === pageId ? { ...page, ...patch } : page)),
      })),
    setPageStatus: (pageId, nextStatus) => {
      const current = tenant();
      if (!current) return "Create a website first.";
      const page = current.pages.find((item) => item.id === pageId);
      if (!page) return "That page is not on this site.";
      if (page.locked && nextStatus !== "published") return "The disclosures page stays published.";
      if (nextStatus === "published" && page.status !== "published") {
        const limit = getPlan(current.plan).pages;
        if (publishedPageCount(current) >= limit) {
          return `${getPlan(current.plan).name} includes ${limit} published pages. This one stays a draft.`;
        }
      }
      save({
        ...current,
        pages: current.pages.map((item) => (item.id === pageId ? { ...item, status: nextStatus } : item)),
      });
      return null;
    },
    addPage: (title) => {
      const current = tenant();
      if (!current) return "Create a website first.";
      const clean = title.trim();
      if (clean.length < 2) return "Give the page a title.";
      const id = slugify(clean);
      if (BUILT_IN_ROUTES.has(id) || current.pages.some((page) => page.id === id)) {
        return "A page with that address already exists.";
      }
      save({
        ...current,
        pages: [
          ...current.pages,
          {
            id,
            title: clean,
            path: `/${id}`,
            summary: "",
            body: "Write this page in plain language. Do not promise returns.",
            layout: starterLayout(clean),
            status: "draft",
            custom: true,
            seoTitle: `${clean} · ${current.businessName}`,
            seoDescription: "",
          },
        ],
      });
      return null;
    },
    removePage: (pageId) =>
      edit((current) => ({
        ...current,
        pages: current.pages.filter((page) => page.id !== pageId || !page.custom),
      })),
    updateService: (serviceId, patch) =>
      edit((current) => ({
        ...current,
        services: current.services.map((service) => (service.id === serviceId ? { ...service, ...patch } : service)),
      })),
    addService: () =>
      edit((current) => ({
        ...current,
        services: [
          ...current.services,
          {
            id: `service-${Date.now()}`,
            title: "New service",
            description: "Describe the help you are allowed to offer. Do not promise returns.",
            status: "draft",
          },
        ],
      })),
    removeService: (serviceId) =>
      edit((current) => ({
        ...current,
        services: current.services.filter((service) => service.id !== serviceId),
      })),
    moveService: (serviceId, direction) =>
      edit((current) => {
        const index = current.services.findIndex((service) => service.id === serviceId);
        const next = index + direction;
        if (index < 0 || next < 0 || next >= current.services.length) return current;
        const services = [...current.services];
        const [item] = services.splice(index, 1);
        services.splice(next, 0, item);
        return { ...current, services };
      }),
    updateAchievement: (id, patch) =>
      edit((current) => ({
        ...current,
        achievements: current.achievements.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      })),
    addAchievement: () =>
      edit((current) => ({
        ...current,
        achievements: [
          ...current.achievements,
          {
            id: `achievement-${Date.now()}`,
            title: "New milestone",
            year: String(new Date().getFullYear()),
            description: "Write only what you can stand behind.",
            status: "review",
          },
        ],
      })),
    removeAchievement: (id) =>
      edit((current) => ({
        ...current,
        achievements: current.achievements.filter((item) => item.id !== id),
      })),
    addLead: async (slug, lead) => {
      try {
        const data = await mutations.current.enquiry({ slug, lead });
        const current = tenant();
        if (current && current.slug === slug && data.lead) {
          store.dispatch(setTenant({ ...current, leads: [data.lead, ...current.leads] }));
        }
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : "Could not send the enquiry.";
      }
    },
    updateLead: (leadId, patch) =>
      edit((current) => ({
        ...current,
        leads: current.leads.map((item) => (item.id === leadId ? { ...item, ...patch } : item)),
      })),
    setLeadStatus: (leadId, nextStatus) =>
      edit((current) => ({
        ...current,
        leads: current.leads.map((item) => (item.id === leadId ? { ...item, status: nextStatus } : item)),
      })),
    dispose: () => {
      if (timer) clearTimeout(timer);
      timer = null;
    },
  };
}

/** Bound once so call sites keep using the same mutation functions the query cache owns. */
export const studioMutationFns = {
  login: (input: { email: string; password: string }) => loginRequest(input.email, input.password),
  logout: () => logoutRequest(),
  signup: (input: { draft: WebsiteDraft; password: string }) => signupRequest(input.draft, input.password),
  save: (tenant: Tenant) => saveSiteRequest(tenant),
  enquiry: (input: { slug: string; lead: NewLead }) => createEnquiryRequest(input.slug, input.lead),
};

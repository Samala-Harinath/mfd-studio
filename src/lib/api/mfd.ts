import type { WebsiteDraft } from "@/lib/build-tenant";
import type { Lead, Tenant } from "@/lib/sample-data";
import { ApiError, errorText, readJson } from "@/lib/api/http";
import type { SessionUser } from "@/features/studio/types";

export type SessionSnapshot = {
  user: SessionUser | null;
  tenant: Tenant | null;
};

export type NewLead = Omit<Lead, "id" | "status" | "note" | "createdAt"> & { consent?: boolean };

export async function fetchSession(signal?: AbortSignal): Promise<SessionSnapshot> {
  const response = await fetch("/api/mfd/me", { credentials: "include", cache: "no-store", signal });
  if (!response.ok) return { user: null, tenant: null };
  const data = await readJson(response);
  return {
    user: data.user
      ? {
          ...(data.user as SessionUser),
          phone: String((data.user as SessionUser).phone ?? ""),
          arn: String((data.user as SessionUser).arn ?? ""),
          canEditSite: Boolean((data.user as SessionUser).canEditSite),
        }
      : null,
    tenant: (data.tenant as Tenant | null) ?? null,
  };
}

export async function registerRequest(input: {
  name: string;
  email: string;
  phone: string;
  arn: string;
  password: string;
}) {
  const response = await fetch("/api/mfd/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await readJson(response);
  if (!response.ok) throw new ApiError(errorText(data, "Could not create the account."));
}

export async function loginRequest(email: string, password: string) {
  const response = await fetch("/api/users/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new ApiError(errorText(await readJson(response), "That email and password do not match."));
  }
}

export async function logoutRequest() {
  await fetch("/api/users/logout", { method: "POST", credentials: "include" });
}

export async function signupRequest(draft: WebsiteDraft, password: string) {
  const response = await fetch("/api/mfd/signup", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft, password }),
  });
  const data = await readJson(response);
  if (!response.ok) throw new ApiError(errorText(data, "Could not create the website."));
  return { tenant: data.tenant as Tenant };
}

export async function saveSiteRequest(tenant: Tenant) {
  const response = await fetch("/api/mfd/site", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tenant),
  });
  const data = await readJson(response);
  if (!response.ok) throw new ApiError(errorText(data, "Could not save your changes."));
  return data.tenant as Tenant;
}

export async function createEnquiryRequest(slug: string, lead: NewLead) {
  const response = await fetch(`/api/mfd/sites/${encodeURIComponent(slug)}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  const data = await readJson(response);
  if (!response.ok) throw new ApiError(errorText(data, "Could not send the enquiry."));
  return { lead: data.lead as Lead | undefined };
}

import type { Metadata } from "next";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { PayloadLivePreview } from "@/components/website/payload-live-preview";
import { findPublicTenantId, loadSite } from "@/server/sites";

const loadPublicSite = cache(async (site: string) => {
  const payload = await getPayload({ config });
  const tenantId = await findPublicTenantId(payload, site);
  const tenant = tenantId ? await loadSite(payload, tenantId, { includePrivate: false }) : null;
  return { tenantId, tenant };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}): Promise<Metadata> {
  const { tenantSlug } = await params;
  const { tenant } = await loadPublicSite(tenantSlug);
  if (!tenant) return { title: "Website not available" };
  const home = tenant.pages.find((page) => page.id === "home");
  return {
    title: {
      absolute: home?.seoTitle || tenant.businessName,
      template: `%s · ${tenant.businessName}`,
    },
    description: home?.seoDescription || tenant.intro,
  };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { tenantId, tenant } = await loadPublicSite(tenantSlug);
  return (
    <PayloadLivePreview tenant={tenant} tenantId={tenantId}>
      {children}
    </PayloadLivePreview>
  );
}

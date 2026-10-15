"use client";

import { useLivePreview } from "@payloadcms/live-preview-react";
import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { PublicTenantProvider } from "@/features/site/public-tenant";
import { parseEnabledCalculators } from "@/lib/calculator-catalog";
import { designFromRecord } from "@/lib/design";
import type { Tenant } from "@/lib/sample-data";

const noSubscribe = () => () => {};

/**
 * Public sites render normally for visitors. Inside the Payload admin Live Preview iframe,
 * the unsaved admin form is merged in on every keystroke so the page redraws immediately.
 */
export function PayloadLivePreview({
  tenant,
  tenantId,
  children,
}: {
  tenant: Tenant | null;
  tenantId: number | null;
  children: ReactNode;
}) {
  const inFrame = useSyncExternalStore(noSubscribe, () => window.self !== window.top, () => false);
  if (!inFrame || !tenant || !tenantId) return <PublicTenantProvider tenant={tenant}>{children}</PublicTenantProvider>;
  return (
    <LiveTenant tenant={tenant} tenantId={tenantId}>
      {children}
    </LiveTenant>
  );
}

function mediaUrl(value: unknown, fallback: string | null) {
  if (value === null) return null;
  if (value && typeof value === "object" && "url" in value) return (value as { url?: string | null }).url ?? null;
  return fallback;
}

function LiveTenant({ tenant, tenantId, children }: { tenant: Tenant; tenantId: number; children: ReactNode }) {
  const initialData = useMemo(() => ({ id: tenantId }), [tenantId]);
  const { data } = useLivePreview<Record<string, unknown>>({
    initialData,
    serverURL: window.location.origin,
    depth: 1,
  });

  const live = useMemo<Tenant>(() => {
    if (data === initialData) return tenant;
    const text = (value: unknown, fallback: string) => (typeof value === "string" ? value : fallback);
    return {
      ...tenant,
      ...designFromRecord(data),
      businessName: text(data.name, tenant.businessName),
      intro: text(data.intro, tenant.intro),
      arn: text(data.arn, tenant.arn) || tenant.arn,
      phone: text(data.phone, tenant.phone),
      email: text(data.email, tenant.email),
      address: text(data.address, tenant.address),
      hours: text(data.hours, tenant.hours),
      announcement: text(data.announcement, tenant.announcement),
      logoDataUrl: mediaUrl(data.logo, tenant.logoDataUrl),
      photoDataUrl: mediaUrl(data.photo, tenant.photoDataUrl),
      heroImageDataUrl: mediaUrl(data.heroImage, tenant.heroImageDataUrl),
      enabledCalculators:
        "enabledCalculators" in data ? parseEnabledCalculators(data.enabledCalculators) : tenant.enabledCalculators,
    };
  }, [data, initialData, tenant]);

  return (
    <PublicTenantProvider tenant={live} live>
      {children}
    </PublicTenantProvider>
  );
}

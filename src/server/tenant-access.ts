import type { User } from '@/payload-types'

function tenantIdFromRow(row: NonNullable<User['tenants']>[number]): number | null {
  const value = row.tenant
  if (value == null) return null
  return typeof value === 'object' ? value.id : value
}

/** Roles on one MFD business row (tenant-admin, tenant-viewer). */
export function rolesOnTenant(user: User, tenantId: number): string[] {
  const row = user.tenants?.find((item) => tenantIdFromRow(item) === tenantId)
  return row?.roles ?? []
}

/**
 * Who may change a site from the MFD dashboard (/dashboard).
 * Payload admin (/admin) is separate; Super Admin there is not overridden here.
 */
export function canEditTenantSite(user: User, tenantId: number): boolean {
  return rolesOnTenant(user, tenantId).includes('tenant-admin')
}

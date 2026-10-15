import { APIError, type CollectionSlug, type Payload, type PayloadRequest, type Where } from 'payload'

import type { User } from '@/payload-types'

/** Every collection that carries a `tenant` field (multi-tenant plugin). */
const TENANT_SCOPED: CollectionSlug[] = [
  'pages',
  'services',
  'achievements',
  'articles',
  'leads',
  'media',
]

function tenantIdFromMembership(value: number | { id: number } | null | undefined) {
  if (value == null) return null
  return typeof value === 'object' ? value.id : value
}

export function tenantIdsFromUser(user: Pick<User, 'tenants'>) {
  const ids: number[] = []
  for (const row of user.tenants ?? []) {
    const id = tenantIdFromMembership(row.tenant as number | { id: number })
    if (id != null) ids.push(id)
  }
  return [...new Set(ids)]
}

async function deleteAllInCollection(
  payload: Payload,
  collection: CollectionSlug,
  tenantId: number,
  req: Partial<PayloadRequest>,
) {
  const result = await payload.find({
    collection,
    where: { tenant: { equals: tenantId } },
    limit: 0,
    depth: 0,
    overrideAccess: true,
    req,
  })

  for (const doc of result.docs) {
    await payload.delete({ collection, id: doc.id, overrideAccess: true, req })
  }
}

/** Removes pages, services, media, leads, etc. for one tenant. Does not delete the tenant row. */
export async function purgeTenantContents(
  payload: Payload,
  tenantId: number,
  req: Partial<PayloadRequest>,
) {
  for (const collection of TENANT_SCOPED) {
    await deleteAllInCollection(payload, collection, tenantId, req)
  }
}

/** Remove every login’s link to this business so the tenant row can be deleted. */
async function detachAllUsers(payload: Payload, tenantId: number, req: Partial<PayloadRequest>) {
  const where: Where = { 'tenants.tenant': { equals: tenantId } }
  const result = await payload.find({
    collection: 'users',
    where,
    limit: 0,
    depth: 0,
    overrideAccess: true,
    req,
  })

  for (const user of result.docs) {
    const tenants = (user.tenants ?? []).filter((row) => {
      const id = tenantIdFromMembership(row.tenant as number | { id: number })
      return id !== tenantId
    })
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { tenants },
      depth: 0,
      overrideAccess: true,
      req,
    })
  }
}

/**
 * Unlink users, then delete pages, leads, logos and other files.
 * Must run before the tenant row itself is removed: those foreign keys cannot be set to null.
 */
export async function releaseTenant(payload: Payload, tenantId: number, req: Partial<PayloadRequest>) {
  await payload
    .update({
      collection: 'tenants',
      id: tenantId,
      data: { logo: null, photo: null },
      depth: 0,
      overrideAccess: true,
      req,
    })
    .catch(() => undefined)

  await detachAllUsers(payload, tenantId, req)
  await purgeTenantContents(payload, tenantId, req)
}

/** Deletes the business and everything that belongs to it. */
export async function purgeTenant(payload: Payload, tenantId: number, req: Partial<PayloadRequest>) {
  try {
    await payload.delete({ collection: 'tenants', id: tenantId, overrideAccess: true, req })
  } catch (error) {
    if (error instanceof APIError) throw error
    const message = error instanceof Error ? error.message : 'Could not delete the website.'
    console.error('[mfd] purge tenant failed', error)
    throw new APIError(message, 400)
  }
}

import type { Access, FieldAccess } from 'payload'

type MaybeUser = { roles?: ('super-admin' | 'user')[] | null } | null | undefined

export function isSuperAdmin(user: MaybeUser) {
  return Boolean(user?.roles?.includes('super-admin'))
}

export const superAdminOnly: Access = ({ req }) => isSuperAdmin(req.user)

/**
 * Any signed-in user. On tenant-scoped collections the multi-tenant plugin
 * narrows this further to the tenants listed on the user.
 */
export const signedIn: Access = ({ req }) => Boolean(req.user)

export const anyone: Access = () => true

export const superAdminField: FieldAccess = ({ req }) => isSuperAdmin(req.user)

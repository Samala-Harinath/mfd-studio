import type { Access, CollectionConfig, FieldAccess } from 'payload'

import { isSuperAdmin } from '../access'
import { purgeTenant, tenantIdsFromUser } from '../server/purge-tenant'

const rolesAccess: FieldAccess = ({ req }) => {
  if (!req.user) return true
  return isSuperAdmin(req.user)
}

const selfOrSuperAdmin: Access = ({ req }) => {
  if (!req.user) return false
  if (isSuperAdmin(req.user)) return true
  return { id: { equals: req.user.id } }
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    // MFD owners use /dashboard. The Payload admin panel is for the platform team.
    admin: ({ req }) => isSuperAdmin(req.user),
    create: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
    read: selfOrSuperAdmin,
    update: selfOrSuperAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Mobile number',
    },
    {
      name: 'arn',
      type: 'text',
      label: 'ARN',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      saveToJWT: true,
      defaultValue: ['user'],
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'User', value: 'user' },
      ],
      access: {
        create: rolesAccess,
        update: rolesAccess,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create' || !data) return data

        const existing = await req.payload.count({
          collection: 'users',
          req,
        })

        // Public registration must not become the platform admin just because it is the first account.
        if (existing.totalDocs === 0 && req.context?.mfdRegister !== true) {
          data.roles = ['super-admin']
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const user = await req.payload.findByID({
          collection: 'users',
          id,
          depth: 0,
          overrideAccess: true,
          req,
        })
        const pending = (req.context.tenantIdsByUser ?? {}) as Record<string, number[]>
        pending[String(id)] = tenantIdsFromUser(user)
        req.context.tenantIdsByUser = pending
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        // Membership rows are removed with the user. The tenant must be deleted after that,
        // because users_tenants.tenant_id is required and cannot be cleared by the database.
        const pending = (req.context.tenantIdsByUser ?? {}) as Record<string, number[]>
        const tenantIds = pending[String(doc.id)] ?? tenantIdsFromUser(doc)
        for (const tenantId of tenantIds) {
          await purgeTenant(req.payload, tenantId, req)
        }
      },
    ],
  },
}

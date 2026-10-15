import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, type Field } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { isSuperAdmin, superAdminField } from './access'
import { Achievements } from './collections/Achievements'
import { Articles } from './collections/Articles'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Services } from './collections/Services'
import { Tenants } from './collections/tenants'
import { Users } from './collections/Users'
import { mfdEndpoints } from './endpoints/mfd'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Direct Neon host. The pooled host breaks Payload schema setup and login queries. */
function databaseUrl() {
  return (
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    ''
  )
}

const tenantRoles: Field = {
  name: 'roles',
  type: 'select',
  hasMany: true,
  required: true,
  defaultValue: ['tenant-viewer'],
  options: [
    { label: 'Admin', value: 'tenant-admin' },
    { label: 'Viewer', value: 'tenant-viewer' },
  ],
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Tenants, Pages, Services, Achievements, Articles, Leads, Media],
  endpoints: mfdEndpoints,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl(),
      ...(process.env.NODE_ENV === 'production' ? { max: 1 } : {}),
    },
  }),
  sharp,
  plugins: [
    multiTenantPlugin({
      collections: {
        pages: {},
        services: {},
        achievements: {},
        articles: {},
        leads: {},
        media: {},
      },
      tenantSelectorLabel: 'MFD business',
      tenantsArrayField: {
        includeDefaultField: true,
        rowFields: [tenantRoles],
        // Without this a signed-in MFD could add another business to their own user.
        arrayFieldAccess: {
          create: superAdminField,
          update: superAdminField,
        },
      },
      userHasAccessToAllTenants: (user) =>
        isSuperAdmin(user as { roles?: ('super-admin' | 'user')[] | null }),
    }),
  ],
})

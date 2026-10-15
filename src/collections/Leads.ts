import type { CollectionConfig } from 'payload'

import { signedIn, superAdminOnly } from '../access'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'source', 'status', 'tenant', 'createdAt'],
  },
  access: {
    // Visitors never write here directly: POST /api/mfd/sites/:site/enquiries
    // resolves the tenant on the server and creates the lead.
    create: superAdminOnly,
    delete: superAdminOnly,
    read: signedIn,
    update: signedIn,
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'message', type: 'textarea' },
    { name: 'source', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    { name: 'note', type: 'textarea' },
    {
      name: 'consentAt',
      type: 'date',
      admin: { description: 'When the visitor ticked the consent box' },
    },
  ],
}

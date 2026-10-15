import type { CollectionConfig } from 'payload'

import { signedIn } from '../access'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'tenant', 'updatedAt'],
  },
  access: {
    create: signedIn,
    delete: signedIn,
    read: signedIn,
    update: signedIn,
  },
  defaultSort: 'sortOrder',
  fields: [
    {
      name: 'key',
      type: 'text',
      index: true,
      admin: { description: 'Stable id used by the dashboard' },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}

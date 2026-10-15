import type { CollectionConfig } from 'payload'

import { signedIn } from '../access'

export const Achievements: CollectionConfig = {
  slug: 'achievements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'status', 'tenant'],
  },
  access: {
    create: signedIn,
    delete: signedIn,
    read: signedIn,
    update: signedIn,
  },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'key', type: 'text', index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'year', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'review',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Needs review', value: 'review' },
        { label: 'Published', value: 'published' },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}

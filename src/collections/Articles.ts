import type { CollectionConfig } from 'payload'

import { signedIn } from '../access'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'tenant'],
  },
  access: {
    create: signedIn,
    delete: signedIn,
    read: signedIn,
    update: signedIn,
  },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'body', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Needs review', value: 'review' },
        { label: 'Published', value: 'published' },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}

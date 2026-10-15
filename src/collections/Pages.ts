import type { CollectionConfig } from 'payload'

import { signedIn } from '../access'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'tenant', 'updatedAt'],
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
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      admin: {
        description: 'Page key inside one website, for example about. Unique per tenant.',
      },
    },
    {
      name: 'path',
      type: 'text',
      admin: { description: 'Public address inside the site, for example /about' },
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'body',
      type: 'textarea',
    },
    {
      name: 'layout',
      type: 'json',
      admin: {
        description: 'Section layout from the visual page builder (Puck JSON).',
      },
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
    {
      name: 'locked',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Locked pages (Disclosures) cannot be unpublished or deleted.' },
    },
    {
      name: 'custom',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Extra page the MFD added, shown at /site/<slug>/<page>.' },
    },
    { name: 'seoTitle', type: 'text' },
    { name: 'seoDescription', type: 'textarea' },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}

import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Logos and photos are shown on public websites.
    read: anyone,
    create: signedIn,
    update: signedIn,
    delete: signedIn,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  },
}

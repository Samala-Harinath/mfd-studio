import type { CollectionConfig, PayloadRequest } from 'payload'

import { cornerStyles, headerLayouts, heroLayouts, templates, themeModes } from '@/lib/design'
import { fontPresets } from '@/lib/themes'
import { signedIn, superAdminField, superAdminOnly } from '../access'
import { releaseTenant } from '../server/purge-tenant'

const platformOnly = { update: superAdminField }

const options = (list: readonly { id: string; name: string }[]) => list.map((item) => ({ label: item.name, value: item.id }))

const colourField = (name: string, description: string) => ({
  name,
  type: 'text' as const,
  admin: { description },
  validate: (value: unknown) =>
    !value || (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) || 'Use a colour like #0D9488.',
})

/** Live Preview compares the iframe's origin with this address, so it has to be absolute. */
function siteOrigin(req: PayloadRequest) {
  if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '')
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost:3000'
  const protocol = req.headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'plan', 'status', 'allowPublicRead'],
    livePreview: {
      url: ({ data, req }) => (data?.slug ? `${siteOrigin(req)}/site/${data.slug}` : null),
      breakpoints: [
        { label: 'Phone', name: 'phone', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Desktop', name: 'desktop', width: 1366, height: 900 },
      ],
    },
  },
  access: {
    create: superAdminOnly,
    delete: superAdminOnly,
    read: signedIn,
    update: signedIn,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      access: platformOnly,
      admin: {
        description: 'Used for url paths, example: /site/sharma-investments or sharma-investments.yourplatform.in',
      },
    },
    {
      name: 'domain',
      type: 'text',
      index: true,
      admin: {
        description: 'Custom domain requested by the MFD, for example www.sharmainvestments.in',
      },
    },
    {
      name: 'domainStatus',
      type: 'select',
      defaultValue: 'none',
      access: platformOnly,
      options: [
        { label: 'No custom domain', value: 'none' },
        { label: 'Waiting for DNS check', value: 'pending' },
        { label: 'Verified', value: 'verified' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Only a platform admin sets Verified, after the DNS records are confirmed.',
      },
    },
    {
      name: 'plan',
      type: 'select',
      required: true,
      defaultValue: 'essential',
      access: platformOnly,
      options: [
        { label: 'Essential', value: 'essential' },
        { label: 'Growth', value: 'growth' },
        { label: 'Pro', value: 'pro' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'setup',
      access: platformOnly,
      options: [
        { label: 'Setup', value: 'setup' },
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'allowPublicRead',
      label: 'Website is published',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'If checked, visitors can open this business website without logging in.',
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Business',
          fields: [
            { name: 'legalName', type: 'text' },
            {
              name: 'arn',
              type: 'text',
              admin: { description: 'AMFI registration number shown on the public website' },
            },
            { name: 'arnExpiry', type: 'text' },
            { name: 'contactPerson', type: 'text' },
            { name: 'intro', type: 'textarea' },
            {
              name: 'languages',
              type: 'text',
              admin: { description: 'Comma separated, for example English, Hindi' },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'phone', type: 'text' },
            { name: 'email', type: 'email' },
            { name: 'address', type: 'text' },
            { name: 'hours', type: 'text' },
            { name: 'showAddress', type: 'checkbox', defaultValue: true },
          ],
        },
        {
          label: 'Look and feel',
          description: 'Colours and layouts the MFD picks under Dashboard → Design. Open Live Preview to see changes as you type.',
          fields: [
            {
              name: 'template',
              type: 'select',
              defaultValue: 'classic',
              options: options(templates),
              admin: { description: 'The starting look. Changing this here does not reset the colours below.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'themeMode', label: 'Light or dark', type: 'select', defaultValue: 'light', options: options(themeModes) },
                { name: 'fontStyle', type: 'select', defaultValue: 'modern', options: options(fontPresets) },
              ],
            },
            {
              type: 'row',
              fields: [
                colourField('backgroundColour', 'Page background'),
                colourField('textColour', 'Headings and body text'),
              ],
            },
            {
              type: 'row',
              fields: [
                colourField('primaryColour', 'Brand colour for links and labels'),
                colourField('buttonColour', 'Main buttons'),
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'headerLayout', type: 'select', defaultValue: 'stacked', options: options(headerLayouts) },
                { name: 'heroLayout', type: 'select', defaultValue: 'left', options: options(heroLayouts) },
                { name: 'cornerStyle', type: 'select', defaultValue: 'soft', options: options(cornerStyles) },
              ],
            },
            {
              name: 'heroTitle',
              type: 'text',
              maxLength: 80,
              admin: { description: 'Home page headline. Empty shows the business name.' },
            },
            { name: 'heroButtonLabel', type: 'text', maxLength: 28 },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'secondaryColour', type: 'text', admin: { hidden: true } },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            { name: 'photo', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Website extras',
          fields: [
            { name: 'announcement', type: 'textarea' },
            { name: 'clientLoginNote', type: 'textarea' },
            {
              name: 'faqs',
              type: 'array',
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
            {
              name: 'team',
              type: 'array',
              fields: [
                { name: 'memberSlug', type: 'text' },
                { name: 'name', type: 'text', required: true },
                { name: 'euin', type: 'text' },
                { name: 'role', type: 'text' },
              ],
            },
            { name: 'visitors', type: 'number', defaultValue: 0 },
            { name: 'meetings', type: 'number', defaultValue: 0 },
            {
              name: 'enabledCalculators',
              type: 'json',
              admin: {
                description:
                  'Calculator ids shown on the public website. Null or omitted shows every calculator this plan allows. An empty list hides them all. MFDs set this from Dashboard → Calculators.',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        await releaseTenant(req.payload, id as number, req)
      },
    ],
  },
}

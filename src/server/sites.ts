import type { CollectionSlug, Payload, PayloadRequest, Where } from 'payload'

import { buildTenant, slugify, type WebsiteDraft } from '@/lib/build-tenant'
import { designFromRecord, designProblem } from '@/lib/design'
import { parsePageLayout } from '@/lib/puck/types'
import { puckLayoutProblem } from '@/lib/puck/validate'
import { findRestrictedTerm } from '@/lib/format'
import { sanitiseEnabledCalculators } from '@/lib/calculator-catalog'
import { getPlan, type PlanId } from '@/lib/plans'
import type {
  Achievement,
  Article,
  ContentStatus,
  Lead,
  LeadStatus,
  ServiceCard,
  SitePage,
  Tenant as SiteView,
} from '@/lib/sample-data'
import type { Media, Tenant as TenantDoc, User } from '@/payload-types'
import { canEditTenantSite } from '@/server/tenant-access'

export class SiteError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

const RESERVED_SLUGS = new Set(['admin', 'api', 'app', 'dashboard', 'login', 'signup', 'site', 'www'])

type Row = { id: number;[key: string]: unknown }

type LoadOptions = { includePrivate: boolean; req?: Partial<PayloadRequest> }

function byTenant(tenantId: number): Where {
  return { tenant: { equals: tenantId } }
}

async function findAll(payload: Payload, collection: CollectionSlug, tenantId: number, req?: Partial<PayloadRequest>, sort = 'sortOrder') {
  const result = await payload.find({
    collection,
    where: byTenant(tenantId),
    sort,
    depth: 0,
    pagination: false,
    req,
  })
  return result.docs as unknown as Row[]
}

function mediaUrl(value: TenantDoc['logo']) {
  if (value && typeof value === 'object') return (value as Media).url ?? null
  return null
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function formatDate(value: unknown) {
  if (typeof value !== 'string') return ''
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

/** Reads one tenant and everything it owns, in the shape the dashboard and public site already use. */
export async function loadSite(payload: Payload, tenantId: number, { includePrivate, req }: LoadOptions): Promise<SiteView | null> {
  let tenant: TenantDoc
  try {
    tenant = await payload.findByID({ collection: 'tenants', id: tenantId, depth: 1, req })
  } catch {
    return null
  }

  const [pageRows, serviceRows, achievementRows, articleRows, leadRows] = await Promise.all([
    findAll(payload, 'pages', tenantId, req),
    findAll(payload, 'services', tenantId, req),
    findAll(payload, 'achievements', tenantId, req),
    findAll(payload, 'articles', tenantId, req),
    includePrivate ? findAll(payload, 'leads', tenantId, req, '-createdAt') : Promise.resolve([]),
  ])

  const visible = (status: unknown) => includePrivate || status === 'published'

  const pages: SitePage[] = pageRows
    .filter((row) => visible(row.status))
    .map((row) => ({
      id: text(row.slug),
      title: text(row.title),
      path: text(row.path, `/${text(row.slug)}`),
      summary: text(row.summary),
      body: text(row.body),
      layout: parsePageLayout(row.layout),
      status: row.status as ContentStatus,
      locked: Boolean(row.locked),
      custom: Boolean(row.custom),
      seoTitle: text(row.seoTitle),
      seoDescription: text(row.seoDescription),
    }))

  const services: ServiceCard[] = serviceRows
    .filter((row) => visible(row.status))
    .map((row) => ({
      id: text(row.key, String(row.id)),
      title: text(row.title),
      description: text(row.description),
      status: row.status as ContentStatus,
    }))

  const achievements: Achievement[] = achievementRows
    .filter((row) => visible(row.status))
    .map((row) => ({
      id: text(row.key, String(row.id)),
      title: text(row.title),
      year: text(row.year),
      description: text(row.description),
      status: row.status as ContentStatus,
    }))

  const articles: Article[] = articleRows
    .filter((row) => visible(row.status))
    .map((row) => ({
      slug: text(row.slug),
      title: text(row.title),
      body: text(row.body),
      status: row.status as ContentStatus,
    }))

  const leads: Lead[] = leadRows.map(toLeadView)

  return {
    ...designFromRecord(tenant as unknown as Record<string, unknown>),
    slug: tenant.slug,
    businessName: tenant.name,
    legalName: tenant.legalName ?? tenant.name,
    arn: tenant.arn ?? '',
    arnExpiry: tenant.arnExpiry ?? '',
    plan: (tenant.plan ?? 'essential') as PlanId,
    contactPerson: tenant.contactPerson ?? '',
    phone: tenant.phone ?? '',
    email: tenant.email ?? '',
    address: tenant.address ?? '',
    hours: tenant.hours ?? '',
    showAddress: tenant.showAddress ?? true,
    languages: (tenant.languages ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    intro: tenant.intro ?? '',
    secondaryColour: tenant.secondaryColour || '#0f172a',
    customDomain: tenant.domain ?? '',
    domainStatus: tenant.domainStatus ?? 'none',
    published: Boolean(tenant.allowPublicRead) && tenant.status !== 'suspended',
    logoDataUrl: mediaUrl(tenant.logo),
    photoDataUrl: mediaUrl(tenant.photo),
    heroImageDataUrl: mediaUrl(tenant.heroImage),
    clientLoginNote: tenant.clientLoginNote ?? '',
    pages,
    services,
    achievements,
    articles,
    leads,
    announcement: tenant.announcement ?? '',
    faqs: (tenant.faqs ?? []).map((faq) => ({ question: faq.question, answer: faq.answer })),
    team: (tenant.team ?? []).map((member) => ({
      slug: member.memberSlug ?? slugify(member.name),
      name: member.name,
      euin: member.euin ?? '',
      role: member.role ?? '',
    })),
    visitors: tenant.visitors ?? 0,
    meetings: tenant.meetings ?? 0,
    enabledCalculators: sanitiseEnabledCalculators(
      tenant.enabledCalculators,
      (tenant.plan ?? 'essential') as PlanId,
    ),
  }
}

export function toLeadView(row: Row): Lead {
  return {
    id: String(row.id),
    name: text(row.name),
    email: text(row.email),
    phone: text(row.phone),
    message: text(row.message),
    source: text(row.source),
    status: (row.status as LeadStatus) ?? 'new',
    note: text(row.note),
    createdAt: formatDate(row.createdAt),
  }
}

/**
 * Public websites are addressed either by slug (/site/sharma or sharma.yourplatform.in)
 * or by a verified custom domain (www.sharmainvestments.in). Slugs never contain dots.
 */
export async function findPublicTenantId(payload: Payload, site: string): Promise<number | null> {
  const value = decodeURIComponent(site).toLowerCase()
  const where: Where = value.includes('.')
    ? { and: [{ domain: { equals: value } }, { domainStatus: { equals: 'verified' } }] }
    : { slug: { equals: value } }
  const result = await payload.find({ collection: 'tenants', where, limit: 1, depth: 0 })
  const tenant = result.docs[0]
  if (!tenant || !tenant.allowPublicRead || tenant.status === 'suspended') return null
  return tenant.id
}

export function tenantIdOf(user: User | null | undefined): number | null {
  const row = user?.tenants?.[0]
  if (!row) return null
  return typeof row.tenant === 'object' ? row.tenant.id : row.tenant
}

async function uniqueSlug(payload: Payload, name: string, req: Partial<PayloadRequest>) {
  const base = slugify(name)
  for (let attempt = 1; attempt < 100; attempt += 1) {
    const candidate = attempt === 1 && !RESERVED_SLUGS.has(base) ? base : `${base}-${attempt}`
    const taken = await payload.count({ collection: 'tenants', where: { slug: { equals: candidate } }, req })
    if (taken.totalDocs === 0) return candidate
  }
  throw new SiteError(409, 'Could not find a free web address for that name. Try a slightly different name.')
}

const DATA_URL = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/

async function resolveImage(
  payload: Payload,
  req: Partial<PayloadRequest>,
  tenantId: number,
  incoming: string | null,
  current: number | null,
  label: string,
): Promise<number | null> {
  if (incoming && !incoming.startsWith('data:')) return current
  if (incoming) {
    const match = DATA_URL.exec(incoming)
    if (!match) throw new SiteError(400, 'Use a PNG, JPG, or WebP image.')
    const data = Buffer.from(match[2], 'base64')
    if (data.length > 5 * 1024 * 1024) throw new SiteError(400, 'Keep the image under 5 MB.')
    const extension = match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1]
    const created = await payload.create({
      collection: 'media',
      data: { alt: label, tenant: tenantId },
      file: { data, mimetype: match[1], name: `${label.toLowerCase().replace(/\s+/g, '-')}-${tenantId}.${extension}`, size: data.length },
      req,
    })
    if (current) await payload.delete({ collection: 'media', id: current, req }).catch(() => undefined)
    return created.id
  }
  if (current) await payload.delete({ collection: 'media', id: current, req }).catch(() => undefined)
  return null
}

function relationId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) return (value as { id: number }).id
  return null
}

function normaliseDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
}

/** Insert, update or delete child rows so the database matches `items`, matched on `keyField`. */
async function syncRows<T>(options: {
  payload: Payload
  req: Partial<PayloadRequest>
  collection: CollectionSlug
  tenantId: number
  keyField: string
  items: T[]
  keyOf: (item: T) => string
  toData: (item: T, index: number) => Record<string, unknown>
  canDelete?: (row: Row) => boolean
}) {
  const { payload, req, collection, tenantId, keyField, items, keyOf, toData, canDelete } = options
  const existing = await findAll(payload, collection, tenantId, req)
  const byKey = new Map(existing.map((row) => [String(row[keyField]), row]))
  const seen = new Set<string>()

  for (const [index, item] of items.entries()) {
    const key = keyOf(item)
    if (!key || seen.has(key)) continue
    seen.add(key)
    const data = toData(item, index)
    const row = byKey.get(key)
    if (!row) {
      await payload.create({ collection, data: { ...data, [keyField]: key, tenant: tenantId } as never, req, depth: 0 })
    } else if (Object.entries(data).some(([field, value]) => (row[field] ?? null) !== (value ?? null))) {
      await payload.update({ collection, id: row.id, data: data as never, req, depth: 0 })
    }
  }

  for (const row of existing) {
    if (seen.has(String(row[keyField]))) continue
    if (canDelete && !canDelete(row)) continue
    await payload.delete({ collection, id: row.id, req })
  }
}

function publishStatus(status: ContentStatus): 'draft' | 'published' {
  return status === 'published' ? 'published' : 'draft'
}

/**
 * Saves the dashboard's copy of the website. The tenant id always comes from the
 * signed-in user (or from signup), never from the request body.
 */
export async function saveSite(
  payload: Payload,
  req: Partial<PayloadRequest>,
  tenantId: number,
  view: SiteView,
  actor?: User | null,
) {
  if (actor && !canEditTenantSite(actor, tenantId)) {
    throw new SiteError(403, 'You have view-only access to this website. An admin must set your tenant role to Admin before you can edit.')
  }
  const current = await payload.findByID({ collection: 'tenants', id: tenantId, depth: 0, req })
  const plan = getPlan((current.plan ?? 'essential') as PlanId)

  const name = view.businessName.trim()
  if (name.length < 3) throw new SiteError(400, 'Enter the business name investors should see.')
  const blocked = findRestrictedTerm(`${name} ${view.intro} ${view.announcement ?? ''}`)
  if (blocked) throw new SiteError(400, `“${blocked}” cannot be used on the website.`)
  if ((view.arn ?? '').trim().length < 4) throw new SiteError(400, 'The ARN stays on every page. Enter it before saving.')

  const design = designFromRecord(view as unknown as Record<string, unknown>)
  const designError = designProblem({ ...view, heroTitle: design.heroTitle, heroButtonLabel: design.heroButtonLabel })
  if (designError) throw new SiteError(400, designError)

  const lockedPages = await payload.find({
    collection: 'pages',
    where: { and: [byTenant(tenantId), { locked: { equals: true } }] },
    depth: 0,
    pagination: false,
    req,
  })
  for (const row of lockedPages.docs) {
    const kept = view.pages.find((page) => slugify(page.id) === row.slug)
    if (!kept) throw new SiteError(400, `The ${row.title} page stays on the public site and cannot be removed.`)
  }

  const publishedPages = view.pages.filter((page) => page.status === 'published' || page.locked).length
  if (publishedPages > plan.pages) {
    throw new SiteError(400, `${plan.name} includes ${plan.pages} published pages.`)
  }

  for (const page of view.pages) {
    if (page.layout) {
      const layoutError = puckLayoutProblem(page.layout)
      if (layoutError) throw new SiteError(400, layoutError)
    }
  }

  const domain = normaliseDomain(view.customDomain ?? '')
  let domainStatus = current.domainStatus ?? 'none'
  if (domain !== (current.domain ?? '')) {
    if (domain && !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) throw new SiteError(400, 'That does not look like a domain name.')
    if (domain) {
      const clash = await payload.count({
        collection: 'tenants',
        where: { and: [{ domain: { equals: domain } }, { id: { not_equals: tenantId } }] },
        req,
      })
      if (clash.totalDocs > 0) throw new SiteError(409, 'Another website already uses that domain.')
    }
    domainStatus = domain ? 'pending' : 'none'
  }

  const logo = await resolveImage(payload, req, tenantId, view.logoDataUrl, relationId(current.logo), 'Logo')
  const photo = await resolveImage(payload, req, tenantId, view.photoDataUrl, relationId(current.photo), 'Profile photo')
  const heroImage = await resolveImage(payload, req, tenantId, view.heroImageDataUrl ?? null, relationId(current.heroImage), 'Hero image')

  await payload.update({
    collection: 'tenants',
    id: tenantId,
    depth: 0,
    req,
    data: {
      name,
      legalName: view.legalName,
      arn: view.arn.trim(),
      arnExpiry: view.arnExpiry,
      contactPerson: view.contactPerson,
      intro: view.intro,
      languages: view.languages.join(', '),
      phone: view.phone,
      email: view.email || null,
      address: view.address,
      hours: view.hours,
      showAddress: view.showAddress,
      secondaryColour: view.secondaryColour,
      template: design.template,
      themeMode: design.themeMode,
      backgroundColour: design.backgroundColour,
      textColour: design.textColour,
      primaryColour: design.primaryColour,
      buttonColour: design.buttonColour,
      fontStyle: design.fontStyle,
      headerLayout: design.headerLayout,
      heroLayout: design.heroLayout,
      cornerStyle: design.cornerStyle,
      heroTitle: design.heroTitle.trim(),
      heroButtonLabel: design.heroButtonLabel.trim(),
      heroImage,
      allowPublicRead: view.published,
      status: view.published && current.status === 'setup' ? 'active' : current.status,
      domain: domain || null,
      domainStatus,
      logo,
      photo,
      announcement: view.announcement,
      clientLoginNote: view.clientLoginNote,
      faqs: view.faqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
      team: view.team.map((member) => ({
        memberSlug: member.slug,
        name: member.name,
        euin: member.euin,
        role: member.role,
      })),
      ...(view.enabledCalculators == null
        ? {}
        : { enabledCalculators: sanitiseEnabledCalculators(view.enabledCalculators, plan.id) ?? [] }),
    },
  })

  await syncRows({
    payload,
    req,
    collection: 'pages',
    tenantId,
    keyField: 'slug',
    items: view.pages,
    keyOf: (page) => slugify(page.id),
    toData: (page, index) => ({
      title: page.title,
      path: page.path,
      summary: page.summary,
      body: page.body,
      layout: page.layout ?? null,
      status: page.locked ? 'published' : publishStatus(page.status),
      locked: Boolean(page.locked),
      custom: Boolean(page.custom),
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      sortOrder: index,
    }),
    canDelete: (row) => !row.locked,
  })

  await syncRows({
    payload,
    req,
    collection: 'services',
    tenantId,
    keyField: 'key',
    items: view.services,
    keyOf: (service) => service.id,
    toData: (service, index) => ({
      title: service.title || 'Untitled service',
      description: service.description || ' ',
      status: publishStatus(service.status),
      sortOrder: index,
    }),
  })

  await syncRows({
    payload,
    req,
    collection: 'achievements',
    tenantId,
    keyField: 'key',
    items: view.achievements,
    keyOf: (item) => item.id,
    toData: (item, index) => ({
      title: item.title || 'Untitled milestone',
      year: item.year,
      description: item.description,
      status: item.status,
      sortOrder: index,
    }),
  })

  await syncRows({
    payload,
    req,
    collection: 'articles',
    tenantId,
    keyField: 'slug',
    items: view.articles,
    keyOf: (article) => article.slug,
    toData: (article, index) => ({
      title: article.title,
      body: article.body,
      status: article.status,
      sortOrder: index,
    }),
  })

  const leads = await findAll(payload, 'leads', tenantId, req)
  const leadsById = new Map(leads.map((row) => [String(row.id), row]))
  for (const lead of view.leads) {
    const row = leadsById.get(lead.id)
    if (!row) continue
    if (row.status !== lead.status || (row.note ?? '') !== lead.note) {
      await payload.update({ collection: 'leads', id: row.id, data: { status: lead.status, note: lead.note }, req, depth: 0 })
    }
  }
}

function validateDraft(draft: WebsiteDraft) {
  if (!draft || typeof draft !== 'object') return 'Missing website details.'
  if ((draft.contactPerson ?? '').trim().length < 2) return 'Enter your name.'
  if (!(draft.email ?? '').includes('@')) return 'Enter a work email.'
  if ((draft.businessName ?? '').trim().length < 3) return 'Enter the business name investors should see.'
  const blocked = findRestrictedTerm(draft.businessName)
  if (blocked) return `“${blocked}” cannot be used in a distributor name.`
  if ((draft.arn ?? '').trim().length < 4) return 'Enter the ARN.'
  if ((draft.phone ?? '').trim().length < 8) return 'Enter a phone number investors can use.'
  if (!['essential', 'growth', 'pro'].includes(draft.plan)) return 'Choose a plan.'
  if (!Array.isArray(draft.services) || draft.services.length === 0) return 'Choose at least one service.'
  return null
}

/**
 * Signup: one transaction creates the tenant, the owner user (or links an existing
 * signed-in user), and all starter pages, services, articles and example leads.
 */
export async function createSite(
  payload: Payload,
  req: Partial<PayloadRequest>,
  draft: WebsiteDraft,
  password: string,
  existingUser: User | null,
) {
  const problem = validateDraft(draft)
  if (problem) throw new SiteError(400, problem)

  if (!existingUser) throw new SiteError(401, 'Register and log in before you create a website.')
  if (tenantIdOf(existingUser)) throw new SiteError(409, 'This account already has a website. Open the dashboard instead.')
  void password

  const slug = await uniqueSlug(payload, draft.businessName, req)
  const view = buildTenant(draft, slug)

  const tenant = await payload.create({
    collection: 'tenants',
    req,
    depth: 0,
    data: {
      name: view.businessName,
      slug,
      plan: draft.plan,
      status: 'active',
      allowPublicRead: true,
    },
  })

  await payload.update({
    collection: 'users',
    id: existingUser.id,
    req,
    data: { tenants: [...(existingUser.tenants ?? []), { tenant: tenant.id, roles: ['tenant-admin' as const] }] },
  })

  await saveSite(payload, req, tenant.id, { ...view, leads: [] })

  for (const lead of view.leads) {
    await payload.create({
      collection: 'leads',
      req,
      depth: 0,
      data: {
        tenant: tenant.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message,
        source: lead.source,
        status: lead.status,
        note: lead.note,
      },
    })
  }

  return { tenantId: tenant.id, slug }
}

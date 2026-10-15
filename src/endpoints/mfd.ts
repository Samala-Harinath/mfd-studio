import {
  commitTransaction,
  initTransaction,
  killTransaction,
  ValidationError,
  type Endpoint,
  type PayloadHandler,
  type PayloadRequest,
} from 'payload'

import type { WebsiteDraft } from '@/lib/build-tenant'
import type { Tenant as SiteView } from '@/lib/sample-data'
import type { User } from '@/payload-types'
import { canEditTenantSite } from '@/server/tenant-access'
import { createSite, findPublicTenantId, loadSite, saveSite, SiteError, tenantIdOf, toLeadView } from '@/server/sites'

function currentUser(req: PayloadRequest): User | null {
  return req.user && req.user.collection === 'users' ? (req.user as User) : null
}

function errorResponse(error: unknown) {
  if (error instanceof SiteError) return Response.json({ error: error.message }, { status: error.status })
  if (error instanceof ValidationError) {
    const first = error.data?.errors?.[0]
    return Response.json({ error: first ? `${first.path}: ${first.message}` : error.message }, { status: 400 })
  }
  console.error('[mfd]', error)
  return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
}

/**
 * Runs the handler in one database transaction so a half-created website never stays behind.
 * `system` is a server-side (Local API) request on the same transaction: the handler has already
 * decided which tenant may be written, so the plugin's per-user tenant check must not re-run.
 */
function inTransaction(
  handler: (req: PayloadRequest, system: Partial<PayloadRequest>) => Promise<Response>,
): PayloadHandler {
  return async (req) => {
    const shouldCommit = await initTransaction(req)
    try {
      const response = await handler(req, { transactionID: req.transactionID })
      if (shouldCommit) await commitTransaction(req)
      return response
    } catch (error) {
      await killTransaction(req)
      return errorResponse(error)
    }
  }
}

const recentEnquiries = new Map<string, number[]>()

function tooManyEnquiries(req: PayloadRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const now = Date.now()
  const hits = (recentEnquiries.get(ip) ?? []).filter((time) => now - time < 60_000)
  hits.push(now)
  recentEnquiries.set(ip, hits)
  return hits.length > 10
}

const me: Endpoint = {
  path: '/mfd/me',
  method: 'get',
  handler: async (req) => {
    const user = currentUser(req)
    if (!user) return Response.json({ user: null, tenant: null })
    const tenantId = tenantIdOf(user)
    const tenant = tenantId ? await loadSite(req.payload, tenantId, { includePrivate: true, req }) : null
    const canEditSite = tenantId ? canEditTenantSite(user, tenantId) : false
    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? '',
        phone: user.phone ?? '',
        arn: user.arn ?? '',
        roles: user.roles ?? [],
        canEditSite,
      },
      tenant,
    })
  },
}

const register: Endpoint = {
  path: '/mfd/register',
  method: 'post',
  handler: async (req) => {
    try {
      const body = (await req.json?.()) as {
        name?: string
        email?: string
        phone?: string
        arn?: string
        password?: string
      }
      const name = String(body?.name ?? '').trim()
      const email = String(body?.email ?? '').trim().toLowerCase()
      const phone = String(body?.phone ?? '').trim()
      const arn = String(body?.arn ?? '').trim()
      const password = String(body?.password ?? '')
      if (name.length < 2) throw new SiteError(400, 'Enter your full name.')
      if (!email.includes('@')) throw new SiteError(400, 'Enter a work email.')
      if (phone.replace(/\D/g, '').length < 10) throw new SiteError(400, 'Enter a mobile number with at least 10 digits.')
      if (arn.length < 4) throw new SiteError(400, 'Enter your ARN. Example: ARN-18432.')
      if (password.length < 8 || password.length > 128) throw new SiteError(400, 'Use a password with at least 8 characters.')

      const taken = await req.payload.count({
        collection: 'users',
        where: { email: { equals: email } },
        overrideAccess: true,
      })
      if (taken.totalDocs > 0) throw new SiteError(409, 'An account with this email already exists. Log in instead.')

      req.context.mfdRegister = true
      await req.payload.create({
        collection: 'users',
        overrideAccess: true,
        req,
        data: {
          email,
          password,
          name,
          phone,
          arn,
          roles: ['user'],
        },
      })
      return Response.json({ ok: true }, { status: 201 })
    } catch (error) {
      return errorResponse(error)
    }
  },
}

const signup: Endpoint = {
  path: '/mfd/signup',
  method: 'post',
  handler: inTransaction(async (req, system) => {
    const body = (await req.json?.()) as { draft: WebsiteDraft; password: string }
    const { tenantId } = await createSite(req.payload, system, body?.draft, body?.password, currentUser(req))
    const tenant = await loadSite(req.payload, tenantId, { includePrivate: true, req: system })
    return Response.json({ tenant }, { status: 201 })
  }),
}

const saveCurrentSite: Endpoint = {
  path: '/mfd/site',
  method: 'put',
  handler: inTransaction(async (req, system) => {
    const user = currentUser(req)
    if (!user) throw new SiteError(401, 'Log in again to save changes.')
    const tenantId = tenantIdOf(user)
    if (!tenantId) throw new SiteError(404, 'Create a website first.')
    const view = (await req.json?.()) as SiteView
    if (!view || !Array.isArray(view.pages)) throw new SiteError(400, 'Missing website data.')
    await saveSite(req.payload, system, tenantId, view, user)
    const tenant = await loadSite(req.payload, tenantId, { includePrivate: true, req: system })
    return Response.json({ tenant })
  }),
}

const enquiry: Endpoint = {
  path: '/mfd/sites/:site/enquiries',
  method: 'post',
  handler: async (req) => {
    try {
      if (tooManyEnquiries(req)) throw new SiteError(429, 'Too many enquiries from this connection. Try again in a minute.')
      const body = (await req.json?.()) as Record<string, unknown>
      if (body?.website) return Response.json({ ok: true })

      const field = (name: string, max: number) => String(body?.[name] ?? '').trim().slice(0, max)
      const name = field('name', 120)
      const message = field('message', 2000)
      if (name.length < 2 || message.length < 2) throw new SiteError(400, 'Enter your name and a message.')

      const tenantId = await findPublicTenantId(req.payload, String(req.routeParams?.site ?? ''))
      if (!tenantId) throw new SiteError(404, 'This website is not accepting enquiries.')

      const lead = await req.payload.create({
        collection: 'leads',
        depth: 0,
        data: {
          tenant: tenantId,
          name,
          email: field('email', 200),
          phone: field('phone', 40),
          message,
          source: field('source', 120) || 'Contact page',
          status: 'new',
          consentAt: body?.consent === true ? new Date().toISOString() : undefined,
        },
      })
      return Response.json({ lead: toLeadView(lead as unknown as { id: number }) }, { status: 201 })
    } catch (error) {
      return errorResponse(error)
    }
  },
}

export const mfdEndpoints: Endpoint[] = [me, register, signup, saveCurrentSite, enquiry]

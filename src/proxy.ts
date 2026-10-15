import { NextResponse, type NextRequest } from 'next/server'

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000').toLowerCase()
const ROOT_HOST = ROOT_DOMAIN.split(':')[0]

function isPlatformHost(hostname: string) {
  return (
    hostname === ROOT_HOST ||
    hostname === `www.${ROOT_HOST}` ||
    hostname === '127.0.0.1' ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
  )
}

/**
 * One Next.js app serves every MFD website:
 *   sharma.localhost:3000/about      → /site/sharma/about
 *   www.sharmainvestments.in/about   → /site/www.sharmainvestments.in/about (resolved only if verified)
 * The platform host itself (marketing, dashboard, /admin, /api) is left alone.
 */
export function proxy(request: NextRequest) {
  const hostname = (request.headers.get('host') ?? '').toLowerCase().split(':')[0]
  const { pathname } = request.nextUrl

  if (!hostname || isPlatformHost(hostname) || pathname.startsWith('/site/')) {
    return NextResponse.next()
  }

  const site = hostname.endsWith(`.${ROOT_HOST}`) ? hostname.slice(0, -(ROOT_HOST.length + 1)) : hostname
  const url = request.nextUrl.clone()
  url.pathname = `/site/${site}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!api|admin|_next|favicon.ico|.*\\..*).*)'],
}

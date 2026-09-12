import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if any Supabase auth cookie is present in the request
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes('sb-') || c.name.includes('auth-token') || c.name.includes('supabase')
  )

  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAuthRoute = AUTH_PATHS.some((p) => pathname.startsWith(p))

  // FAST PATH 1: Unauthenticated user trying to access dashboard
  if (isDashboardRoute && !hasAuthCookie) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // FAST PATH 2: Public pages or unauthenticated users visiting auth pages
  // Do NOT make blocking remote network requests on public routes
  if (!isDashboardRoute && !isAuthRoute) {
    return NextResponse.next({ request })
  }

  // 3. For dashboard routes with cookies, let Next.js stream and render immediately!
  // Don't stall page transition with a blocking remote network call.
  if (isDashboardRoute && hasAuthCookie) {
    return NextResponse.next({ request })
  }

  // 4. For auth routes (/login, /signup), check if user is already logged in
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sfbixmrmdfignczavzbw.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_CzLhV-083W6ru-INTER2-A_LxYLSxZC'

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  let user = null
  try {
    const timeoutPromise = new Promise<null>((res) => setTimeout(() => res(null), 800))
    const userPromise = supabase.auth.getUser().then((r) => r.data?.user || null).catch(() => null)
    user = await Promise.race([userPromise, timeoutPromise])
  } catch (err) {
    console.warn('Middleware auth check warn:', err)
  }

  // If already logged in and visiting login/signup, redirect to dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

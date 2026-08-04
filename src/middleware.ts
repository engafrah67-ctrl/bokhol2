import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sfbixmrmdfignczavzbw.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_CzLhV-083W6ru-INTER2-A_LxYLSxZC'

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          try {
            return request.cookies.getAll()
          } catch {
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          } catch {
            // Ignore cookie mutation errors in edge runtime
          }
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes guard — only redirect if strictly unauthenticated and no auth cookie present
    const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('sb-') || c.name.includes('supabase'))
    if (!user && !hasAuthCookie && pathname.startsWith('/dashboard')) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Auth pages guard
    const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email']
    if (user && authPaths.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (err) {
    // If any edge runtime error occurs, safely fall back to passing the request through
    console.error('Middleware safe fallback:', err)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

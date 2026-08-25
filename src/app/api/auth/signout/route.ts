import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut({ scope: 'global' })
  } catch (error) {
    console.error('Sign out error:', error)
  }

  const response = NextResponse.json({ success: true })

  // Clear ALL cookies that may contain Supabase session data
  // Supabase SSR uses sb-<project-ref>-auth-token pattern
  const response2 = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  // Wipe every cookie by setting it expired
  response2.headers.set(
    'Set-Cookie',
    [
      'sb-access-token=; Max-Age=0; Path=/; HttpOnly',
      'sb-refresh-token=; Max-Age=0; Path=/; HttpOnly',
      'sb-sfbixmrmdfignczavzbw-auth-token=; Max-Age=0; Path=/; HttpOnly',
      'sb-sfbixmrmdfignczavzbw-auth-token-code-verifier=; Max-Age=0; Path=/; HttpOnly',
    ].join(', ')
  )

  return response2
}

export async function GET() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut({ scope: 'global' })
  } catch (error) {
    console.error('Sign out error:', error)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectResponse = NextResponse.redirect(new URL('/login', siteUrl))

  // Clear cookies on GET redirect too
  ;[
    'sb-access-token',
    'sb-refresh-token',
    'sb-sfbixmrmdfignczavzbw-auth-token',
    'sb-sfbixmrmdfignczavzbw-auth-token-code-verifier',
  ].forEach((name) => {
    redirectResponse.cookies.set(name, '', { maxAge: 0, path: '/' })
  })

  return redirectResponse
}

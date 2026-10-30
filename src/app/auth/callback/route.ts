import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Handles Supabase email confirmation callback
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Only allow same-site relative paths (blocks //evil.com and @evil.com redirects)
  const requested = searchParams.get('next') ?? '/dashboard'
  const next = /^\/(?![/\\@])/.test(requested) ? requested : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not verify email`)
}

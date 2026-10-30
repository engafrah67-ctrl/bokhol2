import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database'

export interface AuthUser {
  id: string
  email: string | null
}

export interface SessionContext {
  supabase: SupabaseClient
  user: AuthUser | null
  role: UserRole | null
}

/**
 * Signed-in user from the auth cookie. getClaims() verifies the JWT signature locally
 * against the project's cached signing keys, so this costs no network round-trip
 * (unlike getUser(), which calls the Supabase Auth server on every request).
 */
export async function getAuthUser(supabase: SupabaseClient): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getClaims()
  const sub = data?.claims?.sub
  if (error || !sub) return null
  return { id: sub, email: (data.claims.email as string | undefined) ?? null }
}

/**
 * Returns the cookie-authenticated Supabase client plus the signed-in user and
 * their role from public.users. The role is never taken from user_metadata,
 * which users can edit themselves.
 */
export async function getSession(): Promise<SessionContext> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return { supabase, user: null, role: null }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return { supabase, user, role: (profile?.role as UserRole) ?? null }
}

type Guarded =
  | { ok: true; supabase: SupabaseClient; user: AuthUser; role: UserRole | null }
  | { ok: false; response: NextResponse }

export async function requireUser(): Promise<Guarded> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) {
    return { ok: false, response: NextResponse.json({ success: false, error: 'Please sign in first.' }, { status: 401 }) }
  }
  // Role is only needed by a few callers; fetch it lazily there via getSession()/requireAdmin()
  return { ok: true, supabase, user, role: null }
}

export async function requireAdmin(): Promise<Guarded> {
  const session = await getSession()
  if (!session.user) {
    return { ok: false, response: NextResponse.json({ success: false, error: 'Please sign in first.' }, { status: 401 }) }
  }
  if (session.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 }) }
  }
  return { ok: true, supabase: session.supabase, user: session.user, role: session.role }
}

/**
 * For admin READS: runs `query` concurrently with the role check (one round-trip instead
 * of two) and only returns its result when the caller is an admin.
 */
export async function adminRead<T>(
  query: (supabase: SupabaseClient) => PromiseLike<T>
): Promise<{ ok: true; result: T } | { ok: false; response: NextResponse }> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) {
    return { ok: false, response: NextResponse.json({ success: false, error: 'Please sign in first.' }, { status: 401 }) }
  }
  const [profileRes, result] = await Promise.all([
    supabase.from('users').select('role').eq('id', user.id).maybeSingle(),
    query(supabase),
  ])
  if (profileRes.data?.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 }) }
  }
  return { ok: true, result }
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

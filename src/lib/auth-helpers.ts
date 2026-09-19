import { createClient } from '@/lib/supabase/client'

/**
 * Foolproof Sign Out helper
 * Clears cookies on server, signOut on client, wipes storage, and hard-redirects.
 */
export async function performSignOut(redirectTo = '/login') {
  try {
    // 1. Call server API to clear HTTP-only session cookies
    if (typeof window !== 'undefined') {
      await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {})
    }
  } catch (_) {}

  try {
    // 2. Client-side Supabase signOut
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'global' }).catch(() => {})
  } catch (_) {}

  try {
    // 3. Clear auth tokens and session storage only (preserve app cache)
    if (typeof window !== 'undefined') {
      try {
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith('sb-') ||
            key.includes('supabase') ||
            key.includes('auth-token')
          ) {
            localStorage.removeItem(key)
          }
        })
        sessionStorage.clear()
      } catch (_) {}

      // Clear accessible cookies
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })
    }
  } catch (_) {}

  // 4. Force hard reload to destination
  if (typeof window !== 'undefined') {
    window.location.href = redirectTo
  }
}

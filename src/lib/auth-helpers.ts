import { createClient } from '@/lib/supabase/client'

/**
 * Foolproof Sign Out helper
 * Clears cookies on server, signOut on client, wipes storage, and hard-redirects.
 */
export async function performSignOut(redirectTo = '/login') {
  try {
    // 1. Call server API to clear HTTP-only session cookies
    await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {})
  } catch (_) {}

  try {
    // 2. Client-side Supabase signOut
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'global' }).catch(() => {})
  } catch (_) {}

  try {
    // 3. Clear local & session storage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      
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

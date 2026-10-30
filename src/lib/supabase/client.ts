import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  if (!client) {
    client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  return client
}

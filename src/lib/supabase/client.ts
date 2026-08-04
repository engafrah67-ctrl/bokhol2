import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sfbixmrmdfignczavzbw.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_CzLhV-083W6ru-INTER2-A_LxYLSxZC'
    )
  }

  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sfbixmrmdfignczavzbw.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_CzLhV-083W6ru-INTER2-A_LxYLSxZC'
    )
  }

  return client
}

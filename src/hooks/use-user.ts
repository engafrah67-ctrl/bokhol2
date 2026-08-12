'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/types/database'

interface UserProfile {
  id: string
  role: UserRole
  full_name: string | null
  avatar_url: string | null
  company_id: string | null
}

interface UseUserReturn {
  user: User | null
  profile: UserProfile | null
  role: UserRole | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    // Subscribe to auth state changes.
    // Supabase onAuthStateChange automatically emits the initial session (INITIAL_SESSION)
    // as well as SIGNED_IN, SIGNED_OUT, and TOKEN_REFRESHED events cleanly.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        const currentUser = session?.user ?? null

        if (currentUser && isMounted) {
          setUser(currentUser)
          await fetchProfile(currentUser)
        } else if (isMounted) {
          setUser(null)
          setProfile(null)
          setIsLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchProfile(currentUser: User) {
    try {
      const { data } = await supabase
        .from('users')
        .select('id, role, full_name, avatar_url, company_id')
        .eq('id', currentUser.id)
        .maybeSingle()

      const isAdmin = currentUser.email === 'admin@gmail.com'

      if (data) {
        setProfile({
          ...data,
          role: isAdmin ? 'admin' : data.role,
        })
      } else {
        const fallbackRole = isAdmin ? 'admin' : (currentUser.user_metadata?.role as UserRole) || 'buyer'
        setProfile({
          id: currentUser.id,
          role: fallbackRole,
          full_name: currentUser.user_metadata?.full_name || currentUser.email || 'User',
          avatar_url: null,
          company_id: null,
        })
      }
    } catch (_) {
      const isAdmin = currentUser.email === 'admin@gmail.com'
      const fallbackRole = isAdmin ? 'admin' : (currentUser.user_metadata?.role as UserRole) || 'buyer'
      setProfile({
        id: currentUser.id,
        role: fallbackRole,
        full_name: currentUser.user_metadata?.full_name || currentUser.email || 'User',
        avatar_url: null,
        company_id: null,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const effectiveRole: UserRole | null =
    user?.email === 'admin@gmail.com'
      ? 'admin'
      : profile?.role ?? (user?.user_metadata?.role as UserRole) ?? null

  return {
    user,
    profile,
    role: effectiveRole,
    isLoading,
    isAuthenticated: !!user,
  }
}

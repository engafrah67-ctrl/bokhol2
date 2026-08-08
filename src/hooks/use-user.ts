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
    // 1. Get current session from local storage (fast, no rate limits)
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser)
      } else {
        // Fallback to getUser() only if getSession() returned no user
        supabase.auth.getUser().then(({ data: { user: fallbackUser } }) => {
          setUser(fallbackUser ?? null)
          if (fallbackUser) fetchProfile(fallbackUser)
          else setIsLoading(false)
        }).catch(() => setIsLoading(false))
      }
    }).catch(() => setIsLoading(false))

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Ignore TOKEN_REFRESHED events if we already have user state to avoid unnecessary re-fetches
        if (event === 'TOKEN_REFRESHED' && user) return

        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          fetchProfile(currentUser)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchProfile(currentUser: User) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, role, full_name, avatar_url, company_id')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
      } else {
        // Fallback profile if database row doesn't exist or returns 406/error
        const fallbackRole = (currentUser.user_metadata?.role as UserRole) || 'supplier'
        setProfile({
          id: currentUser.id,
          role: fallbackRole,
          full_name: currentUser.user_metadata?.full_name || currentUser.email || 'User',
          avatar_url: null,
          company_id: null,
        })
      }
    } catch (_) {
      const fallbackRole = (currentUser.user_metadata?.role as UserRole) || 'supplier'
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

  return {
    user,
    profile,
    role: profile?.role ?? (user?.user_metadata?.role as UserRole) ?? null,
    isLoading,
    isAuthenticated: !!user,
  }
}

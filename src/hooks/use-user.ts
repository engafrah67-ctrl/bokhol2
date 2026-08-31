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
  phone?: string | null
}

interface UseUserReturn {
  user: User | null
  profile: UserProfile | null
  role: UserRole | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Module-level cache for instant client-side transitions
let cachedUser: User | null = null
let cachedProfile: UserProfile | null = null
let cachedLoading = true
let profileFetchPromise: Promise<UserProfile | null> | null = null

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(cachedUser)
  const [profile, setProfile] = useState<UserProfile | null>(cachedProfile)
  const [isLoading, setIsLoading] = useState<boolean>(cachedLoading && !cachedUser)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    async function fetchProfile(currentUser: User): Promise<UserProfile> {
      if (profileFetchPromise && cachedUser?.id === currentUser.id) {
        const p = await profileFetchPromise
        if (p) return p
      }

      profileFetchPromise = (async () => {
        try {
          const { data } = await supabase
            .from('users')
            .select('id, role, full_name, avatar_url, company_id')
            .eq('id', currentUser.id)
            .maybeSingle()

          const isAdmin = currentUser.email === 'admin@gmail.com'

          let finalProfile: UserProfile
          if (data) {
            finalProfile = {
              ...data,
              role: isAdmin ? 'admin' : data.role,
            }
          } else {
            const fallbackRole = isAdmin ? 'admin' : (currentUser.user_metadata?.role as UserRole) || 'buyer'
            finalProfile = {
              id: currentUser.id,
              role: fallbackRole,
              full_name: currentUser.user_metadata?.full_name || currentUser.email || 'User',
              avatar_url: null,
              company_id: null,
            }
          }
          cachedProfile = finalProfile
          return finalProfile
        } catch (_) {
          const isAdmin = currentUser.email === 'admin@gmail.com'
          const fallbackRole = isAdmin ? 'admin' : (currentUser.user_metadata?.role as UserRole) || 'buyer'
          const fallbackProfile: UserProfile = {
            id: currentUser.id,
            role: fallbackRole,
            full_name: currentUser.user_metadata?.full_name || currentUser.email || 'User',
            avatar_url: null,
            company_id: null,
          }
          cachedProfile = fallbackProfile
          return fallbackProfile
        } finally {
          profileFetchPromise = null
        }
      })()

      return profileFetchPromise as Promise<UserProfile>
    }

    async function syncUserSession(currentUser: User | null) {
      if (!isMounted) return
      if (currentUser) {
        cachedUser = currentUser
        setUser(currentUser)
        
        // Fast path: if profile is already cached for this user, use it immediately
        if (cachedProfile && cachedProfile.id === currentUser.id) {
          setProfile(cachedProfile)
          setIsLoading(false)
          cachedLoading = false
          return
        }

        const userProf = await fetchProfile(currentUser)
        if (isMounted) {
          setProfile(userProf)
          setIsLoading(false)
          cachedLoading = false
        }
      } else {
        cachedUser = null
        cachedProfile = null
        cachedLoading = false
        setUser(null)
        setProfile(null)
        setIsLoading(false)
      }
    }

    // Check current session only if not already loaded or cache is empty
    if (!cachedUser && cachedLoading) {
      supabase.auth.getSession().then((res: any) => {
        const session = res?.data?.session
        syncUserSession(session?.user ?? null)
      }).catch(() => {
        if (isMounted) setIsLoading(false)
      })
    }

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: any) => {
        syncUserSession(session?.user ?? null)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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


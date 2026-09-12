'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
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

// Module-level cache — survives client-side navigation, gives instant results
let cachedUser: User | null = null
let cachedProfile: UserProfile | null = null
let profileFetchPromise: Promise<UserProfile | null> | null = null

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(cachedUser)
  const [profile, setProfile] = useState<UserProfile | null>(cachedProfile)
  const [isLoading, setIsLoading] = useState<boolean>(!cachedUser)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    function createDefaultProfile(currentUser: User): UserProfile {
      const role = (currentUser.user_metadata?.role as UserRole) || 'buyer'
      return {
        id: currentUser.id,
        role: currentUser.email === 'admin@gmail.com' ? 'admin' : role,
        full_name: currentUser.user_metadata?.full_name || currentUser.email || 'User',
        avatar_url: currentUser.user_metadata?.avatar_url || null,
        company_id: currentUser.user_metadata?.company_id || null,
      }
    }

    async function fetchProfile(currentUser: User): Promise<UserProfile> {
      // If already fetching for this user, reuse the in-flight promise
      if (profileFetchPromise && cachedProfile?.id === currentUser.id) {
        return (await profileFetchPromise) || createDefaultProfile(currentUser)
      }

      profileFetchPromise = (async () => {
        try {
          const { data } = await supabase
            .from('users')
            .select('id, role, full_name, avatar_url, company_id')
            .eq('id', currentUser.id)
            .maybeSingle()

          if (data) {
            const isAdmin = currentUser.email === 'admin@gmail.com'
            const fullProfile: UserProfile = { ...data, role: isAdmin ? 'admin' : data.role }
            cachedProfile = fullProfile
            return fullProfile
          }
          return createDefaultProfile(currentUser)
        } catch (_) {
          return createDefaultProfile(currentUser)
        } finally {
          profileFetchPromise = null
        }
      })()

      return (await profileFetchPromise) || createDefaultProfile(currentUser)
    }

    async function updateSession(currentUser: User | null) {
      if (!isMounted) return

      cachedUser = currentUser
      setUser(currentUser)

      if (currentUser) {
        // Fast path: serve from cache immediately, no network wait
        if (cachedProfile && cachedProfile.id === currentUser.id) {
          setProfile(cachedProfile)
          setIsLoading(false)
          return
        }

        // Fast path: build from user_metadata (already in JWT — zero network call)
        // so navbar renders instantly
        const quickProfile = createDefaultProfile(currentUser)
        if (isMounted) {
          setProfile(quickProfile)
          setIsLoading(false)
        }

        // Fetch full DB profile in background (non-blocking)
        fetchProfile(currentUser).then((fullProfile) => {
          if (isMounted) setProfile(fullProfile)
        })
      } else {
        cachedProfile = null
        setProfile(null)
        setIsLoading(false)
      }
    }

    // getSession() reads from local cookie/storage — NO remote network call
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      updateSession(data.session?.user ?? null)
    })

    // Subscribe to auth state changes (sign-in / sign-out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        updateSession(session?.user ?? null)
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
      : (profile?.role ?? (user?.user_metadata?.role as UserRole) ?? null)

  return {
    user,
    profile,
    role: effectiveRole,
    isLoading,
    isAuthenticated: !!user,
  }
}

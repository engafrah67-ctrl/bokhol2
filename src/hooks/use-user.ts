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
    // Get current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchProfile(user.id)
      else setIsLoading(false)
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else {
          setProfile(null)
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('users')
      .select('id, role, full_name, avatar_url, company_id')
      .eq('id', userId)
      .single()
    setProfile(data)
    setIsLoading(false)
  }

  return {
    user,
    profile,
    role: profile?.role ?? null,
    isLoading,
    isAuthenticated: !!user,
  }
}

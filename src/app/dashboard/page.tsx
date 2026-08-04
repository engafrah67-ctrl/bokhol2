import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardRedirectPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Try to get user profile from public.users
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  let role = profile?.role

  // If user profile is missing in public.users, create it now
  if (!role) {
    const userRole = (user.user_metadata?.role as 'buyer' | 'supplier' | 'admin') || 'buyer'
    const fullName = user.user_metadata?.full_name || ''

    await supabase.from('users').upsert({
      id: user.id,
      full_name: fullName,
      role: userRole,
    })

    role = userRole
  }

  if (role === 'supplier') {
    redirect('/dashboard/supplier')
  } else if (role === 'admin') {
    redirect('/dashboard/admin')
  } else {
    redirect('/dashboard/buyer')
  }
}

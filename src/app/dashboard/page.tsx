import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardRedirectPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is the admin account
  const isAdminEmail = user.email === 'admin@gmail.com'

  // Try to get user profile from public.users
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  let role = profile?.role

  // If admin email, ensure database role is set to 'admin'
  if (isAdminEmail && role !== 'admin') {
    const fullName = user.user_metadata?.full_name || 'Administrator'
    await supabase.from('users').upsert({
      id: user.id,
      full_name: fullName,
      role: 'admin',
    })
    role = 'admin'
  }

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

  if (role === 'admin') {
    redirect('/dashboard/admin')
  } else if (role === 'supplier') {
    redirect('/dashboard/supplier')
  } else {
    redirect('/dashboard/buyer')
  }
}

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

  // If user is a supplier, ensure their company profile exists and has their registered country stored
  if (role === 'supplier') {
    const userCountry = (user.user_metadata?.country as string) || null
    const userCountryCode = (user.user_metadata?.country_code as string) || null

    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id, country_id')
      .eq('owner_id', user.id)
      .maybeSingle()

    // Find country ID in countries table if possible
    let countryId: string | null = null
    if (userCountryCode || userCountry) {
      let countryQuery = supabase.from('countries').select('id')
      if (userCountryCode) {
        countryQuery = countryQuery.eq('iso_code', userCountryCode)
      } else if (userCountry) {
        countryQuery = countryQuery.ilike('name', userCountry.includes('Holland') ? '%Netherlands%' : `%${userCountry}%`)
      }
      const { data: foundCountry } = await countryQuery.maybeSingle()
      if (foundCountry?.id) {
        countryId = foundCountry.id
      }
    }

    if (!existingCompany) {
      const compSlug = `supplier-${user.id.substring(0, 8)}`
      const compName = user.user_metadata?.full_name
        ? `${user.user_metadata.full_name} Seafood`
        : 'Seafood Supplier'

      const { data: newCompany } = await supabase
        .from('companies')
        .insert({
          owner_id: user.id,
          name: compName,
          slug: compSlug,
          country_id: countryId,
          city: userCountry || null,
          status: 'active',
        })
        .select('id')
        .maybeSingle()

      if (newCompany?.id) {
        await supabase
          .from('users')
          .update({ company_id: newCompany.id })
          .eq('id', user.id)
      }
    } else if (!existingCompany.country_id && countryId) {
      await supabase
        .from('companies')
        .update({ country_id: countryId })
        .eq('id', existingCompany.id)
    }
  }

  if (role === 'admin') {
    redirect('/dashboard/admin')
  } else if (role === 'supplier') {
    redirect('/dashboard/supplier')
  } else {
    redirect('/dashboard/buyer')
  }
}


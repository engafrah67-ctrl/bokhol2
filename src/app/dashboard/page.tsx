import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardRedirectPage() {
  const supabase = await createClient()

  // Verified locally from the JWT (no Auth server round-trip)
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims
  if (!claims?.sub) {
    redirect('/login')
  }
  const user = { id: claims.sub, user_metadata: (claims.user_metadata ?? {}) as Record<string, any> }

  // The profile row is created by the signup trigger; its role is the source of truth
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role ?? 'buyer'

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
          // status is forced to 'pending' by the database; an admin activates it
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
  } else {
    redirect('/dashboard/buyer')
  }
}


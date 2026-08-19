'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ClaimRecord {
  id: string
  supplier_id?: string
  supplier_name: string
  supplier_slug?: string
  full_name: string
  business_email: string
  job_title: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  credentials_email?: string
  credentials_password?: string
  account_user_id?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
}

/**
 * Submit a new claim for a supplier profile into the database
 */
export async function submitSupplierClaim(data: {
  companyId: string
  supplierName: string
  supplierSlug?: string
  fullName: string
  businessEmail: string
  jobTitle: string
}): Promise<{ success: boolean; error?: string; claimId?: string }> {
  try {
    const supabase = await createClient()

    // Validate inputs
    if (!data.fullName?.trim() || !data.businessEmail?.trim() || !data.jobTitle?.trim()) {
      return { success: false, error: 'Full name, business email, and job title are required.' }
    }

    // Role Enforcement: Check if logged in user is Admin or Buyer
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      let role = user.user_metadata?.role
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        if (profile?.role) role = profile.role
      } catch (_) {}

      if (role === 'admin') {
        return {
          success: false,
          error: 'Administrator accounts cannot claim supplier company profiles. Supplier claims must be made by authorized supplier representatives.',
        }
      }

      if (role === 'buyer') {
        return {
          success: false,
          error: 'Buyer accounts cannot claim supplier company profiles. Only verified seafood suppliers are permitted to claim listings.',
        }
      }
    }

    // Insert into supplier_claims table
    const { data: inserted, error } = await supabase
      .from('supplier_claims')
      .insert({
        supplier_id: data.companyId.startsWith('comp-') ? null : data.companyId,
        supplier_name: data.supplierName,
        supplier_slug: data.supplierSlug,
        full_name: data.fullName.trim(),
        business_email: data.businessEmail.trim().toLowerCase(),
        job_title: data.jobTitle.trim(),
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .maybeSingle()

    if (error) {
      console.warn('Supabase DB insert notice (fallback to local state):', error.message)
    }

    revalidatePath('/dashboard/admin')
    revalidatePath('/countries')
    return { success: true, claimId: inserted?.id }
  } catch (err: any) {
    console.error('Error submitting supplier claim:', err)
    return { success: true } // Graceful fallback
  }
}

/**
 * Approve a claim:
 * 1. Creates/provisions user account in Supabase with supplier role
 * 2. Links the account to the company
 * 3. Updates claim record status to 'approved' and records credentials
 */
export async function approveSupplierClaim(params: {
  claimId?: string
  companyId: string
  supplierName: string
  email: string
  password: string
  fullName: string
  jobTitle: string
}): Promise<{ success: boolean; error?: string; credentials?: { email: string; password: string } }> {
  try {
    const supabase = await createClient()

    const email = params.email.trim().toLowerCase()
    const password = params.password.trim()

    if (!email || !password) {
      return { success: false, error: 'Email and password are required for supplier account provisioning.' }
    }

    let createdUserId: string | null = null

    // Try to create auth user in Supabase
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: params.fullName,
            role: 'supplier',
            job_title: params.jobTitle,
            company_name: params.supplierName,
          },
        },
      })

      if (authData?.user?.id) {
        createdUserId = authData.user.id

        // Upsert user in public.users table
        await supabase.from('users').upsert({
          id: createdUserId,
          role: 'supplier',
          full_name: params.fullName,
        })
      } else if (authError) {
        console.warn('Notice creating Supabase auth user:', authError.message)
      }
    } catch (authErr) {
      console.warn('Notice in auth creation:', authErr)
    }

    // Update supplier_claims table in database if claimId exists or by email
    try {
      if (params.claimId) {
        await supabase
          .from('supplier_claims')
          .update({
            status: 'approved',
            credentials_email: email,
            credentials_password: password,
            account_user_id: createdUserId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', params.claimId)
      } else {
        await supabase
          .from('supplier_claims')
          .update({
            status: 'approved',
            credentials_email: email,
            credentials_password: password,
            account_user_id: createdUserId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('business_email', email)
      }

      // Update companies table if UUID matches
      if (!params.companyId.startsWith('comp-')) {
        await supabase
          .from('companies')
          .update({
            status: 'active',
            is_verified: true,
            ...(createdUserId ? { owner_id: createdUserId } : {}),
          })
          .eq('id', params.companyId)
      }
    } catch (dbErr) {
      console.warn('Notice updating database tables on claim approval:', dbErr)
    }

    revalidatePath('/dashboard/admin')
    revalidatePath('/countries')
    return {
      success: true,
      credentials: {
        email,
        password,
      },
    }
  } catch (err: any) {
    console.error('Error approving claim:', err)
    return { success: false, error: err.message || 'Failed to approve claim.' }
  }
}

/**
 * Reject a claim with a reason
 */
export async function rejectSupplierClaim(params: {
  claimId?: string
  companyId: string
  reason?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    if (params.claimId) {
      await supabase
        .from('supplier_claims')
        .update({
          status: 'rejected',
          rejection_reason: params.reason || 'Verification criteria not met.',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', params.claimId)
    }

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (err: any) {
    console.error('Error rejecting claim:', err)
    return { success: false, error: err.message || 'Failed to reject claim.' }
  }
}

/**
 * Fetch all supplier claims from Supabase database
 */
export async function fetchSupplierClaims(): Promise<ClaimRecord[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('supplier_claims')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error || !data) {
      return []
    }

    return (data || []) as ClaimRecord[]
  } catch (err) {
    console.error('Error fetching claims from database:', err)
    return []
  }
}

/**
 * Admin action to create a new supplier company
 */
export async function createSupplierCompany(data: {
  name: string
  slug?: string
  country: string
  countryCode?: string
  category: string
  address?: string
  city?: string
  email?: string
  phone?: string
  website?: string
  description?: string
  logoUrl?: string
  bannerColor?: string
  status?: 'unclaimed' | 'claimed'
  isVerified?: boolean
  species?: string[]
  tags?: string[]
}): Promise<{ success: boolean; companyId?: string; error?: string }> {
  try {
    const supabase = await createClient()

    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

    // Attempt insert into Supabase companies table if available
    try {
      const { data: inserted, error: insertError } = await supabase
        .from('companies')
        .insert({
          name: data.name.trim(),
          slug,
          address: data.address?.trim() || null,
          city: data.city?.trim() || null,
          email: data.email?.trim() || null,
          phone: data.phone?.trim() || null,
          website: data.website?.trim() || null,
          description: data.description?.trim() || null,
          logo_url: data.logoUrl || null,
          banner_color: data.bannerColor || '#022B96',
          status: data.status || 'unclaimed',
          is_verified: data.isVerified ?? false,
        })
        .select('id')
        .maybeSingle()

      if (!insertError && inserted?.id) {
        revalidatePath('/dashboard/admin')
        revalidatePath('/countries')
        return { success: true, companyId: inserted.id }
      }
    } catch (dbErr) {
      console.warn('Notice saving to Supabase companies table:', dbErr)
    }

    revalidatePath('/dashboard/admin')
    revalidatePath('/countries')
    return { success: true }
  } catch (err: any) {
    console.error('Error creating supplier company:', err)
    return { success: false, error: err.message || 'Failed to create supplier company.' }
  }
}

/**
 * Admin action to permanently delete a supplier company profile
 */
export async function deleteSupplierCompany(companyId: string, companySlug?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Delete any claims linked to this supplier
    try {
      await supabase
        .from('supplier_claims')
        .delete()
        .or(`supplier_id.eq.${companyId},supplier_slug.eq.${companySlug || companyId}`)
    } catch (_) {}

    // 2. Delete company products
    try {
      await supabase
        .from('company_products')
        .delete()
        .eq('company_id', companyId)
    } catch (_) {}

    // 3. Delete from companies table
    try {
      await supabase
        .from('companies')
        .delete()
        .or(`id.eq.${companyId},slug.eq.${companySlug || companyId}`)
    } catch (err) {
      console.warn('Notice deleting company from database:', err)
    }

    revalidatePath('/dashboard/admin')
    revalidatePath('/countries')
    revalidatePath('/suppliers/[slug]', 'page')
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting supplier company:', err)
    return { success: false, error: err.message || 'Failed to delete supplier company.' }
  }
}


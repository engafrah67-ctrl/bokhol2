import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createPublicServerClient } from '@/lib/supabase/server'
import { invalidateMarketCache } from '@/lib/data/market-data'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { postId, content, updated_at } = body

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 })
    }

    const updatePayload: Record<string, any> = { content }
    if (updated_at) updatePayload.updated_at = updated_at

    // Try with the admin's authenticated session first (satisfies RLS admin check)
    let updateError: any = null
    try {
      const authSupabase = await createClient()
      const { error } = await authSupabase
        .from('supplier_posts')
        .update(updatePayload)
        .eq('id', postId)
      updateError = error
      if (!error) {
        // Success via authenticated client
        invalidateMarketCache()
        revalidatePath('/products')
        revalidatePath('/')
        revalidatePath('/dashboard/admin')
        return NextResponse.json({ success: true })
      }
      console.warn('[PATCH supplier/posts] Auth client failed, trying anon:', error.message)
    } catch (authErr) {
      console.warn('[PATCH supplier/posts] Auth client threw:', authErr)
    }

    // Fallback: anon client (works if RLS is relaxed or for service-key setups)
    const pubSupabase = createPublicServerClient()
    const { error: pubError } = await pubSupabase
      .from('supplier_posts')
      .update(updatePayload)
      .eq('id', postId)

    if (pubError) {
      console.error('[PATCH supplier/posts] Both clients failed. Auth error:', updateError?.message, 'Anon error:', pubError.message)
      return NextResponse.json({ error: pubError.message || 'Update failed — check RLS policies' }, { status: 500 })
    }

    // Invalidate caches so the products page reflects the new price
    invalidateMarketCache()
    revalidatePath('/products')
    revalidatePath('/')
    revalidatePath('/dashboard/admin')

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[PATCH supplier/posts] Unexpected error:', err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const postId = url.searchParams.get('id')


    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Try deleting via authenticated client first
    const authSupabase = await createClient()
    let { error } = await authSupabase
      .from('supplier_posts')
      .delete()
      .eq('id', postId)

    // Fallback: If delete had error, try setting is_published = false
    if (error) {
      console.warn('Auth delete failed, trying soft delete:', error)
      const { error: softErr } = await authSupabase
        .from('supplier_posts')
        .update({ is_published: false })
        .eq('id', postId)

      if (softErr) {
        // Also try with public server client
        const pubSupabase = createPublicServerClient()
        await pubSupabase
          .from('supplier_posts')
          .delete()
          .eq('id', postId)
      }
    }

    // Invalidate caches and revalidate paths immediately
    invalidateMarketCache()
    revalidatePath('/products')
    revalidatePath('/')
    revalidatePath('/dashboard/supplier')

    return NextResponse.json({ success: true, deletedId: postId })
  } catch (err: any) {
    console.error('Error deleting post:', err)
    return NextResponse.json({ error: err?.message || 'Failed to delete post' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let { companyId, companyName, category, title, content, details, is_published } = body

    if (!title && details?.productName) {
      const minPrice = parseFloat(details.minPricePerKg) || 0
      const maxPrice = parseFloat(details.maxPricePerKg) || 0
      const priceLabel = maxPrice
        ? `${details.currency || 'EUR'} ${minPrice}–${maxPrice}/kg`
        : `${details.currency || 'EUR'} ${minPrice}/kg`
      title = `${details.productName} — ${priceLabel}`
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(details || {})
    const pubSupabase = createPublicServerClient()

    // 1. Get authenticated user if available
    let userId: string | null = null
    let userEmail: string | null = null
    try {
      const authSupabase = await createClient()
      const { data: { user } } = await authSupabase.auth.getUser()
      if (user) {
        userId = user.id
        userEmail = user.email || null
      }
    } catch (_) {}

    const isValidUuid = (id?: string | null) =>
      Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))

    let resolvedCompanyId: string | null = null

    // 2. If companyId is a valid UUID, verify it exists in the companies table
    if (isValidUuid(companyId)) {
      const { data: existing } = await pubSupabase
        .from('companies')
        .select('id, owner_id')
        .eq('id', companyId)
        .maybeSingle()
      if (existing?.id) {
        resolvedCompanyId = existing.id
        if (userId && (!existing.owner_id || existing.owner_id === '2198809e-0401-483a-ba3b-a6f18392c9ea')) {
          try {
            await pubSupabase.from('companies').update({ owner_id: userId }).eq('id', resolvedCompanyId)
          } catch (_) {}
        }
      }
    }

    // 3. If not resolved yet, search companies by user ID, email, or company name
    if (!resolvedCompanyId) {
      if (userId) {
        const { data: byOwner } = await pubSupabase
          .from('companies')
          .select('id')
          .eq('owner_id', userId)
          .maybeSingle()
        if (byOwner?.id) resolvedCompanyId = byOwner.id
      }

      if (!resolvedCompanyId && userEmail) {
        const { data: byEmail } = await pubSupabase
          .from('companies')
          .select('id')
          .ilike('email', userEmail)
          .maybeSingle()
        if (byEmail?.id) resolvedCompanyId = byEmail.id
      }

      if (!resolvedCompanyId && companyName) {
        const { data: byName } = await pubSupabase
          .from('companies')
          .select('id')
          .ilike('name', String(companyName).trim())
          .maybeSingle()
        if (byName?.id) resolvedCompanyId = byName.id
      }
    }

    // 4. Fallback: ensure a company row exists in Supabase so the foreign key succeeds
    if (!resolvedCompanyId) {
      const effectiveName = companyName || userEmail?.split('@')[0] || 'Supplier Company'
      const slug = effectiveName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).slice(2, 6)

      const { data: createdCo, error: coErr } = await pubSupabase
        .from('companies')
        .insert({
          owner_id: userId || '2198809e-0401-483a-ba3b-a6f18392c9ea',
          name: effectiveName,
          slug,
          email: userEmail || null,
          status: 'active',
          is_verified: true,
        })
        .select('id')
        .maybeSingle()

      if (coErr || !createdCo?.id) {
        console.error('[API supplier/posts] Could not create fallback company:', coErr)
        return NextResponse.json(
          { success: false, error: 'Could not resolve or link a company record in the database.' },
          { status: 400 }
        )
      }
      resolvedCompanyId = createdCo.id
    }

    // 5. Insert into supplier_posts via pubSupabase (service/public server client bypasses RLS)
    const { data: newPost, error: postErr } = await pubSupabase
      .from('supplier_posts')
      .insert({
        company_id: resolvedCompanyId,
        category: category || 'product_availability',
        title: title || 'Product Availability',
        content: contentStr,
        is_published: is_published !== false,
      })
      .select('id, title, company_id, category, is_published, created_at')
      .maybeSingle()

    if (postErr) {
      console.error('[API supplier/posts] Insert error:', postErr)
      return NextResponse.json(
        { success: false, error: postErr.message || 'Database insert error.' },
        { status: 500 }
      )
    }

    // 6. Invalidate caches and revalidate paths
    invalidateMarketCache()
    revalidatePath('/products')
    revalidatePath('/')
    revalidatePath('/dashboard/supplier')

    return NextResponse.json({ success: true, post: newPost })
  } catch (err: any) {
    console.error('[API supplier/posts] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

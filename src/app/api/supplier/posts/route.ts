import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { PUBLIC_DATA_TAG } from '@/lib/data/public-cache'
import { requireUser, UUID_RE } from '@/lib/auth/server'
import { invalidateMarketCache } from '@/lib/data/market-data'

export const dynamic = 'force-dynamic'

const POST_CATEGORIES = new Set([
  'product_availability', 'new_stock', 'shipment', 'certification', 'company_update', 'trade_event',
])

function refreshListings() {
  invalidateMarketCache()
  revalidateTag(PUBLIC_DATA_TAG)
  revalidatePath('/products')
  revalidatePath('/')
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/supplier')
}

// Offers contain prices, so they are only returned to signed-in users (RLS enforces this too)
export async function GET(req: NextRequest) {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('company_id')

  let query = guard.supabase
    .from('supplier_posts')
    .select('id, title, content, is_published, created_at, updated_at, company_id, companies(id, name, slug, logo_url, city, country_id, countries(name, iso_code))')
    .order('created_at', { ascending: false })

  if (companyId) {
    if (!UUID_RE.test(companyId)) {
      return NextResponse.json({ success: false, error: 'Invalid company_id.' }, { status: 400 })
    }
    query = query.eq('company_id', companyId)
  }
  if (searchParams.get('published') === 'true') {
    query = query.eq('is_published', true)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, posts: data || [] })
}

// Create an offer. Allowed for admins (any company) and for the company's owner (RLS).
export async function POST(req: NextRequest) {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  try {
    const body = await req.json()
    let { title } = body
    const { companyId, category, content, details, is_published } = body

    let resolvedCompanyId: string | null = companyId && UUID_RE.test(companyId) ? companyId : null

    // Posting without an explicit company uses the company the caller owns (if any)
    if (!resolvedCompanyId) {
      const { data: owned } = await guard.supabase
        .from('companies')
        .select('id')
        .eq('owner_id', guard.user.id)
        .limit(1)
        .maybeSingle()
      resolvedCompanyId = owned?.id ?? null
    }

    if (!resolvedCompanyId) {
      return NextResponse.json({ success: false, error: 'Select the supplier company for this product.' }, { status: 400 })
    }

    if (!title && details?.productName) {
      const minPrice = parseFloat(details.minPricePerKg ?? details.pricePerKg) || 0
      const maxPrice = parseFloat(details.maxPricePerKg) || 0
      const priceLabel = maxPrice > minPrice ? `EUR ${minPrice}–${maxPrice}/kg` : `EUR ${minPrice}/kg`
      title = `${details.productName} — ${priceLabel}`
    }

    const { data: newPost, error } = await guard.supabase
      .from('supplier_posts')
      .insert({
        company_id: resolvedCompanyId,
        category: POST_CATEGORIES.has(category) ? category : 'product_availability',
        title: String(title || 'Product Availability').trim(),
        content: typeof content === 'string' ? content : JSON.stringify(details || {}),
        is_published: is_published !== false,
      })
      .select('id, title, company_id, category, is_published, created_at')
      .single()

    if (error) {
      const status = error.code === '42501' ? 403 : 500
      const message = status === 403 ? 'You can only post products for your own company.' : error.message
      return NextResponse.json({ success: false, error: message }, { status })
    }

    refreshListings()
    return NextResponse.json({ success: true, post: newPost })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  try {
    const { postId, content, title, is_published } = await req.json()
    if (!postId || !UUID_RE.test(postId)) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = {}
    if (typeof content === 'string') updatePayload.content = content
    if (typeof title === 'string') updatePayload.title = title.trim()
    if (typeof is_published === 'boolean') updatePayload.is_published = is_published

    // .select() makes RLS-blocked updates visible: zero rows means "not allowed or not found"
    const { data, error } = await guard.supabase
      .from('supplier_posts')
      .update(updatePayload)
      .eq('id', postId)
      .select('id')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Post not found or you are not allowed to edit it.' }, { status: 404 })
    }

    refreshListings()
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  const postId = new URL(req.url).searchParams.get('id')
  if (!postId || !UUID_RE.test(postId)) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
  }

  const { data, error } = await guard.supabase
    .from('supplier_posts')
    .delete()
    .eq('id', postId)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Post not found or you are not allowed to delete it.' }, { status: 404 })
  }

  refreshListings()
  return NextResponse.json({ success: true, deletedId: postId })
}

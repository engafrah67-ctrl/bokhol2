import { NextRequest, NextResponse } from 'next/server'
import { createPublicServerClient } from '@/lib/supabase/server'
import { requireAdmin, UUID_RE } from '@/lib/auth/server'
import { invalidateMarketCache } from '@/lib/data/market-data'

export const dynamic = 'force-dynamic'

const INDEX_SELECT = '*, product:products(id, name, slug, category)'

function toNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null
  const n = parseFloat(String(value))
  return Number.isFinite(n) ? n : null
}

// Market indexes are public reference data
export async function GET() {
  const supabase = createPublicServerClient()
  const [indexesRes, prodsRes] = await Promise.all([
    supabase.from('market_indexes').select(INDEX_SELECT).order('updated_at', { ascending: false }),
    supabase.from('products').select('id, name, slug, category').order('name', { ascending: true }),
  ])

  if (indexesRes.error || prodsRes.error) {
    const message = indexesRes.error?.message || prodsRes.error?.message
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
  return NextResponse.json({ success: true, indexes: indexesRes.data, products: prodsRes.data })
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const productId = String(body.product_id || '')
    const avg = toNumber(body.avg_price)

    if (!name || !UUID_RE.test(productId) || avg === null || avg < 0) {
      return NextResponse.json(
        { success: false, error: 'Name, product, and a valid average price are required.' },
        { status: 400 }
      )
    }

    const { data, error } = await guard.supabase
      .from('market_indexes')
      .insert({
        name,
        product_id: productId,
        avg_price: avg,
        low_price: toNumber(body.low_price) ?? parseFloat((avg * 0.92).toFixed(2)),
        high_price: toNumber(body.high_price) ?? parseFloat((avg * 1.08).toFixed(2)),
        currency: String(body.currency || 'EUR').slice(0, 3).toUpperCase(),
        unit: body.unit || 'kg',
        change_pct: toNumber(body.change_pct) ?? 0,
        period: body.period || 'weekly',
      })
      .select(INDEX_SELECT)
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    invalidateMarketCache()
    return NextResponse.json({ success: true, index: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const body = await req.json()
    if (!body.id || !UUID_RE.test(body.id)) {
      return NextResponse.json({ success: false, error: 'Index ID is required.' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (body.name) updates.name = String(body.name).trim()
    if (toNumber(body.avg_price) !== null) updates.avg_price = toNumber(body.avg_price)
    if (toNumber(body.low_price) !== null) updates.low_price = toNumber(body.low_price)
    if (toNumber(body.high_price) !== null) updates.high_price = toNumber(body.high_price)
    if (body.currency) updates.currency = String(body.currency).slice(0, 3).toUpperCase()
    if (toNumber(body.change_pct) !== null) updates.change_pct = toNumber(body.change_pct)
    if (body.period) updates.period = body.period

    const { data, error } = await guard.supabase
      .from('market_indexes')
      .update(updates)
      .eq('id', body.id)
      .select(INDEX_SELECT)
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    invalidateMarketCache()
    return NextResponse.json({ success: true, index: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const id = new URL(req.url).searchParams.get('id')
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ success: false, error: 'Index ID is required.' }, { status: 400 })
  }

  const { error } = await guard.supabase.from('market_indexes').delete().eq('id', id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  invalidateMarketCache()
  return NextResponse.json({ success: true, message: 'Market index deleted successfully.' })
}

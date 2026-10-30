import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { saveManagedIndexItems, upsertManagedIndexItem, deleteManagedIndexItem } from '@/lib/data/seafood-index-server'
import { getCachedManagedIndex, PUBLIC_DATA_TAG } from '@/lib/data/public-cache'
import { ManagedIndexItem } from '@/lib/data/seafood-index-data'
import { invalidateMarketCache } from '@/lib/data/market-data'
import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/

function isValidItem(item: any): item is ManagedIndexItem {
  const isNum = (n: unknown) => typeof n === 'number' && Number.isFinite(n)
  return (
    item &&
    typeof item.id === 'string' && SLUG_RE.test(item.id) &&
    typeof item.slug === 'string' && SLUG_RE.test(item.slug) &&
    typeof item.label === 'string' && item.label.trim().length > 0 &&
    isNum(item.latestPrice) && item.latestPrice >= 0 &&
    isNum(item.monthlyChangePct) &&
    isNum(item.monthHigh) && isNum(item.monthLow) &&
    Array.isArray(item.data) && item.data.every((p: any) => p && isNum(p.price))
  )
}

// The managed index is shown publicly on the home page
export async function GET() {
  try {
    // Shared cache; cleared by revalidateTag on every save
    const items = await getCachedManagedIndex()
    return NextResponse.json({ success: true, items })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const body = await req.json()
    const items: unknown = body.items
    if (!Array.isArray(items) || items.length === 0 || !items.every(isValidItem)) {
      return NextResponse.json({ success: false, error: 'Invalid items payload' }, { status: 400 })
    }

    await saveManagedIndexItems(guard.supabase, items)

    publishIndexChange()
    return NextResponse.json({ success: true, saved: items.length })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to save items' }, { status: 500 })
  }
}

function publishIndexChange() {
  invalidateMarketCache()
  revalidateTag(PUBLIC_DATA_TAG)
  revalidatePath('/')
}

// Add (or update) a single species — goes live immediately
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const { item } = await req.json()
    if (!isValidItem(item)) {
      return NextResponse.json({ success: false, error: 'Invalid species data' }, { status: 400 })
    }
    await upsertManagedIndexItem(guard.supabase, item)
    publishIndexChange()
    return NextResponse.json({ success: true, item })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to add species' }, { status: 500 })
  }
}

// Delete a single species — removed from the home page immediately
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const id = new URL(req.url).searchParams.get('id') || ''
  if (!SLUG_RE.test(id)) {
    return NextResponse.json({ success: false, error: 'A valid species id is required.' }, { status: 400 })
  }

  try {
    const deleted = await deleteManagedIndexItem(guard.supabase, id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Species not found.' }, { status: 404 })
    }
    publishIndexChange()
    return NextResponse.json({ success: true, deletedId: id })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete species' }, { status: 500 })
  }
}

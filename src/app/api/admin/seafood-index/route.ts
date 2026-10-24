import { NextRequest, NextResponse } from 'next/server'
import { getManagedIndexItems, saveManagedIndexItems } from '@/lib/data/seafood-index-server'
import { ManagedIndexItem } from '@/lib/data/seafood-index-data'
import { invalidateMarketCache } from '@/lib/data/market-data'

export async function GET() {
  try {
    const items = getManagedIndexItems()
    return NextResponse.json({ success: true, items })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const items: ManagedIndexItem[] = body.items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid items payload' }, { status: 400 })
    }
    const ok = saveManagedIndexItems(items)
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Failed to save items' }, { status: 500 })
    }
    try { invalidateMarketCache() } catch (_) {}
    try {
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/')
      const { invalidateHomeSupabaseCache } = await import('@/app/page')
      invalidateHomeSupabaseCache()
    } catch (_) {}
    return NextResponse.json({ success: true, saved: items.length })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

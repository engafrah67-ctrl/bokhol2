import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { PUBLIC_DATA_TAG } from '@/lib/data/public-cache'
import { invalidateMarketCache } from '@/lib/data/market-data'
import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

// Admin-only manual cache refresh
export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const path = new URL(req.url).searchParams.get('path') || '/products'
  if (!path.startsWith('/')) {
    return NextResponse.json({ revalidated: false, error: 'Invalid path' }, { status: 400 })
  }

  revalidatePath(path)
  revalidatePath('/products')
  revalidatePath('/')
  revalidatePath('/dashboard/supplier')
  invalidateMarketCache()
  revalidateTag(PUBLIC_DATA_TAG)

  return NextResponse.json({ revalidated: true, path, timestamp: Date.now() })
}

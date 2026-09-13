import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { invalidateMarketCache } from '@/lib/data/market-data'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const path = url.searchParams.get('path') || '/products'

    revalidatePath(path)
    revalidatePath('/products')
    revalidatePath('/')
    revalidatePath('/dashboard/supplier')
    invalidateMarketCache()

    return NextResponse.json({ revalidated: true, path, timestamp: Date.now() })
  } catch (err: any) {
    return NextResponse.json({ revalidated: false, error: err?.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}

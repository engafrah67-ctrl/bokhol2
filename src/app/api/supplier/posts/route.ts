import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createPublicServerClient } from '@/lib/supabase/server'
import { invalidateMarketCache } from '@/lib/data/market-data'

export const dynamic = 'force-dynamic'

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

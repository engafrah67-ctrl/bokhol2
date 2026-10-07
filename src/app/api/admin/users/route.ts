import { NextRequest, NextResponse } from 'next/server'
import { createClient, createPublicServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    let supabase: any
    try {
      supabase = await createClient()
    } catch (_) {
      supabase = createPublicServerClient()
    }
    const { searchParams } = new URL(req.url)
    const roleParam = searchParams.get('role') || 'buyer'

    // Fetch real users from Supabase
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (roleParam && roleParam !== 'all') {
      query = query.eq('role', roleParam)
    }

    const { data: dbUsers, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const users = dbUsers || []

    // Fetch requests count
    const requestsCountMap = new Map<string, number>()
    try {
      const { data: requests } = await supabase
        .from('buyer_requests')
        .select('user_id')
      if (Array.isArray(requests)) {
        for (const reqItem of requests) {
          if (reqItem.user_id) {
            requestsCountMap.set(reqItem.user_id, (requestsCountMap.get(reqItem.user_id) || 0) + 1)
          }
        }
      }
    } catch (_) {}

    const mappedBuyers = users.map((u: any) => ({
      id: u.id,
      full_name: u.full_name || 'Buyer User',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'buyer',
      avatar_url: u.avatar_url || null,
      company_id: u.company_id || null,
      created_at: u.created_at || new Date().toISOString(),
      requests_count: requestsCountMap.get(u.id) || 0,
    }))

    return NextResponse.json({
      success: true,
      buyers: mappedBuyers,
      total: mappedBuyers.length,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing user id parameter.' }, { status: 400 })
    }

    let supabase: any
    try {
      supabase = await createClient()
    } catch (_) {
      supabase = createPublicServerClient()
    }
    try {
      await supabase.from('buyer_requests').delete().eq('user_id', id)
      await supabase.from('users').delete().eq('id', id)
    } catch (dbErr) {
      console.warn('Supabase delete error:', dbErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Buyer user deleted successfully.',
      id,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

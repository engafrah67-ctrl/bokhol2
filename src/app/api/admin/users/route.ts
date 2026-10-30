import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, UUID_RE } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

const ROLES = new Set(['buyer', 'supplier', 'admin', 'guest'])

export async function GET(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const roleParam = new URL(req.url).searchParams.get('role') || 'buyer'

  let query = guard.supabase
    .from('users')
    .select('id, email, full_name, phone, role, avatar_url, company_id, created_at')
    .order('created_at', { ascending: false })

  if (roleParam !== 'all') {
    if (!ROLES.has(roleParam)) {
      return NextResponse.json({ success: false, error: 'Invalid role filter.' }, { status: 400 })
    }
    query = query.eq('role', roleParam)
  }

  const [{ data: users, error }, { data: requests }] = await Promise.all([
    query,
    guard.supabase.from('buyer_requests').select('user_id'),
  ])

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  const requestsCount = new Map<string, number>()
  for (const r of requests || []) {
    requestsCount.set(r.user_id, (requestsCount.get(r.user_id) || 0) + 1)
  }

  const buyers = (users || []).map((u) => ({
    id: u.id,
    full_name: u.full_name || 'Buyer User',
    email: u.email || '',
    phone: u.phone || '',
    role: u.role,
    avatar_url: u.avatar_url,
    company_id: u.company_id,
    created_at: u.created_at,
    requests_count: requestsCount.get(u.id) || 0,
  }))

  return NextResponse.json({ success: true, buyers, total: buyers.length })
}

// Deletes the account login itself; the profile and its requests cascade.
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const id = new URL(req.url).searchParams.get('id')
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ success: false, error: 'A valid user id is required.' }, { status: 400 })
  }

  const { error } = await guard.supabase.rpc('admin_delete_user', { p_user_id: id })
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
  return NextResponse.json({ success: true, message: 'User deleted successfully.', id })
}

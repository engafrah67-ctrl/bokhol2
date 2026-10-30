import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, requireUser, UUID_RE } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

const CLAIM_COLUMNS =
  'id, user_id, company_id, company_name, full_name, job_title, business_email, phone, status, rejection_reason, reviewed_at, created_at, updated_at'

// Admin sees every claim; any other signed-in user sees only their own (enforced by RLS)
export async function GET() {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  const { data, error } = await guard.supabase
    .from('profile_claims')
    .select(CLAIM_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json(
    { success: true, claims: data || [] },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

// Signed-in user submits a claim for an unclaimed company
export async function POST(req: NextRequest) {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  try {
    const body = await req.json()
    const companyId = String(body.company_id || '')
    const fullName = String(body.full_name || '').trim()
    const businessEmail = String(body.business_email || '').trim().toLowerCase()

    if (!UUID_RE.test(companyId) || !fullName || !businessEmail) {
      return NextResponse.json({ success: false, error: 'Missing required claim fields.' }, { status: 400 })
    }

    const { data: company } = await guard.supabase
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .maybeSingle()
    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found.' }, { status: 404 })
    }

    const { data, error } = await guard.supabase
      .from('profile_claims')
      .insert({
        user_id: guard.user.id,
        company_id: company.id,
        company_name: company.name,
        full_name: fullName,
        job_title: body.job_title ? String(body.job_title).trim() : null,
        business_email: businessEmail,
        phone: body.phone ? String(body.phone).trim() : null,
        status: 'pending',
      })
      .select(CLAIM_COLUMNS)
      .single()

    if (error) {
      const message = error.code === '23505'
        ? 'You already have a pending claim for this company.'
        : error.code === '42501'
          ? 'This company has already been claimed.'
          : error.message
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    return NextResponse.json({ success: true, claim: data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}

// Admin: approve / reject / revoke
export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const { id, action, rejection_reason } = await req.json()
    if (!id || !UUID_RE.test(id)) {
      return NextResponse.json({ success: false, error: 'A valid claim id is required.' }, { status: 400 })
    }

    let result
    if (action === 'approve') {
      result = await guard.supabase.rpc('approve_profile_claim', { p_claim_id: id })
    } else if (action === 'reject') {
      result = await guard.supabase.rpc('reject_profile_claim', { p_claim_id: id, p_reason: rejection_reason ?? null })
    } else if (action === 'revoke') {
      result = await guard.supabase.rpc('revoke_profile_claim', { p_claim_id: id })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve", "reject", or "revoke".' },
        { status: 400 }
      )
    }

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 400 })
    }
    return NextResponse.json({
      success: true,
      status: action === 'revoke' ? 'unclaimed' : action === 'approve' ? 'approved' : 'rejected',
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}

// Claimant withdraws a pending claim, or admin deletes any claim (RLS decides)
export async function DELETE(req: NextRequest) {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  const id = new URL(req.url).searchParams.get('id')
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ success: false, error: 'A valid claim id is required.' }, { status: 400 })
  }

  const { error } = await guard.supabase.from('profile_claims').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, message: 'Claim record deleted successfully.' })
}

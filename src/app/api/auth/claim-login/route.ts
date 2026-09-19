import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createPublicServerClient } from '@/lib/supabase/server'

interface ProfileClaimRecord {
  id: string
  company_id: string
  company_name: string
  username: string
  full_name: string
  job_title: string
  business_email: string
  phone?: string
  password?: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_at: string
  updated_at: string
}

const DATA_FILE = path.join(process.cwd(), 'src', 'lib', 'data', 'profile-claims.json')

function readClaims(): ProfileClaimRecord[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return []
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    return []
  }
}

function writeClaims(claims: ProfileClaimRecord[]) {
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify(claims, null, 2), 'utf-8')
  } catch (_) {}
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { identifier, password } = body

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ error: 'Missing login identifier' }, { status: 400 })
    }

    const cleanId = identifier.trim().toLowerCase()
    const claims = readClaims()

    // 1. Look for matching claim by username or business email
    let claim = claims.find(
      (c) =>
        (c.username && c.username.toLowerCase() === cleanId) ||
        (c.business_email && c.business_email.toLowerCase() === cleanId)
    )

    // 2. Also check Supabase table if not found locally
    if (!claim) {
      try {
        const supabase = createPublicServerClient()
        const { data } = await supabase
          .from('profile_claims')
          .select('*')
          .or(`username.ilike.${cleanId},business_email.ilike.${cleanId}`)
          .limit(1)
          .maybeSingle()

        if (data) {
          claim = data as ProfileClaimRecord
        }
      } catch (_) {}
    }

    // If this is NOT a profile claim user (e.g. Admin or buyer), let standard auth handle it
    if (!claim) {
      return NextResponse.json({ isClaimUser: false })
    }

    // ── CASE A: Claim is PENDING ──
    if (claim.status === 'pending') {
      return NextResponse.json({
        isClaimUser: true,
        status: 'pending',
        company_name: claim.company_name,
        message: `⏳ Your claim for "${claim.company_name}" is currently pending admin verification. Please wait for the admin to approve your request before logging in.`,
      })
    }

    // ── CASE B: Claim was REJECTED ──
    if (claim.status === 'rejected') {
      const reasonText = claim.rejection_reason ? ` Reason: ${claim.rejection_reason}` : ''
      return NextResponse.json({
        isClaimUser: true,
        status: 'rejected',
        company_name: claim.company_name,
        message: `❌ Your claim for "${claim.company_name}" was not approved.${reasonText}`,
      })
    }

    // ── CASE C: Claim is APPROVED ──
    if (claim.status === 'approved') {
      // If password was stored, verify it matches
      if (claim.password && password && claim.password !== password) {
        return NextResponse.json({
          isClaimUser: true,
          status: 'approved',
          valid: false,
          error: 'Incorrect password. Please verify your password and try again.',
        })
      }

      // If password was not previously saved, save it now on first successful login
      if (!claim.password && password) {
        claim.password = String(password)
        const idx = claims.findIndex((c) => c.id === claim?.id)
        if (idx !== -1) {
          claims[idx].password = String(password)
          writeClaims(claims)
        }
      }

      // Attempt to ensure Supabase auth user exists in background
      try {
        const supabase = createPublicServerClient()
        await supabase.auth.signUp({
          email: claim.business_email,
          password: password || claim.password || 'BokholSupplier2026!',
          options: {
            data: {
              role: 'supplier',
              username: claim.username,
              full_name: claim.full_name,
              company_id: claim.company_id,
              company_name: claim.company_name,
              claim_status: 'approved',
            },
          },
        })
      } catch (_) {}

      return NextResponse.json({
        isClaimUser: true,
        status: 'approved',
        valid: true,
        email: claim.business_email,
        username: claim.username,
        company_id: claim.company_id,
        company_name: claim.company_name,
        full_name: claim.full_name,
        savedPassword: claim.password || password,
      })
    }

    return NextResponse.json({ isClaimUser: false })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

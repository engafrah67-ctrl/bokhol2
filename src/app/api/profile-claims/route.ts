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

function readClaimsFromFile(): ProfileClaimRecord[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return []
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to read profile claims file:', err)
    return []
  }
}

function writeClaimsToFile(claims: ProfileClaimRecord[]) {
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(claims, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write profile claims file:', err)
  }
}

export async function GET() {
  try {
    // 1. Read from local server persistence
    const fileClaims = readClaimsFromFile()

    // 2. Also try Supabase if table exists
    try {
      const supabase = createPublicServerClient()
      const { data, error } = await supabase
        .from('profile_claims')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        // Merge Supabase claims with file claims (deduplicating by id or company_id + username)
        const idSet = new Set(data.map((d: any) => d.id))
        const merged = [...data]
        for (const fc of fileClaims) {
          if (!idSet.has(fc.id)) {
            merged.push(fc)
          }
        }
        return NextResponse.json({ success: true, claims: merged })
      }
    } catch (_) {}

    return NextResponse.json({ success: true, claims: fileClaims })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      company_id,
      company_name,
      username,
      full_name,
      job_title,
      business_email,
      phone,
      password,
    } = body

    if (!company_id || !company_name || !username || !full_name || !business_email) {
      return NextResponse.json(
        { success: false, error: 'Missing required claim fields.' },
        { status: 400 }
      )
    }

    const newClaim: ProfileClaimRecord = {
      id: `claim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      company_id: String(company_id),
      company_name: String(company_name),
      username: String(username).toLowerCase().trim(),
      full_name: String(full_name).trim(),
      job_title: String(job_title || 'Representative').trim(),
      business_email: String(business_email).toLowerCase().trim(),
      phone: phone ? String(phone).trim() : undefined,
      password: password ? String(password) : undefined,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 1. Save to local server file
    const existing = readClaimsFromFile()
    // Check if there is already a pending claim for this company
    const duplicate = existing.find(
      (c) => c.company_id === newClaim.company_id && c.status === 'pending'
    )
    if (duplicate) {
      // Update the existing pending claim with the latest info
      const idx = existing.findIndex((c) => c.id === duplicate.id)
      existing[idx] = { ...existing[idx], ...newClaim, id: duplicate.id }
      writeClaimsToFile(existing)
    } else {
      existing.unshift(newClaim)
      writeClaimsToFile(existing)
    }

    // 2. Try Supabase insert if table exists
    try {
      const supabase = createPublicServerClient()
      await supabase.from('profile_claims').insert({
        company_id: newClaim.company_id,
        company_name: newClaim.company_name,
        username: newClaim.username,
        full_name: newClaim.full_name,
        job_title: newClaim.job_title,
        business_email: newClaim.business_email,
        phone: newClaim.phone || null,
        status: 'pending',
      })
    } catch (_) {}

    return NextResponse.json({ success: true, claim: newClaim })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, company_id, action, rejection_reason } = body

    if (!action || !['approve', 'reject', 'revoke'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve", "reject", or "revoke".' },
        { status: 400 }
      )
    }

    let claims = readClaimsFromFile()
    const idx = claims.findIndex((c) => c.id === id || (company_id && c.company_id === company_id))

    if (idx !== -1) {
      if (action === 'revoke') {
        claims.splice(idx, 1)
        writeClaimsToFile(claims)
      } else {
        claims[idx].status = action === 'approve' ? 'approved' : 'rejected'
        if (action === 'reject') {
          claims[idx].rejection_reason = rejection_reason || 'Verification could not be completed.'
        }
        claims[idx].updated_at = new Date().toISOString()
        writeClaimsToFile(claims)
      }
    }

    // Also update Supabase if exists
    try {
      const supabase = createPublicServerClient()
      if (action === 'revoke') {
        if (id && !id.startsWith('claim-')) {
          await supabase.from('profile_claims').delete().eq('id', id)
        } else if (company_id) {
          await supabase.from('profile_claims').delete().eq('company_id', company_id)
        }
      } else {
        const updateData: any = {
          status: action === 'approve' ? 'approved' : 'rejected',
          updated_at: new Date().toISOString(),
        }
        if (action === 'reject') {
          updateData.rejection_reason = rejection_reason || 'Verification could not be completed.'
        }

        if (id && !id.startsWith('claim-')) {
          await supabase.from('profile_claims').update(updateData).eq('id', id)
        } else if (company_id) {
          await supabase.from('profile_claims').update(updateData).eq('company_id', company_id)
        }
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      status: action === 'revoke' ? 'unclaimed' : action === 'approve' ? 'approved' : 'rejected',
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const company_id = searchParams.get('company_id')
    const claim_id = searchParams.get('id')

    if (!company_id && !claim_id) {
      return NextResponse.json(
        { success: false, error: 'Missing company_id or id parameter.' },
        { status: 400 }
      )
    }

    let claims = readClaimsFromFile()
    if (claim_id) {
      claims = claims.filter((c) => c.id !== claim_id)
    } else if (company_id) {
      claims = claims.filter((c) => c.company_id !== company_id)
    }
    writeClaimsToFile(claims)

    try {
      const supabase = createPublicServerClient()
      if (claim_id) {
        await supabase.from('profile_claims').delete().eq('id', claim_id)
      } else if (company_id) {
        await supabase.from('profile_claims').delete().eq('company_id', company_id)
      }
    } catch (_) {}

    return NextResponse.json({ success: true, message: 'Claim record deleted successfully.' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}


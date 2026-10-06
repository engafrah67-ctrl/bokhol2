import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createPublicServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const SUPPLIERS_FILE = path.join(process.cwd(), 'src', 'lib', 'data', 'added-suppliers.json')

function readSuppliersFromFile(): any[] {
  try {
    if (!fs.existsSync(SUPPLIERS_FILE)) {
      return []
    }
    const raw = fs.readFileSync(SUPPLIERS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to read added suppliers file:', err)
    return []
  }
}

function writeSuppliersToFile(suppliers: any[]) {
  try {
    const dir = path.dirname(SUPPLIERS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(SUPPLIERS_FILE, JSON.stringify(suppliers, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write added suppliers file:', err)
  }
}

export async function GET() {
  try {
    const fileSuppliers = readSuppliersFromFile()
    return NextResponse.json({ success: true, suppliers: fileSuppliers })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, country, logoUrl, species, category } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Company name and email are required.' },
        { status: 400 }
      )
    }

    const trimmedName = String(name).trim()
    const trimmedEmail = String(email).trim().toLowerCase()
    const baseSlug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    const slug = `${baseSlug}-${Date.now().toString(36)}`

    const speciesList = Array.isArray(species)
      ? species
      : typeof species === 'string' && species.trim()
        ? species.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []

    const countryCodeMap: Record<string, string> = {
      Germany: 'DE',
      Norway: 'NO',
      Netherlands: 'NL',
      Belgium: 'BE',
    }
    const countryCode = country ? (countryCodeMap[country] || 'NL') : 'NL'

    let countryId: string | null = null
    const supabase = createPublicServerClient()

    if (country) {
      try {
        const { data: cData } = await supabase
          .from('countries')
          .select('id')
          .ilike('name', country)
          .maybeSingle()
        if (cData?.id) {
          countryId = cData.id
        }
      } catch (_) {}
    }

    // 1. Insert into Supabase companies table
    let dbCompany: any = null
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          owner_id: '2198809e-0401-483a-ba3b-a6f18392c9ea',
          name: trimmedName,
          slug,
          email: trimmedEmail,
          phone: phone ? String(phone).trim() : null,
          country_id: countryId,
          logo_url: logoUrl || null,
          description: speciesList.join(', ') || null,
          status: 'active',
          is_verified: false,
        })
        .select('id, name, slug, email, phone, logo_url, description, country_id, status, is_verified, created_at')
        .maybeSingle()

      if (!error && data) {
        dbCompany = data
      } else if (error) {
        console.warn('[AddSupplier] Supabase insert warning:', error.message)
      }
    } catch (e: any) {
      console.warn('[AddSupplier] Supabase error:', e?.message)
    }

    // 2. Build full CompanyProfile record for application persistence
    const companyProfile = {
      id: dbCompany?.id || `sup-${Date.now()}`,
      rank: 50 + readSuppliersFromFile().length,
      name: trimmedName,
      slug: dbCompany?.slug || slug,
      category: (category || 'SEAFOOD SUPPLIER') as any,
      country: country || 'Netherlands',
      countryCode,
      address: '',
      website: '',
      email: trimmedEmail,
      phone: phone ? String(phone).trim() : '',
      domain: trimmedEmail.split('@')[1] || '',
      description: speciesList.length > 0 ? `Specializing in ${speciesList.join(', ')}.` : '',
      logoUrl: logoUrl || undefined,
      status: 'unclaimed',
      isVerified: false,
      isPublicListing: true,
      completenessScore: 85,
      species: speciesList,
      tags: ['SUPPLIER', 'UNCLAIMED', ...(country ? [country.toUpperCase()] : [])],
      createdAt: new Date().toISOString(),
    }

    // 3. Save to local server file for persistent guarantee
    const existing = readSuppliersFromFile()
    const duplicateIdx = existing.findIndex(
      (s) => s.slug === companyProfile.slug || s.name.toLowerCase() === companyProfile.name.toLowerCase()
    )
    if (duplicateIdx !== -1) {
      existing[duplicateIdx] = { ...existing[duplicateIdx], ...companyProfile }
    } else {
      existing.unshift(companyProfile)
    }
    writeSuppliersToFile(existing)

    return NextResponse.json({
      success: true,
      company: companyProfile,
      dbSaved: !!dbCompany,
    })
  } catch (err: any) {
    console.error('[API/add-supplier] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Unexpected server error.' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id parameter.' }, { status: 400 })
    }

    const existing = readSuppliersFromFile()
    const filtered = existing.filter((s) => s.id !== id)
    writeSuppliersToFile(filtered)

    if (/^[0-9a-f-]{36}$/i.test(id)) {
      try {
        const supabase = createPublicServerClient()
        await supabase.from('companies').delete().eq('id', id)
      } catch (_) {}
    }

    return NextResponse.json({ success: true, message: 'Supplier deleted successfully.' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

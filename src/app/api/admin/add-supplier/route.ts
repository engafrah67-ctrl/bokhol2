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
    const supabase = createPublicServerClient()

    let dbSuppliers: any[] = []
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, slug, email, phone, website, logo_url, description, city, country_id, is_verified, status, created_at, countries(id, name, iso_code)')
        .order('created_at', { ascending: false })

      if (!error && Array.isArray(data)) {
        dbSuppliers = data.map((co: any) => {
          const countryName = co.countries?.name || co.city || 'Netherlands'
          const countryCode = co.countries?.iso_code || (countryName === 'Germany' ? 'DE' : countryName === 'Norway' ? 'NO' : countryName === 'Belgium' ? 'BE' : 'NL')
          const speciesList = co.description ? co.description.replace(/^Specializing in\s*/i, '').split(',').map((s: string) => s.trim()).filter(Boolean) : []
          return {
            id: co.id,
            name: co.name,
            slug: co.slug || co.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            email: co.email || '',
            phone: co.phone || '',
            website: co.website || '',
            category: 'SEAFOOD SUPPLIER',
            country: countryName,
            countryCode,
            address: co.city || '',
            description: co.description || '',
            logoUrl: co.logo_url || null,
            status: co.status || 'active',
            isVerified: co.is_verified ?? true,
            species: speciesList,
            createdAt: co.created_at || new Date().toISOString(),
          }
        })
      }
    } catch (e: any) {
      console.warn('[API/add-supplier GET] Supabase fetch error:', e?.message)
    }

    // Merge DB suppliers with file suppliers (DB takes precedence, file supplements)
    const map = new Map<string, any>()
    for (const s of fileSuppliers) {
      const key = (s.id || s.slug || s.name || '').toLowerCase()
      if (key) map.set(key, s)
    }
    for (const s of dbSuppliers) {
      const key = (s.id || s.slug || s.name || '').toLowerCase()
      if (key) {
        // Merge with file record if present (file might have custom logo or species)
        const fileMatch = map.get(key) || Array.from(map.values()).find(
          (m) => (m.slug && m.slug === s.slug) || (m.name && m.name.toLowerCase() === s.name.toLowerCase())
        )
        map.set(key, {
          ...fileMatch,
          ...s,
          logoUrl: s.logoUrl || fileMatch?.logoUrl || null,
          species: s.species?.length > 0 ? s.species : fileMatch?.species || [],
        })
      }
    }

    const mergedSuppliers = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )

    return NextResponse.json({ success: true, suppliers: mergedSuppliers })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, country, logoUrl, species, category, address } = body

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
      Spain: 'ES',
      France: 'FR',
      Denmark: 'DK',
      Iceland: 'IS',
      UnitedKingdom: 'GB',
      'United Kingdom': 'GB',
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
          city: address || country || null,
          country_id: countryId,
          logo_url: logoUrl || null,
          description: speciesList.length > 0 ? `Specializing in ${speciesList.join(', ')}.` : null,
          status: 'active',
          is_verified: true,
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

    // 2. Build CompanyProfile record
    const companyProfile = {
      id: dbCompany?.id || `sup-${Date.now()}`,
      rank: 50 + readSuppliersFromFile().length,
      name: trimmedName,
      slug: dbCompany?.slug || slug,
      category: (category || 'SEAFOOD SUPPLIER') as any,
      country: country || 'Netherlands',
      countryCode,
      address: address || '',
      website: '',
      email: trimmedEmail,
      phone: phone ? String(phone).trim() : '',
      domain: trimmedEmail.split('@')[1] || '',
      description: speciesList.length > 0 ? `Specializing in ${speciesList.join(', ')}.` : '',
      logoUrl: logoUrl || undefined,
      status: 'active',
      isVerified: true,
      isPublicListing: true,
      species: speciesList,
      tags: ['SUPPLIER', ...(country ? [country.toUpperCase()] : [])],
      createdAt: dbCompany?.created_at || new Date().toISOString(),
    }

    // 3. Save to local server file for persistence guarantee
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

    const supabase = createPublicServerClient()
    if (/^[0-9a-f-]{36}$/i.test(id)) {
      try {
        await supabase.from('supplier_posts').delete().eq('company_id', id)
        await supabase.from('companies').delete().eq('id', id)
      } catch (_) {}
    } else {
      try {
        await supabase.from('companies').delete().eq('slug', id)
      } catch (_) {}
    }

    return NextResponse.json({ success: true, message: 'Supplier deleted successfully.' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

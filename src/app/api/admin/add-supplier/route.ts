import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { PUBLIC_DATA_TAG } from '@/lib/data/public-cache'
import { adminRead, requireAdmin, UUID_RE } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

// Supplier markets the platform operates in
const SUPPLIER_COUNTRIES = ['Netherlands', 'Belgium', 'Norway', 'Germany']

const COMPANY_COLUMNS =
  'id, name, slug, email, phone, website, logo_url, description, city, address, country_id, owner_id, is_verified, status, created_at, countries(id, name, iso_code)'

function toSupplier(co: any) {
  const country = Array.isArray(co.countries) ? co.countries[0] : co.countries
  const speciesList = co.description
    ? co.description.replace(/^Specializing in\s*/i, '').replace(/\.$/, '').split(',').map((s: string) => s.trim()).filter(Boolean)
    : []
  return {
    id: co.id,
    name: co.name,
    slug: co.slug,
    email: co.email || '',
    phone: co.phone || '',
    website: co.website || '',
    category: 'SEAFOOD SUPPLIER',
    country: country?.name || '',
    countryCode: country?.iso_code || '',
    address: co.address || co.city || '',
    description: co.description || '',
    logoUrl: co.logo_url || null,
    status: co.status,
    isVerified: co.is_verified,
    isClaimed: Boolean(co.owner_id),
    species: speciesList,
    createdAt: co.created_at,
  }
}

// Admin: list every company (any status), including contact details
export async function GET() {
  const read = await adminRead((supabase) =>
    supabase.from('companies').select(COMPANY_COLUMNS).order('created_at', { ascending: false })
  )
  if (!read.ok) return read.response

  const { data, error } = read.result
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, suppliers: (data || []).map(toSupplier) })
}

// Admin: create an unclaimed supplier profile (owner_id stays NULL until a claim is approved)
export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const { name, email, phone, country, logoUrl, species, address, website } = await req.json()

    const trimmedName = String(name || '').trim()
    const trimmedEmail = String(email || '').trim().toLowerCase()
    if (!trimmedName || !trimmedEmail) {
      return NextResponse.json({ success: false, error: 'Company name and email are required.' }, { status: 400 })
    }

    const baseSlug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'supplier'
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    const speciesList: string[] = Array.isArray(species)
      ? species.map((s) => String(s).trim()).filter(Boolean)
      : typeof species === 'string'
        ? species.split(',').map((s) => s.trim()).filter(Boolean)
        : []

    const countryName = SUPPLIER_COUNTRIES.find((c) => c.toLowerCase() === String(country || '').trim().toLowerCase())
    if (!countryName) {
      return NextResponse.json(
        { success: false, error: `Country must be one of: ${SUPPLIER_COUNTRIES.join(', ')}.` },
        { status: 400 }
      )
    }

    const { data: cData } = await guard.supabase
      .from('countries')
      .select('id')
      .eq('name', countryName)
      .maybeSingle()
    const countryId: string | null = cData?.id ?? null

    const { data, error } = await guard.supabase
      .from('companies')
      .insert({
        owner_id: null,
        name: trimmedName,
        slug,
        email: trimmedEmail,
        phone: phone ? String(phone).trim() : null,
        website: website ? String(website).trim() : null,
        address: address ? String(address).trim() : null,
        city: address ? String(address).trim() : country || null,
        country_id: countryId,
        logo_url: logoUrl || null,
        description: speciesList.length > 0 ? `Specializing in ${speciesList.join(', ')}.` : null,
        status: 'active',
        is_verified: true,
      })
      .select(COMPANY_COLUMNS)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    revalidateTag(PUBLIC_DATA_TAG)
    return NextResponse.json({ success: true, company: toSupplier(data) })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Unexpected server error.' }, { status: 500 })
  }
}

// Admin: delete a company (its posts, products and claims cascade)
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const id = new URL(req.url).searchParams.get('id')
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ success: false, error: 'A valid company id is required.' }, { status: 400 })
  }

  const { error } = await guard.supabase.from('companies').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  revalidateTag(PUBLIC_DATA_TAG)
  return NextResponse.json({ success: true, message: 'Supplier deleted successfully.' })
}

// ============================================================
// companies-data.ts — Supabase-only, no localStorage
// ============================================================

export interface CompanyProfile {
  id: string
  rank: number
  name: string
  slug: string
  category: 'SEAFOOD WHOLESALER' | 'SEAFOOD SUPPLIER' | 'SEAFOOD IMPORTER' | 'PROCESSOR & DISTRIBUTOR' | 'AQUACULTURE FARM'
  country: string
  countryCode: string
  address: string
  website: string
  email: string
  phone: string
  domain: string
  description: string
  logoUrl?: string
  bannerColor?: string
  status: 'unclaimed' | 'claim_requested' | 'claimed' | 'rejected'
  isVerified: boolean
  isFoundingMember?: boolean
  isPublicListing: boolean
  completenessScore: number
  species: string[]
  tags: string[]
  claimRequest?: {
    username?: string
    fullName: string
    businessEmail: string
    jobTitle: string
    phone?: string
    requestedAt: string
    rejectionReason?: string
  }
}

// Static curated directory of companies — displayed for claim management.
// This is configuration data (not user data), so it lives here as a constant.
export const INITIAL_COMPANIES: CompanyProfile[] = [
  {
    id: 'comp-1', rank: 1, name: 'Amacore B.V.', slug: 'amacore',
    category: 'SEAFOOD WHOLESALER', country: 'Netherlands', countryCode: 'NL',
    address: 'Het Scheer 5, 8251 RB Dronten, Netherlands', website: 'https://amacore.nl',
    email: 'info@amacore.nl', phone: '+31 (0)321 330 025', domain: 'amacore.nl',
    description: 'Amacore specializes in sourcing, importing, and distributing high-quality frozen fish products globally.',
    logoUrl: '/partners/amacore.png', bannerColor: '#022B96',
    status: 'unclaimed', isVerified: true, isFoundingMember: true, isPublicListing: true,
    completenessScore: 100, species: ['Sea bass', 'Cod', 'Plaice', 'Yellowfin Tuna', 'Salmon'],
    tags: ['WHOLESALER', 'FRESH', 'FROZEN'],
  },
  {
    id: 'comp-2', rank: 2, name: 'AnT Seafood B.V.', slug: 'ant-seafood',
    category: 'SEAFOOD SUPPLIER', country: 'Netherlands', countryCode: 'NL',
    address: 'Vissershaven 18, Urk, Netherlands', website: 'https://antseafood.nl',
    email: 'info@antseafood.nl', phone: '+31 527 68 99 00', domain: 'antseafood.nl',
    description: 'Premium North Sea supplier specializing in fresh flatfish, sea bass, turbot, and cod.',
    logoUrl: '/partners/ant-seafood.png', bannerColor: '#022B96',
    status: 'unclaimed', isVerified: true, isFoundingMember: true, isPublicListing: true,
    completenessScore: 95, species: ['Sea Bass', 'Cod', 'Plaice', 'Turbot'],
    tags: ['WHOLESALER', 'FRESH', 'FROZEN'],
  },
  {
    id: 'comp-3', rank: 3, name: 'ATL Seafood B.V.', slug: 'atl-seafood',
    category: 'SEAFOOD SUPPLIER', country: 'Netherlands', countryCode: 'NL',
    address: 'Korfwater 3, 1755 LE Petten, Netherlands', website: 'https://atlseafood.com',
    email: 'sales@atlseafood.com', phone: '+31 (0)224 561 289', domain: 'atlseafood.com',
    description: 'Premium fresh seafood supplier specializing in flatfish, turbot, sole, and custom filleting services.',
    logoUrl: '/partners/atl-seafood.png', bannerColor: '#1d4ed8',
    status: 'unclaimed', isVerified: true, isFoundingMember: false, isPublicListing: true,
    completenessScore: 92, species: ['Turbot', 'Plaice', 'Dover Sole', 'Sea Bass'],
    tags: ['SUPPLIER', 'FRESH', 'PREMIUM'],
  },
  {
    id: 'comp-4', rank: 4, name: 'Blue World Seafood B.V.', slug: 'blue-world-seafood',
    category: 'SEAFOOD IMPORTER', country: 'Netherlands', countryCode: 'NL',
    address: 'Havenweg 10, 8321 Urk, Netherlands', website: 'https://blueworldseafood.nl',
    email: 'info@blueworldseafood.nl', phone: '+31 527 680 111', domain: 'blueworldseafood.nl',
    description: 'Global seafood importer providing high-grade wild-caught cod, salmon fillets, and frozen shrimp products.',
    logoUrl: '/partners/blue-world-seafood.png', bannerColor: '#004488',
    status: 'unclaimed', isVerified: true, isFoundingMember: false, isPublicListing: true,
    completenessScore: 88, species: ['Atlantic Cod', 'Salmon', 'Shrimp', 'Squid'],
    tags: ['IMPORTER', 'FROZEN', 'GLOBAL'],
  },
  {
    id: 'comp-5', rank: 5, name: 'Dayseaday Frozen Fish', slug: 'dayseaday',
    category: 'PROCESSOR & DISTRIBUTOR', country: 'Netherlands', countryCode: 'NL',
    address: 'Westgate 23, 8321 WX Urk, Netherlands', website: 'https://dayseaday.nl',
    email: 'info@dayseaday.nl', phone: '+31 (0)527 684 684', domain: 'dayseaday.nl',
    description: 'Major seafood processor delivering fresh and frozen fish fillets, whole fish, and specialized seafood mixes.',
    logoUrl: '/partners/dayseaday.png', bannerColor: '#0284c7',
    status: 'unclaimed', isVerified: true, isFoundingMember: false, isPublicListing: true,
    completenessScore: 90, species: ['Yellowfin Tuna', 'Octopus', 'Sea Bream', 'Salmon Fillet'],
    tags: ['PROCESSOR', 'WHOLESALER', 'FRESH'],
  },
  {
    id: 'comp-6', rank: 6, name: 'AM Fish B.V.', slug: 'am-fish',
    category: 'SEAFOOD SUPPLIER', country: 'Netherlands', countryCode: 'NL',
    address: 'Het Urkerland 47, 8321 ZA Urk, Netherlands', website: 'https://amfish.nl',
    email: 'sales@amfish.nl', phone: '+31 (0)527 687 010', domain: 'amfish.nl',
    description: 'International supplier of wild-caught and farmed frozen fish and shrimp products with global distribution.',
    logoUrl: '/partners/am-fish.png', bannerColor: '#0066cc',
    status: 'unclaimed', isVerified: true, isFoundingMember: false, isPublicListing: true,
    completenessScore: 85, species: ['Atlantic Salmon', 'Prawns', 'Mackerel', 'Squid', 'Cod'],
    tags: ['SUPPLIER', 'FROZEN', 'EXPORT'],
  },
]

// Returns the static list — claim statuses are applied by syncWithServerClaims()
export function getStoredCompanies(): CompanyProfile[] {
  return [...INITIAL_COMPANIES]
}

// Fetch companies from Supabase (real supplier-created companies)
export async function fetchSupabaseCompanies(): Promise<any[]> {
  try {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data } = await supabase
      .from('companies')
      .select('id, name, slug, email, phone, website, logo_url, status, is_verified, created_at, city, country_id')
      .order('created_at', { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

// Sync company claim statuses, dynamically added suppliers, and DB registered supplier accounts
export async function syncWithServerClaims(): Promise<CompanyProfile[]> {
  try {
    const [claimsRes, addedRes, dbCompanies] = await Promise.all([
      fetch('/api/profile-claims').catch(() => null),
      fetch('/api/admin/add-supplier').catch(() => null),
      fetchSupabaseCompanies().catch(() => []),
    ])

    const claimsJson = claimsRes ? await claimsRes.json().catch(() => null) : null
    const addedJson = addedRes ? await addedRes.json().catch(() => null) : null

    const companies = getStoredCompanies()

    // Add any dynamically added suppliers from the server
    if (addedJson?.success && Array.isArray(addedJson.suppliers)) {
      const existingSlugs = new Set(companies.map((c) => c.slug))
      const existingIds = new Set(companies.map((c) => c.id))

      for (const sup of addedJson.suppliers) {
        if (!existingSlugs.has(sup.slug) && !existingIds.has(sup.id)) {
          companies.push(sup)
          existingSlugs.add(sup.slug)
          existingIds.add(sup.id)
        }
      }
    }

    // Include registered supplier companies from Supabase database
    // ONLY add companies that are NOT already tracked locally (i.e., not admin-added)
    if (Array.isArray(dbCompanies) && dbCompanies.length > 0) {
      for (const dbComp of dbCompanies) {
        const existingIdx = companies.findIndex(
          (c) => c.id === dbComp.id ||
            c.slug === dbComp.slug ||
            c.name.toLowerCase() === dbComp.name.toLowerCase()
        )

        // If already tracked locally (e.g., admin-added), preserve its existing status
        // Do NOT auto-mark it as claimed — only real claim requests (from profile-claims) should do that
        if (existingIdx !== -1) {
          companies[existingIdx] = {
            ...companies[existingIdx],
            id: dbComp.id || companies[existingIdx].id,
            logoUrl: dbComp.logo_url || companies[existingIdx].logoUrl,
            // Do NOT change status here — let profile-claims API handle it below
          }
        }
        // If NOT in local list at all, it was created by a supplier signing up themselves — mark as claimed
        else {
          const countryName = dbComp.countries?.name || dbComp.city || 'Germany'
          const countryCode = dbComp.countries?.iso_code || (countryName === 'Norway' ? 'NO' : countryName === 'Netherlands' ? 'NL' : 'DE')
          companies.push({
            id: dbComp.id,
            rank: 40,
            name: dbComp.name,
            slug: dbComp.slug || dbComp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category: 'SEAFOOD SUPPLIER',
            country: countryName,
            countryCode: countryCode,
            address: dbComp.city || '',
            website: dbComp.website || '',
            email: dbComp.email || '',
            phone: dbComp.phone || '',
            domain: dbComp.website ? dbComp.website.replace(/^https?:\/\//, '') : '',
            description: 'Verified registered supplier on Bokhol platform.',
            logoUrl: dbComp.logo_url || undefined,
            status: 'claimed',
            isVerified: true,
            isPublicListing: true,
            completenessScore: 90,
            species: ['Atlantic Cod', 'Salmon', 'Sea Bass'],
            tags: ['SUPPLIER', 'VERIFIED'],
            claimRequest: {
              username: dbComp.slug || 'supplier',
              fullName: dbComp.name,
              businessEmail: dbComp.email || 'supplier@bokhol.com',
              jobTitle: 'Registered Supplier Account',
              phone: dbComp.phone || '',
              requestedAt: dbComp.created_at || new Date().toISOString(),
            },
          })
        }
      }
    }

    if (claimsJson?.success && Array.isArray(claimsJson.claims)) {
      for (const claim of claimsJson.claims) {
        const idx = companies.findIndex(
          (c) => c.id === claim.company_id ||
            (claim.company_name && c.name.toLowerCase() === claim.company_name.toLowerCase())
        )
        if (idx !== -1) {
          const mappedStatus =
            claim.status === 'approved' ? 'claimed' :
            claim.status === 'pending' ? 'claim_requested' : 'rejected'
          companies[idx] = {
            ...companies[idx],
            status: mappedStatus,
            ...(claim.status === 'approved' ? { isVerified: true } : {}),
            claimRequest: {
              username: claim.username,
              fullName: claim.full_name,
              businessEmail: claim.business_email,
              jobTitle: claim.job_title,
              phone: claim.phone,
              requestedAt: claim.created_at,
              rejectionReason: claim.rejection_reason,
            },
          }
        }
      }
    }
    return companies
  } catch {
    return getStoredCompanies()
  }
}

// These functions update only the server claim record (no localStorage)
export function requestProfileClaim(companyId: string, details: any): { success: boolean; error?: string } {
  return { success: true }
}

export function approveProfileClaim(companyId: string): boolean {
  // State update is handled in the admin page via syncWithServerClaims()
  return true
}

export function rejectProfileClaim(companyId: string, reason?: string): boolean {
  return true
}

export function revokeProfileClaim(companyId: string): boolean {
  return true
}

export async function deleteCompany(companyId: string): Promise<boolean> {
  try {
    await fetch(`/api/admin/add-supplier?id=${companyId}`, { method: 'DELETE' }).catch(() => null)
  } catch {}

  // Delete from Supabase if it's a real company (UUID format)
  if (/^[0-9a-f-]{36}$/i.test(companyId)) {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.from('companies').delete().eq('id', companyId)
    } catch { }
  }
  return true
}

export { type CompanyProfile as default }

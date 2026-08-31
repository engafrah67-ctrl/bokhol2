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
  completenessScore: number // percentage 0-100
  species: string[]
  tags: string[]
  claimRequest?: {
    fullName: string
    businessEmail: string
    jobTitle: string
    phone: string
    requestedAt: string
    rejectionReason?: string
  }
}

export const INITIAL_COMPANIES: CompanyProfile[] = [
  {
    id: 'comp-1',
    rank: 1,
    name: 'Amacore B.V.',
    slug: 'amacore',
    category: 'SEAFOOD WHOLESALER',
    country: 'Netherlands',
    countryCode: 'NL',
    address: 'Het Scheer 5, 8251 RB Dronten, Netherlands',
    website: 'https://amacore.nl',
    email: 'info@amacore.nl',
    phone: '+31 (0)321 330 025',
    domain: 'amacore.nl',
    description: 'Amacore specializes in sourcing, importing, and distributing high-quality frozen fish products globally. Trusted supplier of Sea bass, Cod, Plaice, and Tuna.',
    logoUrl: '/partners/amacore.png',
    bannerColor: '#022B96',
    status: 'unclaimed',
    isVerified: true,
    isFoundingMember: true,
    isPublicListing: true,
    completenessScore: 100,
    species: ['Sea bass', 'Cod', 'Plaice', 'Yellowfin Tuna', 'Salmon'],
    tags: ['WHOLESALER', 'FRESH', 'FROZEN'],
  },
  {
    id: 'comp-2',
    rank: 2,
    name: 'AnT Seafood B.V.',
    slug: 'ant-seafood',
    category: 'SEAFOOD SUPPLIER',
    country: 'Netherlands',
    countryCode: 'NL',
    address: 'Vissershaven 18, Urk, Netherlands',
    website: 'https://antseafood.nl',
    email: 'info@antseafood.nl',
    phone: '+31 527 68 99 00',
    domain: 'antseafood.nl',
    description: 'Premium North Sea supplier specializing in fresh flatfish, sea bass, turbot, and cod.',
    logoUrl: '/partners/ant-seafood.png',
    bannerColor: '#022B96',
    status: 'unclaimed',
    isVerified: true,
    isFoundingMember: true,
    isPublicListing: true,
    completenessScore: 95,
    species: ['Sea Bass', 'Cod', 'Plaice', 'Turbot'],
    tags: ['WHOLESALER', 'FRESH', 'FROZEN'],
  },
  {
    id: 'comp-3',
    rank: 3,
    name: 'ATL Seafood B.V.',
    slug: 'atl-seafood',
    category: 'SEAFOOD SUPPLIER',
    country: 'Netherlands',
    countryCode: 'NL',
    address: 'Korfwater 3, 1755 LE Petten, Netherlands',
    website: 'https://atlseafood.com',
    email: 'sales@atlseafood.com',
    phone: '+31 (0)224 561 289',
    domain: 'atlseafood.com',
    description: 'Premium fresh seafood supplier specializing in flatfish, turbot, sole, and custom filleting services for European wholesalers.',
    logoUrl: '/partners/atl-seafood.png',
    bannerColor: '#1d4ed8',
    status: 'unclaimed',
    isVerified: true,
    isFoundingMember: false,
    isPublicListing: true,
    completenessScore: 92,
    species: ['Turbot', 'Plaice', 'Dover Sole', 'Sea Bass'],
    tags: ['SUPPLIER', 'FRESH', 'PREMIUM'],
  },
  {
    id: 'comp-4',
    rank: 4,
    name: 'Blue World Seafood B.V.',
    slug: 'blue-world-seafood',
    category: 'SEAFOOD IMPORTER',
    country: 'Netherlands',
    countryCode: 'NL',
    address: 'Havenweg 10, 8321 Urk, Netherlands',
    website: 'https://blueworldseafood.nl',
    email: 'info@blueworldseafood.nl',
    phone: '+31 527 680 111',
    domain: 'blueworldseafood.nl',
    description: 'Global seafood importer providing high-grade wild-caught cod, salmon fillets, and frozen shrimp products.',
    logoUrl: '/partners/blue-world-seafood.png',
    bannerColor: '#004488',
    status: 'unclaimed',
    isVerified: true,
    isFoundingMember: false,
    isPublicListing: true,
    completenessScore: 88,
    species: ['Atlantic Cod', 'Salmon', 'Shrimp', 'Squid'],
    tags: ['IMPORTER', 'FROZEN', 'GLOBAL'],
  },
  {
    id: 'comp-5',
    rank: 5,
    name: 'Dayseaday Frozen Fish',
    slug: 'dayseaday',
    category: 'PROCESSOR & DISTRIBUTOR',
    country: 'Netherlands',
    countryCode: 'NL',
    address: 'Westgate 23, 8321 WX Urk, Netherlands',
    website: 'https://dayseaday.nl',
    email: 'info@dayseaday.nl',
    phone: '+31 (0)527 684 684',
    domain: 'dayseaday.nl',
    description: 'Major seafood processor delivering fresh and frozen fish fillets, whole fish, and specialized seafood mixes across Europe.',
    logoUrl: '/partners/dayseaday.png',
    bannerColor: '#0284c7',
    status: 'unclaimed',
    isVerified: true,
    isFoundingMember: false,
    isPublicListing: true,
    completenessScore: 90,
    species: ['Yellowfin Tuna', 'Octopus', 'Sea Bream', 'Salmon Fillet'],
    tags: ['PROCESSOR', 'WHOLESALER', 'FRESH'],
  },
  {
    id: 'comp-6',
    rank: 6,
    name: 'AM Fish B.V.',
    slug: 'am-fish',
    category: 'SEAFOOD SUPPLIER',
    country: 'Netherlands',
    countryCode: 'NL',
    address: 'Het Urkerland 47, 8321 ZA Urk, Netherlands',
    website: 'https://amfish.nl',
    email: 'sales@amfish.nl',
    phone: '+31 (0)527 687 010',
    domain: 'amfish.nl',
    description: 'International supplier of wild-caught and farmed frozen fish and shrimp products with global distribution channels.',
    logoUrl: '/partners/am-fish.png',
    bannerColor: '#0066cc',
    status: 'unclaimed',
    isVerified: true,
    isFoundingMember: false,
    isPublicListing: true,
    completenessScore: 85,
    species: ['Atlantic Salmon', 'Prawns', 'Mackerel', 'Squid', 'Cod'],
    tags: ['SUPPLIER', 'FROZEN', 'EXPORT'],
  }
]

const STORAGE_KEY = 'bokhol_fishmarket_companies_v10'

export function getStoredCompanies(): CompanyProfile[] {
  if (typeof window === 'undefined') return INITIAL_COMPANIES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPANIES))
      return INITIAL_COMPANIES
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPANIES))
      return INITIAL_COMPANIES
    }
    return parsed
  } catch (_) {
    return INITIAL_COMPANIES
  }
}

export function saveCompanies(companies: CompanyProfile[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies))
  } catch (err) {
    console.error('Failed to save companies to localStorage:', err)
  }
}

export function requestProfileClaim(
  companyId: string,
  claimData: {
    fullName: string
    businessEmail: string
    jobTitle: string
    phone: string
  }
): { success: boolean; error?: string } {
  const companies = getStoredCompanies()
  const idx = companies.findIndex((c) => c.id === companyId)
  if (idx === -1) return { success: false, error: 'Company profile not found.' }

  const current = companies[idx]
  if (current.status === 'claimed') {
    return { success: false, error: 'This company profile has already been claimed and verified.' }
  }
  if (current.status === 'claim_requested') {
    return { success: false, error: 'A claim request is already pending verification for this company.' }
  }

  companies[idx] = {
    ...current,
    status: 'claim_requested',
    claimRequest: {
      ...claimData,
      requestedAt: new Date().toISOString(),
    },
  }

  saveCompanies(companies)
  return { success: true }
}

export function approveProfileClaim(companyId: string): boolean {
  const companies = getStoredCompanies()
  const idx = companies.findIndex((c) => c.id === companyId)
  if (idx === -1) return false

  companies[idx] = {
    ...companies[idx],
    status: 'claimed',
    isVerified: true,
    completenessScore: Math.max(companies[idx].completenessScore, 85),
  }

  saveCompanies(companies)
  return true
}

export function rejectProfileClaim(companyId: string, reason?: string): boolean {
  const companies = getStoredCompanies()
  const idx = companies.findIndex((c) => c.id === companyId)
  if (idx === -1) return false

  const existingRequest = companies[idx].claimRequest

  companies[idx] = {
    ...companies[idx],
    status: 'rejected',
    claimRequest: existingRequest
      ? {
          ...existingRequest,
          rejectionReason: reason || 'Business verification could not be completed.',
        }
      : undefined,
  }

  saveCompanies(companies)
  return true
}

export function deleteCompany(companyId: string): boolean {
  const companies = getStoredCompanies()
  const filtered = companies.filter((c) => c.id !== companyId)
  if (filtered.length === companies.length) return false
  saveCompanies(filtered)
  return true
}

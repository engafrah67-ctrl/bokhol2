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
    id?: string
    fullName: string
    businessEmail: string
    jobTitle: string
    phone?: string
    requestedAt: string
    reviewedAt?: string
    rejectionReason?: string
    credentials?: {
      username: string
      email: string
      password?: string
      generatedAt?: string
    }
  }
  claimedAccount?: {
    fullName: string
    businessEmail: string
    jobTitle: string
    claimedAt: string
    credentials?: {
      username: string
      email: string
      password?: string
    }
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
    isVerified: false,
    isFoundingMember: false,
    isPublicListing: true,
    completenessScore: 85,
    species: ['Atlantic Salmon', 'Prawns', 'Mackerel', 'Squid', 'Cod'],
    tags: ['SUPPLIER', 'FROZEN', 'EXPORT'],
  },
  {
    id: 'comp-7',
    rank: 7,
    name: 'Scanimex Seafood A/S',
    slug: 'scanimex',
    category: 'SEAFOOD IMPORTER',
    country: 'Denmark',
    countryCode: 'DK',
    address: 'Fiskehavnsgade 12, 6700 Esbjerg, Denmark',
    website: 'https://scanimex.dk',
    email: 'contact@scanimex.dk',
    phone: '+45 75 12 34 56',
    domain: 'scanimex.dk',
    description: 'Nordic seafood specialist focusing on sustainable coldwater shrimp, cod, haddock, and salmon sourcing from North Atlantic waters.',
    logoUrl: '/partners/blue-world-seafood.png',
    bannerColor: '#0f766e',
    status: 'unclaimed',
    isVerified: false,
    isFoundingMember: false,
    isPublicListing: true,
    completenessScore: 78,
    species: ['Coldwater Prawns', 'Atlantic Cod', 'Haddock', 'Saithe'],
    tags: ['IMPORTER', 'NORDIC', 'FROZEN'],
  },
  {
    id: 'comp-8',
    rank: 8,
    name: '14 De Julio S.A.',
    slug: '14-de-julio',
    category: 'SEAFOOD SUPPLIER',
    country: 'Spain',
    countryCode: 'ES',
    address: 'Puerto de Vigo, Muelle de Reparaciones, 36202 Vigo, Spain',
    website: 'https://14dejulio.es',
    email: 'info@14dejulio.es',
    phone: '+34 986 44 22 11',
    domain: '14dejulio.es',
    description: 'Atlantic ocean fishing company operating longliners and trawlers specializing in hake, squid, and octopus.',
    status: 'unclaimed',
    isVerified: false,
    isFoundingMember: false,
    isPublicListing: true,
    completenessScore: 10,
    species: ['Octopus', 'Squid', 'Hake', 'Mussels'],
    tags: ['SUPPLIER', 'FROZEN'],
  },
  {
    id: 'comp-9',
    rank: 9,
    name: '3D Brand Communication Seafood',
    slug: '3d-brand-seafood',
    category: 'SEAFOOD SUPPLIER',
    country: 'Spain',
    countryCode: 'ES',
    address: 'Avenida de Beiramar 140, Vigo, Spain',
    website: 'https://3dseafood.es',
    email: 'contact@3dseafood.es',
    phone: '+34 986 11 33 55',
    domain: '3dseafood.es',
    description: 'Integrated marketing and distribution platform for Galician seafood producers.',
    status: 'unclaimed',
    isVerified: false,
    isFoundingMember: false,
    isPublicListing: true,
    completenessScore: 10,
    species: ['Sea Bass', 'Sea Bream', 'Sardines'],
    tags: ['SUPPLIER'],
  },
  {
    id: 'comp-10',
    rank: 10,
    name: '68°Noord - Seafood Passion',
    slug: '68noord-seafood',
    category: 'SEAFOOD WHOLESALER',
    country: 'Norway',
    countryCode: 'NO',
    address: 'Svolvær Quay 4, 8300 Svolvær, Lofoten, Norway',
    website: 'https://68noord.no',
    email: 'post@68noord.no',
    phone: '+47 76 07 80 00',
    domain: '68noord.no',
    description: 'Lofoten-based salmon and cod exporter known for high-grade air-flown salmon and artisan stockfish.',
    status: 'unclaimed',
    isVerified: true,
    isFoundingMember: false,
    isPublicListing: true,
    completenessScore: 54,
    species: ['Atlantic Salmon', 'Cod', 'Mussels'],
    tags: ['WHOLESALER', 'FROZEN', 'NORWAY'],
  },
  {
    id: 'comp-11',
    rank: 11,
    name: '8F Asset Management Seafood PTE Ltd.',
    slug: '8f-asset-seafood',
    category: 'AQUACULTURE FARM',
    country: 'Singapore',
    countryCode: 'SG',
    address: 'Marina Bay Financial Centre Tower 1, Singapore',
    website: 'https://8fseafood.com',
    email: 'invest@8fseafood.com',
    phone: '+65 6812 7800',
    domain: '8fseafood.com',
    description: 'Pioneering sustainable land-based recirculating aquaculture systems (RAS) for Atlantic Salmon.',
    status: 'unclaimed',
    isVerified: false,
    isFoundingMember: false,
    isPublicListing: true,
    completenessScore: 30,
    species: ['Atlantic Salmon'],
    tags: ['AQUACULTURE', 'FRESH', 'SUSTAINABLE'],
  },
  {
    id: 'comp-12',
    rank: 12,
    name: 'Mariscos del Mar S.L.',
    slug: 'mariscos-del-mar',
    category: 'SEAFOOD WHOLESALER',
    country: 'Spain',
    countryCode: 'ES',
    address: 'Mercamadrid Naves 4-6, 28053 Madrid, Spain',
    website: 'https://mariscosdelmar.es',
    email: 'ventas@mariscosdelmar.es',
    phone: '+34 91 785 4321',
    domain: 'mariscosdelmar.es',
    description: 'Leading Spanish wholesaler distributing fresh shellfish, shrimp, octopus, and Mediterranean finfish.',
    status: 'unclaimed',
    isVerified: true,
    isFoundingMember: false,
    isPublicListing: true,
    completenessScore: 88,
    species: ['Octopus', 'Red Shrimp', 'Squid', 'Sea Bass', 'Sea Bream'],
    tags: ['WHOLESALER', 'FRESH', 'SPAIN'],
  }
]

const STORAGE_KEY = 'bokhol_fishmarketcap_companies_v4'

export function getStoredCompanies(): CompanyProfile[] {
  if (typeof window === 'undefined') return INITIAL_COMPANIES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPANIES))
      return INITIAL_COMPANIES
    }
    return JSON.parse(raw)
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
    phone?: string
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

export function approveProfileClaim(
  companyId: string,
  credentials?: {
    username: string
    email: string
    password?: string
  }
): boolean {
  const companies = getStoredCompanies()
  const idx = companies.findIndex((c) => c.id === companyId)
  if (idx === -1) return false

  const existingRequest = companies[idx].claimRequest

  companies[idx] = {
    ...companies[idx],
    status: 'claimed',
    isVerified: true,
    completenessScore: Math.max(companies[idx].completenessScore, 85),
    claimRequest: existingRequest
      ? {
          ...existingRequest,
          reviewedAt: new Date().toISOString(),
          credentials: credentials
            ? {
                ...credentials,
                generatedAt: new Date().toISOString(),
              }
            : undefined,
        }
      : undefined,
    claimedAccount: existingRequest
      ? {
          fullName: existingRequest.fullName,
          businessEmail: existingRequest.businessEmail,
          jobTitle: existingRequest.jobTitle,
          claimedAt: new Date().toISOString(),
          credentials,
        }
      : undefined,
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
          reviewedAt: new Date().toISOString(),
          rejectionReason: reason || 'Business verification could not be completed.',
        }
      : undefined,
  }

  saveCompanies(companies)
  return true
}

export function getPendingClaims(): CompanyProfile[] {
  return getStoredCompanies().filter((c) => c.status === 'claim_requested')
}

export function getClaimedCompanies(): CompanyProfile[] {
  return getStoredCompanies().filter((c) => c.status === 'claimed')
}

export function getUnclaimedCompanies(): CompanyProfile[] {
  return getStoredCompanies().filter((c) => c.status === 'unclaimed' || c.status === 'rejected')
}

export function addNewCompany(companyData: Partial<CompanyProfile> & { name: string; country: string }): CompanyProfile {
  const companies = getStoredCompanies()
  const slug =
    companyData.slug ||
    companyData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

  const newCompany: CompanyProfile = {
    id: companyData.id || `comp-${Date.now()}`,
    rank: companies.length + 1,
    name: companyData.name.trim(),
    slug,
    category: companyData.category || 'SEAFOOD SUPPLIER',
    country: companyData.country.trim(),
    countryCode: companyData.countryCode || companyData.country.slice(0, 2).toUpperCase(),
    address: companyData.address?.trim() || '',
    website: companyData.website?.trim() || '',
    email: companyData.email?.trim() || '',
    phone: companyData.phone?.trim() || '',
    domain: companyData.domain?.trim() || (companyData.website ? companyData.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '') : ''),
    description: companyData.description?.trim() || '',
    logoUrl: companyData.logoUrl || undefined,
    bannerColor: companyData.bannerColor || '#022B96',
    status: companyData.status || 'unclaimed',
    isVerified: companyData.isVerified ?? false,
    isPublicListing: true,
    completenessScore: companyData.completenessScore || 85,
    species: companyData.species && companyData.species.length > 0 ? companyData.species : ['Salmon', 'Tuna', 'Whitefish'],
    tags: companyData.tags && companyData.tags.length > 0 ? companyData.tags : ['SUPPLIER', 'WHOLESALER'],
  }

  const updated = [newCompany, ...companies]
  saveCompanies(updated)
  return newCompany
}

export function deleteCompany(companyId: string): boolean {
  const companies = getStoredCompanies()
  const filtered = companies.filter((c) => c.id !== companyId && c.slug !== companyId)
  if (filtered.length !== companies.length) {
    saveCompanies(filtered)
    return true
  }
  return false
}




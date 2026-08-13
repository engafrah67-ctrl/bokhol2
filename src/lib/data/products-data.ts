export interface SupplierPost {
  id: string
  user_id?: string
  company_id?: string
  company_name?: string
  product_name: string
  price_per_kg: number
  currency: string
  country_of_origin: string
  fresh_frozen: string
  size_weight: string
  packaging: string
  availability: string
  location: string
  supplier_info_extra?: string
  custom_image?: string
  created_at: string
  updated_at?: string
  status?: string
}

export interface MarketProductCard {
  slug: string
  name: string
  category: string
  scientificName: string
  imageUrl: string
  suppliersCount: number
  avgPrice: string
  topOrigin: string
  lastUpdated: string
}

// Fish image mapping
const FISH_IMAGE_MAP: Record<string, string> = {
  'Mackerel': '/mackerel.png',
  'Herring': '/mackerel.png',
  'Sardine': '/mackerel.png',
  'Tuna': '/tuna.png',
  'Yellowfin Tuna': '/tuna.png',
  'Bluefin Tuna': '/tuna.png',
  'Bigeye Tuna': '/tuna.png',
  'Albacore Tuna': '/tuna.png',
  'Skipjack Tuna': '/tuna.png',
  'Tuna Loin': '/tuna.png',
  'Atlantic Cod': '/cod.png',
  'Cod': '/cod.png',
  'Pacific Cod': '/cod.png',
  'Haddock': '/cod.png',
  'Pollock': '/cod.png',
  'Hake': '/cod.png',
  'Atlantic Salmon': '/salmon.png',
  'Salmon': '/salmon.png',
  'Pacific Salmon': '/salmon.png',
  'Salmon Fillet': '/salmon.png',
  'Shrimp': '/shrimp.png',
  'King Crab': '/shrimp.png',
  'Sea Bass': '/fish-seabass.png',
  'European Sea Bass': '/fish-seabass.png',
  'Sea Bream': '/fish-seabass.png',
  'Gilthead Sea Bream': '/fish-seabass.png',
}

export function getFishImageForProduct(name: string, customImage?: string): string {
  if (customImage && customImage.trim() !== '') return customImage

  const strName = name || ''
  if (FISH_IMAGE_MAP[strName]) return FISH_IMAGE_MAP[strName]

  const lower = strName.toLowerCase()
  if (lower.includes('trout') || lower.includes('salmon')) return '/salmon.png'
  if (lower.includes('tuna')) return '/tuna.png'
  if (lower.includes('cod') || lower.includes('haddock') || lower.includes('pollock') || lower.includes('hake') || lower.includes('sole') || lower.includes('plaice') || lower.includes('turbot') || lower.includes('halibut') || lower.includes('flatfish')) return '/cod.png'
  if (lower.includes('mackerel') || lower.includes('herring') || lower.includes('sardine') || lower.includes('anchovy')) return '/mackerel.png'
  if (lower.includes('shrimp') || lower.includes('crab') || lower.includes('prawn') || lower.includes('lobster') || lower.includes('squid') || lower.includes('octopus') || lower.includes('mussel')) return '/shrimp.png'
  if (lower.includes('bass') || lower.includes('bream')) return '/fish-seabass.png'

  return '/salmon.png'
}

// Initial sample supplier posts to seed if empty
const INITIAL_SUPPLIER_POSTS: SupplierPost[] = [
  {
    id: 'post-init-1',
    company_name: 'Nordic Seafood AS',
    product_name: 'Atlantic Salmon',
    price_per_kg: 7.71,
    currency: 'EUR',
    country_of_origin: 'Norway',
    fresh_frozen: 'Fresh',
    size_weight: 'Medium (1-3 kg)',
    packaging: 'Fillet (Skin On)',
    availability: 'In Stock — Ready to Ship',
    location: 'Bergen, Norway',
    supplier_info_extra: 'Certified MSC & ASC global export standard.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'active',
  },
  {
    id: 'post-init-2',
    company_name: 'Iberia Seafood SL',
    product_name: 'Yellowfin Tuna',
    price_per_kg: 6.11,
    currency: 'EUR',
    country_of_origin: 'Spain',
    fresh_frozen: 'Frozen',
    size_weight: 'Large (3-6 kg)',
    packaging: 'Loin',
    availability: 'In Stock — Ready to Ship',
    location: 'Vigo, Spain',
    supplier_info_extra: 'Deep frozen -60C sashimi grade.',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'active',
  },
  {
    id: 'post-init-3',
    company_name: 'Atlantic Fresh BV',
    product_name: 'Mackerel',
    price_per_kg: 5.31,
    currency: 'EUR',
    country_of_origin: 'Netherlands',
    fresh_frozen: 'Fresh',
    size_weight: 'Medium (1-3 kg)',
    packaging: 'Whole Fish',
    availability: 'In Stock — Ready to Ship',
    location: 'Urk, Netherlands',
    supplier_info_extra: 'Whole fresh catch, weekly delivery available.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'active',
  },
  {
    id: 'post-init-4',
    company_name: 'Hellas Sea Farms',
    product_name: 'European Sea Bass',
    price_per_kg: 6.45,
    currency: 'EUR',
    country_of_origin: 'Greece',
    fresh_frozen: 'Fresh',
    size_weight: 'Medium (1-3 kg)',
    packaging: 'Fillet (Skin On)',
    availability: 'In Stock — Ready to Ship',
    location: 'Piraeus, Greece',
    supplier_info_extra: 'Farm fresh Mediterranean sea bass.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'active',
  },
]

// Get all posts from localStorage
export function getStoredSupplierPosts(): SupplierPost[] {
  if (typeof window === 'undefined') return INITIAL_SUPPLIER_POSTS

  try {
    const raw = localStorage.getItem('supplier_posts')
    if (!raw) {
      localStorage.setItem('supplier_posts', JSON.stringify(INITIAL_SUPPLIER_POSTS))
      return INITIAL_SUPPLIER_POSTS
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('supplier_posts', JSON.stringify(INITIAL_SUPPLIER_POSTS))
      return INITIAL_SUPPLIER_POSTS
    }

    // Normalize posts if stored as raw JSON string content
    return parsed.map((item: any) => {
      if (typeof item.content === 'string') {
        try {
          const details = JSON.parse(item.content)
          return {
            id: item.id || 'post-' + Math.random(),
            company_name: item.company_name || 'Supplier Company',
            product_name: item.product_name || details.productName || 'Seafood Product',
            price_per_kg: parseFloat(item.price_per_kg || details.pricePerKg || 0),
            currency: item.currency || details.currency || 'EUR',
            country_of_origin: item.country_of_origin || details.countryOfOrigin || 'Norway',
            fresh_frozen: item.fresh_frozen || details.freshFrozen || 'Frozen',
            size_weight: item.size_weight || details.sizeWeight || 'Medium',
            packaging: item.packaging || details.packagingFillet || 'Standard',
            availability: item.availability || details.availability || 'In Stock',
            location: item.location || details.location || 'EU Port',
            supplier_info_extra: item.supplier_info_extra || details.supplierInfoExtra || '',
            custom_image: details.customImage || item.custom_image,
            created_at: item.created_at || details.createdAt || new Date().toISOString(),
            updated_at: item.updated_at || item.created_at || new Date().toISOString(),
            status: item.status || 'active',
          }
        } catch (_) {}
      }
      return {
        id: item.id || 'post-' + Math.random(),
        company_name: item.company_name || item.companyName || 'Supplier Company',
        product_name: item.product_name || item.productName || 'Seafood Product',
        price_per_kg: parseFloat(item.price_per_kg || item.pricePerKg || 0),
        currency: item.currency || 'EUR',
        country_of_origin: item.country_of_origin || item.countryOfOrigin || 'Norway',
        fresh_frozen: item.fresh_frozen || item.freshFrozen || 'Frozen',
        size_weight: item.size_weight || item.sizeWeight || 'Medium',
        packaging: item.packaging || item.packagingFillet || 'Standard',
        availability: item.availability || 'In Stock',
        location: item.location || 'EU Hub',
        supplier_info_extra: item.supplier_info_extra || item.supplierInfoExtra || '',
        custom_image: item.custom_image || item.customImage,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || item.created_at || new Date().toISOString(),
        status: item.status || 'active',
      }
    })
  } catch (err) {
    console.error('Error loading stored supplier posts:', err)
    return INITIAL_SUPPLIER_POSTS
  }
}

// Save posts to localStorage
export function saveSupplierPosts(posts: SupplierPost[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('supplier_posts', JSON.stringify(posts))
      window.dispatchEvent(new Event('storage'))
    } catch (err) {
      console.error('Error saving supplier posts:', err)
    }
  }
}

// Update Price for a specific post
export function updateProductPrice(
  postId: string,
  newPrice: number,
  currency: string = 'EUR',
  availability?: string
): SupplierPost[] {
  const posts = getStoredSupplierPosts()
  const now = new Date().toISOString()

  const updated = posts.map((p) => {
    if (p.id === postId) {
      return {
        ...p,
        price_per_kg: newPrice,
        currency,
        ...(availability ? { availability } : {}),
        updated_at: now,
      }
    }
    return p
  })

  saveSupplierPosts(updated)
  return updated
}

// Add a new supplier post
export function addSupplierPost(newPost: SupplierPost): SupplierPost[] {
  const posts = getStoredSupplierPosts()
  const updated = [newPost, ...posts]
  saveSupplierPosts(updated)
  return updated
}

// Base default market products
const BASE_MARKET_PRODUCTS: MarketProductCard[] = [
  {
    slug: 'mackerel',
    name: 'Mackerel',
    category: 'Finfish',
    scientificName: 'Scomber scombrus',
    imageUrl: '/mackerel.png',
    suppliersCount: 20,
    avgPrice: '€5.31 / kg',
    topOrigin: 'Norway',
    lastUpdated: 'Aug 10, 2026',
  },
  {
    slug: 'tuna',
    name: 'Tuna',
    category: 'Finfish',
    scientificName: 'Thunnus',
    imageUrl: '/tuna.png',
    suppliersCount: 18,
    avgPrice: '€6.11 / kg',
    topOrigin: 'Spain',
    lastUpdated: 'Aug 11, 2026',
  },
  {
    slug: 'atlantic-cod',
    name: 'Atlantic Cod',
    category: 'Finfish',
    scientificName: 'Gadus morhua',
    imageUrl: '/cod.png',
    suppliersCount: 16,
    avgPrice: '€6.91 / kg',
    topOrigin: 'Greece',
    lastUpdated: 'Aug 09, 2026',
  },
  {
    slug: 'atlantic-salmon',
    name: 'Atlantic Salmon',
    category: 'Finfish',
    scientificName: 'Salmo salar',
    imageUrl: '/salmon.png',
    suppliersCount: 14,
    avgPrice: '€7.71 / kg',
    topOrigin: 'Iceland',
    lastUpdated: 'Aug 12, 2026',
  },
  {
    slug: 'shrimp',
    name: 'Shrimp',
    category: 'Shellfish',
    scientificName: 'Caridea',
    imageUrl: '/shrimp.png',
    suppliersCount: 12,
    avgPrice: '€8.51 / kg',
    topOrigin: 'Vietnam',
    lastUpdated: 'Aug 08, 2026',
  },
]

// Aggregate baseline catalog with supplier-posted products
export function getAllMarketProducts(): MarketProductCard[] {
  const posts = getStoredSupplierPosts()
  const productMap = new Map<string, MarketProductCard>()

  // Initialize with base products
  BASE_MARKET_PRODUCTS.forEach((p) => {
    productMap.set(p.name.toLowerCase(), { ...p })
  })

  // Process supplier posts
  posts.forEach((post) => {
    if (!post.product_name) return
    const key = post.product_name.toLowerCase()

    // Determine category
    let category = 'Finfish'
    const lowerName = key
    if (lowerName.includes('shrimp') || lowerName.includes('crab') || lowerName.includes('mussel') || lowerName.includes('lobster')) {
      category = 'Shellfish'
    } else if (lowerName.includes('squid') || lowerName.includes('octopus') || lowerName.includes('cuttlefish')) {
      category = 'Cephalopods'
    }

    const formattedDate = new Date(post.updated_at || post.created_at || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    if (productMap.has(key)) {
      const existing = productMap.get(key)!
      const count = existing.suppliersCount + 1
      const priceVal = post.price_per_kg || 0
      const symbol = post.currency === 'USD' ? '$' : post.currency === 'GBP' ? '£' : '€'
      const formattedPrice = priceVal > 0 ? `${symbol}${priceVal.toFixed(2)} / kg` : existing.avgPrice
      productMap.set(key, {
        ...existing,
        suppliersCount: count,
        avgPrice: formattedPrice,
        topOrigin: post.country_of_origin || existing.topOrigin,
        lastUpdated: formattedDate,
      })
    } else {
      // Create new market card for newly posted supplier product species
      const slug = key.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      const symbol = post.currency === 'USD' ? '$' : post.currency === 'GBP' ? '£' : '€'
      productMap.set(key, {
        slug,
        name: post.product_name,
        category,
        scientificName: `${post.product_name} species`,
        imageUrl: getFishImageForProduct(post.product_name, post.custom_image),
        suppliersCount: 1,
        avgPrice: `${symbol}${post.price_per_kg ? post.price_per_kg.toFixed(2) : '5.50'} / kg`,
        topOrigin: post.country_of_origin || 'Norway',
        lastUpdated: formattedDate,
      })
    }
  })

  return Array.from(productMap.values())
}

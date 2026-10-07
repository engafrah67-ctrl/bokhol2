import { createPublicServerClient } from '@/lib/supabase/server'
import { getFishImageForProduct } from '@/lib/data/products-data'
import { ProductsClient, ProductCard } from '@/components/products/products-client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

function getCategory(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('shrimp') || lower.includes('crab') || lower.includes('mussel') || lower.includes('lobster') || lower.includes('oyster') || lower.includes('scallop')) return 'Shellfish'
  if (lower.includes('squid') || lower.includes('octopus') || lower.includes('cuttlefish')) return 'Cephalopods'
  return 'Finfish'
}

export default async function ProductsPage() {
  const supabase = createPublicServerClient()

  let cards: ProductCard[] = []
  try {
    // 1. Fetch catalog products for accurate categories, slugs and images
    const { data: catalogProducts } = await supabase
      .from('products')
      .select('name, slug, category, image_url')
      .order('name', { ascending: true })

    const catalogMap = new Map<string, any>()
    if (catalogProducts) {
      for (const prod of catalogProducts) {
        catalogMap.set(prod.name.toLowerCase().trim(), prod)
      }
    }

    // 2. Fetch all active supplier posts with company profile for supplier logos
    const { data: posts } = await supabase
      .from('supplier_posts')
      .select('id, title, content, created_at, updated_at, company_id, companies(id, name, logo_url)')
      .eq('is_published', true)

    // Group posts by normalized product name
    const postGroups = new Map<string, {
      displayName: string
      prices: number[]
      minPrices: number[]
      maxPrices: number[]
      origins: string[]
      latestDate: string
      currency: string
      customImages: string[]
      supplierMap: Map<string, { name: string; logoUrl: string | null }>
    }>()

    if (posts && posts.length > 0) {
      for (const post of posts) {
        let details: any = {}
        try { details = JSON.parse(post.content || '{}') } catch (_) {}

        const rawName: string = details.productName || post.title?.split(' —')[0]?.split(' -')[0] || ''
        if (!rawName.trim()) continue

        const name = rawName.trim()
        const key = name.toLowerCase()

        // Support both single price and min/max price format
        const explicitSingle = parseFloat(details.pricePerKg || 0)
        const explicitMin = parseFloat(details.minPricePerKg || 0)
        const explicitMax = parseFloat(details.maxPricePerKg || 0)

        let minPrice = 0
        let maxPrice = 0

        if (explicitSingle > 0) {
          minPrice = explicitSingle
          maxPrice = explicitMax > explicitSingle ? explicitMax : 0
        } else if (explicitMin > 0) {
          minPrice = explicitMin
          maxPrice = explicitMax > explicitMin ? explicitMax : 0
        }

        const price = minPrice

        const origin = details.countryOfOrigin || ''
        // Prefer admin-chosen date (in content JSON) over DB updated_at (overwritten by DB trigger)
        const date = details.lastAdminUpdate || details.lastUpdated || post.updated_at || post.created_at || ''
        const currency = details.currency || 'EUR'
        const customImg = details.customImage || ''

        // Resolve supplier profile from joined companies relation
        const compRel: any = Array.isArray((post as any).companies) ? (post as any).companies[0] : (post as any).companies
        const supplierId: string = (post as any).company_id || compRel?.id || ''
        const supplierName: string = compRel?.name || details.companyName || ''
        const supplierLogo: string | null = compRel?.logo_url || details.companyLogo || null

        if (postGroups.has(key)) {
          const existing = postGroups.get(key)!
          if (price > 0) existing.prices.push(price)
          if (minPrice > 0) existing.minPrices.push(minPrice)
          if (maxPrice > 0) existing.maxPrices.push(maxPrice)
          if (origin) existing.origins.push(origin)
          if (date > existing.latestDate) existing.latestDate = date
          if (customImg) existing.customImages.push(customImg)
          if (supplierId && supplierName && !existing.supplierMap.has(supplierId)) {
            existing.supplierMap.set(supplierId, { name: supplierName, logoUrl: supplierLogo })
          }
        } else {
          const supplierMap = new Map<string, { name: string; logoUrl: string | null }>()
          if (supplierId && supplierName) supplierMap.set(supplierId, { name: supplierName, logoUrl: supplierLogo })
          postGroups.set(key, {
            displayName: name,
            prices: price > 0 ? [price] : [],
            minPrices: minPrice > 0 ? [minPrice] : [],
            maxPrices: maxPrice > 0 ? [maxPrice] : [],
            origins: origin ? [origin] : [],
            latestDate: date,
            currency,
            customImages: customImg ? [customImg] : [],
            supplierMap,
          })
        }
      }
    }

    // 3. Build product cards ONLY for products that have real live uploaded supplier posts
    cards = Array.from(postGroups.entries()).map(([key, group]) => {
      const cat = catalogMap.get(key)
      const name = cat?.name || group.displayName || key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      const slug = cat?.slug || key.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      const avgPriceNum = group.prices.length > 0
        ? (group.prices.reduce((a, b) => a + b, 0) / group.prices.length)
        : null
      const overallMin = group.minPrices.length > 0 ? Math.min(...group.minPrices) : avgPriceNum
      const overallMax = group.maxPrices.length > 0 ? Math.max(...group.maxPrices) : null
      const symbol = group.currency === 'USD' ? '$' : group.currency === 'GBP' ? '£' : '€'

      const avgPrice = avgPriceNum ? `${symbol}${avgPriceNum.toFixed(2)} / kg` : 'Contact for price'
      const priceRange = overallMin && overallMin > 0
        ? overallMax && overallMax > overallMin
          ? `${symbol}${overallMin.toFixed(2)} – ${symbol}${overallMax.toFixed(2)} / kg`
          : `${symbol}${overallMin.toFixed(2)} / kg`
        : 'Contact for price'

      const originCounts = group.origins.reduce((acc: Record<string, number>, o) => {
        acc[o] = (acc[o] || 0) + 1; return acc
      }, {})
      const topOrigin = Object.entries(originCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Europe'

      const lastUpdated = group.latestDate
        ? new Date(group.latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recently'

      const displayImg = getFishImageForProduct(name, group.customImages[0])

      const suppliers = Array.from(group.supplierMap.values()).slice(0, 4)

      return {
        slug,
        name,
        category: cat?.category || getCategory(name),
        imageUrl: displayImg,
        suppliersCount: group.prices.length || 1,
        avgPrice,
        priceRange,
        topOrigin,
        lastUpdated,
        suppliers,
      }
    })

    // Sort: most offers first
    cards.sort((a, b) => b.suppliersCount - a.suppliersCount || a.name.localeCompare(b.name))
  } catch (err) {
    console.error('Failed to load products on server:', err)
  }

  return <ProductsClient initialProducts={cards} />
}

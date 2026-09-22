import { createPublicServerClient } from '@/lib/supabase/server'
import { getFishImageForProduct } from '@/lib/data/products-data'
import { ProductsClient, ProductCard } from '@/components/products/products-client'
import { isPriceSane } from '@/lib/data/market-data'

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

    // 2. Fetch all active supplier posts to match REAL live offers only
    const { data: posts } = await supabase
      .from('supplier_posts')
      .select('id, title, content, created_at, updated_at')
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
    }>()

    if (posts && posts.length > 0) {
      for (const post of posts) {
        let details: any = {}
        try { details = JSON.parse(post.content || '{}') } catch (_) {}

        const rawName: string = details.productName || post.title?.split(' —')[0] || ''
        if (!rawName.trim()) continue

        const name = rawName.trim()
        const key = name.toLowerCase()
        const normSlug = key.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

        // Support both new min/max format and legacy single price
        const rawMin = parseFloat(details.minPricePerKg || details.pricePerKg || 0)
        const rawMax = parseFloat(details.maxPricePerKg || 0)
        const minPrice = isPriceSane(rawMin, normSlug) ? rawMin : 0
        const maxPrice = rawMax > 0 && isPriceSane(rawMax, normSlug) ? rawMax : 0
        const price = minPrice

        const origin = details.countryOfOrigin || ''
        const date = post.updated_at || post.created_at || ''
        const currency = details.currency || 'EUR'
        const customImg = details.customImage || ''

        if (postGroups.has(key)) {
          const existing = postGroups.get(key)!
          if (price > 0) existing.prices.push(price)
          if (minPrice > 0) existing.minPrices.push(minPrice)
          if (maxPrice > 0) existing.maxPrices.push(maxPrice)
          if (origin) existing.origins.push(origin)
          if (date > existing.latestDate) existing.latestDate = date
          if (customImg) existing.customImages.push(customImg)
        } else {
          postGroups.set(key, {
            displayName: name,
            prices: price > 0 ? [price] : [],
            minPrices: minPrice > 0 ? [minPrice] : [],
            maxPrices: maxPrice > 0 ? [maxPrice] : [],
            origins: origin ? [origin] : [],
            latestDate: date,
            currency,
            customImages: customImg ? [customImg] : [],
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
      const priceRange = overallMin
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
      }
    })

    // Sort: most offers first
    cards.sort((a, b) => b.suppliersCount - a.suppliersCount || a.name.localeCompare(b.name))
  } catch (err) {
    console.error('Failed to load products on server:', err)
  }

  return <ProductsClient initialProducts={cards} />
}

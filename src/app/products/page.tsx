import { createPublicServerClient } from '@/lib/supabase/server'
import { getFishImageForProduct } from '@/lib/data/products-data'
import { ProductsClient, ProductCard } from '@/components/products/products-client'

export const revalidate = 10 // Cache statically and revalidate every 10 seconds

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
    // 1. Fetch the complete catalog of seafood products
    const { data: catalogProducts } = await supabase
      .from('products')
      .select('name, slug, category, image_url')
      .order('name', { ascending: true })

    // 2. Fetch all active supplier posts to match live offers
    const { data: posts } = await supabase
      .from('supplier_posts')
      .select('id, title, content, created_at, updated_at')
      .eq('is_published', true)

    // Group posts by normalized product name
    const postGroups = new Map<string, {
      prices: number[]
      origins: string[]
      latestDate: string
      currency: string
    }>()

    if (posts) {
      for (const post of posts) {
        let details: any = {}
        try { details = JSON.parse(post.content || '{}') } catch (_) {}

        const name: string = details.productName || post.title?.split(' —')[0] || ''
        if (!name) continue

        const key = name.toLowerCase().trim()
        const price = parseFloat(details.pricePerKg || 0)
        const origin = details.countryOfOrigin || ''
        const date = post.updated_at || post.created_at || ''
        const currency = details.currency || 'EUR'

        if (postGroups.has(key)) {
          const existing = postGroups.get(key)!
          if (price > 0) existing.prices.push(price)
          if (origin) existing.origins.push(origin)
          if (date > existing.latestDate) existing.latestDate = date
        } else {
          postGroups.set(key, {
            prices: price > 0 ? [price] : [],
            origins: origin ? [origin] : [],
            latestDate: date,
            currency,
          })
        }
      }
    }

    // 3. Build product cards starting from catalog products
    if (catalogProducts && catalogProducts.length > 0) {
      cards = catalogProducts.map((prod) => {
        const key = prod.name.toLowerCase().trim()
        const match = postGroups.get(key)

        if (match) {
          const avgPrice = match.prices.length > 0
            ? (match.prices.reduce((a, b) => a + b, 0) / match.prices.length)
            : null
          const symbol = match.currency === 'USD' ? '$' : match.currency === 'GBP' ? '£' : '€'

          const originCounts = match.origins.reduce((acc: Record<string, number>, o) => {
            acc[o] = (acc[o] || 0) + 1; return acc
          }, {})
          const topOrigin = Object.entries(originCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

          const lastUpdated = match.latestDate
            ? new Date(match.latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—'

          return {
            slug: prod.slug,
            name: prod.name,
            category: prod.category || getCategory(prod.name),
            imageUrl: prod.image_url || getFishImageForProduct(prod.name),
            suppliersCount: match.prices.length || 1,
            avgPrice: avgPrice ? `${symbol}${avgPrice.toFixed(2)} / kg` : 'Contact for price',
            topOrigin,
            lastUpdated,
          }
        } else {
          // If no active supplier posts, show placeholder status with catalog details
          return {
            slug: prod.slug,
            name: prod.name,
            category: prod.category || getCategory(prod.name),
            imageUrl: prod.image_url || getFishImageForProduct(prod.name),
            suppliersCount: 0,
            avgPrice: 'Contact for price',
            topOrigin: '—',
            lastUpdated: '—',
          }
        }
      })

      // Sort: Active offers first, then alphabetically by name
      cards.sort((a, b) => {
        if (b.suppliersCount !== a.suppliersCount) {
          return b.suppliersCount - a.suppliersCount
        }
        return a.name.localeCompare(b.name)
      })
    }
  } catch (err) {
    console.error('Failed to load products on server:', err)
  }

  return <ProductsClient initialProducts={cards} />
}

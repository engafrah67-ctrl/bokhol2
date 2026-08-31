import { createPublicServerClient } from '@/lib/supabase/server'
import { getFishImageForProduct } from '@/lib/data/products-data'
import { ProductsClient, ProductCard } from '@/components/products/products-client'

export const revalidate = 60 // Cache statically and revalidate every 60 seconds

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
    const { data: posts } = await supabase
      .from('supplier_posts')
      .select('id, title, content, created_at, updated_at, company_id')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (posts && posts.length > 0) {
      const productMap = new Map<string, {
        name: string
        prices: number[]
        origins: string[]
        latestDate: string
        currency: string
      }>()

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

        if (productMap.has(key)) {
          const existing = productMap.get(key)!
          if (price > 0) existing.prices.push(price)
          if (origin) existing.origins.push(origin)
          if (date > existing.latestDate) existing.latestDate = date
        } else {
          productMap.set(key, {
            name,
            prices: price > 0 ? [price] : [],
            origins: origin ? [origin] : [],
            latestDate: date,
            currency,
          })
        }
      }

      cards = Array.from(productMap.entries()).map(([, data]) => {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        const avgPrice = data.prices.length > 0
          ? (data.prices.reduce((a, b) => a + b, 0) / data.prices.length)
          : null
        const symbol = data.currency === 'USD' ? '$' : data.currency === 'GBP' ? '£' : '€'

        const originCounts = data.origins.reduce((acc: Record<string, number>, o) => {
          acc[o] = (acc[o] || 0) + 1; return acc
        }, {})
        const topOrigin = Object.entries(originCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

        const lastUpdated = data.latestDate
          ? new Date(data.latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '—'

        return {
          slug,
          name: data.name,
          category: getCategory(data.name),
          imageUrl: getFishImageForProduct(data.name),
          suppliersCount: productMap.get(data.name.toLowerCase().trim())?.prices.length || 1,
          avgPrice: avgPrice ? `${symbol}${avgPrice.toFixed(2)} / kg` : 'Contact for price',
          topOrigin,
          lastUpdated,
        }
      })

      cards.sort((a, b) => b.suppliersCount - a.suppliersCount)
    }
  } catch (err) {
    console.error('Failed to load products on server:', err)
  }

  return <ProductsClient initialProducts={cards} />
}

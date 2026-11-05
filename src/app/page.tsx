import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/home/hero-section'
import { PartnersSection } from '@/components/home/partners-section'
import { SeafoodIndexCard } from '@/components/home/seafood-index'
import { TopProducts } from '@/components/home/top-products'
import { LatestNews } from '@/components/home/latest-news'
import { ExpertProfile } from '@/components/home/expert-profile'
import { FAQSection } from '@/components/home/faq-section'
import { parseSupplierPostsToMarketData, LiveCountryMarketData, LiveSpeciesIndex, TopMarketProduct } from '@/lib/data/market-data'
import { getFishImageForProduct } from '@/lib/data/products-data'
import { ManagedIndexItem } from '@/lib/data/seafood-index-data'
import { getAuthUser } from '@/lib/auth/server'
import {
  getCachedProductListings,
  getCachedLatestNews,
  getCachedManagedIndex,
} from '@/lib/data/public-cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/** Convert managed index items to LiveCountryMarketData for the home page graph */
function managedToEuEntry(items: ManagedIndexItem[]): LiveCountryMarketData {
  const species: LiveSpeciesIndex[] = items.map(item => ({
    id: item.id,
    slug: item.slug,
    label: item.label,
    currency: item.currency,
    unit: item.unit,
    latest: item.latestPrice,
    weekHigh: item.monthHigh,
    weekLow: item.monthLow,
    change: item.monthlyChangePct,
    color: item.color,
    suppliersCount: item.activeOffersCount,
    topOrigin: 'Europe',
    origins: ['Europe'],
    imageUrl: '',
    data: item.data,
  }))
  return {
    id: 'eu',
    name: 'All Europe',
    flagUrl: 'https://flagcdn.com/w40/eu.png',
    source: items[0]?.source ?? 'EU Spot Market Average',
    description: `${species.length} species · Managed index`,
    species,
  }
}

function listingCategory(name: string): string {
  const lower = name.toLowerCase()
  return ['shrimp', 'crab', 'lobster', 'prawn', 'mussel', 'oyster', 'scallop'].some(k => lower.includes(k)) ? 'Shellfish' : 'Finfish'
}

/** Visitor-safe top products: names, origins and images only — no prices, counts or suppliers */
function listingsToTopProducts(listings: any[]): TopMarketProduct[] {
  return listings.slice(0, 6).map((l) => {
    const name = String(l.product_name || '').trim()
    const origins: string[] = Array.isArray(l.origins) && l.origins.length > 0 ? l.origins : ['Europe']
    return {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      origin: origins.join(', '),
      origins,
      avgPrice: '',
      avgPriceNum: 0,
      suppliersCount: 0,
      imageUrl: getFishImageForProduct(name, l.image || undefined),
      category: listingCategory(name),
    }
  })
}

export default async function HomePage() {
  // Cookie-aware client: offers (with prices) are only readable by signed-in users (RLS).
  // Public data comes from the shared server cache; only signed-in users trigger a live query.
  const supabase = await createClient()
  const user = await getAuthUser(supabase)

  const safe = <T,>(p: Promise<T>, fallback: T, what: string): Promise<T> =>
    p.catch((err) => {
      console.error(`Home page ${what} error:`, err?.message || err)
      return fallback
    })

  const [rows, news, managedItems] = await Promise.all([
    user
      ? supabase
          .from('supplier_posts')
          .select('id, title, content, created_at, updated_at')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (error) throw new Error(error.message)
            return (data || []) as any[]
          })
      : safe<any[]>(getCachedProductListings(), [], 'listings'),
    safe<any[]>(getCachedLatestNews(), [], 'news'),
    safe(getCachedManagedIndex(), [] as ManagedIndexItem[], 'seafood index'),
  ]).catch((err) => {
    console.error('Home page offers fetch error:', err?.message || err)
    return [[], [], []] as [any[], any[], ManagedIndexItem[]]
  })

  // The Seafood Index is exactly what the admin manages — the same for every viewer
  const countryData: LiveCountryMarketData[] = managedItems.length > 0 ? [managedToEuEntry(managedItems)] : []
  const topProducts: TopMarketProduct[] = user
    ? parseSupplierPostsToMarketData(rows).topProducts
    : listingsToTopProducts(rows)

  const mergedCountryData = countryData

  return (
    <div>
      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 1.25. Trusted Industry Partners Banner */}
      <PartnersSection />

      <div className="space-y-16 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2. European Seafood Index — merges admin-managed data */}
        <SeafoodIndexCard initialCountryData={mergedCountryData} />

        {/* 3. Top Seafood Products */}
        <TopProducts topProducts={topProducts} />

        {/* 3.5 Expert Profile */}
        <ExpertProfile />

        {/* 4. Latest News (published by admin) */}
        <LatestNews news={news || []} />

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </div>
  )
}


import { createPublicServerClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/home/hero-section'
import { PartnersSection } from '@/components/home/partners-section'
import { SeafoodIndexCard } from '@/components/home/seafood-index'
import { TopProducts } from '@/components/home/top-products'
import { MarketFeed } from '@/components/home/market-feed'
import { ExpertProfile } from '@/components/home/expert-profile'
import { FAQSection } from '@/components/home/faq-section'
import { StatsBar } from '@/components/home/stats-bar'
import { NewsArticle } from '@/types/database'
import { parseSupplierPostsToMarketData, getLiveMarketData, LiveCountryMarketData, LiveSpeciesIndex } from '@/lib/data/market-data'
import { getManagedIndexItems } from '@/lib/data/seafood-index-server'
import { ManagedIndexItem } from '@/lib/data/seafood-index-data'

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

/**
 * Merge admin-managed index items into Supabase-derived country data.
 * Admin prices + trends override Supabase; new species in managed index are added.
 */
function mergeWithManagedIndex(
  countryData: LiveCountryMarketData[],
  managedItems: ManagedIndexItem[]
): LiveCountryMarketData[] {
  if (!managedItems.length) return countryData

  const euEntry = countryData.find(c => c.id === 'eu')

  if (!euEntry || euEntry.species.length === 0) {
    // No Supabase data — use managed index entirely
    return [managedToEuEntry(managedItems), ...countryData.filter(c => c.id !== 'eu')]
  }

  const supabaseSlugs = new Set(euEntry.species.map((s: LiveSpeciesIndex) => s.slug))

  // Override Supabase species with admin prices/trends where slug matches
  const mergedSpecies: LiveSpeciesIndex[] = euEntry.species.map((sp: LiveSpeciesIndex) => {
    const managed = managedItems.find(m => m.slug === sp.slug || m.id === sp.id)
    if (!managed) return sp
    return {
      ...sp,
      latest: managed.latestPrice,
      weekHigh: managed.monthHigh,
      weekLow: managed.monthLow,
      change: managed.monthlyChangePct,
      color: managed.color,
      data: managed.data,
      suppliersCount: Math.max(sp.suppliersCount, managed.activeOffersCount),
    }
  })

  // Add species only in managed index (not in Supabase)
  for (const item of managedItems) {
    if (!supabaseSlugs.has(item.slug)) {
      mergedSpecies.push({
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
      })
    }
  }

  return countryData.map(c =>
    c.id === 'eu'
      ? { ...c, species: mergedSpecies, description: `${mergedSpecies.length} species · Live verified data` }
      : c
  )
}

interface SupabaseHomeCache {
  posts: any[]
  news: any[]
  supplierCount: number
  timestamp: number
}

let supabaseHomeCache: SupabaseHomeCache | null = null
const CACHE_TTL_MS = 30_000 // 30s cache for remote DB calls to ensure instant logo clicks and navigation

export function invalidateHomeSupabaseCache() {
  supabaseHomeCache = null
}

export default async function HomePage() {
  const now = Date.now()
  let posts: any[] = []
  let news: any[] = []
  let supplierCount = 0

  if (supabaseHomeCache && now - supabaseHomeCache.timestamp < CACHE_TTL_MS) {
    posts = supabaseHomeCache.posts
    news = supabaseHomeCache.news
    supplierCount = supabaseHomeCache.supplierCount
  } else {
    try {
      const supabase = createPublicServerClient()
      const [postsRes, newsRes, suppliersCountRes] = await Promise.all([
        supabase
          .from('supplier_posts')
          .select('id, title, content, created_at, updated_at')
          .eq('is_published', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('news')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(3),
        supabase
          .from('companies')
          .select('id', { count: 'exact', head: true }),
      ])

      posts = postsRes?.data || []
      news = newsRes?.data || []
      supplierCount = suppliersCountRes?.count ?? 0

      supabaseHomeCache = {
        posts,
        news,
        supplierCount,
        timestamp: Date.now(),
      }
    } catch (err) {
      console.error('Home page data fetch error:', err)
      if (supabaseHomeCache) {
        posts = supabaseHomeCache.posts
        news = supabaseHomeCache.news
        supplierCount = supabaseHomeCache.supplierCount
      }
    }
  }

  // Always read latest managed items on every request so admin updates are instant
  const managedItems = getManagedIndexItems()
  const rawMarketData = parseSupplierPostsToMarketData(posts)
  const mergedCountryData = mergeWithManagedIndex(rawMarketData.countryData, managedItems)

  const { topProducts } = rawMarketData
  const productCount = topProducts?.length ?? 0
  const marketCount = mergedCountryData?.filter(c => c.species && c.species.length > 0).length ?? 0

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

        {/* 4. Market Feed */}
        <MarketFeed news={(news as NewsArticle[]) || []} />

        {/* 5. Bottom Stats Bar */}
        <StatsBar
          supplierCount={supplierCount}
          productCount={productCount}
          marketCount={marketCount}
        />

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </div>
  )
}


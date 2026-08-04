import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/home/hero-section'
import { PartnersSection } from '@/components/home/partners-section'
import { SeafoodIndexCard } from '@/components/home/seafood-index'
import { TopProducts } from '@/components/home/top-products'
import { MarketFeed } from '@/components/home/market-feed'
import { StatsBar } from '@/components/home/stats-bar'
import { Product, NewsArticle } from '@/types/database'

export const revalidate = 60 // revalidate page every 60s

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch top products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('is_featured', { ascending: false })
    .limit(5)

  // Fetch latest news
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(3)

  return (
    <div>
      {/* 1. Hero Banner — full viewport width */}
      <HeroSection />

      {/* 1.25. Trusted Industry Partners Banner */}
      <PartnersSection />

      {/* Rest of page content — constrained */}
      <div className="space-y-16 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 2. Main European Seafood Index */}
        <SeafoodIndexCard />

        {/* 3. Top Seafood Products */}
        <TopProducts products={(products as Product[]) || []} />

        {/* 4. Market Feed */}
        <MarketFeed news={(news as NewsArticle[]) || []} />

        {/* 5. Bottom Stats Bar */}
        <StatsBar />
      </div>
    </div>
  )
}

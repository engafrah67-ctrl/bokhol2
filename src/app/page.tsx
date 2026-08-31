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
import { getLiveMarketData } from '@/lib/data/market-data'

export const revalidate = 10 // revalidate page every 10s for fast live updates

export default async function HomePage() {
  const supabase = createPublicServerClient()

  // Fetch real market index, top products, and latest news in parallel
  const [marketData, newsRes] = await Promise.all([
    getLiveMarketData(),
    supabase
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3),
  ])

  const { countryData, topProducts } = marketData
  const news = newsRes.data

  return (
    <div>
      {/* 1. Hero Banner — full viewport width */}
      <HeroSection />

      {/* 1.25. Trusted Industry Partners Banner */}
      <PartnersSection />

      {/* Rest of page content — constrained */}
      <div className="space-y-16 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 2. Main European Seafood Index with real live verified market data */}
        <SeafoodIndexCard initialCountryData={countryData} />

        {/* 3. Top Seafood Products corresponding directly to real active products */}
        <TopProducts topProducts={topProducts} />

        {/* 3.5 Expert Profile — Hassan Abdulkadir */}
        <ExpertProfile />

        {/* 4. Market Feed */}
        <MarketFeed news={(news as NewsArticle[]) || []} />

        {/* 5. Bottom Stats Bar */}
        <StatsBar />

        {/* FAQ Section — just before footer */}
        <FAQSection />
      </div>
    </div>
  )
}

import { createPublicServerClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/home/hero-section'
import { PartnersSection } from '@/components/home/partners-section'
import { SeafoodIndexCard } from '@/components/home/seafood-index'
import { TopProducts } from '@/components/home/top-products'
import { MarketFeed } from '@/components/home/market-feed'
import { ExpertProfile } from '@/components/home/expert-profile'
import { FAQSection } from '@/components/home/faq-section'
import { StatsBar } from '@/components/home/stats-bar'
import { Product, NewsArticle } from '@/types/database'

export const revalidate = 60 // revalidate page every 60s

export default async function HomePage() {
  const supabase = createPublicServerClient()

  // Fetch top products and latest news in parallel
  const [productsRes, newsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .order('is_featured', { ascending: false })
      .limit(5),
    supabase
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3),
  ])

  const products = productsRes.data
  const news = newsRes.data

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

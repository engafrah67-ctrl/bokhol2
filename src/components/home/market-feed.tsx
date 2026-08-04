'use client'

import Link from 'next/link'
import { NewsArticle } from '@/types/database'
import { Building2, Newspaper, ShoppingBag, ArrowUpRight, Clock } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

interface MarketFeedProps {
  news: NewsArticle[]
}

export function MarketFeed({ news }: MarketFeedProps) {
  const { t } = useLanguage()
  const latestNews = news.length > 0
    ? news[0]
    : {
        title: 'EU Seafood Report 2026',
        summary: 'Strong demand and stable supply expected across European trade hubs.',
        published_at: '2 hours ago',
      }

  return (
    <section className="space-y-6">
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{t('feed_title')}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border border-border divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Column 1: Latest Supplier Updates */}
        <div className="p-6 flex flex-col justify-between hover:bg-muted/30 transition-all duration-200 group">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-4 bg-muted px-3 py-1.5 rounded-sm border border-border self-start w-fit">
              <Building2 className="h-3.5 w-3.5" />
              {t('feed_supplier_updates')}
            </div>
            <h3 className="font-extrabold text-foreground text-base mb-1.5 group-hover:underline transition-all cursor-pointer leading-snug">
              Dalga Seafood
            </h3>
            <p className="text-xs text-foreground/80 font-bold mb-2">
              Fresh Tuna Available — 20 Tons
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              High grade fresh yellowfin tuna caught in Spanish coastal waters. Ready for immediate EU air-freight dispatch.
            </p>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border text-[10px] text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> 2 hours ago
            </span>
            <Link href="/suppliers" className="text-foreground font-bold hover:underline flex items-center gap-0.5">
              {t('feed_details')} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Column 2: Latest News */}
        <div className="p-6 flex flex-col justify-between hover:bg-muted/30 transition-all duration-200 group">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-4 bg-muted px-3 py-1.5 rounded-sm border border-border self-start w-fit">
              <Newspaper className="h-3.5 w-3.5" />
              {t('feed_latest_news')}
            </div>
            <h3 className="font-extrabold text-foreground text-base mb-1.5 group-hover:underline transition-all cursor-pointer line-clamp-2 leading-snug">
              {latestNews.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mt-3">
              {latestNews.summary || 'European seafood spot market prices rise following updated environmental standards.'}
            </p>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border text-[10px] text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Recently published
            </span>
            <Link href="/news" className="text-foreground font-bold hover:underline flex items-center gap-0.5">
              {t('feed_read')} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Column 3: Latest Buyer Requests */}
        <div className="p-6 flex flex-col justify-between hover:bg-muted/30 transition-all duration-200 group">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-4 bg-muted px-3 py-1.5 rounded-sm border border-border self-start w-fit">
              <ShoppingBag className="h-3.5 w-3.5" />
              {t('feed_buyer_tenders')}
            </div>
            <h3 className="font-extrabold text-foreground text-base mb-1.5 group-hover:underline transition-all cursor-pointer leading-snug">
              Looking for 50 Tons of Salmon
            </h3>
            <p className="text-xs font-bold text-foreground/80 mb-2">
              Norway Origin — Grade A
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              Urgent buyer tender from German seafood processor. Requires ASC or MSC certified supplier.
            </p>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border text-[10px] text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> 5 hours ago
            </span>
            <Link href="/requests" className="text-foreground font-bold hover:underline flex items-center gap-0.5">
              {t('feed_submit_quote')} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { NewsArticle } from '@/types/database'
import { Building2, Newspaper, ShoppingBag, ArrowUpRight, Clock, Lock } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { getStoredNewsArticles, NewsArticle as StoredNewsArticle } from '@/lib/data/news-data'

interface MarketFeedProps {
  news: NewsArticle[]
}

export function MarketFeed({ news }: MarketFeedProps) {
  const { t } = useLanguage()
  const [topStory, setTopStory] = useState<{ title: string; summary: string }>({
    title: 'EU Seafood Report 2026',
    summary: 'Strong demand and stable supply expected across European trade hubs.',
  })

  useEffect(() => {
    const articles = getStoredNewsArticles()
    if (articles.length > 0) {
      setTopStory({
        title: articles[0].title,
        summary: articles[0].excerpt,
      })
    } else if (news.length > 0) {
      setTopStory({
        title: news[0].title,
        summary: news[0].summary || (news[0] as any).excerpt || 'European seafood spot market prices rise.',
      })
    }
  }, [news])

  return (
    <section className="space-y-6">
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{t('feed_title')}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border border-border divide-y md:divide-y-0 md:divide-x divide-border rounded-2xl overflow-hidden shadow-sm">
        {/* Column 1: Latest Supplier Updates */}
        <div className="p-6 flex flex-col justify-between hover:bg-muted/30 transition-all duration-200 group">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-4 bg-muted px-3 py-1.5 rounded-lg border border-border self-start w-fit">
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
            <Link href="#" className="text-foreground font-bold hover:underline flex items-center gap-0.5">
              {t('feed_details')} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Column 2: Latest News */}
        <div className="p-6 flex flex-col justify-between hover:bg-muted/30 transition-all duration-200 group">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-4 bg-muted px-3 py-1.5 rounded-lg border border-border self-start w-fit">
              <Newspaper className="h-3.5 w-3.5" />
              {t('feed_latest_news')}
            </div>
            <h3 className="font-extrabold text-foreground text-base mb-1.5 group-hover:underline transition-all cursor-pointer line-clamp-2 leading-snug">
              {topStory.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mt-3">
              {topStory.summary}
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
                <ShoppingBag className="h-3.5 w-3.5" />
                {t('feed_buyer_tenders')}
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                <Lock className="w-2.5 h-2.5" /> {t('feed_suppliers_only')}
              </span>
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
            <Link href="/requests/buyer" className="text-foreground font-bold hover:underline flex items-center gap-0.5">
              {t('feed_submit_quote')} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

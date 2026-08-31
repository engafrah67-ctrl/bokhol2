'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { NewsArticle } from '@/types/database'
import { Building2, Newspaper, ShoppingBag, ArrowUpRight, Clock, Lock } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { createClient } from '@/lib/supabase/client'

interface MarketFeedProps {
  news?: NewsArticle[]
}

interface LatestSupplierPost {
  companyName: string
  companySlug: string
  title: string
  productName: string
  location: string
  supplierInfoExtra: string
  createdAt: string
}

interface LatestBuyerRequest {
  title: string
  quantity: string
  destination: string
  description: string
  createdAt: string
}

interface LatestNews {
  title: string
  summary: string
  slug: string
  createdAt: string
}

export function MarketFeed({ news }: MarketFeedProps) {
  const { t } = useLanguage()
  const [latestPost, setLatestPost] = useState<LatestSupplierPost | null>(null)
  const [latestRequest, setLatestRequest] = useState<LatestBuyerRequest | null>(null)
  const [topStory, setTopStory] = useState<LatestNews | null>(null)

  useEffect(() => {
    async function loadFeedData() {
      const supabase = createClient()

      try {
        const [postsRes, requestsRes, newsRes] = await Promise.allSettled([
          supabase
            .from('supplier_posts')
            .select(`
              id, title, content, created_at,
              companies(name, slug, city)
            `)
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(1),
          supabase
            .from('buyer_requests')
            .select('id, title, quantity, quantity_unit, destination, description, created_at')
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(1),
          supabase
            .from('news')
            .select('title, summary, slug, published_at')
            .eq('is_published', true)
            .order('published_at', { ascending: false })
            .limit(1),
        ])

        // 1. Process supplier post
        if (postsRes.status === 'fulfilled' && postsRes.value.data && postsRes.value.data.length > 0) {
          const p = postsRes.value.data[0]
          let details: any = {}
          try { details = JSON.parse(p.content || '{}') } catch (_) {}
          const company = Array.isArray(p.companies) ? p.companies[0] : p.companies

          setLatestPost({
            companyName: company?.name || 'Verified Supplier',
            companySlug: company?.slug || '',
            title: `${details.productName || p.title?.split(' —')[0] || 'Seafood'} Available`,
            productName: details.productName || p.title?.split(' —')[0] || 'Seafood',
            location: details.location || company?.city || 'EU Port',
            supplierInfoExtra: details.supplierInfoExtra || 'High grade seafood stock ready for immediate export.',
            createdAt: p.created_at,
          })
        }

        // 2. Process buyer request
        if (requestsRes.status === 'fulfilled' && requestsRes.value.data && requestsRes.value.data.length > 0) {
          const req = requestsRes.value.data[0]
          setLatestRequest({
            title: req.title,
            quantity: req.quantity ? `${req.quantity} ${req.quantity_unit || 'kg'}` : 'Bulk Quantity',
            destination: req.destination || 'EU Destination',
            description: req.description || 'Verified buyer tender open for quotes.',
            createdAt: req.created_at,
          })
        }

        // 3. Process news
        if (newsRes.status === 'fulfilled' && newsRes.value.data && newsRes.value.data.length > 0) {
          const dbNews = newsRes.value.data
          setTopStory({
            title: dbNews[0].title,
            summary: dbNews[0].summary || '',
            slug: dbNews[0].slug || '',
            createdAt: dbNews[0].published_at,
          })
        } else if (news && news.length > 0) {
          setTopStory({
            title: news[0].title,
            summary: news[0].summary || '',
            slug: news[0].id || '',
            createdAt: news[0].created_at || '',
          })
        }
      } catch (_) {}
    }

    loadFeedData()
  }, [news])

  return (
    <section className="space-y-6">
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{t('feed_title')}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border border-border divide-y md:divide-y-0 md:divide-x divide-border rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
        {/* Column 1: Latest Supplier Updates */}
        <div className="p-6 flex flex-col justify-between hover:bg-muted/30 transition-all duration-200 group">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-4 bg-muted px-3 py-1.5 rounded-lg border border-border self-start w-fit">
              <Building2 className="h-3.5 w-3.5" />
              {t('feed_supplier_updates')}
            </div>
            {latestPost ? (
              <>
                <h3 className="font-extrabold text-foreground text-base mb-1.5 group-hover:underline transition-all cursor-pointer leading-snug">
                  {latestPost.companyName}
                </h3>
                <p className="text-xs text-foreground/80 font-bold mb-2">
                  {latestPost.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {latestPost.supplierInfoExtra}
                </p>
              </>
            ) : (
              <>
                <h3 className="font-bold text-foreground text-base mb-1.5 leading-snug">
                  Live Supplier Network
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verified suppliers post regular stock availability and live offer updates here.
                </p>
              </>
            )}
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border text-[10px] text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {latestPost?.createdAt
                ? new Date(latestPost.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : 'Recent'}
            </span>
            <Link
              href={latestPost?.companySlug ? `/suppliers/${latestPost.companySlug}` : '/products'}
              className="text-foreground font-bold hover:underline flex items-center gap-0.5"
            >
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
            {topStory ? (
              <>
                <h3 className="font-extrabold text-foreground text-base mb-1.5 group-hover:underline transition-all cursor-pointer line-clamp-2 leading-snug">
                  {topStory.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mt-3">
                  {topStory.summary}
                </p>
              </>
            ) : (
              <>
                <h3 className="font-bold text-foreground text-base mb-1.5 leading-snug">
                  Industry News & Market Reports
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  Stay updated with global seafood trade regulations, benchmark pricing, and market shifts.
                </p>
              </>
            )}
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border text-[10px] text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {topStory?.createdAt
                ? new Date(topStory.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : 'Recent'}
            </span>
            <Link href={topStory?.slug ? `/news/${topStory.slug}` : '/news'} className="text-foreground font-bold hover:underline flex items-center gap-0.5">
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
                <Lock className="w-2.5 h-2.5" /> Suppliers Only
              </span>
            </div>
            {latestRequest ? (
              <>
                <h3 className="font-extrabold text-foreground text-base mb-1.5 group-hover:underline transition-all cursor-pointer leading-snug">
                  {latestRequest.title}
                </h3>
                <p className="text-xs font-bold text-foreground/80 mb-2">
                  Quantity: {latestRequest.quantity} {latestRequest.destination ? `· ${latestRequest.destination}` : ''}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {latestRequest.description}
                </p>
              </>
            ) : (
              <>
                <h3 className="font-bold text-foreground text-base mb-1.5 leading-snug">
                  Active Buyer Sourcing Requests
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verified buyers submit direct wholesale tenders for seafood products worldwide.
                </p>
              </>
            )}
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border text-[10px] text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {latestRequest?.createdAt
                ? new Date(latestRequest.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : 'Recent'}
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

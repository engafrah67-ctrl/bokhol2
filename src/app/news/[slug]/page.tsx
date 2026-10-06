'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User, Share2, Tag, ChevronRight, Newspaper, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ArticleDetail {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string
  cover_image_url: string | null
  category: string | null
  tags: string[] | null
  author: string
  published_at: string | null
  created_at: string
}

const FALLBACK_ARTICLES: Record<string, ArticleDetail> = {
  'european-salmon-prices-rise-2024': {
    id: 'seed-1',
    title: 'European Salmon Prices Rise Amid Supply Constraints',
    slug: 'european-salmon-prices-rise-2024',
    summary: 'Atlantic salmon prices in the European spot market rose 2.3% this week, driven by lower harvesting volumes from Norway.',
    content: `Atlantic salmon prices in the European spot market rose 2.3% this week, driven by lower harvesting volumes from Norway due to adverse weather conditions affecting key farming regions in Trondheim and Møre og Romsdal. Traders are closely watching Norwegian export data for the coming weeks.

Production cycles in Chilean salmon farming facilities have also witnessed modest slowdowns due to seasonal shifts, further consolidating pricing leverage across Northern European logistics hubs. Major wholesalers in France, Germany, and the Netherlands report steady wholesale demand despite upward pricing pressures.

Industry analysts project wholesale price resilience throughout the current quarter, with forward delivery contracts trading at slight premiums across Oslo and Frankfurt seafood trading desks. Buyers are advised to secure forward-dispatch allocations with verified suppliers early.`,
    cover_image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    category: 'Market Update',
    tags: ['Salmon', 'Norway', 'Pricing', 'Europe'],
    author: 'Bokhol Market Research',
    published_at: '2026-03-20T10:00:00Z',
    created_at: '2026-03-20T10:00:00Z',
  },
  'vietnam-seafood-exports-surge-q3': {
    id: 'seed-2',
    title: 'Vietnam Seafood Exports Surge 15% in Q3',
    slug: 'vietnam-seafood-exports-surge-q3',
    summary: "Vietnam's seafood export revenue reached $2.8 billion in Q3, up 15% year-on-year, driven by shrimp and pangasius.",
    content: `Vietnam's seafood export revenue reached $2.8 billion in Q3, a 15% increase year-on-year. Shrimp exports led the growth, accounting for 42% of total revenue, followed by pangasius at 28%. Key markets include the United States, China, Japan, and the EU.

Trade bodies highlight that expanded bilateral trade protocols and enhanced traceability certifications have facilitated accelerated customs clearance at major European entry ports like Rotterdam and Antwerp.

Aquaculture processors across the Mekong Delta are ramping up processed product lines to cater to value-added retail demand in international markets. Exporters continue to invest heavily in ASC and BAP accreditations to meet EU importer compliance guidelines.`,
    cover_image_url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=1200&q=80',
    category: 'Trade',
    tags: ['Shrimp', 'Vietnam', 'Exports', 'Asia'],
    author: 'Bokhol Market Research',
    published_at: '2026-03-18T10:00:00Z',
    created_at: '2026-03-18T10:00:00Z',
  },
  'king-crab-quotas-cut-2024': {
    id: 'seed-3',
    title: 'Global King Crab Quotas Cut by 30% for Upcoming Season',
    slug: 'king-crab-quotas-cut-2024',
    summary: 'Norwegian and Russian authorities have agreed to significantly reduce king crab fishing quotas for the 2024–25 season.',
    content: `Norwegian and Russian fishery management authorities have agreed to reduce Barents Sea king crab fishing quotas by approximately 30% for the 2024–25 season. This decision follows stock assessment surveys indicating a decline in mature male crab biomass.

The quota reduction is expected to constrain live and frozen crab supplies into Western European culinary and hospitality chains, prompting spot price increases across major distribution networks.

Vessel operators and processing hubs in Finnmark are pivoting toward optimizing premium grading and localized logistics to maintain margin targets during the constrained season. Importers should anticipate tighter delivery schedules and premium grading surcharges.`,
    cover_image_url: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=1200&q=80',
    category: 'Regulation',
    tags: ['King Crab', 'Barents Sea', 'Quotas', 'Norway'],
    author: 'Bokhol Market Research',
    published_at: '2026-03-15T10:00:00Z',
    created_at: '2026-03-15T10:00:00Z',
  },
  'asc-group-certification-small-farms': {
    id: 'seed-4',
    title: 'New ASC Group Certification Standard Launched for Small Farms',
    slug: 'asc-group-certification-small-farms',
    summary: 'The Aquaculture Stewardship Council has launched a new group certification pathway designed specifically for small-scale farms.',
    content: `The Aquaculture Stewardship Council (ASC) has launched a new group certification pathway designed specifically for small-scale farms in developing countries. The initiative aims to make ASC certification more accessible and affordable for cooperatives of small producers.

Under the new framework, smallholders can pool compliance verification and audit overheads, lowering barrier costs by up to 60% while adhering to rigorous environmental and social standards.

Major European seafood retailers have welcomed the initiative, anticipating broader supply access to certified sustainably farmed species across retail and foodservice categories.`,
    cover_image_url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=1200&q=80',
    category: 'Sustainability',
    tags: ['ASC', 'Certification', 'Sustainability', 'Farming'],
    author: 'Bokhol Market Research',
    published_at: '2026-03-10T10:00:00Z',
    created_at: '2026-03-10T10:00:00Z',
  },
  'global-salmon-prices-q3-2026': {
    id: 'seed-5',
    title: 'Global Salmon Prices Rise 12% in Q3 2026 Amid Supply Constraints',
    slug: 'global-salmon-prices-q3-2026',
    summary: 'Atlantic salmon prices have surged to their highest level in three years, driven by reduced harvests in Norway and Scotland.',
    content: `Atlantic salmon prices have surged to their highest level in three years, driven by reduced harvests in Norway and Scotland following environmental regulations and seasonal biological factors.

Exporters report robust order books from Southern European and Middle Eastern distributors, keeping cold storage inventories lean across regional logistics hubs. Processing margins remain tight, prompting suppliers to prioritize long-term contract partners.`,
    cover_image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
    category: 'Market Update',
    tags: ['Salmon', 'Pricing', 'Supply Chain'],
    author: 'Bokhol Market Research',
    published_at: '2026-07-25T10:00:00Z',
    created_at: '2026-07-25T10:00:00Z',
  },
  'vietnam-shrimp-exports-record': {
    id: 'seed-6',
    title: 'Vietnam Sets New Shrimp Export Record, Surpassing $4.2B in H1 2026',
    slug: 'vietnam-shrimp-exports-record',
    summary: "Southeast Asia's largest shrimp producer has posted record first-half revenues, fuelled by growing demand from European and North American buyers.",
    content: `Southeast Asia's largest shrimp producer has posted record first-half revenues, fuelled by growing demand from European and North American buyers. Vannamei and black tiger shrimp varieties accounted for over 70% of export transactions.

Quality certifications and integrated cold-chain shipping investments have enabled direct deliveries into premium supermarket chains across the EU.`,
    cover_image_url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=1200&q=80',
    category: 'Trade',
    tags: ['Shrimp', 'Vietnam', 'Exports'],
    author: 'Bokhol Market Research',
    published_at: '2026-07-23T10:00:00Z',
    created_at: '2026-07-23T10:00:00Z',
  },
  'eu-seafood-labelling-2026': {
    id: 'seed-7',
    title: 'EU Introduces Stricter Seafood Labelling Rules Starting January 2027',
    slug: 'eu-seafood-labelling-2026',
    summary: 'The European Commission has published new traceability requirements for all seafood sold in the EU, giving suppliers 18 months to comply.',
    content: `The European Commission has published new traceability requirements for all seafood sold in the EU, giving suppliers 18 months to comply. Under the updated mandate, digital lot codes indicating catch coordinates, gear type, and vessel registration must accompany all consignments through wholesale transit.`,
    cover_image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200&q=80',
    category: 'Regulation',
    tags: ['EU', 'Regulation', 'Traceability'],
    author: 'Bokhol Market Research',
    published_at: '2026-07-21T10:00:00Z',
    created_at: '2026-07-21T10:00:00Z',
  },
  'tuna-msc-certification': {
    id: 'seed-8',
    title: 'Three Major Tuna Fisheries Receive MSC Certification in Pacific Waters',
    slug: 'tuna-msc-certification',
    summary: 'The Marine Stewardship Council has granted certified sustainable status to key Pacific tuna fisheries, unlocking new premium market access.',
    content: `The Marine Stewardship Council has granted certified sustainable status to key Pacific tuna fisheries, unlocking new premium market access. The accreditation verifies sustainable harvest limits, minimized bycatch, and traceable maritime supply chains.`,
    cover_image_url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=1200&q=80',
    category: 'Sustainability',
    tags: ['Tuna', 'MSC', 'Pacific'],
    author: 'Bokhol Market Research',
    published_at: '2026-07-18T10:00:00Z',
    created_at: '2026-07-18T10:00:00Z',
  },
  'cod-north-sea-quotas': {
    id: 'seed-9',
    title: 'North Sea Cod Quotas Reduced by 20% for 2027 Season',
    slug: 'cod-north-sea-quotas',
    summary: 'Fisheries management bodies across the UK, Norway, and Iceland have agreed to cut cod harvest quotas significantly to allow stock recovery.',
    content: `Fisheries management bodies across the UK, Norway, and Iceland have agreed to cut cod harvest quotas significantly to allow stock recovery. Processors and frozen fillet suppliers are preparing for higher raw material costs heading into the autumn auctions.`,
    cover_image_url: 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=1200&q=80',
    category: 'Market Update',
    tags: ['Cod', 'North Sea', 'Quotas'],
    author: 'Bokhol Market Research',
    published_at: '2026-07-15T10:00:00Z',
    created_at: '2026-07-15T10:00:00Z',
  },
}

export default function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadArticle() {
      if (!slug) {
        setLoading(false)
        return
      }

      const cleanSlug = decodeURIComponent(slug).trim()
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug)

      const supabase = createClient()
      try {
        // 1. Fetch from Supabase news table safely without triggering Postgres UUID cast error
        let row: any = null
        if (isUUID) {
          const { data } = await supabase
            .from('news')
            .select('*')
            .or(`id.eq.${cleanSlug},slug.eq.${cleanSlug}`)
            .maybeSingle()
          row = data
        } else {
          // Exact slug query
          const { data } = await supabase
            .from('news')
            .select('*')
            .eq('slug', cleanSlug)
            .maybeSingle()
          row = data

          // Case-insensitive fallback if not found
          if (!row) {
            const { data: ilikeData } = await supabase
              .from('news')
              .select('*')
              .ilike('slug', cleanSlug)
              .maybeSingle()
            row = ilikeData
          }
        }

        if (row) {
          let displayContent = row.content || row.summary || ''
          let authorName = row.author || 'Bokhol Market Research'

          try {
            const parsed = JSON.parse(row.content || '{}')
            if (parsed && typeof parsed === 'object') {
              if (parsed.authorName) authorName = parsed.authorName
              if (parsed.content) displayContent = parsed.content
              else if (parsed.excerpt) displayContent = parsed.excerpt
            }
          } catch (_) {}

          setArticle({
            id: row.id,
            title: row.title,
            slug: row.slug || cleanSlug,
            summary: row.summary,
            content: displayContent,
            cover_image_url: row.cover_image_url,
            category: row.category || 'Market Update',
            tags: row.tags || [],
            author: authorName,
            published_at: row.published_at,
            created_at: row.created_at,
          })
          setLoading(false)
          return
        }

        // 2. Check localStorage (admin_news_articles)
        if (typeof window !== 'undefined') {
          try {
            const local = JSON.parse(localStorage.getItem('admin_news_articles') || '[]')
            const localMatch = local.find(
              (a: any) =>
                a.slug?.toLowerCase() === cleanSlug.toLowerCase() ||
                a.id?.toLowerCase() === cleanSlug.toLowerCase()
            )
            if (localMatch) {
              setArticle({
                id: localMatch.id || cleanSlug,
                title: localMatch.title,
                slug: localMatch.slug || cleanSlug,
                summary: localMatch.excerpt || '',
                content: localMatch.excerpt || localMatch.title,
                cover_image_url: localMatch.image || null,
                category: localMatch.category || 'Market Update',
                tags: [],
                author: localMatch.author || 'Bokhol Market Research',
                published_at: localMatch.date || null,
                created_at: localMatch.created_at || new Date().toISOString(),
              })
              setLoading(false)
              return
            }
          } catch (_) {}
        }

        // 3. Fallback to known industry articles library
        const fallback =
          FALLBACK_ARTICLES[cleanSlug] ||
          FALLBACK_ARTICLES[cleanSlug.toLowerCase()]

        if (fallback) {
          setArticle(fallback)
          setLoading(false)
          return
        }

      } catch (err) {
        console.error('Failed to load article:', err)
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [slug])

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-[#022B96]" />
        <span className="text-sm font-medium">Loading article...</span>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-transparent py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Newspaper className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Article Not Found</h1>
          <p className="text-sm text-slate-500 mb-6">
            The news article you are looking for may have been moved or removed.
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-bold rounded-xl shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to News Feed
          </Link>
        </div>
      </main>
    )
  }

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent'

  return (
    <main className="min-h-screen bg-transparent pb-24">
      {/* Top Breadcrumbs & Back Nav */}
      <div className="border-b border-white/50 bg-transparent py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#022B96] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to News & Feed
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>News</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-700 font-semibold">{article.category || 'Article'}</span>
            </div>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Category & Title */}
        <div className="space-y-4 mb-8">
          {article.category && (
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-[#022B96] bg-blue-50 px-3 py-1 rounded-lg border border-blue-100/60">
              {article.category}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Meta bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                3 min read
              </span>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Link Copied!' : 'Share'}
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {article.cover_image_url && (
          <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden mb-10 border border-slate-200 shadow-sm">
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}



        {/* Article Body */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
            {article.content}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>


      </article>
    </main>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Tag, Rss, Building2, Package, MapPin, CheckCircle2, ShieldAlert } from 'lucide-react'

interface NewsArticle {
  slug: string
  category: string
  categoryColor: string
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  image: string
  isSupplierNews?: boolean
  companyName?: string
}

interface SupplierPostFeed {
  id: string
  supplierName: string
  companyLogo?: string
  title: string
  productName: string
  pricePerKg: string
  freshFrozen: string
  location: string
  availability: string
  supplierInfoExtra: string
  date: string
}

const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: 'global-salmon-prices-q3-2026',
    category: 'Market Update',
    categoryColor: 'bg-blue-50 text-[#022B96]',
    title: 'Global Salmon Prices Rise 12% in Q3 2026 Amid Supply Constraints',
    excerpt: 'Atlantic salmon prices have surged to their highest level in three years, driven by reduced harvests in Norway and Scotland following environmental regulations.',
    author: 'FishMarketCap Research',
    date: 'July 25, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  },
  {
    slug: 'vietnam-shrimp-exports-record',
    category: 'Trade',
    categoryColor: 'bg-emerald-50 text-emerald-700',
    title: 'Vietnam Sets New Shrimp Export Record, Surpassing $4.2B in H1 2026',
    excerpt: "Southeast Asia's largest shrimp producer has posted record first-half revenues, fuelled by growing demand from European and North American buyers.",
    author: 'FishMarketCap Research',
    date: 'July 23, 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80',
  },
  {
    slug: 'eu-seafood-labelling-2026',
    category: 'Regulation',
    categoryColor: 'bg-orange-50 text-orange-700',
    title: 'EU Introduces Stricter Seafood Labelling Rules Starting January 2027',
    excerpt: 'The European Commission has published new traceability requirements for all seafood sold in the EU, giving suppliers 18 months to comply.',
    author: 'FishMarketCap Research',
    date: 'July 21, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  },
  {
    slug: 'tuna-msc-certification',
    category: 'Sustainability',
    categoryColor: 'bg-teal-50 text-teal-700',
    title: 'Three Major Tuna Fisheries Receive MSC Certification in Pacific Waters',
    excerpt: 'The Marine Stewardship Council has granted certified sustainable status to key Pacific tuna fisheries, unlocking new premium market access.',
    author: 'FishMarketCap Research',
    date: 'July 18, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=80',
  },
  {
    slug: 'cod-north-sea-quotas',
    category: 'Market Update',
    categoryColor: 'bg-blue-50 text-[#022B96]',
    title: 'North Sea Cod Quotas Reduced by 20% for 2027 Season',
    excerpt: 'Fisheries management bodies across the UK, Norway, and Iceland have agreed to cut cod harvest quotas significantly to allow stock recovery.',
    author: 'FishMarketCap Research',
    date: 'July 15, 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=800&q=80',
  },
]

const DEFAULT_SUPPLIER_FEED: SupplierPostFeed[] = [
  {
    id: 'supp-feed-1',
    supplierName: 'Norsk Seafood Ltd',
    title: 'Fresh Harvest Norwegian Atlantic Salmon Stock Ready for EU Export',
    productName: 'Atlantic Salmon',
    pricePerKg: '7.80 EUR / kg',
    freshFrozen: 'Fresh',
    location: 'Alesund Port, Norway',
    availability: 'In Stock — Ready to Ship',
    supplierInfoExtra: 'ASC & MSC certified. Global cold chain delivery within 48h to Rotterdam & Zeebrugge ports.',
    date: 'Today at 09:30 AM',
  },
  {
    id: 'supp-feed-2',
    supplierName: 'Amacore Seafood B.V.',
    title: 'New Shipment of Pacific Vannamei Shrimp Arriving at Rotterdam',
    productName: 'Vannamei Shrimp',
    pricePerKg: '6.50 EUR / kg',
    freshFrozen: 'Frozen (IQF)',
    location: 'Rotterdam Port, Netherlands',
    availability: 'Available within 3 days',
    supplierInfoExtra: 'Grade A IQF peeled & deveined shrimp. Full EU health certificates available.',
    date: 'Yesterday at 04:15 PM',
  },
  {
    id: 'supp-feed-3',
    supplierName: 'Iberia Seafood S.A.',
    title: 'Sashimi Grade Bluefin Tuna Loins Available for Immediate Dispatch',
    productName: 'Bluefin Tuna',
    pricePerKg: '14.50 EUR / kg',
    freshFrozen: 'Frozen (-60°C)',
    location: 'Vigo Port, Spain',
    availability: 'In Stock — Ready to Ship',
    supplierInfoExtra: 'Ultra-deep frozen sashimi quality. HACCP certified with full traceability documentation.',
    date: 'August 7, 2026',
  },
]

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<'market_feed' | 'all' | 'market_update' | 'trade'>('all')
  const [supplierPosts, setSupplierPosts] = useState<SupplierPostFeed[]>(DEFAULT_SUPPLIER_FEED)

  // Load any local supplier posts created by users
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('supplier_posts') || '[]')
        if (stored && Array.isArray(stored) && stored.length > 0) {
          const formatted: SupplierPostFeed[] = stored.map((p: any) => {
            let parsed = p
            if (typeof p.content === 'string') {
              try { parsed = { ...p, ...JSON.parse(p.content) } } catch (_) {}
            }
            return {
              id: p.id || 'sp-' + Math.random(),
              supplierName: p.company_name || 'Verified Seafood Supplier',
              title: `${parsed.product_name || parsed.productName || 'Seafood Stock'} — Available for Dispatch`,
              productName: parsed.product_name || parsed.productName || 'Seafood Stock',
              pricePerKg: parsed.price_per_kg || parsed.pricePerKg ? `${parsed.currency || 'EUR'} ${parsed.price_per_kg || parsed.pricePerKg} / kg` : 'Contact Supplier',
              freshFrozen: parsed.fresh_frozen || parsed.freshFrozen || 'Frozen',
              location: parsed.location || 'EU Port',
              availability: parsed.availability || 'In Stock',
              supplierInfoExtra: parsed.supplier_info_extra || parsed.supplierInfoExtra || 'Export quality seafood stock.',
              date: new Date(p.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            }
          })
          setSupplierPosts([...formatted, ...DEFAULT_SUPPLIER_FEED])
        }
      } catch (_) {}
    }
  }, [])

  const [featured, ...restArticles] = NEWS_ARTICLES

  return (
    <main className="min-h-screen bg-transparent pb-16">
      {/* Page Header */}
      <div className="border-b border-white/50 bg-transparent py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Seafood Market News & Feed</h1>
              <p className="mt-2 text-slate-500 text-sm">Latest industry insights, price updates, and verified supplier market announcements.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
                <Rss className="h-3.5 w-3.5" /> Live Feed Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Sub-Tabs Navigation (Market Feed / All News / Market Update / Trade) */}
        <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 max-w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#022B96] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            🗞️ All News
          </button>

          <button
            onClick={() => setActiveTab('market_feed')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'market_feed'
                ? 'bg-[#022B96] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            📢 Market Feed (Supplier News)
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-blue-400/30 text-white rounded-full">
              {supplierPosts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('market_update')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'market_update'
                ? 'bg-[#022B96] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            📊 Market Updates
          </button>

          <button
            onClick={() => setActiveTab('trade')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'trade'
                ? 'bg-[#022B96] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            📦 Trade & Regulations
          </button>
        </div>

        {/* SUB TAB 1: SUPPLIER MARKET FEED (Posts from suppliers) */}
        {activeTab === 'market_feed' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Supplier Market Feed
              </h2>
              <span className="text-xs text-slate-400">Live announcements from verified exporters</span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {supplierPosts.map((post) => (
                <div key={post.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#022B96] flex items-center justify-center font-bold text-sm border border-blue-100">
                        {post.supplierName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          {post.supplierName}
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                        </h4>
                        <span className="text-[11px] text-slate-400">Verified Seafood Supplier</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">{post.date}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{post.title}</h3>
                    <p className="text-sm font-extrabold text-[#022B96] mt-1">{post.pricePerKg}</p>
                  </div>

                  {/* Stock specifications */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Product</span>
                      <span className="font-bold text-slate-800">{post.productName}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Condition</span>
                      <span className="font-bold text-slate-800">❄️ {post.freshFrozen}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Location</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-500" /> {post.location}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Availability</span>
                      <span className="font-bold text-emerald-700">{post.availability}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <strong>Supplier Note:</strong> {post.supplierInfoExtra}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <Link href="/requests/buyer">
                      <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl transition cursor-pointer">
                        Request Quote / Offer <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* STANDARD NEWS ARTICLES */
          <div>
            {/* Featured Article */}
            <Link href={`/news/${featured.slug}`} className="group block mb-12">
              <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                <div className="h-64 md:h-auto overflow-hidden">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-8 flex flex-col justify-between bg-white">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#022B96] bg-blue-50 px-2.5 py-1 rounded-md">
                      {featured.category}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#022B96] transition-colors leading-snug mt-3 mb-3">
                      {featured.title}
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed">{featured.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{featured.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featured.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Article Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restArticles
                .filter((art) => {
                  if (activeTab === 'market_update') return art.category === 'Market Update'
                  if (activeTab === 'trade') return art.category === 'Trade' || art.category === 'Regulation'
                  return true
                })
                .map((article) => (
                  <Link href={`/news/${article.slug}`} key={article.slug} className="group block">
                    <div className="border border-slate-200 rounded-3xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300 h-full flex flex-col bg-white">
                      <div className="h-44 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md self-start mb-2">
                          {article.category}
                        </span>

                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#022B96] transition-colors leading-snug mb-2 flex-1">
                          {article.title}
                        </h3>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                          {article.excerpt}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-3 border-t border-slate-100 mt-auto">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{article.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

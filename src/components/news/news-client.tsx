'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Rss, Building2, MapPin, Newspaper } from 'lucide-react'
import { NewsArticle, fetchNewsArticles } from '@/lib/data/news-data'

export interface SupplierPostFeed {
  id: string
  supplierName: string
  companySlug: string
  logoUrl: string | null
  title: string
  productName: string
  pricePerKg: string
  freshFrozen: string
  location: string
  availability: string
  supplierInfoExtra: string
  date: string
}

interface NewsClientProps {
  initialArticles: NewsArticle[]
  initialSupplierPosts: SupplierPostFeed[]
}

export function NewsClient({ initialArticles, initialSupplierPosts }: NewsClientProps) {
  const [activeTab, setActiveTab] = useState<'market_feed' | 'all' | 'market_update' | 'trade'>('all')
  const [supplierPosts] = useState<SupplierPostFeed[]>(initialSupplierPosts)
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles)

  // Listen for admin real-time local updates
  useEffect(() => {
    const handleUpdate = () => {
      fetchNewsArticles().then((data) => setArticles(data)).catch(() => {})
    }
    window.addEventListener('news-articles-updated', handleUpdate)
    return () => window.removeEventListener('news-articles-updated', handleUpdate)
  }, [])

  const [featured, ...restArticles] = articles

  return (
    <main className="min-h-screen bg-transparent pb-16 w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="border-b border-white/50 bg-transparent py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
                Seafood Market News & Feed
              </h1>
              <p className="mt-1.5 sm:mt-2 text-slate-500 text-xs sm:text-sm">
                Latest industry insights, price updates, and verified supplier market announcements.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
                <Rss className="h-3.5 w-3.5" /> Live Feed Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 w-full min-w-0">
        {/* Tabs - horizontal scrolling on mobile, nice row on desktop */}
        <div className="mb-6 sm:mb-8 overflow-x-auto no-scrollbar pb-1 w-full max-w-full">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 min-w-max">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'all' ? 'bg-[#022B96] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
            >
              🗞️ All News
            </button>
            <button
              onClick={() => setActiveTab('market_feed')}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'market_feed' ? 'bg-[#022B96] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
            >
              📢 Market Feed (Supplier News)
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-blue-400/30 text-white rounded-full">{supplierPosts.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('market_update')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'market_update' ? 'bg-[#022B96] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
            >
              📊 Market Updates
            </button>
            <button
              onClick={() => setActiveTab('trade')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'trade' ? 'bg-[#022B96] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
            >
              📦 Trade & Regulations
            </button>
          </div>
        </div>

        {/* SUPPLIER MARKET FEED */}
        {activeTab === 'market_feed' ? (
          <div className="space-y-6 w-full min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Supplier Market Feed
              </h2>
              <span className="text-xs text-slate-400">Live announcements from verified exporters</span>
            </div>

            {supplierPosts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl">
                <Building2 className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-base font-semibold text-slate-500 mb-1">No supplier posts yet</p>
                <p className="text-sm text-slate-400">Supplier product listings will appear here once posted.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 w-full min-w-0">
                {supplierPosts.map((post) => (
                  <div key={post.id} className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition space-y-4 min-w-0 overflow-hidden w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#022B96] flex items-center justify-center font-bold text-sm border border-blue-100 overflow-hidden shrink-0">
                          {post.logoUrl
                            ? <img src={post.logoUrl} alt={post.supplierName} className="w-full h-full object-cover" />
                            : post.supplierName.charAt(0)
                          }
                        </div>
                        <div className="min-w-0 truncate">
                          {post.companySlug ? (
                            <Link href={`/suppliers/${post.companySlug}`} className="font-extrabold text-slate-900 text-sm hover:text-[#022B96] transition-colors truncate block">
                              {post.supplierName}
                            </Link>
                          ) : (
                            <h4 className="font-extrabold text-slate-900 text-sm truncate">{post.supplierName}</h4>
                          )}
                          <span className="text-[11px] text-slate-400 block">Verified Seafood Supplier</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold shrink-0">{post.date}</span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug break-words [overflow-wrap:anywhere]">{post.title}</h3>
                      <p className="text-sm font-extrabold text-[#022B96] mt-1">{post.pricePerKg}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                      <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100 min-w-0 overflow-hidden">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Product</span>
                        <span className="font-bold text-slate-800 truncate block">{post.productName}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100 min-w-0 overflow-hidden">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Condition</span>
                        <span className="font-bold text-slate-800 truncate block">❄️ {post.freshFrozen}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100 min-w-0 overflow-hidden">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Location</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 text-red-500 shrink-0" /> {post.location}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100 min-w-0 overflow-hidden">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Availability</span>
                        <span className="font-bold text-emerald-700 truncate block">{post.availability.replace(' — Ready to Ship', '')}</span>
                      </div>
                    </div>

                    {post.supplierInfoExtra && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 break-words [overflow-wrap:anywhere]">
                        <strong>Supplier Note:</strong> {post.supplierInfoExtra}
                      </p>
                    )}

                    <div className="pt-2 flex justify-end">
                      <Link href="/requests/buyer" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs">
                          Request Quote / Offer <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* STANDARD NEWS ARTICLES */
          <div className="w-full min-w-0">
            {articles.length === 0 ? (
              <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl">
                <Newspaper className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-base font-semibold text-slate-600 mb-1">No news articles published yet</p>
                <p className="text-sm text-slate-400">Articles published by the admin will appear here.</p>
              </div>
            ) : (
              <>
                {/* Featured Article */}
                {featured && (
                  <Link href={`/news/${featured.slug}`} className="group block mb-8 sm:mb-10 w-full min-w-0 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg transition-all duration-300 w-full min-w-0">
                      <div className="h-48 sm:h-64 md:h-full min-h-[180px] sm:min-h-[220px] bg-slate-100 flex items-center justify-center overflow-hidden w-full">
                        {featured.image ? (
                          <img
                            src={featured.image}
                            alt={featured.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50/50 text-[#022B96]">
                            <Newspaper className="w-16 h-16 opacity-40" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 sm:p-8 flex flex-col justify-between min-w-0 overflow-hidden">
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#022B96] bg-blue-50 px-2.5 py-1 rounded-md inline-block mb-3">
                            {featured.category}
                          </span>
                          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 group-hover:text-[#022B96] transition-colors leading-snug mb-3 break-words [overflow-wrap:anywhere]">
                            {featured.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed break-words [overflow-wrap:anywhere] line-clamp-3">
                            {featured.excerpt}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{featured.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featured.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Article Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full min-w-0">
                  {restArticles
                    .filter((art: NewsArticle) => {
                      if (activeTab === 'market_update') return art.category === 'Market Update'
                      if (activeTab === 'trade') return art.category === 'Trade' || art.category === 'Regulation'
                      return true
                    })
                    .map((article: NewsArticle) => (
                      <Link href={`/news/${article.slug}`} key={article.slug} className="group block w-full min-w-0 overflow-hidden">
                        <div className="border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300 h-full flex flex-col bg-white w-full min-w-0">
                          {article.image && (
                            <div className="h-44 overflow-hidden w-full bg-slate-100">
                              <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}
                          <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0 overflow-hidden">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md self-start mb-2">
                              {article.category}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#022B96] transition-colors leading-snug mb-2 flex-1 break-words [overflow-wrap:anywhere]">
                              {article.title}
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 break-words [overflow-wrap:anywhere]">
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
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

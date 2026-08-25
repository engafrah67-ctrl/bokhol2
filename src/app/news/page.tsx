'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Rss, Building2, MapPin, Loader2, Newspaper } from 'lucide-react'
import { fetchNewsArticles, NewsArticle } from '@/lib/data/news-data'
import { createClient } from '@/lib/supabase/client'

interface SupplierPostFeed {
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

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<'market_feed' | 'all' | 'market_update' | 'trade'>('all')
  const [supplierPosts, setSupplierPosts] = useState<SupplierPostFeed[]>([])
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loadingNews, setLoadingNews] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(true)

  // Load real news articles from DB
  useEffect(() => {
    fetchNewsArticles().then((data) => {
      setArticles(data)
      setLoadingNews(false)
    }).catch(() => setLoadingNews(false))

    const handleUpdate = () => {
      fetchNewsArticles().then((data) => setArticles(data)).catch(() => {})
    }
    window.addEventListener('news-articles-updated', handleUpdate)
    return () => window.removeEventListener('news-articles-updated', handleUpdate)
  }, [])

  // Load real supplier posts from Supabase
  useEffect(() => {
    async function loadSupplierPosts() {
      const supabase = createClient()
      try {
        const { data: posts } = await supabase
          .from('supplier_posts')
          .select(`
            id, title, content, created_at,
            companies(id, name, slug, logo_url, city)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(20)

        if (posts && posts.length > 0) {
          const formatted: SupplierPostFeed[] = posts.map((post: any) => {
            let details: any = {}
            try { details = JSON.parse(post.content || '{}') } catch (_) {}

            const company = Array.isArray(post.companies) ? post.companies[0] : post.companies
            const price = details.pricePerKg
            const currency = details.currency || 'EUR'

            return {
              id: post.id,
              supplierName: company?.name || 'Verified Supplier',
              companySlug: company?.slug || '',
              logoUrl: company?.logo_url || null,
              title: `${details.productName || post.title?.split(' —')[0] || 'Seafood'} — Available for Dispatch`,
              productName: details.productName || post.title?.split(' —')[0] || 'Seafood',
              pricePerKg: price ? `${currency} ${Number(price).toFixed(2)} / kg` : 'Contact Supplier',
              freshFrozen: details.freshFrozen || 'Frozen',
              location: details.location || (company?.city ? company.city : 'EU Port'),
              availability: details.availability || 'In Stock — Ready to Ship',
              supplierInfoExtra: details.supplierInfoExtra || '',
              date: new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            }
          })
          setSupplierPosts(formatted)
        }
      } catch (err) {
        console.error('Failed to load supplier feed:', err)
      } finally {
        setLoadingPosts(false)
      }
    }
    loadSupplierPosts()
  }, [])

  const [featured, ...restArticles] = articles

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

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 max-w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'all' ? 'bg-[#022B96] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
          >
            🗞️ All News
          </button>
          <button
            onClick={() => setActiveTab('market_feed')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'market_feed' ? 'bg-[#022B96] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
          >
            📢 Market Feed (Supplier News)
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-blue-400/30 text-white rounded-full">{supplierPosts.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('market_update')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'market_update' ? 'bg-[#022B96] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
          >
            📊 Market Updates
          </button>
          <button
            onClick={() => setActiveTab('trade')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'trade' ? 'bg-[#022B96] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
          >
            📦 Trade & Regulations
          </button>
        </div>

        {/* SUPPLIER MARKET FEED */}
        {activeTab === 'market_feed' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Supplier Market Feed
              </h2>
              <span className="text-xs text-slate-400">Live announcements from verified exporters</span>
            </div>

            {loadingPosts ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-[#022B96]" />
                <span className="text-sm">Loading supplier posts...</span>
              </div>
            ) : supplierPosts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl">
                <Building2 className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-base font-semibold text-slate-500 mb-1">No supplier posts yet</p>
                <p className="text-sm text-slate-400">Supplier product listings will appear here once posted.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {supplierPosts.map((post) => (
                  <div key={post.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#022B96] flex items-center justify-center font-bold text-sm border border-blue-100 overflow-hidden shrink-0">
                          {post.logoUrl
                            ? <img src={post.logoUrl} alt={post.supplierName} className="w-full h-full object-cover" />
                            : post.supplierName.charAt(0)
                          }
                        </div>
                        <div>
                          {post.companySlug ? (
                            <Link href={`/suppliers/${post.companySlug}`} className="font-extrabold text-slate-900 text-sm hover:text-[#022B96] transition-colors">
                              {post.supplierName}
                            </Link>
                          ) : (
                            <h4 className="font-extrabold text-slate-900 text-sm">{post.supplierName}</h4>
                          )}
                          <span className="text-[11px] text-slate-400">Verified Seafood Supplier</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">{post.date}</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{post.title}</h3>
                      <p className="text-sm font-extrabold text-[#022B96] mt-1">{post.pricePerKg}</p>
                    </div>

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
                        <span className="font-bold text-emerald-700">{post.availability.replace(' — Ready to Ship', '')}</span>
                      </div>
                    </div>

                    {post.supplierInfoExtra && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <strong>Supplier Note:</strong> {post.supplierInfoExtra}
                      </p>
                    )}

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
            )}
          </div>
        ) : (
          /* STANDARD NEWS ARTICLES */
          <div>
            {loadingNews ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-[#022B96]" />
                <span className="text-sm">Loading news...</span>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl">
                <Newspaper className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-base font-semibold text-slate-600 mb-1">No news articles published yet</p>
                <p className="text-sm text-slate-400">Articles published by the admin will appear here.</p>
              </div>
            ) : (
              <>
                {/* Featured */}
                {featured && (
                  <Link href={`/news/${featured.slug}`} className="group block mb-10">
                    <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                      <div className="h-64 md:h-full min-h-[220px] bg-slate-100 flex items-center justify-center overflow-hidden">
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
                      <div className="p-8 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#022B96] bg-blue-50 px-2.5 py-1 rounded-md">
                            {featured.category}
                          </span>
                          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#022B96] transition-colors leading-snug mt-3 mb-3">
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
                )}

                {/* Article Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restArticles
                    .filter((art: NewsArticle) => {
                      if (activeTab === 'market_update') return art.category === 'Market Update'
                      if (activeTab === 'trade') return art.category === 'Trade' || art.category === 'Regulation'
                      return true
                    })
                    .map((article: NewsArticle) => (
                      <Link href={`/news/${article.slug}`} key={article.slug} className="group block">
                        <div className="border border-slate-200 rounded-3xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300 h-full flex flex-col bg-white">
                          {article.image && (
                            <div className="h-44 overflow-hidden">
                              <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}
                          <div className="p-5 flex flex-col flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md self-start mb-2">
                              {article.category}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#022B96] transition-colors leading-snug mb-2 flex-1">
                              {article.title}
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
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

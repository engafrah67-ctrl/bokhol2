'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, TrendingUp, Globe, Clock, ChevronRight, Fish } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { BlurGate } from '@/components/blur-gate'
import { createClient } from '@/lib/supabase/client'
import { getFishImageForProduct } from '@/lib/data/products-data'

const CATEGORIES = ['All', 'Finfish', 'Shellfish', 'Cephalopods']

function getCategory(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('shrimp') || lower.includes('crab') || lower.includes('mussel') || lower.includes('lobster') || lower.includes('oyster') || lower.includes('scallop')) return 'Shellfish'
  if (lower.includes('squid') || lower.includes('octopus') || lower.includes('cuttlefish')) return 'Cephalopods'
  return 'Finfish'
}

export interface ProductCard {
  slug: string
  name: string
  category: string
  imageUrl: string
  suppliersCount: number
  avgPrice: string
  priceRange: string
  topOrigin: string
  lastUpdated: string
  suppliers: { name: string; logoUrl: string | null }[]
}

interface ProductsClientProps {
  initialProducts: ProductCard[]
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<ProductCard[]>(initialProducts)

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const fetchLiveProducts = useCallback(async () => {
    try {
      const supabase = createClient()
      const [postsRes, catalogRes] = await Promise.all([
        supabase
          .from('supplier_posts')
          .select('id, title, content, created_at, updated_at, company_id, companies(id, name, logo_url)')
          .eq('is_published', true),
        supabase
          .from('products')
          .select('name, slug, category, image_url')
      ])

      const posts = postsRes.data || []
      const catalogProducts = catalogRes.data || []

      const catalogMap = new Map<string, any>()
      for (const prod of catalogProducts) {
        catalogMap.set(prod.name.toLowerCase().trim(), prod)
      }

      const postGroups = new Map<string, {
        displayName: string
        prices: number[]
        minPrices: number[]
        maxPrices: number[]
        origins: string[]
        latestDate: string
        currency: string
        customImages: string[]
        supplierMap: Map<string, { name: string; logoUrl: string | null }>
      }>()

      for (const post of posts) {
        let details: any = {}
        try { details = JSON.parse(post.content || '{}') } catch (_) {}

        const rawName: string = details.productName || post.title?.split(/\s*[-\u2014\u2013]\s*/)[0] || ''
        if (!rawName.trim()) continue

        const name = rawName.trim()
        const key = name.toLowerCase()

        const explicitSingle = parseFloat(details.pricePerKg || 0)
        const explicitMin = parseFloat(details.minPricePerKg || 0)
        const explicitMax = parseFloat(details.maxPricePerKg || 0)

        let minPrice = 0
        let maxPrice = 0

        if (explicitSingle > 0) {
          minPrice = explicitSingle
          maxPrice = explicitMax > explicitSingle ? explicitMax : 0
        } else if (explicitMin > 0) {
          minPrice = explicitMin
          maxPrice = explicitMax > explicitMin ? explicitMax : 0
        }

        const price = minPrice
        const origin = details.countryOfOrigin || ''
        const date = details.lastAdminUpdate || details.lastUpdated || post.updated_at || post.created_at || ''
        const currency = details.currency || 'EUR'
        const customImg = details.customImage || ''

        const compRel: any = Array.isArray((post as any).companies) ? (post as any).companies[0] : (post as any).companies
        const supplierId: string = (post as any).company_id || compRel?.id || ''
        const supplierName: string = compRel?.name || details.companyName || ''
        const supplierLogo: string | null = compRel?.logo_url || details.companyLogo || null

        if (postGroups.has(key)) {
          const existing = postGroups.get(key)!
          if (price > 0) existing.prices.push(price)
          if (minPrice > 0) existing.minPrices.push(minPrice)
          if (maxPrice > 0) existing.maxPrices.push(maxPrice)
          if (origin) existing.origins.push(origin)
          if (date > existing.latestDate) existing.latestDate = date
          if (customImg) existing.customImages.push(customImg)
          if (supplierId && supplierName && !existing.supplierMap.has(supplierId)) {
            existing.supplierMap.set(supplierId, { name: supplierName, logoUrl: supplierLogo })
          }
        } else {
          const supplierMap = new Map<string, { name: string; logoUrl: string | null }>()
          if (supplierId && supplierName) supplierMap.set(supplierId, { name: supplierName, logoUrl: supplierLogo })
          postGroups.set(key, {
            displayName: name,
            prices: price > 0 ? [price] : [],
            minPrices: minPrice > 0 ? [minPrice] : [],
            maxPrices: maxPrice > 0 ? [maxPrice] : [],
            origins: origin ? [origin] : [],
            latestDate: date,
            currency,
            customImages: customImg ? [customImg] : [],
            supplierMap,
          })
        }
      }

      const cards: ProductCard[] = Array.from(postGroups.entries()).map(([key, group]) => {
        const cat = catalogMap.get(key)
        const name = cat?.name || group.displayName || key.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        const slug = cat?.slug || key.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        const avgPriceNum = group.prices.length > 0
          ? (group.prices.reduce((a: number, b: number) => a + b, 0) / group.prices.length)
          : null
        const overallMin = group.minPrices.length > 0 ? Math.min(...group.minPrices) : avgPriceNum
        const overallMax = group.maxPrices.length > 0 ? Math.max(...group.maxPrices) : null
        const symbol = group.currency === 'USD' ? '$' : group.currency === 'GBP' ? 'pound' : 'euro'
        const sym = symbol === 'pound' ? '£' : symbol === 'euro' ? '€' : '$'

        const avgPrice = avgPriceNum ? (sym + avgPriceNum.toFixed(2) + ' / kg') : 'Contact for price'
        const priceRange = overallMin && overallMin > 0
          ? overallMax && overallMax > overallMin
            ? (sym + overallMin.toFixed(2) + ' – ' + sym + overallMax.toFixed(2) + ' / kg')
            : (sym + overallMin.toFixed(2) + ' / kg')
          : 'Contact for price'

        const originCounts = group.origins.reduce((acc: Record<string, number>, o: string) => {
          acc[o] = (acc[o] || 0) + 1; return acc
        }, {})
        const topOrigin = Object.entries(originCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'Europe'

        const lastUpdated = group.latestDate
          ? new Date(group.latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Recently'

        const displayImg = getFishImageForProduct(name, group.customImages[0])
        const suppliers = Array.from(group.supplierMap.values()).slice(0, 4)

        return {
          slug,
          name,
          category: cat?.category || getCategory(name),
          imageUrl: displayImg,
          suppliersCount: group.prices.length || 1,
          avgPrice,
          priceRange,
          topOrigin,
          lastUpdated,
          suppliers,
        }
      })

      cards.sort((a, b) => b.suppliersCount - a.suppliersCount || a.name.localeCompare(b.name))
      setProducts(cards)
    } catch (err) {
      console.error('Failed to live-refresh products:', err)
    }
  }, [])

  useEffect(() => {
    fetchLiveProducts()

    const supabase = createClient()
    const channel = supabase
      .channel('realtime:products_posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'supplier_posts' }, () => {
        fetchLiveProducts()
      })
      .subscribe()

    const onFocus = () => fetchLiveProducts()
    window.addEventListener('focus', onFocus)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('focus', onFocus)
    }
  }, [fetchLiveProducts])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="min-h-screen bg-transparent pb-16">
      <section className="relative overflow-hidden py-16 flex flex-col items-center text-center mb-8 border-b border-slate-200/60">
        <div className="relative z-10 max-w-3xl mx-auto px-4 flex flex-col items-center">
          <span className="text-[11px] font-extrabold text-[#022B96] uppercase tracking-widest bg-blue-50 border border-blue-200/70 px-3 py-1.5 rounded-full mb-5">
            Live Market Directory
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Seafood Products
          </h1>
          <p className="text-slate-500 text-base mt-3 max-w-xl leading-relaxed">
            Browse live supplier offers across{' '}
            <strong className="text-slate-700">{products.length}</strong> species. Updated in real-time by verified exporters worldwide.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 w-full max-w-lg bg-white border border-slate-200 p-1.5 rounded-2xl flex items-center shadow-sm focus-within:border-[#022B96] focus-within:ring-2 focus-within:ring-blue-100 transition-all"
          >
            <div className="flex items-center pl-3.5 pr-2 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search by species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 outline-none text-slate-900 placeholder-slate-400 flex-1 min-w-0 py-2 pr-2 text-sm"
            />
            <button
              type="submit"
              className="flex-none bg-[#022B96] hover:bg-[#011a5e] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 text-sm font-semibold rounded-full border transition-all cursor-pointer ${
                activeCategory === category
                  ? 'bg-[#022B96] text-white border-[#022B96] shadow-md shadow-blue-900/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <Link href={`/products/${product.slug}`} key={product.slug} className="block group">
                <div className="bg-white border border-slate-200/90 rounded-2xl hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full overflow-hidden">

                  <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        {product.category}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight mt-0.5 group-hover:text-[#022B96] transition-colors truncate">
                        {product.name}
                      </h3>
                    </div>
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors mt-0.5">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#022B96] transition-colors" />
                    </div>
                  </div>

                  <div className="w-full px-6 py-4 bg-slate-50/80 flex items-center justify-center" style={{ minHeight: 140 }}>
                    <div className="w-full h-28 relative">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        style={{ filter: 'brightness(1.05) contrast(1.1)' }}
                      />
                    </div>
                  </div>

                  <div className="px-4 py-2.5 border-t border-slate-100 bg-gradient-to-r from-blue-50/90 to-indigo-50/60">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <TrendingUp className="w-3 h-3" />
                        Price range
                      </div>
                      <span className="font-extrabold text-[#022B96] text-sm">
                        <BlurGate>{product.priceRange || product.avgPrice}</BlurGate>
                      </span>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-3 text-xs space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Fish className="w-3 h-3 text-slate-400" />
                        Live offers
                      </span>
                      <span className="font-bold text-slate-800">
                        <BlurGate>{product.suppliersCount}</BlurGate>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Globe className="w-3 h-3 text-slate-400" />
                        Top origin
                      </span>
                      <span className="font-bold text-slate-800">{product.topOrigin}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        Last updated
                      </span>
                      <span className="font-medium text-slate-600">{product.lastUpdated}</span>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white border border-slate-200 rounded-2xl">
            <div className="text-5xl mb-4">fish</div>
            <p className="text-slate-700 font-bold text-lg mb-1">No products found</p>
            <p className="text-slate-400 text-sm">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "Suppliers haven't posted any products yet. Check back soon."}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
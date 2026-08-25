'use client'

import React, { useState, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { BlurGate } from '@/components/blur-gate'
import { createClient } from '@/lib/supabase/client'
import { getFishImageForProduct } from '@/lib/data/products-data'

const CATEGORIES = ['All', 'Finfish', 'Shellfish', 'Cephalopods']

interface ProductCard {
  slug: string
  name: string
  category: string
  imageUrl: string
  suppliersCount: number
  avgPrice: string
  topOrigin: string
  lastUpdated: string
}

function getCategory(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('shrimp') || lower.includes('crab') || lower.includes('mussel') || lower.includes('lobster') || lower.includes('oyster') || lower.includes('scallop')) return 'Shellfish'
  if (lower.includes('squid') || lower.includes('octopus') || lower.includes('cuttlefish')) return 'Cephalopods'
  return 'Finfish'
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<ProductCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRealProducts() {
      const supabase = createClient()
      try {
        // Fetch all published supplier posts
        const { data: posts } = await supabase
          .from('supplier_posts')
          .select('id, title, content, created_at, updated_at, company_id')
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (!posts || posts.length === 0) {
          setProducts([])
          setLoading(false)
          return
        }

        // Aggregate posts by product name
        const productMap = new Map<string, {
          name: string
          prices: number[]
          origins: string[]
          latestDate: string
          currency: string
        }>()

        for (const post of posts) {
          let details: any = {}
          try { details = JSON.parse(post.content || '{}') } catch (_) {}

          const name: string = details.productName || post.title?.split(' —')[0] || ''
          if (!name) continue

          const key = name.toLowerCase().trim()
          const price = parseFloat(details.pricePerKg || 0)
          const origin = details.countryOfOrigin || ''
          const date = post.updated_at || post.created_at || ''
          const currency = details.currency || 'EUR'

          if (productMap.has(key)) {
            const existing = productMap.get(key)!
            if (price > 0) existing.prices.push(price)
            if (origin) existing.origins.push(origin)
            if (date > existing.latestDate) existing.latestDate = date
          } else {
            productMap.set(key, {
              name,
              prices: price > 0 ? [price] : [],
              origins: origin ? [origin] : [],
              latestDate: date,
              currency,
            })
          }
        }

        // Convert map to ProductCard array
        const cards: ProductCard[] = Array.from(productMap.entries()).map(([, data]) => {
          const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
          const avgPrice = data.prices.length > 0
            ? (data.prices.reduce((a, b) => a + b, 0) / data.prices.length)
            : null
          const symbol = data.currency === 'USD' ? '$' : data.currency === 'GBP' ? '£' : '€'

          // Most common origin
          const originCounts = data.origins.reduce((acc: Record<string, number>, o) => {
            acc[o] = (acc[o] || 0) + 1; return acc
          }, {})
          const topOrigin = Object.entries(originCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

          const lastUpdated = data.latestDate
            ? new Date(data.latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—'

          return {
            slug,
            name: data.name,
            category: getCategory(data.name),
            imageUrl: getFishImageForProduct(data.name),
            suppliersCount: productMap.get(data.name.toLowerCase().trim())?.prices.length || 1,
            avgPrice: avgPrice ? `${symbol}${avgPrice.toFixed(2)} / kg` : 'Contact for price',
            topOrigin,
            lastUpdated,
          }
        })

        // Sort: most offers first
        cards.sort((a, b) => b.suppliersCount - a.suppliersCount)
        setProducts(cards)
      } catch (err) {
        console.error('Failed to load products:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchRealProducts()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="min-h-screen bg-transparent pb-12">
      {/* Hero Header */}
      <section className="relative overflow-hidden py-16 flex flex-col items-center text-center mb-10 border-b border-white/50">
        <div className="relative z-10 max-w-3xl mx-auto px-4 flex flex-col items-center">
          <span className="text-xs font-bold text-[#022B96] uppercase tracking-widest bg-[#022B96]/10 px-3 py-1.5 rounded-full mb-4">
            Live Market Directory
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Seafood Products
          </h1>
          <p className="text-slate-500 text-base mt-3 max-w-xl">
            Browse live supplier offers across {products.length} species. Updated in real-time by verified exporters worldwide.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 w-full max-w-lg bg-white/90 border border-blue-200 p-1.5 rounded-xl flex items-center shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all"
          >
            <div className="flex items-center pl-4 pr-3 text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search by species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 outline-none text-slate-900 placeholder-slate-400 flex-1 min-w-0 py-2 mr-2"
            />
            <button
              type="submit"
              className="flex-none bg-[#022B96] hover:bg-[#011a5e] text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${
                activeCategory === category
                  ? 'bg-[#022B96] text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#022B96]" />
            <span className="text-sm font-medium">Loading live offers...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <Link href={`/products/${product.slug}`} key={product.slug} className="block">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group cursor-pointer flex flex-col h-full">

                  {/* Card Header */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 flex justify-between items-center m-2 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#022B96] transition-colors text-sm">
                        {product.name}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{product.category}</span>
                    </div>
                    <span className="text-slate-400 group-hover:text-[#022B96] transition-colors font-medium text-lg">→</span>
                  </div>

                  {/* Image */}
                  <div className="w-full px-4 my-2">
                    <div className="w-full h-32 relative">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain mix-blend-multiply dark:mix-blend-screen dark:invert group-hover:scale-110 transition-transform duration-500"
                        style={{ filter: 'brightness(1.05) contrast(1.1)' }}
                      />
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="px-5 pb-5 mt-auto text-xs">
                    <div className="flex justify-between py-2.5 border-b border-slate-100">
                      <span className="text-slate-500">Live offers</span>
                      <span className="font-bold text-slate-800">
                        <BlurGate>{product.suppliersCount}</BlurGate>
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-slate-100">
                      <span className="text-slate-500">Avg. price</span>
                      <span className="font-bold text-slate-800">
                        <BlurGate>{product.avgPrice}</BlurGate>
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-slate-100">
                      <span className="text-slate-500">Top origin</span>
                      <span className="font-bold text-slate-800">{product.topOrigin}</span>
                    </div>
                    <div className="flex justify-between pt-2.5 pb-1">
                      <span className="text-slate-500">Last updated</span>
                      <span className="font-medium text-slate-800">{product.lastUpdated}</span>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="text-4xl mb-4">🐟</div>
            <p className="text-slate-600 font-semibold text-lg mb-1">No products listed yet</p>
            <p className="text-slate-400 text-sm">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : 'Suppliers haven\'t posted any products yet. Check back soon.'}
            </p>
          </div>
        )}

      </div>
    </main>
  )
}

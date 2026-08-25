'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import {
  ArrowLeft, ShieldCheck, MapPin, Filter,
  ChevronDown, MessageSquare,
  TrendingUp, Package, Snowflake, Droplets, Loader2, Fish,
} from 'lucide-react'
import { BlurGate } from '@/components/blur-gate'
import { getFishImageForProduct } from '@/lib/data/products-data'
import { createClient } from '@/lib/supabase/client'

const COUNTRY_FLAGS: Record<string, string> = {
  Norway: '🇳🇴', Spain: '🇪🇸', Greece: '🇬🇷', Iceland: '🇮🇸',
  Vietnam: '🇻🇳', Netherlands: '🇳🇱', 'Holland (Netherlands)': '🇳🇱', Holland: '🇳🇱',
  Germany: '🇩🇪', Belgium: '🇧🇪', Denmark: '🇩🇰', Morocco: '🇲🇦',
  Japan: '🇯🇵', Chile: '🇨🇱', Portugal: '🇵🇹', France: '🇫🇷',
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', Turkey: '🇹🇷', China: '🇨🇳', Peru: '🇵🇪',
}

function getCountryFlag(countryName: string): string {
  if (!countryName) return '🌍'
  if (COUNTRY_FLAGS[countryName]) return COUNTRY_FLAGS[countryName]
  const lower = countryName.toLowerCase()
  if (lower.includes('holland') || lower.includes('netherlands')) return '🇳🇱'
  if (lower.includes('germany')) return '🇩🇪'
  if (lower.includes('belgium')) return '🇧🇪'
  if (lower.includes('norway')) return '🇳🇴'
  if (lower.includes('spain')) return '🇪🇸'
  if (lower.includes('greece')) return '🇬🇷'
  if (lower.includes('iceland')) return '🇮🇸'
  if (lower.includes('scotland')) return '🏴󠁧󠁢󠁳󠁣󠁴󠁿'
  if (lower.includes('france')) return '🇫🇷'
  return '🌍'
}

interface SupplierOffer {
  id: string
  companyName: string
  companySlug: string
  logoUrl: string | null
  country: string
  location: string
  pricePerKg: number
  currency: string
  freshFrozen: string
  packaging: string
  sizeWeight: string
  availability: string
  supplierInfoExtra: string
  createdAt: string
}

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)

  // Convert slug back to product name (e.g. 'atlantic-salmon' → 'Atlantic Salmon')
  const productName = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const [filterFresh, setFilterFresh] = useState<'All' | 'Fresh' | 'Frozen'>('All')
  const [filterCountry, setFilterCountry] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'price' | 'availability'>('price')
  const [offers, setOffers] = useState<SupplierOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [countries, setCountries] = useState<string[]>([])

  useEffect(() => {
    async function fetchOffers() {
      const supabase = createClient()
      try {
        // Fetch published posts for this product name
        const { data: posts } = await supabase
          .from('supplier_posts')
          .select(`
            id, title, content, created_at, updated_at,
            companies!inner(id, name, slug, logo_url, city, country_id)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (!posts) { setLoading(false); return }

        // Filter to posts matching this product slug
        const matchingOffers: SupplierOffer[] = []
        const countrySet = new Set<string>()

        for (const post of posts as any[]) {
          let details: any = {}
          try { details = JSON.parse(post.content || '{}') } catch (_) {}

          const pName: string = details.productName || post.title?.split(' —')[0] || ''
          // Match by slug: normalize both to slug format
          const pSlug = pName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
          if (pSlug !== slug) continue

          // Supabase can return join as object or array — handle both
          const company = Array.isArray(post.companies) ? post.companies[0] : post.companies

          const country = details.countryOfOrigin || ''
          if (country) countrySet.add(country)

          matchingOffers.push({
            id: post.id,
            companyName: company?.name || 'Supplier',
            companySlug: company?.slug || '',
            logoUrl: company?.logo_url || null,
            country,
            location: details.location || (company?.city ? `${company.city}` : ''),
            pricePerKg: parseFloat(details.pricePerKg || 0),
            currency: details.currency || 'EUR',
            freshFrozen: details.freshFrozen || 'Frozen',
            packaging: details.packagingFillet || 'Standard',
            sizeWeight: details.sizeWeight || '—',
            availability: details.availability || 'In Stock — Ready to Ship',
            supplierInfoExtra: details.supplierInfoExtra || '',
            createdAt: post.created_at,
          })
        }

        setOffers(matchingOffers)
        setCountries(Array.from(countrySet).sort())
      } catch (err) {
        console.error('Failed to load product offers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [slug])

  const filteredOffers = offers
    .filter(o => filterFresh === 'All' || o.freshFrozen === filterFresh)
    .filter(o => filterCountry === 'All' || o.country.toLowerCase().includes(filterCountry.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price') return a.pricePerKg - b.pricePerKg
      return a.availability.localeCompare(b.availability)
    })

  const prices = offers.filter(o => o.pricePerKg > 0).map(o => o.pricePerKg)
  const avgPrice = prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : null
  const minPrice = prices.length > 0 ? Math.min(...prices).toFixed(2) : null
  const maxPrice = prices.length > 0 ? Math.max(...prices).toFixed(2) : null
  const currencySymbol = offers[0]?.currency === 'USD' ? '$' : offers[0]?.currency === 'GBP' ? '£' : '€'

  return (
    <main className="min-h-screen bg-transparent pb-20">

      {/* Header */}
      <div className="relative w-full px-4 sm:px-8 pt-7 pb-8 border-b border-white/50">
        <div className="relative z-10 max-w-6xl mx-auto">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#022B96] mb-6 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="h-28 w-28 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/80 shadow-sm shrink-0 overflow-hidden">
              <Image src={getFishImageForProduct(productName)} alt={productName} width={100} height={100} className="object-contain" />
            </div>
            <div>
              <span className="inline-block text-xs font-bold text-[#022B96] uppercase tracking-widest mb-2 bg-[#022B96]/10 px-3 py-1 rounded-full">Seafood Species</span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{productName}</h1>
              <p className="text-slate-500 text-sm mt-1">Live supplier offers from verified exporters</p>
            </div>
            <div className="sm:ml-auto flex flex-wrap gap-3">
              <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-xl px-4 py-3 text-center shadow-sm">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Avg. Price</p>
                <BlurGate>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {avgPrice ? <>{currencySymbol}{avgPrice}<span className="text-sm font-normal text-slate-400">/kg</span></> : '—'}
                  </p>
                </BlurGate>
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-xl px-4 py-3 text-center shadow-sm">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Offers</p>
                <BlurGate><p className="text-xl font-black text-slate-900 mt-1">{offers.length}</p></BlurGate>
              </div>
              {minPrice && maxPrice && (
                <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-xl px-4 py-3 text-center shadow-sm">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Price Range</p>
                  <BlurGate><p className="text-xl font-black text-slate-900 mt-1">{currencySymbol}{minPrice}–{maxPrice}</p></BlurGate>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 relative z-10 space-y-6">

        {/* Supplier Offers Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

          {/* Table Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Supplier Offers
              <span className="ml-2 text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{filteredOffers.length}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {/* Country Filter */}
              {countries.length > 0 && (
                <div className="relative">
                  <select
                    value={filterCountry}
                    onChange={e => setFilterCountry(e.target.value)}
                    className="appearance-none text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-7 outline-none cursor-pointer hover:border-slate-300 transition"
                  >
                    <option value="All">All Countries 🌍</option>
                    {countries.map(c => (
                      <option key={c} value={c}>{getCountryFlag(c)} {c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              )}

              {/* Fresh/Frozen Filter */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                {(['All', 'Fresh', 'Frozen'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterFresh(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      filterFresh === f ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {f === 'Fresh' ? '🧊 ' : f === 'Frozen' ? '❄️ ' : ''}{f}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="appearance-none text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-7 outline-none cursor-pointer"
                >
                  <option value="price">Sort: Lowest Price</option>
                  <option value="availability">Sort: Availability</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Column Headers */}
          <div className="hidden md:grid grid-cols-[1.8fr_0.8fr_0.9fr_1fr_1fr_auto] gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            {['Supplier', 'Price / kg', 'Fresh / Frozen', 'Packaging', 'Availability', ''].map(h => (
              <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-[#022B96]" />
                <span className="text-sm font-medium">Loading supplier offers...</span>
              </div>
            ) : filteredOffers.length > 0 ? (
              filteredOffers.map((offer, idx) => (
                <div
                  key={offer.id}
                  className={`px-5 py-4 grid md:grid-cols-[1.8fr_0.8fr_0.9fr_1fr_1fr_auto] gap-3 items-center hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors ${idx === 0 ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''}`}
                >
                  {/* Supplier */}
                  <div className="flex items-center gap-3 min-w-0">
                    {offer.companySlug ? (
                      <Link href={`/suppliers/${offer.companySlug}`} className="flex items-center gap-3 min-w-0 group/supplier">
                        <div className="h-10 w-10 rounded-xl bg-[#022B96]/10 dark:bg-blue-950/40 flex items-center justify-center text-[#022B96] dark:text-blue-400 font-black text-sm shrink-0 overflow-hidden group-hover/supplier:ring-2 group-hover/supplier:ring-[#022B96] transition-all">
                          {offer.logoUrl ? (
                            <img src={offer.logoUrl} alt={offer.companyName} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <span className="group-hover/supplier:text-white group-hover/supplier:bg-[#022B96] w-full h-full flex items-center justify-center rounded-xl transition-colors">{offer.companyName[0]}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover/supplier:text-[#022B96] transition-colors underline-offset-2 group-hover/supplier:underline">
                              {offer.companyName}
                            </span>
                            {idx === 0 && prices.length > 1 && (
                              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full shrink-0">BEST PRICE</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <span>{getCountryFlag(offer.country)}</span>
                            <span>{offer.country}</span>
                            {offer.location && <><span>·</span><MapPin className="h-3 w-3" /><span className="truncate">{offer.location}</span></>}
                          </div>
                          {offer.supplierInfoExtra && (
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{offer.supplierInfoExtra}</p>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-xl bg-[#022B96]/10 dark:bg-blue-950/40 flex items-center justify-center text-[#022B96] dark:text-blue-400 font-black text-sm shrink-0 overflow-hidden">
                          {offer.logoUrl ? (
                            <img src={offer.logoUrl} alt={offer.companyName} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            offer.companyName[0]
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{offer.companyName}</span>
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <span>{getCountryFlag(offer.country)}</span>
                            <span>{offer.country}</span>
                            {offer.location && <><span>·</span><MapPin className="h-3 w-3" /><span className="truncate">{offer.location}</span></>}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <BlurGate>
                      <span className="font-black text-slate-900 dark:text-white text-base">
                        {currencySymbol}{offer.pricePerKg > 0 ? offer.pricePerKg.toFixed(2) : '—'}
                      </span>
                      {offer.pricePerKg > 0 && <span className="text-xs text-slate-400 font-normal"> /kg</span>}
                    </BlurGate>
                  </div>

                  {/* Fresh/Frozen */}
                  <div className="flex items-center gap-1.5">
                    {offer.freshFrozen === 'Fresh'
                      ? <Droplets className="h-3.5 w-3.5 text-blue-400" />
                      : <Snowflake className="h-3.5 w-3.5 text-cyan-400" />}
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{offer.freshFrozen}</span>
                  </div>

                  {/* Packaging */}
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-tight">{offer.packaging}</span>
                  </div>

                  {/* Availability */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full ${
                      offer.availability.toLowerCase().includes('stock')
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${offer.availability.toLowerCase().includes('stock') ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {offer.availability.replace(' — Ready to Ship', '').replace(' — ', ' ')}
                    </span>
                  </div>

                  {/* CTA */}
                  <div>
                    <BlurGate>
                      {offer.companySlug ? (
                        <Link href={`/suppliers/${offer.companySlug}`}>
                          <button className="flex items-center gap-1.5 text-xs font-bold bg-[#022B96] hover:bg-[#011a5e] text-white px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Contact
                          </button>
                        </Link>
                      ) : (
                        <button className="flex items-center gap-1.5 text-xs font-bold bg-[#022B96] hover:bg-[#011a5e] text-white px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Contact
                        </button>
                      )}
                    </BlurGate>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 px-4">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Fish className="h-8 w-8 text-blue-300" />
                </div>
                <p className="text-base font-semibold text-slate-600 mb-1">No offers listed yet</p>
                <p className="text-sm text-slate-400">
                  {filterFresh !== 'All' || filterCountry !== 'All'
                    ? 'No results match your filters. Try adjusting them.'
                    : 'No supplier has posted this product yet.'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import {
  ArrowLeft, ShieldCheck, MapPin, Filter,
  ChevronDown, MessageSquare,
  TrendingUp, Package, Snowflake, Droplets, Loader2, Fish,
} from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'
import { BlurGate } from '@/components/blur-gate'
import { getFishImageForProduct, getFlagUrl } from '@/lib/data/products-data'
import { createClient } from '@/lib/supabase/client'
import { ProductMarketGraph } from '@/components/market/product-market-graph'
import { syncWithServerClaims } from '@/lib/data/companies-data'

const ALLOWED_COUNTRY_OPTIONS = [
  { value: 'All', label: 'All Countries 🌍' },
  { value: 'Germany', label: '🇩🇪 Germany' },
  { value: 'Norway', label: '🇳🇴 Norway' },
  { value: 'Netherlands', label: '🇳🇱 Netherlands (Holland)' },
  { value: 'Belgium', label: '🇧🇪 Belgium' },
]

function normalizeToFourCountries(countryName: string): { name: string; code: string } {
  const lower = (countryName || '').toLowerCase().trim()
  if (lower.includes('ger') || lower === 'de') return { name: 'Germany', code: 'DE' }
  if (lower.includes('nor') || lower === 'no') return { name: 'Norway', code: 'NO' }
  if (lower.includes('bel') || lower === 'be') return { name: 'Belgium', code: 'BE' }
  if (lower.includes('hol') || lower.includes('neth') || lower === 'nl') return { name: 'Netherlands', code: 'NL' }
  return { name: 'Netherlands', code: 'NL' }
}

function formatCleanLocation(loc: string, fallbackCountry: string): string {
  const raw = loc || fallbackCountry || ''
  if (!raw) return ''
  return raw
    .split(/[,·]/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(', ')
}

interface SupplierOffer {
  id: string
  companyName: string
  companySlug: string
  logoUrl: string | null
  country: string
  countryCode: string
  origin: string
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

  useEffect(() => {
    async function fetchOffers() {
      const supabase = createClient()
      try {
        // Pre-fetch directory companies so we know every supplier's registered nationality
        let directoryCompanies: any[] = []
        try {
          directoryCompanies = await syncWithServerClaims()
        } catch (_) {}

        // Fetch published posts for this product name
        const { data: posts } = await supabase
          .from('supplier_posts')
          .select(`
            id, title, content, created_at, updated_at,
            companies(id, name, slug, logo_url, city, country_id, countries(id, name, iso_code))
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        // Filter to posts matching this product slug
        const matchingOffers: SupplierOffer[] = []

        for (const post of (posts || []) as any[]) {
          let details: any = {}
          try { details = JSON.parse(post.content || '{}') } catch (_) {}

          const pName: string = details.productName || post.title?.split(' —')[0] || ''
          // Match by slug: normalize both to slug format
          const pSlug = pName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
          if (pSlug !== slug) continue

          // Supabase can return join as object or array — handle both
          const company = Array.isArray(post.companies) ? post.companies[0] : post.companies
          const companyCountryObj = Array.isArray(company?.countries) ? company?.countries[0] : company?.countries

          // Nationality depends on the supplier who posted this product:
          // 1. Supplier's registered company country from DB join
          let regCountry = companyCountryObj?.name || ''

          // 2. Lookup in directory / INITIAL_COMPANIES by company slug, id, or name
          if (!regCountry && company) {
            const matched = directoryCompanies.find(
              (c: any) =>
                (c.id && company.id && c.id === company.id) ||
                (c.slug && company.slug && c.slug === company.slug) ||
                (c.name && company.name && c.name.toLowerCase() === company.name.toLowerCase())
            )
            if (matched?.country) {
              regCountry = matched.country
            }
          }

          // 3. Fallback to details.countryOfOrigin if it specifies one of the countries
          if (!regCountry && details.countryOfOrigin) {
            regCountry = details.countryOfOrigin
          }

          // Normalize to one of the 4 supported countries (Germany, Norway, Netherlands, Belgium)
          const { name: countryName, code: countryCode } = normalizeToFourCountries(regCountry)
          const offerOrigin = details.countryOfOrigin || countryName || '—'

          matchingOffers.push({
            id: post.id,
            companyName: company?.name || 'Supplier',
            companySlug: company?.slug || '',
            logoUrl: company?.logo_url || null,
            country: countryName,
            countryCode,
            origin: offerOrigin,
            location: details.location || (company?.city ? `${company.city}` : ''),
            pricePerKg: parseFloat(details.pricePerKg ?? details.minPricePerKg ?? 0),
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
    .filter(o => {
      if (filterCountry === 'All') return true
      const oCountry = (o.country || '').toLowerCase()
      const oOrigin = (o.origin || '').toLowerCase()
      const fCountry = filterCountry.toLowerCase()
      if (fCountry.includes('neth') || fCountry.includes('hol')) {
        return oCountry.includes('neth') || oCountry.includes('hol') || oOrigin.includes('neth') || oOrigin.includes('hol')
      }
      return oCountry.includes(fCountry) || oOrigin.includes(fCountry)
    })
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
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">

      {/* Header Container */}
      <div className="w-full px-4 sm:px-8 pt-6 pb-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Products
          </Link>

          {/* Unified Product Header Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="h-20 w-24 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-700/60 shrink-0">
                <Image
                  src={getFishImageForProduct(productName)}
                  alt={productName}
                  width={80}
                  height={80}
                  className="object-contain max-h-full"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#022B96] uppercase tracking-wider block">
                  Seafood Species
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {productName}
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Live supplier offers from verified exporters
                </p>
              </div>
            </div>

            {/* Clean Key Metrics */}
            <div className="flex items-center divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 p-2 shrink-0">
              <div className="px-5 py-1 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Avg. Price
                </span>
                <BlurGate>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {avgPrice ? `${currencySymbol}${avgPrice}` : '—'}
                    <span className="text-xs font-normal text-slate-400">/kg</span>
                  </span>
                </BlurGate>
              </div>
              <div className="px-5 py-1 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Active Offers
                </span>
                <BlurGate>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {offers.length}
                  </span>
                </BlurGate>
              </div>
              {minPrice && maxPrice && (
                <div className="px-5 py-1 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Price Range
                  </span>
                  <BlurGate>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {currencySymbol}{minPrice}–{maxPrice}
                    </span>
                  </BlurGate>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-2 space-y-6">

        {/* Live Market Benchmark & Trend Graph */}
        <ProductMarketGraph
          productName={productName}
          currency={offers[0]?.currency || 'EUR'}
        />

        {/* Clean Supplier Offers Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">

          {/* Table Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Supplier Offers
              </h2>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                {filteredOffers.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Country Filter */}
              <div className="relative">
                <select
                  value={filterCountry}
                  onChange={e => setFilterCountry(e.target.value)}
                  className="appearance-none text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 pr-7 outline-none cursor-pointer hover:border-slate-300 transition"
                >
                  {ALLOWED_COUNTRY_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Condition Filter */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 gap-0.5">
                {(['All', 'Fresh', 'Frozen'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterFresh(f)}
                    className={`px-3 py-1 text-xs rounded-md transition cursor-pointer ${
                      filterFresh === f
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 font-medium'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="appearance-none text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 pr-7 outline-none cursor-pointer hover:border-slate-300 transition"
                >
                  <option value="price">Lowest Price</option>
                  <option value="availability">Availability</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Semantic Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-3 px-6 font-semibold">Supplier</th>
                  <th className="py-3 px-6 font-semibold">Top Origin</th>
                  <th className="py-3 px-6 font-semibold">Price</th>
                  <th className="py-3 px-6 font-semibold">Condition</th>
                  <th className="py-3 px-6 font-semibold">Packaging</th>
                  <th className="py-3 px-6 font-semibold">Availability</th>
                  <th className="py-3 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#022B96] mb-2" />
                      <span className="text-xs">Loading supplier offers...</span>
                    </td>
                  </tr>
                ) : filteredOffers.length > 0 ? (
                  filteredOffers.map((offer, idx) => (
                    <tr
                      key={offer.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* 1. Supplier */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 flex items-center justify-center text-[#022B96] font-bold text-xs shrink-0 overflow-hidden">
                            {offer.logoUrl ? (
                              <img src={offer.logoUrl} alt={offer.companyName} className="w-full h-full object-cover" />
                            ) : (
                              offer.companyName[0]
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {offer.companySlug ? (
                                <Link
                                  href={`/suppliers/${offer.companySlug}`}
                                  className="font-semibold text-slate-900 dark:text-white hover:text-[#022B96] transition-colors truncate"
                                >
                                  {offer.companyName}
                                </Link>
                              ) : (
                                <span className="font-semibold text-slate-900 dark:text-white truncate">
                                  {offer.companyName}
                                </span>
                              )}
                              {idx === 0 && prices.length > 1 && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded shrink-0">
                                  Best Price
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 truncate">
                              {formatCleanLocation(offer.location, offer.country)}
                              {offer.supplierInfoExtra && ` · ${offer.supplierInfoExtra.replace(/[()]/g, '')}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Top Origin */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getFlagUrl(offer.origin) ? (
                            <img
                              src={getFlagUrl(offer.origin)!}
                              alt={offer.origin}
                              className="h-3.5 w-5 object-cover rounded shadow-2xs border border-slate-200/60 shrink-0"
                            />
                          ) : (
                            <span className="text-xs">🏳️</span>
                          )}
                          <span className="font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {offer.origin}
                          </span>
                        </div>
                      </td>

                      {/* 3. Price */}
                      <td className="py-4 px-6">
                        <BlurGate>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {currencySymbol}{offer.pricePerKg > 0 ? offer.pricePerKg.toFixed(2) : '—'}
                          </span>
                          <span className="text-xs text-slate-400 font-normal"> /kg</span>
                        </BlurGate>
                      </td>

                      {/* 4. Condition */}
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                        {offer.freshFrozen}
                      </td>

                      {/* 5. Packaging */}
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                        {offer.packaging}
                      </td>

                      {/* 6. Availability */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {offer.availability.replace(' — Ready to Ship', '').replace(' — ', ' ')}
                        </span>
                      </td>

                      {/* 7. Action */}
                      <td className="py-4 px-6 text-right">
                        <BlurGate>
                          {offer.companySlug ? (
                            <Link href={`/suppliers/${offer.companySlug}`}>
                              <button className="text-xs font-semibold bg-[#022B96] hover:bg-[#011a5e] text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap">
                                Contact
                              </button>
                            </Link>
                          ) : (
                            <button className="text-xs font-semibold bg-[#022B96] hover:bg-[#011a5e] text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap">
                              Contact
                            </button>
                          )}
                        </BlurGate>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Fish className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-600 mb-0.5">No offers listed</p>
                      <p className="text-xs text-slate-400">
                        {filterFresh !== 'All' || filterCountry !== 'All'
                          ? 'Try adjusting your filters.'
                          : 'No supplier has posted this product yet.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </main>
  )
}

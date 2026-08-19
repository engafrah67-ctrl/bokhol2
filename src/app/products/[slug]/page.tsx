'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'
import {
  ArrowLeft, ShieldCheck, MapPin, Star, Filter,
  ChevronDown, MessageSquare, TrendingUp, TrendingDown,
  ArrowUpRight, Package, Snowflake, Droplets,
} from 'lucide-react'
import { BlurGate } from '@/components/blur-gate'
import { getFishImageForProduct } from '@/lib/data/products-data'

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

// Mock supplier offers for this product
const SUPPLIER_OFFERS = [
  {
    id: 1,
    supplier: 'Nordic Seafood AS',
    country: 'Norway',
    rating: 4.9,
    reviews: 142,
    verified: true,
    pricePerKg: 5.20,
    currency: 'EUR',
    freshFrozen: 'Fresh',
    packaging: 'Whole Fish',
    sizeWeight: 'Large (3–6 kg)',
    availability: 'In Stock',
    minOrderKg: 500,
    quantity: '8,000 kg',
    location: 'Bergen, Norway',
    certifications: ['MSC', 'ASC'],
  },
  {
    id: 2,
    supplier: 'Atlantic Fresh BV',
    country: 'Holland (Netherlands)',
    rating: 4.7,
    reviews: 98,
    verified: true,
    pricePerKg: 5.31,
    currency: 'EUR',
    freshFrozen: 'Fresh',
    packaging: 'Fillet (Skin On)',
    sizeWeight: 'Medium (1–3 kg)',
    availability: 'In Stock',
    minOrderKg: 250,
    quantity: '3,500 kg',
    location: 'Urk, Netherlands',
    certifications: ['HACCP', 'IFS Food'],
  },
  {
    id: 3,
    supplier: 'Bremerhaven Fisch GmbH',
    country: 'Germany',
    rating: 4.8,
    reviews: 84,
    verified: true,
    pricePerKg: 5.25,
    currency: 'EUR',
    freshFrozen: 'Fresh',
    packaging: 'Loin',
    sizeWeight: 'Medium (1–3 kg)',
    availability: 'In Stock',
    minOrderKg: 300,
    quantity: '5,000 kg',
    location: 'Bremerhaven, Germany',
    certifications: ['IFS Food', 'HACCP'],
  },
  {
    id: 4,
    supplier: 'North Sea Trading NV',
    country: 'Belgium',
    rating: 4.7,
    reviews: 62,
    verified: true,
    pricePerKg: 5.35,
    currency: 'EUR',
    freshFrozen: 'Frozen',
    packaging: 'Vacuum Packed',
    sizeWeight: 'Large (3–6 kg)',
    availability: 'In Stock',
    minOrderKg: 500,
    quantity: '6,200 kg',
    location: 'Ostend Port, Belgium',
    certifications: ['MSC', 'ASC'],
  },
  {
    id: 5,
    supplier: 'Frisk Havfisk',
    country: 'Norway',
    rating: 4.8,
    reviews: 201,
    verified: true,
    pricePerKg: 5.28,
    currency: 'EUR',
    freshFrozen: 'Frozen',
    packaging: 'IQF Block Frozen',
    sizeWeight: 'Mixed Sizes',
    availability: 'In Stock',
    minOrderKg: 1000,
    quantity: '20,000 kg',
    location: 'Ålesund, Norway',
    certifications: ['MSC', 'HACCP'],
  },
  {
    id: 6,
    supplier: 'Salmon House Ltd',
    country: 'Scotland',
    rating: 4.5,
    reviews: 67,
    verified: false,
    pricePerKg: 5.45,
    currency: 'EUR',
    freshFrozen: 'Fresh',
    packaging: 'Fillet (Skinless)',
    sizeWeight: 'Small (< 1 kg)',
    availability: 'Within 7 days',
    minOrderKg: 100,
    quantity: '1,200 kg',
    location: 'Aberdeen, Scotland',
    certifications: ['ASC'],
  },
]

const PRICE_HISTORY = [3.1, 3.4, 3.0, 3.6, 4.2, 4.8, 5.0, 5.2, 5.3, 5.1, 5.3, 5.2]
const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const productName = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const [filterFresh, setFilterFresh] = useState<'All' | 'Fresh' | 'Frozen'>('All')
  const [filterCountry, setFilterCountry] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'availability'>('price')

  const filteredOffers = SUPPLIER_OFFERS
    .filter(o => filterFresh === 'All' || o.freshFrozen === filterFresh)
    .filter(o => filterCountry === 'All' || o.country.toLowerCase().includes(filterCountry.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price') return a.pricePerKg - b.pricePerKg
      if (sortBy === 'rating') return b.rating - a.rating
      return a.availability.localeCompare(b.availability)
    })

  const avgPrice = (SUPPLIER_OFFERS.reduce((s, o) => s + o.pricePerKg, 0) / SUPPLIER_OFFERS.length).toFixed(2)
  const minPrice = Math.min(...SUPPLIER_OFFERS.map(o => o.pricePerKg)).toFixed(2)
  const maxPrice = Math.max(...SUPPLIER_OFFERS.map(o => o.pricePerKg)).toFixed(2)
  const maxChart = Math.max(...PRICE_HISTORY)

  return (
    <main className="min-h-screen bg-transparent pb-20">

      {/* Clean Header — no dark bg, gradient shows through */}
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
              <p className="text-slate-500 text-sm mt-1 italic">Salmo salar · Atlantic species</p>
            </div>
            <div className="sm:ml-auto flex flex-wrap gap-3">
              <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-xl px-4 py-3 text-center shadow-sm">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Avg. Price</p>
                <BlurGate><p className="text-xl font-black text-slate-900 mt-1">€{avgPrice}<span className="text-sm font-normal text-slate-400">/kg</span></p></BlurGate>
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-xl px-4 py-3 text-center shadow-sm">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Offers</p>
                <BlurGate><p className="text-xl font-black text-slate-900 mt-1">{SUPPLIER_OFFERS.length}</p></BlurGate>
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-xl px-4 py-3 text-center shadow-sm">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Price Range</p>
                <BlurGate><p className="text-xl font-black text-slate-900 mt-1">€{minPrice}–{maxPrice}</p></BlurGate>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 relative z-10 space-y-6">

        {/* Price Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">12-Month Price Index</h2>
              <p className="text-xs text-slate-400 mt-0.5">EUR / kg · European spot market average</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full">
              <TrendingUp className="h-3.5 w-3.5" /> +2.3% this week
            </span>
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {PRICE_HISTORY.map((p, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className={`w-full rounded-t-md transition-all ${i === PRICE_HISTORY.length - 1 ? 'bg-[#022B96]' : 'bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-300'}`}
                  style={{ height: `${(p / maxChart) * 100}%` }}
                />
                <span className="text-[9px] text-slate-400 font-medium">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

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
              <div className="relative">
                <select
                  value={filterCountry}
                  onChange={e => setFilterCountry(e.target.value)}
                  className="appearance-none text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-7 outline-none cursor-pointer hover:border-slate-300 transition"
                >
                  <option value="All">All Countries 🌍</option>
                  <option value="Holland">🇳🇱 Holland (Netherlands)</option>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="Belgium">🇧🇪 Belgium</option>
                  <option value="Norway">🇳🇴 Norway</option>
                  <option value="Scotland">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland</option>
                  <option value="Iceland">🇮🇸 Iceland</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>

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
                  <option value="rating">Sort: Highest Rating</option>
                  <option value="availability">Sort: Availability</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Column Headers */}
          <div className="hidden md:grid grid-cols-[1.8fr_0.8fr_0.9fr_1fr_1fr_0.8fr_auto] gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            {['Supplier', 'Price / kg', 'Fresh / Frozen', 'Packaging', 'Availability', 'Min. Order', ''].map(h => (
              <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredOffers.length > 0 ? (
              filteredOffers.map((offer, idx) => (
                <div
                  key={offer.id}
                  className={`px-5 py-4 grid md:grid-cols-[1.8fr_0.8fr_0.9fr_1fr_1fr_0.8fr_auto] gap-3 items-center hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors ${idx === 0 ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''}`}
                >
                  {/* Supplier */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-[#022B96]/10 dark:bg-blue-950/40 flex items-center justify-center text-[#022B96] dark:text-blue-400 font-black text-sm shrink-0">
                      {offer.supplier[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{offer.supplier}</span>
                        {offer.verified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                        {idx === 0 && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full shrink-0">BEST PRICE</span>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <span>{getCountryFlag(offer.country)}</span>
                        <span>{offer.country}</span>
                        <span>·</span>
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{offer.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <span className="text-amber-400">{'★'.repeat(Math.floor(offer.rating))}</span>
                        <span className="font-medium text-slate-500">{offer.rating} ({offer.reviews})</span>
                        <span>·</span>
                        {offer.certifications.map(c => (
                          <span key={c} className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-semibold">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <BlurGate>
                      <span className="font-black text-slate-900 dark:text-white text-base">€{offer.pricePerKg.toFixed(2)}</span>
                      <span className="text-xs text-slate-400 font-normal"> /kg</span>
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
                      offer.availability === 'In Stock'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${offer.availability === 'In Stock' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {offer.availability}
                    </span>
                  </div>

                  {/* Min Order */}
                  <div>
                    <BlurGate>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{offer.minOrderKg.toLocaleString()} kg</span>
                    </BlurGate>
                  </div>

                  {/* CTA */}
                  <div>
                    <BlurGate>
                      <button className="flex items-center gap-1.5 text-xs font-bold bg-[#022B96] hover:bg-[#011a5e] text-white px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Contact
                      </button>
                    </BlurGate>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <p className="text-sm font-semibold text-slate-500">No supplier offers match country &ldquo;{filterCountry}&rdquo;.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}

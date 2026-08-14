'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowRight, Search, Anchor, Calendar, Lock, ShieldAlert, Building2, Send, LogIn } from 'lucide-react'
import { useUser } from '@/hooks/use-user'

interface SupplierOffer {
  id: string
  supplierName: string
  originCountry: string
  originFlag: string
  originPort: string
  destCountry: string
  destFlag: string
  destPort: string
  productAvailable: string
  quantity: string
  containerType: string
  date: string
}

const DEFAULT_OFFERS: SupplierOffer[] = [
  {
    id: '1',
    supplierName: 'Norsk Seafood Ltd',
    originCountry: 'Norway',
    originFlag: 'https://flagcdn.com/w40/no.png',
    originPort: 'Alesund Port',
    destCountry: 'Spain',
    destFlag: 'https://flagcdn.com/w40/es.png',
    destPort: 'Vigo Port',
    productAvailable: 'Frozen Atlantic Salmon',
    quantity: '25 Metric Tons',
    containerType: '40RF',
    date: 'August 16, 2026'
  },
  {
    id: '2',
    supplierName: 'Iberia Seafood S.A.',
    originCountry: 'Spain',
    originFlag: 'https://flagcdn.com/w40/es.png',
    originPort: 'Bilbao Port',
    destCountry: 'Japan',
    destFlag: 'https://flagcdn.com/w40/jp.png',
    destPort: 'Osaka Port',
    productAvailable: 'Frozen Bluefin Tuna',
    quantity: '18 Metric Tons',
    containerType: '40RF',
    date: 'August 20, 2026'
  }
]

export default function SupplierRequestsPage() {
  const { user, profile, isLoading } = useUser()
  const [offers] = useState<SupplierOffer[]>(DEFAULT_OFFERS)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOffers = offers.filter(o =>
    o.originPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.destPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productAvailable.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Loading spinner while checking auth status
  if (isLoading) {
    return (
      <main className="min-h-screen bg-transparent py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#022B96] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Verifying access permissions...</p>
        </div>
      </main>
    )
  }

  // Gated Access Screen for Unauthenticated Visitors
  if (!user) {
    return (
      <main className="min-h-screen bg-transparent pb-16">
        <div className="border-b border-slate-200/80 bg-white/60 backdrop-blur-sm py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Supplier Availability</h1>
              <p className="mt-1 text-slate-500 text-sm">Active supplier cargo catalogs, stocks, and available shipping routes.</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="bg-white rounded-3xl p-8 md:p-12 text-slate-900 shadow-xl border border-slate-200/80 relative overflow-hidden">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                  Supplier Product Stocks &amp; Offers are Restricted to Logged-in Users
                </h2>
                <p className="text-slate-600 text-sm md:text-base mt-2 leading-relaxed max-w-2xl">
                  To protect wholesale trade pricing and supplier inventory availability, product stock catalogs and shipping routes are only visible to authenticated users.
                </p>
              </div>

              {/* Value Proposition Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 text-left space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#022B96] flex items-center justify-center font-bold text-sm mb-2 border border-blue-200">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Wholesale Price Protection</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Supplier pricing and volume terms are kept confidential from public web scraping.
                  </p>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 text-left space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm mb-2 border border-amber-200">
                    <Anchor className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Verified Shipping Routes</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Direct access to cargo availability, reefer container specs, and port departure schedules.
                  </p>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 text-left space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mb-2 border border-emerald-200">
                    <Send className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Direct Supplier RFQs</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Connect directly with verified seafood suppliers and exporters to request custom quotes.
                  </p>
                </div>
              </div>

              {/* CTA Action Button */}
              <div className="pt-4">
                <Link href="/login?next=/requests/supplier">
                  <button className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-extrabold rounded-2xl shadow-md transition cursor-pointer">
                    <LogIn className="w-4 h-4" />
                    Log In to View Supplier Stock
                  </button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-transparent pb-16">
      {/* Header */}
      <div className="border-b border-white/50 bg-transparent py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Supplier Availability</h1>
              <p className="mt-2 text-slate-500 text-sm">Active supplier cargo catalogs, stocks, and available shipping routes.</p>
            </div>
            {profile?.role === 'supplier' && (
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#022B96]/10 transition cursor-pointer">
                <Plus className="h-4 w-4" />
                Post Product Stock
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search */}
        <div className="max-w-md mb-8">
          <div className="relative flex items-center bg-white rounded-xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-[#022B96]/20 focus-within:border-[#022B96] transition-all p-1.5">
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search ports or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-0 py-2 px-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-sm"
            />
          </div>
        </div>

        {/* Offers list */}
        {filteredOffers.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredOffers.map((off) => (
              <div key={off.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Route */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-4 text-sm font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <img src={off.originFlag} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                    <span>{off.originPort}</span>
                  </div>
                  <span className="text-slate-400 font-normal">→</span>
                  <div className="flex items-center gap-2">
                    <img src={off.destFlag} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                    <span>{off.destPort}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">{off.supplierName}</span>
                    <span className="text-slate-700 font-bold">{off.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-800 font-semibold">{off.productAvailable}</span>
                    <span className="text-slate-700 font-bold">{off.containerType}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 my-4" />

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg transition cursor-pointer">
                    Request quote
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {off.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <Anchor className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No stocks found</h3>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </main>
  )
}

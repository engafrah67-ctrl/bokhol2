'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, ArrowRight, Search, Anchor, Calendar, Lock, ShieldAlert, Building2, Send, LogIn, CheckCircle2, X, Package, MapPin, Loader2 } from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { createClient } from '@/lib/supabase/client'

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

const COUNTRY_FLAGS: Record<string, string> = {
  Norway: 'https://flagcdn.com/w40/no.png',
  Spain: 'https://flagcdn.com/w40/es.png',
  Netherlands: 'https://flagcdn.com/w40/nl.png',
  Germany: 'https://flagcdn.com/w40/de.png',
  Belgium: 'https://flagcdn.com/w40/be.png',
  Japan: 'https://flagcdn.com/w40/jp.png',
  Chile: 'https://flagcdn.com/w40/cl.png',
  Vietnam: 'https://flagcdn.com/w40/vn.png',
  Iceland: 'https://flagcdn.com/w40/is.png',
  France: 'https://flagcdn.com/w40/fr.png',
  Italy: 'https://flagcdn.com/w40/it.png',
  Portugal: 'https://flagcdn.com/w40/pt.png',
  Greece: 'https://flagcdn.com/w40/gr.png',
  Denmark: 'https://flagcdn.com/w40/dk.png',
  Morocco: 'https://flagcdn.com/w40/ma.png',
}

function getCountryFlag(country: string): string {
  if (!country) return 'https://flagcdn.com/w40/eu.png'
  for (const [key, url] of Object.entries(COUNTRY_FLAGS)) {
    if (country.toLowerCase().includes(key.toLowerCase())) return url
  }
  return 'https://flagcdn.com/w40/eu.png'
}

export default function SupplierRequestsPage() {
  const { user, profile, isLoading } = useUser()
  const [offers, setOffers] = useState<SupplierOffer[]>([])
  const [loadingOffers, setLoadingOffers] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadOffers() {
      try {
        const supabase = createClient()
        const { data: posts } = await supabase
          .from('supplier_posts')
          .select(`
            id, title, content, created_at,
            companies(name, country, city)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (posts && posts.length > 0) {
          const list: SupplierOffer[] = posts.map((p: any) => {
            let details: any = {}
            try { details = JSON.parse(p.content || '{}') } catch (_) {}
            const comp = Array.isArray(p.companies) ? p.companies[0] : p.companies
            const supplierName = comp?.name || details.supplierName || 'Verified Exporter'
            const originCountry = details.countryOfOrigin || comp?.country || 'Europe'
            const destCountry = details.destCountry || 'EU'
            const originPort = details.originPort || details.location || comp?.city || `${originCountry} Port`
            const destPort = details.destPort || 'EU Main Port'
            const productAvailable = details.productName || p.title?.split(' —')[0] || 'Seafood Stock'
            const quantity = details.quantity || (details.pricePerKg ? `Stock @ €${details.pricePerKg}/kg` : 'Available Stock')
            const containerType = details.containerType || details.packagingFillet || details.packaging || 'Reefer Container (40RF)'

            return {
              id: p.id,
              supplierName,
              originCountry,
              originFlag: getCountryFlag(originCountry),
              originPort,
              destCountry,
              destFlag: getCountryFlag(destCountry),
              destPort,
              productAvailable,
              quantity,
              containerType,
              date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            }
          })
          setOffers(list)
        } else {
          setOffers([])
        }
      } catch (err) {
        console.error('Failed to load supplier offers:', err)
        setOffers([])
      } finally {
        setLoadingOffers(false)
      }
    }

    loadOffers()
  }, [])

  // Quote Request Modal State
  const [selectedOffer, setSelectedOffer] = useState<SupplierOffer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rfqQuantity, setRfqQuantity] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [destinationPort, setDestinationPort] = useState('')
  const [notes, setNotes] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleOpenQuote = (off: SupplierOffer) => {
    setSelectedOffer(off)
    setRfqQuantity(off.quantity)
    setDestinationPort(off.destPort)
    setTargetPrice('')
    setNotes('')
    setContactName(profile?.full_name || (user?.user_metadata?.company_name as string) || (user?.user_metadata?.full_name as string) || '')
    setContactEmail(user?.email || '')
    setContactPhone(profile?.phone || '')
    setIsSubmitted(false)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOffer(null)
    setIsSubmitted(false)
  }

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOffer) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const numericQty = parseFloat(rfqQuantity.replace(/[^0-9.]/g, '')) || null
      const numericPrice = parseFloat(targetPrice.replace(/[^0-9.]/g, '')) || null

      if (user?.id) {
        await supabase.from('buyer_requests').insert({
          user_id: user.id,
          title: `Quote Request: ${selectedOffer.productAvailable} from ${selectedOffer.supplierName}`,
          description: `Direct quote request for cargo on route ${selectedOffer.originPort} -> ${destinationPort || selectedOffer.destPort}.\nAvailable stock: ${selectedOffer.quantity} (${selectedOffer.containerType}).\n\nBuyer Notes: ${notes || 'None specified'}\n\nContact: ${contactName || 'Buyer'} (${contactEmail || user.email}, ${contactPhone || 'N/A'})`,
          quantity: numericQty,
          quantity_unit: 'Metric Tons',
          target_price: numericPrice,
          currency: 'EUR',
          destination: destinationPort || selectedOffer.destPort,
          status: 'open',
        })
      }
      setIsSubmitted(true)
    } catch (err) {
      console.error('Failed to submit quote request:', err)
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

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
              <Link href="/dashboard/supplier">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#022B96]/10 transition cursor-pointer">
                  <Plus className="h-4 w-4" />
                  Post Product Stock
                </button>
              </Link>
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
        {loadingOffers ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <Loader2 className="h-8 w-8 text-[#022B96] animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-semibold">Loading verified supplier stock...</p>
          </div>
        ) : filteredOffers.length > 0 ? (
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
                  <button
                    type="button"
                    onClick={() => handleOpenQuote(off)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-[#022B96] hover:text-white hover:border-[#022B96] text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer group shadow-xs"
                  >
                    Request quote
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
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
            <p className="text-sm text-slate-400 mt-1">
              {searchTerm ? 'Try adjusting your search terms.' : "Suppliers haven't posted any available stock yet. Check back soon."}
            </p>
          </div>
        )}
      </div>

      {/* Quote Request Modal */}
      {isModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-6 transition-all animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#022B96] mb-1.5">
                  Cargo RFQ / Quotation
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Request Quote from {selectedOffer.supplierName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit your purchase interest directly for this available cargo stock.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {isSubmitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Quote Request Submitted!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Your RFQ for <strong>{selectedOffer.productAvailable}</strong> has been transmitted to <strong>{selectedOffer.supplierName}</strong>. You will be notified when they reply.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Done
                  </button>
                  <Link href="/requests/buyer">
                    <button
                      type="button"
                      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      View Sourcing Board
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote} className="p-6 space-y-4">
                {/* Cargo Stock Summary Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-[#022B96]" />
                      {selectedOffer.productAvailable}
                    </span>
                    <span className="text-slate-600 font-semibold">{selectedOffer.containerType}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Route: {selectedOffer.originPort} → {selectedOffer.destPort}</span>
                    <span className="font-semibold text-slate-700">Stock: {selectedOffer.quantity}</span>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Required Quantity *
                    </label>
                    <input
                      type="text"
                      required
                      value={rfqQuantity}
                      onChange={(e) => setRfqQuantity(e.target.value)}
                      placeholder="e.g. 25 Metric Tons"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#022B96] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Target Price (EUR / unit)
                    </label>
                    <input
                      type="text"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="Optional, e.g. € 6.50/kg"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#022B96] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Destination Port / Delivery Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={destinationPort}
                    onChange={(e) => setDestinationPort(e.target.value)}
                    placeholder="e.g. Vigo Port, Spain"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#022B96] focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Company / Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your name or company"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#022B96] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="buyer@example.com"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#022B96] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Additional Specifications &amp; Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide any specific packaging, sizing, target delivery date, or inspection requirements..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#022B96] focus:bg-white transition resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Quote Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </main>
  )
}

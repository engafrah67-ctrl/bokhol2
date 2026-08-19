'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  ArrowRight,
  Search,
  Anchor,
  Calendar,
  Lock,
  ShieldAlert,
  Building2,
  Send,
  LogIn,
  CheckCircle2,
  X,
  Package,
  Globe2,
  EyeOff,
  Trash2
} from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { useLanguage } from '@/contexts/language-context'

export interface SupplierOffer {
  id: string
  supplierName: string
  supplierEmail?: string
  userId?: string
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
    id: 'stock-1',
    supplierName: 'Norsk Seafood Ltd',
    supplierEmail: 'norsk@seafood.no',
    originCountry: 'Norway',
    originFlag: 'https://flagcdn.com/w40/no.png',
    originPort: 'Alesund Port',
    destCountry: 'Spain',
    destFlag: 'https://flagcdn.com/w40/es.png',
    destPort: 'Vigo Port',
    productAvailable: 'Frozen Atlantic Salmon',
    quantity: '25 Metric Tons',
    containerType: '40RF',
    date: 'August 16, 2026',
  },
  {
    id: 'stock-2',
    supplierName: 'Iberia Seafood S.A.',
    supplierEmail: 'info@iberiaseafood.es',
    originCountry: 'Spain',
    originFlag: 'https://flagcdn.com/w40/es.png',
    originPort: 'Bilbao Port',
    destCountry: 'Japan',
    destFlag: 'https://flagcdn.com/w40/jp.png',
    destPort: 'Osaka Port',
    productAvailable: 'Frozen Bluefin Tuna',
    quantity: '18 Metric Tons',
    containerType: '40RF',
    date: 'August 20, 2026',
  },
]

export default function SupplierRequestsPage() {
  const { user, profile, role, isLoading } = useUser()
  const { t } = useLanguage()

  const [allOffers, setAllOffers] = useState<SupplierOffer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false)
  const [selectedOfferForRfq, setSelectedOfferForRfq] = useState<SupplierOffer | null>(null)

  // RFQ form state
  const [rfqQuantity, setRfqQuantity] = useState('')
  const [rfqMessage, setRfqMessage] = useState('')
  const [rfqSubmitted, setRfqSubmitted] = useState(false)

  // Post stock form state
  const [newProduct, setNewProduct] = useState('')
  const [newQuantity, setNewQuantity] = useState('')
  const [newOriginPort, setNewOriginPort] = useState('')
  const [newDestPort, setNewDestPort] = useState('')
  const [newContainerType, setNewContainerType] = useState('40RF Reefer')
  const [postSuccess, setPostSuccess] = useState(false)

  const isSupplier = role === 'supplier'
  const isBuyer = role === 'buyer'
  const isAdmin = role === 'admin' || user?.email === 'admin@gmail.com'

  // Load offers from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('supplier_stock_offers')
      if (stored) {
        const parsed = JSON.parse(stored)
        setAllOffers([...parsed, ...DEFAULT_OFFERS])
      } else {
        setAllOffers(DEFAULT_OFFERS)
      }
    } catch (_) {
      setAllOffers(DEFAULT_OFFERS)
    }
  }, [])

  // Filter offers based on user role:
  // - Supplier: Can ONLY see their own posted offers (cannot see competing suppliers' requests/stocks)
  // - Buyer & Admin: Can see all suppliers' available stocks
  const visibleOffers = allOffers.filter((o) => {
    if (isSupplier) {
      // Must match supplier email or user id
      const matchesEmail = o.supplierEmail && user?.email && o.supplierEmail.toLowerCase() === user.email.toLowerCase()
      const matchesUserId = o.userId && user?.id && o.userId === user.id
      const matchesCompanyName = profile?.full_name && o.supplierName.toLowerCase().includes(profile.full_name.toLowerCase())
      return matchesEmail || matchesUserId || matchesCompanyName
    }
    return true
  })

  const filteredOffers = visibleOffers.filter((o) =>
    o.originPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.destPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productAvailable.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePostStock = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct || !newQuantity || !newOriginPort) return

    const newOffer: SupplierOffer = {
      id: `stock-${Date.now()}`,
      supplierName: profile?.full_name || 'My Seafood Company',
      supplierEmail: user?.email || '',
      userId: user?.id,
      originCountry: 'Netherlands',
      originFlag: 'https://flagcdn.com/w40/nl.png',
      originPort: newOriginPort,
      destCountry: 'European Union',
      destFlag: 'https://flagcdn.com/w40/eu.png',
      destPort: newDestPort || 'Rotterdam Port',
      productAvailable: newProduct,
      quantity: newQuantity,
      containerType: newContainerType,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }

    const updated = [newOffer, ...allOffers]
    setAllOffers(updated)
    try {
      const stored = JSON.parse(localStorage.getItem('supplier_stock_offers') || '[]')
      localStorage.setItem('supplier_stock_offers', JSON.stringify([newOffer, ...stored]))
    } catch (_) {}

    setPostSuccess(true)
    setTimeout(() => {
      setPostSuccess(false)
      setIsPostModalOpen(false)
      setNewProduct('')
      setNewQuantity('')
      setNewOriginPort('')
      setNewDestPort('')
    }, 1200)
  }

  const handleDeleteOffer = (id: string) => {
    const updated = allOffers.filter((o) => o.id !== id)
    setAllOffers(updated)
    try {
      const stored = JSON.parse(localStorage.getItem('supplier_stock_offers') || '[]')
      const filteredStored = stored.filter((o: any) => o.id !== id)
      localStorage.setItem('supplier_stock_offers', JSON.stringify(filteredStored))
    } catch (_) {}
  }

  const handleOpenRfq = (offer: SupplierOffer) => {
    setSelectedOfferForRfq(offer)
    setRfqQuantity(offer.quantity)
    setRfqMessage(`Interested in purchasing ${offer.productAvailable}. Please provide FOB / CIF spot price quotation.`)
    setIsRfqModalOpen(true)
    setRfqSubmitted(false)
  }

  const handleSubmitRfq = (e: React.FormEvent) => {
    e.preventDefault()
    setRfqSubmitted(true)
    setTimeout(() => {
      setIsRfqModalOpen(false)
      setSelectedOfferForRfq(null)
    }, 1500)
  }

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-transparent py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#022B96] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Verifying permissions...</p>
        </div>
      </main>
    )
  }

  // Gated Screen for Unauthenticated Visitors
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
                  To protect wholesale trade pricing and supplier inventory availability, product stock catalogs and shipping routes are only visible to authenticated buyers and verified participants.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 text-left space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#022B96] flex items-center justify-center font-bold text-sm mb-2 border border-blue-200">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Trade Price Protection</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Supplier pricing and volume terms are kept confidential from competitors and web crawlers.
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
                  <h4 className="font-extrabold text-slate-900 text-sm">Direct Buyer RFQs</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Buyers connect directly with verified seafood suppliers to request custom spot quotations.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/login?next=/requests/supplier">
                  <button className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-extrabold rounded-2xl shadow-md transition cursor-pointer">
                    <LogIn className="w-4 h-4" />
                    Log In to Access Market
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
      <div className="border-b border-slate-200/60 bg-white/40 backdrop-blur-sm py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isSupplier ? 'My Product Stock & Cargo' : 'Supplier Availability'}
                </h1>
                {isSupplier && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                    <Building2 className="w-3 h-3" /> Supplier Portal
                  </span>
                )}
              </div>
              <p className="mt-2 text-slate-500 text-sm">
                {isSupplier
                  ? 'Manage your published seafood cargo stocks, routes, and buyer quote inquiries.'
                  : 'Active supplier cargo catalogs, stocks, and available shipping routes across Europe.'}
              </p>
            </div>

            {/* Post Stock Button (Supplier Only) */}
            {isSupplier && (
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-bold rounded-xl shadow-md transition cursor-pointer self-start md:self-auto"
              >
                <Plus className="h-4 w-4" />
                Post Product Stock
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* Search Bar */}
        <div className="max-w-md">
          <div className="relative flex items-center bg-white rounded-xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-[#022B96]/20 focus-within:border-[#022B96] transition-all p-1.5">
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search ports, species, or cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-0 py-2 px-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-sm"
            />
          </div>
        </div>

        {/* Offers Grid */}
        {filteredOffers.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredOffers.map((off) => (
              <div
                key={off.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
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
                      <span className="text-slate-600 font-semibold">{off.supplierName}</span>
                      <span className="text-slate-900 font-extrabold">{off.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-900 font-bold">{off.productAvailable}</span>
                      <span className="text-slate-600 font-medium text-xs bg-slate-100 px-2 py-0.5 rounded-md">
                        {off.containerType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div>
                  <div className="border-t border-slate-100 my-4" />
                  <div className="flex items-center justify-between">
                    {/* Buyer: Request quote button */}
                    {!isSupplier && (
                      <button
                        onClick={() => handleOpenRfq(off)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-sm"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Request Quote
                      </button>
                    )}

                    {/* Supplier: Manage own listing */}
                    {isSupplier && (
                      <button
                        onClick={() => handleDeleteOffer(off.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition cursor-pointer border border-red-200/60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}

                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1 ml-auto">
                      <Calendar className="h-3 w-3" />
                      {off.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
            <Anchor className="h-12 w-12 text-slate-300 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {isSupplier ? 'You have not posted any product stock yet' : 'No available stocks found'}
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                {isSupplier
                  ? 'Post your available seafood inventory and shipping routes so verified buyers can request quotes directly.'
                  : 'Check back shortly or adjust your search keywords to view incoming supplier cargo.'}
              </p>
            </div>
            {isSupplier && (
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Post Your First Stock
              </button>
            )}
          </div>
        )}
      </div>

      {/* POST PRODUCT STOCK MODAL (SUPPLIER ONLY) */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 relative">
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#022B96] uppercase tracking-wider mb-1">
                <Package className="w-4 h-4" />
                Supplier Stock Publishing
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Post Product Stock</h3>
              <p className="text-xs text-slate-500 mt-1">
                Publish available inventory for verified buyers. Competing suppliers cannot view your cargo.
              </p>
            </div>

            {postSuccess ? (
              <div className="py-10 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-emerald-900 text-lg">Product Stock Published!</h4>
                <p className="text-xs text-emerald-700 font-medium">Your inventory is now visible to EU buyers.</p>
              </div>
            ) : (
              <form onSubmit={handlePostStock} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Product / Species *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frozen Atlantic Salmon, Yellowfin Tuna Loins"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Quantity / Volume *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 20 Metric Tons"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Container Type</label>
                    <select
                      value={newContainerType}
                      onChange={(e) => setNewContainerType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none bg-white"
                    >
                      <option value="40RF Reefer">40RF Reefer</option>
                      <option value="20RF Reefer">20RF Reefer</option>
                      <option value="Air Freight">Air Freight</option>
                      <option value="Truck / Road">Refrigerated Truck</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Origin Port *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alesund Port, Bergen"
                      value={newOriginPort}
                      onChange={(e) => setNewOriginPort(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Destination Port</label>
                    <input
                      type="text"
                      placeholder="e.g. Rotterdam Port, Vigo"
                      value={newDestPort}
                      onChange={(e) => setNewDestPort(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Publish Stock
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* REQUEST QUOTE MODAL (BUYER ONLY) */}
      {isRfqModalOpen && selectedOfferForRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 relative">
            <button
              onClick={() => setIsRfqModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#022B96] uppercase tracking-wider mb-1">
                <Send className="w-4 h-4" />
                Buyer RFQ Quotation Request
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Request Spot Quote</h3>
              <p className="text-xs text-slate-500 mt-1">
                Direct inquiry to <strong>{selectedOfferForRfq.supplierName}</strong> for {selectedOfferForRfq.productAvailable}.
              </p>
            </div>

            {rfqSubmitted ? (
              <div className="py-10 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-emerald-900 text-lg">Quote Request Sent!</h4>
                <p className="text-xs text-emerald-700 font-medium">The supplier has received your direct inquiry.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRfq} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Volume / Quantity</label>
                  <input
                    type="text"
                    required
                    value={rfqQuantity}
                    onChange={(e) => setRfqQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Inquiry Message / Delivery Terms</label>
                  <textarea
                    rows={3}
                    required
                    value={rfqMessage}
                    onChange={(e) => setRfqMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRfqModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Send RFQ
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

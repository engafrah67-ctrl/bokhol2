'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, ShoppingBag, Calendar, MapPin, Package, DollarSign, MessageSquare, Send, CheckCircle2, X, Tag, Clock, Lock, ShieldAlert, LogIn, UserPlus, Building2 } from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { createClient } from '@/lib/supabase/client'

interface BuyerSourcingRequest {
  id: string
  productNeeded: string
  quantity: string
  freshFrozen: string
  location: string
  packagingProcessing: string
  deliveryDate: string
  targetPrice?: string
  additionalNotes?: string
  createdAt: string
  userEmail?: string
}

interface SupplierReply {
  id: string
  requestId: string
  supplierName: string
  supplierEmail?: string
  userId?: string
  pricePerKg: string
  deliveryItem: string
  message: string
  createdAt: string
}

const DEFAULT_REQUESTS: BuyerSourcingRequest[] = [
  {
    id: 'req-sample-1',
    productNeeded: 'Salmon',
    quantity: '100 KG',
    freshFrozen: 'Fresh / Frozen',
    location: 'Amsterdam, Netherlands',
    packagingProcessing: 'packing/pure',
    deliveryDate: 'Friday',
    targetPrice: '$6.20/kg',
    additionalNotes: 'Need fresh or frozen salmon delivered by Friday morning at Amsterdam port warehouse.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req-sample-2',
    productNeeded: 'Atlantic Cod Fillets',
    quantity: '500 KG',
    freshFrozen: 'Frozen (IQF)',
    location: 'Vigo, Spain',
    packagingProcessing: 'Fillet (Skinless)',
    deliveryDate: 'Next Tuesday',
    targetPrice: '$4.80/kg',
    additionalNotes: 'Grade A IQF cod fillets required for restaurant distributor.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req-sample-3',
    productNeeded: 'Yellowfin Tuna Loins',
    quantity: '250 KG',
    freshFrozen: 'Fresh',
    location: 'Tokyo, Japan',
    packagingProcessing: 'Vacuum Packed Loins',
    deliveryDate: 'Thursday',
    targetPrice: '$12.50/kg',
    additionalNotes: 'Sashimi grade fresh yellowfin tuna loins.',
    createdAt: new Date().toISOString(),
  }
]

const DEFAULT_REPLIES: Record<string, SupplierReply[]> = {
  'req-sample-1': [
    {
      id: 'rep-1',
      requestId: 'req-sample-1',
      supplierName: 'Norsk Seafood Ltd',
      pricePerKg: '6.45 €/kg',
      deliveryItem: 'Friday Delivery Guaranteed',
      message: 'We can provide 100 KG premium fresh Norwegian Salmon directly to Amsterdam.',
      createdAt: '10 mins ago',
    }
  ]
}

export default function BuyerRequestsPage() {
  const { user, profile, role, isLoading } = useUser()
  const [requests, setRequests] = useState<BuyerSourcingRequest[]>([])
  const [replies, setReplies] = useState<Record<string, SupplierReply[]>>(DEFAULT_REPLIES)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // Reply Modal State
  const [selectedRequest, setSelectedRequest] = useState<BuyerSourcingRequest | null>(null)
  const [replyPrice, setReplyPrice] = useState('')
  const [replyDelivery, setReplyDelivery] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [replySubmitted, setReplySubmitted] = useState(false)

  const isSupplierOrAdmin = role === 'supplier' || role === 'admin' || user?.email === 'admin@gmail.com'

  useEffect(() => {
    async function loadRequests() {
      let localReqs: BuyerSourcingRequest[] = []
      let localReps: Record<string, SupplierReply[]> = DEFAULT_REPLIES
      
      if (typeof window !== 'undefined') {
        try {
          const storedReqs = JSON.parse(localStorage.getItem('buyer_sourcing_requests') || '[]')
          if (storedReqs && Array.isArray(storedReqs)) {
            localReqs = storedReqs.map((r: any) => {
              try {
                const parsed = JSON.parse(r.description || '{}')
                return {
                  id: r.id,
                  productNeeded: parsed.productNeeded || 'Salmon',
                  quantity: parsed.quantity || '100 KG',
                  freshFrozen: parsed.freshFrozen || 'Fresh / Frozen',
                  location: parsed.location || r.destination || 'Amsterdam',
                  packagingProcessing: parsed.packagingProcessing || 'packing/pure',
                  deliveryDate: parsed.deliveryDate || 'Friday',
                  targetPrice: parsed.targetPrice || null,
                  additionalNotes: parsed.additionalNotes || null,
                  createdAt: r.created_at || new Date().toISOString(),
                }
              } catch (_) {
                return {
                  id: r.id,
                  productNeeded: r.title || 'Salmon',
                  quantity: '100 KG',
                  freshFrozen: 'Fresh / Frozen',
                  location: r.destination || 'Amsterdam',
                  packagingProcessing: 'packing/pure',
                  deliveryDate: 'Friday',
                  createdAt: r.created_at || new Date().toISOString(),
                }
              }
            })
          }

          const storedReps = JSON.parse(localStorage.getItem('supplier_replies') || '{}')
          if (storedReps) {
            localReps = { ...DEFAULT_REPLIES, ...storedReps }
          }
        } catch (_) {}
      }

      setRequests([...localReqs, ...DEFAULT_REQUESTS])
      setReplies(localReps)
      setLoading(false)
    }

    loadRequests()
  }, [])

  const handleOpenReplyModal = (req: BuyerSourcingRequest) => {
    setSelectedRequest(req)
    setReplyPrice('')
    setReplyDelivery(req.deliveryDate ? `${req.deliveryDate} delivery` : 'On-time delivery')
    setReplyMessage('')
    setReplySubmitted(false)
  }

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return

    const newReply: SupplierReply = {
      id: 'reply-' + Date.now(),
      requestId: selectedRequest.id,
      supplierName: profile?.full_name ? `${profile.full_name} (Verified Supplier)` : 'Verified Seafood Supplier',
      supplierEmail: user?.email || '',
      userId: user?.id,
      pricePerKg: replyPrice.includes('/kg') || replyPrice.includes('€') || replyPrice.includes('$') ? replyPrice : `$${replyPrice}/kg`,
      deliveryItem: replyDelivery,
      message: replyMessage,
      createdAt: 'Just now'
    }

    const updatedReplies = {
      ...replies,
      [selectedRequest.id]: [newReply, ...(replies[selectedRequest.id] || [])]
    }

    setReplies(updatedReplies)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('supplier_replies', JSON.stringify(updatedReplies))
      } catch (_) {}
    }

    setReplySubmitted(true)
    setTimeout(() => {
      setSelectedRequest(null)
      setReplySubmitted(false)
    }, 1200)
  }

  const filteredRequests = requests.filter(r =>
    r.productNeeded.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.packagingProcessing.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Skeleton state while checking auth
  if (isLoading) {
    return (
      <main className="min-h-screen bg-transparent py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#022B96] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Verifying supplier access permissions...</p>
        </div>
      </main>
    )
  }

  // Gated Access Screen for Unauthenticated Visitors or Non-Suppliers
  if (!user || !isSupplierOrAdmin) {
    return (
      <main className="min-h-screen bg-transparent pb-16">
        <div className="border-b border-slate-200/80 bg-white/60 backdrop-blur-sm py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Buyer Sourcing Requests</h1>
              <p className="mt-1 text-slate-500 text-sm">Exclusive tender access for verified seafood suppliers & exporters.</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="bg-white rounded-3xl p-8 md:p-12 text-slate-900 shadow-xl border border-slate-200/80 relative overflow-hidden">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                  Buyer Requests are Restricted to Logged-in Suppliers
                </h2>
                <p className="text-slate-600 text-sm md:text-base mt-2 leading-relaxed max-w-2xl">
                  To protect buyer trade confidentiality and preserve competitive bidding, active buyer tenders and sourcing specifications are only visible to authenticated seafood suppliers.
                </p>
              </div>

              {/* Value Proposition Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 text-left space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#022B96] flex items-center justify-center font-bold text-sm mb-2 border border-blue-200">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Protected Trade Privacy</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sourcing specifications and buyer tender volumes are kept confidential from public web indexing.
                  </p>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 text-left space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm mb-2 border border-amber-200">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Verified Importers Only</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Connecting authenticated seafood suppliers directly with vetted global buyers and processors.
                  </p>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 text-left space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mb-2 border border-emerald-200">
                    <Send className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Direct Wholesale Quotes</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Submit wholesale pricing, incoterms, and product availability directly to active buyers.
                  </p>
                </div>
              </div>

              {/* CTA Action Button */}
              <div className="pt-4">
                <Link href="/login?next=/requests/buyer">
                  <button className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-extrabold rounded-2xl shadow-md transition cursor-pointer">
                    <LogIn className="w-4 h-4" />
                    Log In as Supplier
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
      {/* Page Header */}
      <div className="border-b border-white/50 bg-transparent py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Buyer Sourcing Requests</h1>
              <p className="mt-2 text-slate-500 text-sm">Active buyer tenders and seafood procurement demands from verified importers.</p>
            </div>
            <Link href="/requests/buyer/new">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-bold rounded-2xl shadow-md transition cursor-pointer">
                <Plus className="h-4 w-4" />
                Post Sourcing Request
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search Bar */}
        <div className="max-w-md mb-8">
          <div className="relative flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-[#022B96]/20 focus-within:border-[#022B96] transition-all p-1.5">
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search product (Salmon), location (Amsterdam)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-0 py-2 px-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-sm font-medium"
            />
          </div>
        </div>

        {/* Requests Feed Grid */}
        {filteredRequests.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => {
              const reqReplies = replies[req.id] || []
              return (
                <div key={req.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-4">
                    
                    {/* Header Row: Category Badge + Delivery Date */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#022B96] text-xs font-black uppercase tracking-wider border border-blue-100">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Buyer Request
                      </span>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Delivery: <strong className="text-slate-800">{req.deliveryDate}</strong>
                      </span>
                    </div>

                    {/* Product Needed & Target Price */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-snug tracking-tight">
                          {req.quantity} {req.productNeeded}
                        </h2>
                      </div>
                      {req.targetPrice && (
                        <span className="text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1.5 rounded-xl shrink-0">
                          Target: {req.targetPrice}
                        </span>
                      )}
                    </div>

                    {/* Clean Spec Pills (No duplicates!) */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200/60">
                        ❄️ {req.freshFrozen}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200/60">
                        <MapPin className="h-3.5 w-3.5 text-red-500" /> {req.location}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200/60">
                        <Package className="h-3.5 w-3.5 text-blue-500" /> {req.packagingProcessing}
                      </span>
                    </div>

                    {/* Additional Notes Quote */}
                    {req.additionalNotes && (
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 italic">
                        &quot;{req.additionalNotes}&quot;
                      </div>
                    )}

                    {/* Supplier Replies List */}
                    {(() => {
                      const isSupplier = role === 'supplier'
                      const myReplies = isSupplier
                        ? reqReplies.filter(
                            (rep) =>
                              (rep.supplierEmail && user?.email && rep.supplierEmail.toLowerCase() === user.email.toLowerCase()) ||
                              (rep.userId && user?.id && rep.userId === user.id) ||
                              (profile?.full_name && rep.supplierName.toLowerCase().includes(profile.full_name.toLowerCase()))
                          )
                        : reqReplies

                      const competingRepliesCount = reqReplies.length - myReplies.length

                      return (
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          {/* When the user is a supplier */}
                          {isSupplier ? (
                            <>
                              {myReplies.length > 0 ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                      Your Submitted Quote
                                    </p>
                                    <span className="text-[10px] font-bold text-slate-400">
                                      🔒 Confidential to Buyer
                                    </span>
                                  </div>
                                  {myReplies.map((rep) => (
                                    <div key={rep.id} className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-xs space-y-1">
                                      <div className="flex items-center justify-between font-extrabold text-slate-900">
                                        <span>{rep.supplierName}</span>
                                        <span className="text-emerald-700 font-black">{rep.pricePerKg}</span>
                                      </div>
                                      <p className="text-slate-600 font-semibold">📦 {rep.deliveryItem}</p>
                                      {rep.message && <p className="text-slate-500 italic">&quot;{rep.message}&quot;</p>}
                                    </div>
                                  ))}
                                </div>
                              ) : null}

                              {competingRepliesCount > 0 && (
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                  <span className="flex items-center gap-1.5 font-semibold">
                                    <Lock className="w-3 h-3 text-slate-400" />
                                    {competingRepliesCount} {competingRepliesCount === 1 ? 'other quote' : 'other quotes'} submitted
                                  </span>
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                                    Competitor Prices Hidden
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            /* When the user is a Buyer or Admin: can see all replies */
                            reqReplies.length > 0 && (
                              <>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  Supplier Quotes ({reqReplies.length})
                                </p>
                                {reqReplies.map((rep) => (
                                  <div key={rep.id} className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs space-y-1">
                                    <div className="flex items-center justify-between font-extrabold text-slate-900">
                                      <span>{rep.supplierName}</span>
                                      <span className="text-[#022B96] font-black">{rep.pricePerKg}</span>
                                    </div>
                                    <p className="text-slate-600 font-semibold">📦 {rep.deliveryItem}</p>
                                    {rep.message && <p className="text-slate-500 italic">&quot;{rep.message}&quot;</p>}
                                  </div>
                                ))}
                              </>
                            )
                          )}
                        </div>
                      )
                    })()}

                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenReplyModal(req)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Supplier Reply
                    </button>
                    <span className="text-xs text-slate-400 font-semibold">
                      Replies: <strong className="text-slate-700">{reqReplies.length}</strong>
                    </span>
                  </div>

                </div>
              )
            })}
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="h-8 w-8 border-2 border-[#022B96] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl">
            <ShoppingBag className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800">No requests found</h3>
            <p className="text-sm text-slate-400 mt-1 mb-6">Post a sourcing request to get supplier quotes.</p>
            <Link href="/requests/buyer/new">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-semibold rounded-xl shadow-md transition cursor-pointer">
                <Plus className="h-4 w-4" />
                Post Sourcing Request
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* SUPPLIER REPLY MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 relative">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {replySubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Reply Sent to Buyer!</h3>
                <p className="text-xs text-slate-500">Your price per KG and delivery details have been submitted.</p>
              </div>
            ) : (
              <form onSubmit={handleSendReply} className="space-y-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                    Supplier Reply Form
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                    Offer for {selectedRequest.quantity} {selectedRequest.productNeeded}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Location: {selectedRequest.location} · Required: {selectedRequest.deliveryDate}
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      1. Price per KG *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 6.50 €/kg or 7.00 USD/kg"
                        value={replyPrice}
                        onChange={e => setReplyPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-[#022B96] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      2. Delivery Item / Date *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Friday delivery guaranteed, DAP Amsterdam"
                      value={replyDelivery}
                      onChange={e => setReplyDelivery(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-[#022B96] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      3. Message to Buyer *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Add details about fish quality, cold chain, packaging specs..."
                      value={replyMessage}
                      onChange={e => setReplyMessage(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit Reply
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

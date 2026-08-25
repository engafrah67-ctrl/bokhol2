'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Bell,
  Bookmark,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  DollarSign,
  Calendar,
  Building2,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
  UserCheck,
  Globe,
  TrendingUp,
  X,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Send,
  LogOut,
} from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { createClient } from '@/lib/supabase/client'
import { performSignOut } from '@/lib/auth-helpers'

export interface BuyerRequestItem {
  id: string
  productNeeded: string
  quantity: string
  freshFrozen: string
  location: string
  packagingProcessing: string
  deliveryDate: string
  targetPrice?: string
  additionalNotes?: string
  status: 'open' | 'in_review' | 'fulfilled' | 'closed'
  createdAt: string
  userEmail?: string
}

export interface SupplierOfferNotification {
  id: string
  requestId: string
  requestTitle: string
  supplierName: string
  supplierEmail?: string
  supplierPhone?: string
  pricePerKg: string
  deliveryTerms: string
  message: string
  createdAt: string
  isRead: boolean
  supplierCountry?: string
}

const INITIAL_BUYER_REQUESTS: BuyerRequestItem[] = [
  {
    id: 'req-buyer-1',
    productNeeded: 'Atlantic Salmon',
    quantity: '500 KG',
    freshFrozen: 'Fresh / Frozen',
    location: 'Amsterdam Port, Netherlands',
    packagingProcessing: 'Fillet (Trim D, Vacuum Packed)',
    deliveryDate: 'Friday Morning',
    targetPrice: '€7.20 / kg',
    additionalNotes: 'Need premium grade Atlantic salmon delivered to our cold store facility in Amsterdam.',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'req-buyer-2',
    productNeeded: 'Vannamei Shrimp',
    quantity: '1,000 KG',
    freshFrozen: 'Frozen (IQF)',
    location: 'Rotterdam Port, Netherlands',
    packagingProcessing: 'Peeled & Deveined (Tail-on, 16/20)',
    deliveryDate: 'Next Tuesday',
    targetPrice: '€6.40 / kg',
    additionalNotes: 'Grade A IQF shrimp for restaurant wholesale distribution. Must include full health & ASC certificates.',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
  },
  {
    id: 'req-buyer-3',
    productNeeded: 'Yellowfin Tuna Loins',
    quantity: '250 KG',
    freshFrozen: 'Fresh (Sashimi Grade)',
    location: 'Frankfurt, Germany',
    packagingProcessing: 'Skinless & Boneless Loins (IVP)',
    deliveryDate: 'Thursday',
    targetPrice: '€14.00 / kg',
    additionalNotes: 'Ultra-fresh sashimi grade yellowfin tuna loins for hotel chains.',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
]

const INITIAL_SUPPLIER_OFFERS: SupplierOfferNotification[] = [
  {
    id: 'offer-1',
    requestId: 'req-buyer-1',
    requestTitle: '500 KG Atlantic Salmon — Amsterdam Port',
    supplierName: 'Norsk Seafood Ltd',
    supplierEmail: 'sales@norskseafood.no',
    supplierPhone: '+31684033593',
    pricePerKg: '€6.95 / kg',
    deliveryTerms: 'Guaranteed 48h cold-chain delivery to Amsterdam warehouse',
    message: 'Hello! We can fulfill your 500 KG Atlantic Salmon request with harvest from yesterday. ASC & GlobalGAP certified with full temperature logging.',
    createdAt: '15 mins ago',
    isRead: false,
    supplierCountry: 'Norway',
  },
  {
    id: 'offer-2',
    requestId: 'req-buyer-2',
    requestTitle: '1,000 KG Vannamei Shrimp — Rotterdam Port',
    supplierName: 'Amacore Seafood B.V.',
    supplierEmail: 'info@amacore.nl',
    supplierPhone: '+31684033593',
    pricePerKg: '€6.25 / kg',
    deliveryTerms: 'In stock at Rotterdam Port ready for immediate dispatch',
    message: 'We have 16/20 Grade A Vannamei Shrimp ready in Rotterdam cold storage. Can deliver by Monday morning with full certificate package.',
    createdAt: '2 hours ago',
    isRead: false,
    supplierCountry: 'Netherlands',
  },
  {
    id: 'offer-3',
    requestId: 'req-buyer-3',
    requestTitle: '250 KG Yellowfin Tuna Loins — Frankfurt',
    supplierName: 'Iberia Seafood S.A.',
    supplierEmail: 'contact@iberiaseafood.es',
    supplierPhone: '+31684033593',
    pricePerKg: '€13.80 / kg',
    deliveryTerms: 'Direct flight dispatch from Vigo to Frankfurt Airport',
    message: 'Super fresh line-caught Yellowfin Tuna loins. Packed in iced thermo-boxes with next-day air arrival in Frankfurt.',
    createdAt: 'Yesterday',
    isRead: true,
    supplierCountry: 'Spain',
  },
]

export default function BuyerDashboardPage() {
  const router = useRouter()
  const { user, profile, role, isLoading: isUserLoading } = useUser()
  const supabase = createClient()

  const [activeNav, setActiveNav] = useState<'notifications' | 'requests'>('notifications')
  const [requests, setRequests] = useState<BuyerRequestItem[]>([])
  const [offers, setOffers] = useState<SupplierOfferNotification[]>([])

  // Modal State for Making New Product Request
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [productNeeded, setProductNeeded] = useState('Atlantic Salmon')
  const [quantity, setQuantity] = useState('500 KG')
  const [freshFrozen, setFreshFrozen] = useState('Fresh / Frozen')
  const [location, setLocation] = useState('Amsterdam Port, Netherlands')
  const [packagingProcessing, setPackagingProcessing] = useState('Fillet (Vacuum Packed)')
  const [deliveryDate, setDeliveryDate] = useState('Friday')
  const [targetPrice, setTargetPrice] = useState('€7.50 / kg')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [requestError, setRequestError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Search filter
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all')

  // Load Initial Data from localStorage or defaults
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedReqs = localStorage.getItem('buyer_sourcing_requests_list')
        if (storedReqs) {
          const parsed = JSON.parse(storedReqs)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRequests(parsed)
          } else {
            setRequests(INITIAL_BUYER_REQUESTS)
            localStorage.setItem('buyer_sourcing_requests_list', JSON.stringify(INITIAL_BUYER_REQUESTS))
          }
        } else {
          setRequests(INITIAL_BUYER_REQUESTS)
          localStorage.setItem('buyer_sourcing_requests_list', JSON.stringify(INITIAL_BUYER_REQUESTS))
        }

        const storedOffers = localStorage.getItem('buyer_supplier_offers_list')
        if (storedOffers) {
          const parsed = JSON.parse(storedOffers)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOffers(parsed)
          } else {
            setOffers(INITIAL_SUPPLIER_OFFERS)
            localStorage.setItem('buyer_supplier_offers_list', JSON.stringify(INITIAL_SUPPLIER_OFFERS))
          }
        } else {
          setOffers(INITIAL_SUPPLIER_OFFERS)
          localStorage.setItem('buyer_supplier_offers_list', JSON.stringify(INITIAL_SUPPLIER_OFFERS))
        }
      } catch (_) {
        setRequests(INITIAL_BUYER_REQUESTS)
        setOffers(INITIAL_SUPPLIER_OFFERS)
      }
    }
  }, [])

  // Save requests to storage helper
  const saveRequests = (updated: BuyerRequestItem[]) => {
    setRequests(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('buyer_sourcing_requests_list', JSON.stringify(updated))
    }
  }

  // Save offers to storage helper
  const saveOffers = (updated: SupplierOfferNotification[]) => {
    setOffers(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('buyer_supplier_offers_list', JSON.stringify(updated))
    }
  }

  // Handle Creating a New Product Request
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productNeeded.trim() || !quantity.trim() || !location.trim()) {
      setRequestError('Please fill in product, quantity, and delivery location.')
      return
    }

    const newReq: BuyerRequestItem = {
      id: 'req-buyer-' + Date.now(),
      productNeeded: productNeeded.trim(),
      quantity: quantity.trim(),
      freshFrozen,
      location: location.trim(),
      packagingProcessing: packagingProcessing.trim(),
      deliveryDate: deliveryDate.trim(),
      targetPrice: targetPrice.trim() || undefined,
      additionalNotes: additionalNotes.trim() || undefined,
      status: 'open',
      createdAt: new Date().toISOString(),
      userEmail: user?.email || undefined,
    }

    const updated = [newReq, ...requests]
    saveRequests(updated)

    // Also sync to Supabase if connected
    if (user) {
      try {
        supabase.from('buyer_requests').insert({
          id: newReq.id,
          user_id: user.id,
          title: `${newReq.quantity} ${newReq.productNeeded} — ${newReq.location}`,
          description: JSON.stringify(newReq),
          destination: newReq.location,
          status: 'open',
        }).then(() => {}).catch(() => {})
      } catch (_) {}
    }

    setShowRequestModal(false)
    setSuccessMsg(`Product request for "${quantity} ${productNeeded}" posted! Suppliers are being notified.`)
    setTimeout(() => setSuccessMsg(null), 5000)

    // Reset Form
    setProductNeeded('Atlantic Salmon')
    setQuantity('500 KG')
    setLocation('Amsterdam Port, Netherlands')
    setPackagingProcessing('Fillet (Vacuum Packed)')
    setDeliveryDate('Friday')
    setTargetPrice('€7.50 / kg')
    setAdditionalNotes('')
    setRequestError(null)
  }

  // Handle Deleting / Closing a Request
  const handleDeleteRequest = (id: string, title: string) => {
    if (confirm(`Are you sure you want to close this request: "${title}"?`)) {
      const updated = requests.filter((r) => r.id !== id)
      saveRequests(updated)
      setSuccessMsg(`Request "${title}" has been closed.`)
      setTimeout(() => setSuccessMsg(null), 4000)
    }
  }

  // Handle Mark Offer as Read
  const handleToggleReadOffer = (offerId: string) => {
    const updated = offers.map((o) => (o.id === offerId ? { ...o, isRead: !o.isRead } : o))
    saveOffers(updated)
  }

  const unreadOffersCount = offers.filter((o) => !o.isRead).length
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Buyer'

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      r.productNeeded.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.quantity.toLowerCase().includes(q) ||
      (r.additionalNotes?.toLowerCase().includes(q) ?? false)
    )
  })

  const filteredOffers = offers.filter((o) => {
    if (notificationFilter === 'unread' && o.isRead) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      o.supplierName.toLowerCase().includes(q) ||
      o.requestTitle.toLowerCase().includes(q) ||
      o.message.toLowerCase().includes(q) ||
      o.pricePerKg.toLowerCase().includes(q)
    )
  })

  const SIDEBAR_ITEMS = [
    { key: 'notifications', label: 'Notifications (Replies)', icon: Bell, badge: unreadOffersCount },
    { key: 'requests', label: 'Product Requests', icon: ShoppingBag, badge: requests.length },
  ]

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 px-4 sm:px-6 lg:px-8 font-sans">
      {/* ── Main Dashboard Shell ── */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col lg:flex-row min-h-[780px]">

        {/* ── Left Sidebar (Admin-Matched Styling) ── */}
        <aside className="w-full lg:w-64 bg-[#022B96] text-white p-6 flex flex-col justify-between shrink-0">
          <div>
            {/* Brand emblem */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#022B96] font-black text-lg flex items-center justify-center shadow-md">
                B
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight leading-none">Bokhol</h2>
                <span className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Buyer Center</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-2">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = activeNav === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveNav(item.key as any)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#022B96] shadow-lg translate-x-1'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#022B96]' : 'text-blue-200'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[#022B96] text-white'
                            : item.key === 'notifications' && unreadOffersCount > 0
                            ? 'bg-emerald-400 text-slate-900 animate-pulse'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-blue-400/20 space-y-3">
            <button
              onClick={() => performSignOut('/login')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-200 hover:text-white hover:bg-red-500/20 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-300" />
              <span>Sign Out</span>
            </button>

            <div className="text-[11px] text-blue-200 font-medium">
              <p className="font-bold text-white">Bokhol FishMarketCap</p>
              <p className="opacity-80">Buyer Sourcing Portal v2.4</p>
            </div>
          </div>
        </aside>

        {/* ── Right Content Area ── */}
        <main className="flex-1 p-6 sm:p-8 flex flex-col justify-between bg-slate-50/50">
          <div className="space-y-6">

            {/* Global Success Notification */}
            {successMsg && (
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
                <button
                  onClick={() => setSuccessMsg(null)}
                  className="text-emerald-500 hover:text-emerald-800 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}



            {/* ════════════════════════════════════════════════════════════════ */}
            {/* VIEW 2: PRODUCT REQUESTS (MAKE & MANAGE REQUESTS)               */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeNav === 'requests' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Buying Requests</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Submit sourcing requests and specs to receive direct quotes from certified seafood suppliers.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Make Product Request
                  </button>
                </div>

                {/* Search Bar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search requests by fish species, port, quantity..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {filteredRequests.length} Requests Found
                  </span>
                </div>

                {/* Requests Cards List */}
                {filteredRequests.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredRequests.map((req) => {
                      const relatedOffers = offers.filter((o) => o.requestId === req.id)
                      return (
                        <div
                          key={req.id}
                          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-[#022B96]/40 hover:shadow-md transition space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-[#022B96] flex items-center justify-center font-black text-sm shrink-0 border border-blue-100">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                                  {req.quantity} {req.productNeeded}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Posted {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {relatedOffers.length > 0 ? (
                                <button
                                  onClick={() => setActiveNav('notifications')}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl cursor-pointer hover:bg-emerald-100 transition"
                                >
                                  <Bell className="w-3.5 h-3.5 text-emerald-600" />
                                  {relatedOffers.length} Supplier Quote{relatedOffers.length > 1 ? 's' : ''} Received
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl">
                                  <Clock className="w-3 h-3" />
                                  Awaiting Supplier Quotes
                                </span>
                              )}

                              <button
                                onClick={() => handleDeleteRequest(req.id, `${req.quantity} ${req.productNeeded}`)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                title="Close Request"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Request Specifications Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Condition</span>
                              <span className="font-bold text-slate-800 mt-0.5 block">{req.freshFrozen}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Location / Port</span>
                              <span className="font-bold text-slate-800 mt-0.5 block truncate flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                {req.location}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Processing &amp; Packaging</span>
                              <span className="font-bold text-slate-800 mt-0.5 block truncate">{req.packagingProcessing}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Target Delivery &amp; Price</span>
                              <span className="font-bold text-[#022B96] mt-0.5 block truncate">
                                {req.deliveryDate} {req.targetPrice ? `• ${req.targetPrice}` : ''}
                              </span>
                            </div>
                          </div>

                          {req.additionalNotes && (
                            <p className="text-xs text-slate-600 bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                              <strong>Buyer Note:</strong> {req.additionalNotes}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl space-y-3">
                    <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">No Buying Requests Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Submit your required fish species, volume, and delivery destination to receive offers from suppliers.
                    </p>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#022B96] text-white text-xs font-bold rounded-2xl shadow-sm transition hover:bg-[#011a5e] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Post First Request
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* VIEW 3: NOTIFICATIONS / SUPPLIER OFFERS & REPLIES               */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeNav === 'notifications' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      Supplier Offers &amp; Notifications
                      {unreadOffersCount > 0 && (
                        <span className="text-xs bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                          {unreadOffersCount} New
                        </span>
                      )}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Incoming price quotes, availability guarantees, and replies from verified suppliers to your requests.
                    </p>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
                    <button
                      onClick={() => setNotificationFilter('all')}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                        notificationFilter === 'all'
                          ? 'bg-white text-[#022B96] shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Offers ({offers.length})
                    </button>
                    <button
                      onClick={() => setNotificationFilter('unread')}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                        notificationFilter === 'unread'
                          ? 'bg-white text-[#022B96] shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Unread ({unreadOffersCount})
                    </button>
                  </div>
                </div>

                {/* Notifications list */}
                {filteredOffers.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredOffers.map((offer) => (
                      <div
                        key={offer.id}
                        className={`rounded-3xl p-6 border transition-all duration-200 space-y-4 ${
                          !offer.isRead
                            ? 'bg-white border-blue-300 shadow-md ring-2 ring-[#022B96]/5'
                            : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        {/* Supplier Info & Quoted Price */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-start gap-3.5">
                            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-[#022B96] flex items-center justify-center font-extrabold text-sm shrink-0 border border-blue-100">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-slate-900 text-sm">{offer.supplierName}</h3>
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-100">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Verified Supplier
                                </span>
                                {offer.supplierCountry && (
                                  <span className="text-[11px] text-slate-400 font-medium">({offer.supplierCountry})</span>
                                )}
                              </div>
                              <p className="text-xs text-[#022B96] font-bold mt-1">
                                In response to: <span className="text-slate-700 font-medium">{offer.requestTitle}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                            <span className="text-lg font-black text-[#022B96] bg-blue-50/70 px-3.5 py-1.5 rounded-2xl border border-blue-100">
                              {offer.pricePerKg}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {offer.createdAt}
                            </span>
                          </div>
                        </div>

                        {/* Proposal Details */}
                        <div className="space-y-2">
                          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                              Delivery &amp; Logistics Guarantee
                            </span>
                            <span className="font-bold text-slate-800">{offer.deliveryTerms}</span>
                          </div>

                          <div className="bg-blue-50/30 p-3.5 rounded-2xl border border-blue-100/60 text-xs text-slate-700 leading-relaxed">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#022B96] block mb-1">
                              Supplier Message
                            </span>
                            <p>{offer.message}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <button
                            onClick={() => handleToggleReadOffer(offer.id)}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          >
                            {offer.isRead ? 'Mark as Unread' : '✓ Mark as Read'}
                          </button>

                          <div className="flex items-center gap-2">
                            {offer.supplierEmail && (
                              <a
                                href={`mailto:${offer.supplierEmail}?subject=Quote%20Inquiry%20from%20Bokhol%20Buyer&body=Hello%20${encodeURIComponent(offer.supplierName)},%20I%20reviewed%20your%20quote%20on%20Bokhol%20for%20${encodeURIComponent(offer.requestTitle)}.`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5 text-[#022B96]" />
                                Email Supplier
                              </a>
                            )}

                            <a
                              href={`https://wa.me/31684033593?text=${encodeURIComponent(
                                `Hello ${offer.supplierName}, I received your quote on Bokhol for: ${offer.requestTitle} at ${offer.pricePerKg}. Let's discuss details.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#20bc5a] text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                            >
                              {/* WhatsApp icon */}
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              Accept &amp; Chat on WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl space-y-3">
                    <Bell className="h-10 w-10 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">No Supplier Offers Yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      When verified suppliers submit price quotes and availability to your requests, they will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Card Footer */}
          <div className="pt-8 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400 font-semibold mt-8">
            <span>Bokhol Buyer Sourcing Platform</span>
            <span>All Data Synchronized in Real-Time</span>
          </div>
        </main>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MODAL: POST / MAKE PRODUCT REQUEST                              */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in">
            {/* Header */}
            <div className="bg-[#022B96] text-white p-6 relative">
              <button
                onClick={() => setShowRequestModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/15 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 bg-white/15 px-2.5 py-0.5 rounded-full mb-1 inline-block">
                Sourcing Inquiry
              </span>
              <h3 className="text-xl font-black text-white">Post Buyer Sourcing Request</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Tell verified seafood suppliers what product specs and delivery location you need.
              </p>
            </div>

            {requestError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{requestError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Product & Quantity */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Product Needed <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atlantic Salmon, Cod, Tuna"
                    value={productNeeded}
                    onChange={(e) => setProductNeeded(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Quantity Needed <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 KG, 2 Tons"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition"
                  />
                </div>
              </div>

              {/* Condition Selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Condition <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Fresh', 'Frozen', 'Fresh / Frozen'].map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setFreshFrozen(cond)}
                      className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        freshFrozen === cond
                          ? 'bg-[#022B96] text-white border-[#022B96] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location & Processing */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Delivery Location / Port <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amsterdam, Rotterdam, Vigo"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Packaging / Fillet
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fillet, Whole Gutted, IQF"
                    value={packagingProcessing}
                    onChange={(e) => setPackagingProcessing(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition"
                  />
                </div>
              </div>

              {/* Target Delivery & Target Price */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Target Delivery Day / Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Friday, Next Week"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Target Price (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. €7.50 / kg"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition"
                  />
                </div>
              </div>

              {/* Extra Notes */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Extra Specifications / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Specify size requirements, temperature specs, or certification requirements..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition resize-none leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#022B96]/20"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Post Sourcing Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

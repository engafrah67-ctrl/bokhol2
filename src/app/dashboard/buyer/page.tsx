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

  // Load Real Data from Supabase and client storage
  useEffect(() => {
    async function loadBuyerData() {
      if (user?.id) {
        try {
          const { data: dbRequests } = await supabase
            .from('buyer_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

                  if (dbRequests && dbRequests.length > 0) {
            const mapped: BuyerRequestItem[] = dbRequests.map((r: any) => {
              let parsed: any = {}
              try { parsed = JSON.parse(r.description || '{}') } catch (_) {}
              return {
                id: r.id,
                productNeeded: parsed.productNeeded || r.title || 'Seafood Product',
                quantity: r.quantity ? `${r.quantity} ${r.quantity_unit || 'KG'}` : (parsed.quantity || 'Bulk'),
                freshFrozen: parsed.freshFrozen || 'Fresh / Frozen',
                location: r.destination || parsed.location || 'Europe',
                packagingProcessing: parsed.packagingProcessing || 'Standard Packaging',
                deliveryDate: parsed.deliveryDate || 'Flexible',
                targetPrice: r.target_price ? `€${r.target_price} / kg` : (parsed.targetPrice || ''),
                additionalNotes: typeof parsed.additionalNotes === 'string' ? parsed.additionalNotes : (r.description || ''),
                status: r.status || 'open',
                createdAt: r.created_at,
              }
            })
            setRequests(mapped)
          } else {
            setRequests([])
          }
        } catch (err) {
          console.error('Error fetching buyer requests:', err)
          setRequests([])
        }
      }
    }

    loadBuyerData()
  }, [user?.id, supabase])

  // Save requests to state
  const saveRequests = (updated: BuyerRequestItem[]) => {
    setRequests(updated)
  }

  // Save offers to state
  const saveOffers = (updated: SupplierOfferNotification[]) => {
    setOffers(updated)
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
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Main Dashboard Shell ── */}
        <div className="max-w-7xl mx-auto bg-white border-x border-gray-200 overflow-hidden flex flex-col lg:flex-row min-h-screen">

        {/* ── Left Sidebar ── */}
        <aside className="w-full lg:w-56 bg-white border-r border-gray-200 p-5 flex flex-col justify-between shrink-0">
          <div>
            {/* Brand */}
            <div className="flex items-center gap-2.5 mb-8 pb-5 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-[#022B96] text-white font-black text-sm flex items-center justify-center">
                B
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 leading-none">Bokhol</h2>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Buyer Center</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = activeNav === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveNav(item.key as any)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#022B96]/8 text-[#022B96]'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#022B96]' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-[#022B96] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => performSignOut('/login')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ── Right Content Area ── */}
        <main className="flex-1 p-6 sm:p-8 flex flex-col bg-gray-50">
          <div className="space-y-6">

            {/* Global Success Notification */}
            {successMsg && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{successMsg}</span>
                </div>
                <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}



            {/* ════════════════════════════════════════════════════════════════ */}
            {/* VIEW 2: PRODUCT REQUESTS (MAKE & MANAGE REQUESTS)               */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeNav === 'requests' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Product Requests</h1>
                    <p className="text-xs text-gray-400 mt-0.5">Submit sourcing requests to receive direct quotes from verified suppliers.</p>
                  </div>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-semibold rounded-lg transition cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Request
                  </button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#022B96] focus:ring-1 focus:ring-[#022B96]/20 transition"
                  />
                </div>

                {/* Requests List */}
                {filteredRequests.length > 0 ? (
                  <div className="space-y-3">
                    {filteredRequests.map((req) => {
                      const relatedOffers = offers.filter((o) => o.requestId === req.id)
                      return (
                        <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm">
                                {req.quantity} {req.productNeeded}
                              </h3>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Posted {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {relatedOffers.length > 0 ? (
                                <button
                                  onClick={() => setActiveNav('notifications')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold rounded-md cursor-pointer hover:bg-emerald-100 transition"
                                >
                                  <Bell className="w-3 h-3" />
                                  {relatedOffers.length} Quote{relatedOffers.length > 1 ? 's' : ''}
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-md">
                                  <Clock className="w-3 h-3" />
                                  Awaiting quotes
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteRequest(req.id, `${req.quantity} ${req.productNeeded}`)}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-3 border-t border-gray-100">
                            <div>
                              <span className="text-gray-400 block mb-0.5">Condition</span>
                              <span className="font-medium text-gray-700">{req.freshFrozen}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block mb-0.5">Location</span>
                              <span className="font-medium text-gray-700 truncate block">{req.location}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block mb-0.5">Packaging</span>
                              <span className="font-medium text-gray-700 truncate block">{req.packagingProcessing}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block mb-0.5">Delivery</span>
                              <span className="font-medium text-[#022B96]">
                                {req.deliveryDate}{req.targetPrice ? ` · ${req.targetPrice}` : ''}
                              </span>
                            </div>
                          </div>

                          {req.additionalNotes && (
                            <p className="text-xs text-gray-500 pt-2 border-t border-gray-100 leading-relaxed">
                              {req.additionalNotes}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-gray-200 rounded-xl space-y-3">
                    <ShoppingBag className="h-8 w-8 text-gray-200 mx-auto" />
                    <h3 className="text-sm font-semibold text-gray-700">No requests yet</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">Submit your first sourcing request to receive supplier quotes.</p>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#022B96] text-white text-xs font-semibold rounded-lg transition hover:bg-[#011a5e] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
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
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      Supplier Offers
                      {unreadOffersCount > 0 && (
                        <span className="text-[10px] bg-[#022B96] text-white font-semibold px-2 py-0.5 rounded-full">
                          {unreadOffersCount} New
                        </span>
                      )}
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">Price quotes and replies from verified suppliers.</p>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg self-start sm:self-auto">
                    <button
                      onClick={() => setNotificationFilter('all')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                        notificationFilter === 'all'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      All Offers ({offers.length})
                    </button>
                    <button
                      onClick={() => setNotificationFilter('unread')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                        notificationFilter === 'unread'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Unread ({unreadOffersCount})
                    </button>
                  </div>
                </div>

                {/* Offer cards */}
                {filteredOffers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredOffers.map((offer) => (
                      <div
                        key={offer.id}
                        className={`bg-white border rounded-xl p-5 transition space-y-4 ${
                          !offer.isRead ? 'border-blue-200' : 'border-gray-200'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900 text-sm">{offer.supplierName}</h3>
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Verified
                              </span>
                              {offer.supplierCountry && (
                                <span className="text-xs text-gray-400">({offer.supplierCountry})</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              In response to: <span className="text-gray-600">{offer.requestTitle}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-bold text-[#022B96]">{offer.pricePerKg}</span>
                            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center justify-end gap-1">
                              <Clock className="w-3 h-3" />
                              {offer.createdAt}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 pt-3 border-t border-gray-100">
                          <div className="text-xs">
                            <span className="text-gray-400 font-medium block mb-0.5">Delivery &amp; Logistics</span>
                            <span className="text-gray-700">{offer.deliveryTerms}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-400 font-medium block mb-0.5">Supplier Message</span>
                            <p className="text-gray-600 leading-relaxed">{offer.message}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleToggleReadOffer(offer.id)}
                            className="text-xs text-gray-400 hover:text-gray-700 transition cursor-pointer"
                          >
                            {offer.isRead ? 'Mark as Unread' : '✓ Mark as Read'}
                          </button>

                          <div className="flex items-center gap-2">
                            {offer.supplierEmail && (
                              <a
                                href={`mailto:${offer.supplierEmail}?subject=Quote%20Inquiry%20from%20Bokhol%20Buyer&body=Hello%20${encodeURIComponent(offer.supplierName)},%20I%20reviewed%20your%20quote%20on%20Bokhol%20for%20${encodeURIComponent(offer.requestTitle)}.`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium rounded-lg transition cursor-pointer"
                              >
                                <Mail className="w-3 h-3" />
                                Email Supplier
                              </a>
                            )}
                            <a
                              href={`https://wa.me/31684033593?text=${encodeURIComponent(
                                `Hello ${offer.supplierName}, I received your quote on Bokhol for: ${offer.requestTitle} at ${offer.pricePerKg}. Let's discuss details.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bc5a] text-white text-xs font-medium rounded-lg transition cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              Chat on WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-gray-200 rounded-xl space-y-3">
                    <Bell className="h-8 w-8 text-gray-200 mx-auto" />
                    <h3 className="text-sm font-semibold text-gray-700">No supplier offers yet</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      When suppliers submit quotes to your requests, they will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-6 mt-8 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Bokhol Buyer Portal</span>
            <span>Real-time synchronized</span>
          </div>
        </main>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MODAL: POST / MAKE PRODUCT REQUEST                              */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-gray-900">New Sourcing Request</h3>
                <p className="text-xs text-gray-400 mt-0.5">Tell suppliers what you need and they'll send you quotes.</p>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {requestError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{requestError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Product & Quantity */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">Product Needed <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atlantic Salmon, Cod, Tuna"
                    value={productNeeded}
                    onChange={(e) => setProductNeeded(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#022B96] focus:ring-1 focus:ring-[#022B96]/20 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">Quantity <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 KG, 2 Tons"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#022B96] focus:ring-1 focus:ring-[#022B96]/20 transition"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-600">Condition <span className="text-red-400">*</span></label>
                <div className="flex gap-2">
                  {['Fresh', 'Frozen', 'Fresh / Frozen'].map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setFreshFrozen(cond)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition cursor-pointer border ${
                        freshFrozen === cond
                          ? 'bg-[#022B96] text-white border-[#022B96]'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location & Processing */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">Delivery Location <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amsterdam, Rotterdam"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#022B96] focus:ring-1 focus:ring-[#022B96]/20 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">Packaging / Processing</label>
                  <input
                    type="text"
                    placeholder="e.g. Fillet, Whole Gutted, IQF"
                    value={packagingProcessing}
                    onChange={(e) => setPackagingProcessing(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#022B96] focus:ring-1 focus:ring-[#022B96]/20 transition"
                  />
                </div>
              </div>

              {/* Delivery & Price */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">Target Delivery</label>
                  <input
                    type="text"
                    placeholder="e.g. Friday, Next Week"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#022B96] focus:ring-1 focus:ring-[#022B96]/20 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">Target Price (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. €7.50 / kg"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#022B96] focus:ring-1 focus:ring-[#022B96]/20 transition"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-600">Extra Notes</label>
                <textarea
                  rows={3}
                  placeholder="Certification requirements, size specs, temperature, etc."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#022B96] focus:ring-1 focus:ring-[#022B96]/20 transition resize-none leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg text-xs hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white font-medium rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3 h-3" />
                  Post Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Fish,
  TrendingUp,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  AlertCircle,
  X,
  User,
  Calendar,
  Check,
  DollarSign,
} from 'lucide-react'
import {
  CompanyProfile,
  getStoredCompanies,
  approveProfileClaim,
  rejectProfileClaim,
} from '@/lib/data/companies-data'
import {
  getStoredSupplierPosts,
  updateProductPrice,
  getFishImageForProduct,
  SupplierPost,
} from '@/lib/data/products-data'

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  const [activeNav, setActiveNav] = useState<'overview' | 'verification' | 'posts' | 'indexes' | 'users'>('verification')

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuyers: 0,
    totalSuppliers: 0,
    totalBuyerRequests: 0,
  })

  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [supplierPosts, setSupplierPosts] = useState<SupplierPost[]>([])

  const [updatingPostModal, setUpdatingPostModal] = useState<SupplierPost | null>(null)
  const [updatePriceInput, setUpdatePriceInput] = useState<string>('')
  const [updateCurrencyInput, setUpdateCurrencyInput] = useState<string>('EUR')
  const [updateAvailInput, setUpdateAvailInput] = useState<string>('In Stock — Ready to Ship')
  const [priceUpdateMsg, setPriceUpdateMsg] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [claimFilter, setClaimFilter] = useState<'all' | 'pending' | 'claimed' | 'rejected'>('pending')

  const [selectedCompanyModal, setSelectedCompanyModal] = useState<CompanyProfile | null>(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState('')

  const reloadCompanies = () => {
    setCompanies(getStoredCompanies())
  }

  useEffect(() => {
    async function initAdminAuthAndData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user

        if (!user) {
          router.replace('/login?next=/dashboard/admin')
          return
        }

        const isAdminEmail = user.email === 'admin@gmail.com'

        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        const userRole = profile?.role || user.user_metadata?.role

        if (!isAdminEmail && userRole !== 'admin') {
          router.replace('/dashboard')
          return
        }

        setAuthorized(true)
        reloadCompanies()

        const [usersRes, requestsRes] = await Promise.all([
          supabase.from('users').select('id, role', { count: 'exact' }),
          supabase.from('buyer_requests').select('id', { count: 'exact' }),
        ])

        const usersList: any[] = usersRes.data || []
        const totalU = usersRes.count || usersList.length || 1
        const totalB = usersList.filter((u: any) => u.role === 'buyer').length
        const totalS = usersList.filter((u: any) => u.role === 'supplier').length
        const totalReq = requestsRes.count || 0

        setStats({
          totalUsers: totalU,
          totalBuyers: totalB,
          totalSuppliers: totalS,
          totalBuyerRequests: totalReq,
        })

        setSupplierPosts(getStoredSupplierPosts())
      } catch (err) {
        console.error('Admin initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAdminAuthAndData()
  }, [router, supabase])

  const handleApproveClaim = (companyId: string) => {
    approveProfileClaim(companyId)
    reloadCompanies()
    if (selectedCompanyModal?.id === companyId) setSelectedCompanyModal(null)
  }

  const handleRejectClaim = (companyId: string) => {
    rejectProfileClaim(companyId, rejectionReasonInput || undefined)
    reloadCompanies()
    setRejectionReasonInput('')
    if (selectedCompanyModal?.id === companyId) setSelectedCompanyModal(null)
  }

  const pendingClaims = companies.filter((c) => c.status === 'claim_requested')
  const claimedCompanies = companies.filter((c) => c.status === 'claimed')
  const rejectedClaims = companies.filter((c) => c.status === 'rejected')

  const filteredClaims = companies.filter((c) => {
    if (claimFilter === 'pending' && c.status !== 'claim_requested') return false
    if (claimFilter === 'claimed' && c.status !== 'claimed') return false
    if (claimFilter === 'rejected' && c.status !== 'rejected') return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        (c.claimRequest?.fullName?.toLowerCase().includes(q) ?? false) ||
        (c.claimRequest?.businessEmail?.toLowerCase().includes(q) ?? false)
      )
    }
    return true
  })

  if (loading || !authorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#022B96]" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Admin Panel...</span>
        </div>
      </div>
    )
  }

  const SIDEBAR_ITEMS = [
    { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'verification', label: 'Verification', icon: ShieldCheck, badge: pendingClaims.length },
    { key: 'posts', label: 'Product Offers', icon: Fish, badge: supplierPosts.length },
    { key: 'indexes', label: 'Market Index', icon: TrendingUp },
    { key: 'users', label: 'User Directory', icon: Users, badge: stats.totalUsers },
  ]

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 px-4 sm:px-6 lg:px-8 font-sans">

      {/* ── Main Dashboard Container ── */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col lg:flex-row min-h-[780px]">

        {/* ── Left Sidebar ── */}
        <aside className="w-full lg:w-64 bg-[#022B96] text-white p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#022B96] font-black text-lg flex items-center justify-center shadow-md">B</div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight leading-none">Bokhol</h2>
                <span className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Admin Center</span>
              </div>
            </div>

            <nav className="space-y-2">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = activeNav === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveNav(item.key as any)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive ? 'bg-white text-[#022B96] shadow-lg translate-x-1' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#022B96]' : 'text-blue-200'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-[#022B96] text-white' : 'bg-white/20 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-blue-400/20 text-[11px] text-blue-200 font-medium">
            <p className="font-bold text-white">Bokhol FishMarketCap</p>
            <p className="text-[10px] opacity-75 mt-0.5">Admin Security Console v2.4</p>
          </div>
        </aside>

        {/* ── Right Content Area ── */}
        <main className="flex-1 p-6 sm:p-10 bg-slate-50/50 flex flex-col justify-between">
          <div>

            {/* VIEW 1: VERIFICATION */}
            {activeNav === 'verification' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Supplier Profile Claims</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {filteredClaims.length} verification requests found
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search company or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-6">
                    {[
                      { key: 'pending', label: 'Pending', count: pendingClaims.length },
                      { key: 'claimed', label: 'Approved', count: claimedCompanies.length },
                      { key: 'rejected', label: 'Rejected', count: rejectedClaims.length },
                      { key: 'all', label: 'All', count: companies.length },
                    ].map(({ key, label, count }) => (
                      <button
                        key={key}
                        onClick={() => setClaimFilter(key as any)}
                        className={`relative text-xs font-extrabold pb-3 transition cursor-pointer ${
                          claimFilter === key
                            ? 'text-[#022B96] after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#022B96]'
                            : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        {label} <span className="ml-1 opacity-70">({count})</span>
                      </button>
                    ))}
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Updated Live</span>
                  </div>
                </div>

                {filteredClaims.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No requests found</h3>
                    <p className="text-xs text-slate-400">No verification requests match your query or filter.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <div className="col-span-3">Company / Id</div>
                      <div className="col-span-3">Applicant Info</div>
                      <div className="col-span-2">Domain Check</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2 text-right">Action</div>
                    </div>

                    {filteredClaims.map((company) => {
                      const req = company.claimRequest
                      const companyDomain = company.domain || company.email?.split('@')[1] || ''
                      const applicantDomain = req?.businessEmail ? req.businessEmail.split('@')[1] : ''
                      const domainMatches = companyDomain && applicantDomain && companyDomain.toLowerCase() === applicantDomain.toLowerCase()
                      const isPending = company.status === 'claim_requested'
                      const isClaimed = company.status === 'claimed'
                      const isRejected = company.status === 'rejected'

                      return (
                        <div
                          key={company.id}
                          className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 rounded-2xl border transition-all duration-200 items-center ${
                            isPending ? 'bg-amber-50/40 border-amber-200/80 shadow-xs hover:border-amber-300'
                            : isClaimed ? 'bg-white border-slate-200/80 hover:border-slate-300'
                            : 'bg-slate-50 border-slate-200/60 opacity-85'
                          }`}
                        >
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {company.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs truncate">{company.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{company.country} · #{company.id.slice(0, 6)}</p>
                            </div>
                          </div>

                          <div className="col-span-3 min-w-0">
                            {req ? (
                              <div>
                                <p className="font-bold text-slate-800 text-xs truncate">{req.fullName}</p>
                                <p className="text-[10px] text-slate-400 truncate">{req.businessEmail}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No claim submitted</p>
                            )}
                          </div>

                          <div className="col-span-2">
                            {req ? (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${domainMatches ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                                {domainMatches ? <Check className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-amber-600" />}
                                {domainMatches ? 'Match' : 'Mismatch'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">—</span>
                            )}
                          </div>

                          <div className="col-span-2">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold ${isPending ? 'text-amber-600' : isClaimed ? 'text-emerald-600' : 'text-rose-600'}`}>
                              <span className={`h-2 w-2 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : isClaimed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {isPending ? 'Pending' : isClaimed ? 'Approved' : 'Rejected'}
                            </span>
                          </div>

                          <div className="col-span-2 flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedCompanyModal(company)}
                              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApproveClaim(company.id)}
                                  className="px-3 py-1.5 bg-[#022B96] hover:bg-[#022B96]/90 text-white font-bold text-xs rounded-xl shadow-xs transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectClaim(company.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                                  title="Reject Claim"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: OVERVIEW */}
            {activeNav === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Overview</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Platform performance &amp; database activity metrics</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, sub: 'Registered Accounts', icon: Users, color: 'text-[#022B96]' },
                    { label: 'Buyers', value: stats.totalBuyers, sub: 'Active Buyer Accounts', icon: User, color: 'text-blue-600' },
                    { label: 'Suppliers', value: stats.totalSuppliers, sub: 'Verified Businesses', icon: Building2, color: 'text-emerald-600' },
                    { label: 'Pending Claims', value: pendingClaims.length, sub: 'Awaiting Verification', icon: ShieldCheck, color: 'text-amber-600' },
                  ].map((card) => {
                    const CardIcon = card.icon
                    return (
                      <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider">{card.label}</span>
                          <CardIcon className={`w-5 h-5 ${card.color}`} />
                        </div>
                        <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                        <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* VIEW 3: PRODUCT OFFERS */}
            {activeNav === 'posts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Supplier Product Offers</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{supplierPosts.length} published product listings</p>
                  </div>
                  {priceUpdateMsg && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" />
                      {priceUpdateMsg}
                    </div>
                  )}
                </div>

                {supplierPosts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Fish className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-bold text-slate-400">No supplier product posts yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {supplierPosts.map((p) => {
                      const img = getFishImageForProduct(p.product_name, p.custom_image)
                      const symbol = p.currency === 'USD' ? '$' : p.currency === 'GBP' ? '£' : '€'
                      return (
                        <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition space-y-3">
                          <div className="flex items-start gap-3">
                            <img
                              src={img}
                              alt={p.product_name}
                              className="h-14 w-14 rounded-xl object-contain border border-slate-100 bg-slate-50 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-extrabold text-slate-900 text-sm truncate">{p.product_name}</h3>
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full flex-shrink-0">
                                  {p.status || 'Active'}
                                </span>
                              </div>
                              <p className="text-sm font-black text-[#022B96] mt-0.5">{symbol}{p.price_per_kg?.toFixed(2)}/kg</p>
                              <p className="text-xs text-slate-400 mt-0.5">{p.fresh_frozen} · {p.country_of_origin}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Packaging</p>
                              <p className="font-bold text-slate-700 mt-0.5 truncate">{p.packaging}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Availability</p>
                              <p className="font-bold text-slate-700 mt-0.5 truncate">{p.availability}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                              <Clock className="w-3 h-3" />
                              {new Date(p.updated_at || p.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <button
                              onClick={() => {
                                setUpdatingPostModal(p)
                                setUpdatePriceInput(String(p.price_per_kg || ''))
                                setUpdateCurrencyInput(p.currency || 'EUR')
                                setUpdateAvailInput(p.availability || 'In Stock — Ready to Ship')
                                setPriceUpdateMsg(null)
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              Update Price
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 4: MARKET INDEXES */}
            {activeNav === 'indexes' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Market Benchmarks</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Weekly price index benchmarks across EU hubs</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { country: 'Spain', product: 'Yellowfin Tuna', price: '€5.31/kg' },
                    { country: 'Norway', product: 'Atlantic Salmon', price: '€8.45/kg' },
                    { country: 'Greece', product: 'Sea Bass', price: '€5.20/kg' },
                  ].map((item) => (
                    <div key={item.country} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                      <p className="text-[10px] font-extrabold uppercase text-[#022B96] mb-1">{item.country}</p>
                      <h3 className="font-bold text-slate-900 text-sm">{item.product}</h3>
                      <p className="text-xl font-black text-slate-900 mt-2">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 5: USER DIRECTORY */}
            {activeNav === 'users' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Accounts</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{stats.totalUsers} registered users in database</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">
                    Total Buyers: <strong className="text-[#022B96]">{stats.totalBuyers}</strong> · Total Suppliers: <strong className="text-emerald-600">{stats.totalSuppliers}</strong>
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>Bokhol Administration Platform</span>
            <span>All System Data Synchronized</span>
          </div>
        </main>
      </div>

      {/* ── Company Detail Modal ── */}
      {selectedCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-[#022B96] text-white p-6 relative">
              <button
                onClick={() => setSelectedCompanyModal(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 bg-white/15 px-2.5 py-0.5 rounded-full mb-2 inline-block">
                Claim Verification Details
              </span>
              <h3 className="text-xl font-black text-white">{selectedCompanyModal.name}</h3>
              <p className="text-xs text-blue-100 mt-0.5">{selectedCompanyModal.category} · {selectedCompanyModal.country}</p>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              {selectedCompanyModal.claimRequest && (
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-1.5">
                  <p className="font-bold text-slate-900 text-xs mb-2 border-b border-slate-200 pb-1">Applicant Details</p>
                  <p><strong className="text-slate-900">Name:</strong> {selectedCompanyModal.claimRequest.fullName}</p>
                  <p><strong className="text-slate-900">Job Title:</strong> {selectedCompanyModal.claimRequest.jobTitle}</p>
                  <p><strong className="text-slate-900">Business Email:</strong> {selectedCompanyModal.claimRequest.businessEmail}</p>
                  <p><strong className="text-slate-900">Phone:</strong> {selectedCompanyModal.claimRequest.phone}</p>
                </div>
              )}
              <div className="space-y-1 text-slate-600">
                <p><strong className="text-slate-900">Official Website:</strong> {selectedCompanyModal.website}</p>
                <p><strong className="text-slate-900">Official Address:</strong> {selectedCompanyModal.address}</p>
              </div>
              {selectedCompanyModal.status === 'claim_requested' && (
                <div className="pt-2">
                  <label className="block font-bold text-slate-900 text-xs mb-1">Rejection Reason (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. Email domain mismatch"
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#022B96]"
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedCompanyModal(null)}
                className="px-4 py-2 border border-slate-200 bg-white text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              {selectedCompanyModal.status === 'claim_requested' && (
                <>
                  <button
                    onClick={() => handleRejectClaim(selectedCompanyModal.id)}
                    className="px-4 py-2 border border-rose-200 bg-white text-rose-600 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveClaim(selectedCompanyModal.id)}
                    className="px-4 py-2 bg-[#022B96] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                  >
                    Approve &amp; Verify
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ UPDATE PRICE MODAL ══════════════════════════════════════════ */}
      {updatingPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="bg-[#022B96] text-white p-6 relative">
              <button
                onClick={() => setUpdatingPostModal(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/15 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 bg-white/15 px-2.5 py-0.5 rounded-full mb-2 inline-block">
                Admin Price Control
              </span>
              <h3 className="text-lg font-black text-white mt-1">{updatingPostModal.product_name}</h3>
              <p className="text-xs text-blue-200 mt-0.5">Override supplier price &amp; availability.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const post = updatingPostModal
                const numPrice = parseFloat(updatePriceInput)
                if (!post || isNaN(numPrice) || numPrice < 0) return
                const updatedPosts = updateProductPrice(post.id, numPrice, updateCurrencyInput, updateAvailInput)
                setSupplierPosts(updatedPosts)
                setPriceUpdateMsg(`"${post.product_name}" updated → ${updateCurrencyInput} ${numPrice.toFixed(2)}/kg`)
                setUpdatingPostModal(null)
              }}
              className="p-6 space-y-5"
            >
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">New Price per KG *</label>
                <div className="flex gap-2">
                  <select
                    value={updateCurrencyInput}
                    onChange={(e) => setUpdateCurrencyInput(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#022B96] transition cursor-pointer"
                  >
                    <option>EUR</option>
                    <option>USD</option>
                    <option>GBP</option>
                  </select>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 7.50"
                    value={updatePriceInput}
                    onChange={(e) => setUpdatePriceInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Availability</label>
                <select
                  value={updateAvailInput}
                  onChange={(e) => setUpdateAvailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#022B96] transition cursor-pointer"
                >
                  <option>In Stock — Ready to Ship</option>
                  <option>Available within 7 days</option>
                  <option>Available within 2 weeks</option>
                  <option>Available within 1 month</option>
                  <option>Pre-order Only</option>
                  <option>Seasonal</option>
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setUpdatingPostModal(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Save Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

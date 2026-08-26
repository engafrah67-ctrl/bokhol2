'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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
  Newspaper,
  Plus,
  Handshake,
  Upload,
  Trash2,
  Edit3,
  Globe,
  ImageIcon,
  LogOut,
  UserPlus,
  BadgeCheck,
  BadgeX,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { performSignOut } from '@/lib/auth-helpers'
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
import {
  getStoredNewsArticles,
  addNewsArticle,
  deleteNewsArticle,
  NewsArticle,
} from '@/lib/data/news-data'
import {
  PartnerBuyer,
  getStoredPartnerBuyers,
  addPartnerBuyer,
  updatePartnerBuyer,
  deletePartnerBuyer,
} from '@/lib/data/partner-buyers-data'

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  const [activeNav, setActiveNav] = useState<'overview' | 'verification' | 'claimed-profiles' | 'unclaimed-profiles' | 'add-supplier' | 'posts' | 'indexes' | 'news' | 'partners'>('verification')

  // Add Supplier form states
  const [newSupplierLogo, setNewSupplierLogo] = useState('')
  const [newSupplierEmail, setNewSupplierEmail] = useState('')
  const [newSupplierCompany, setNewSupplierCompany] = useState('')
  const [newSupplierCountry, setNewSupplierCountry] = useState('')
  const [newSupplierPhone, setNewSupplierPhone] = useState('')
  const [newSupplierSpecialty, setNewSupplierSpecialty] = useState('')
  const [addSupplierMsg, setAddSupplierMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [addSupplierLoading, setAddSupplierLoading] = useState(false)
  const [addedSuppliers, setAddedSuppliers] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('admin_added_suppliers') || '[]') } catch { return [] }
    }
    return []
  })

  const handleSupplierLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { if (ev.target?.result) setNewSupplierLogo(ev.target.result as string) }
    reader.readAsDataURL(file)
  }

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuyers: 0,
    totalSuppliers: 0,
    totalBuyerRequests: 0,
  })

  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [supplierPosts, setSupplierPosts] = useState<SupplierPost[]>([])
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [partnerBuyers, setPartnerBuyers] = useState<PartnerBuyer[]>([])

  // Partner Buyer Modal & Form states
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [editingPartner, setEditingPartner] = useState<PartnerBuyer | null>(null)
  const [partnerName, setPartnerName] = useState('')
  const [partnerLogo, setPartnerLogo] = useState('')
  const [partnerCountry, setPartnerCountry] = useState('')
  const [partnerWebsite, setPartnerWebsite] = useState('')
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('')
  const [partnerSuccessMsg, setPartnerSuccessMsg] = useState<string | null>(null)
  const [partnerFormError, setPartnerFormError] = useState<string | null>(null)

  // Publish News Modal states
  const [showAddNewsModal, setShowAddNewsModal] = useState(false)
  const [newsTitle, setNewsTitle] = useState('')
  const [newsCategory, setNewsCategory] = useState<'Market Update' | 'Trade' | 'Regulation' | 'Sustainability'>('Market Update')
  const [newsReadTime, setNewsReadTime] = useState('3 min read')
  const [newsExcerpt, setNewsExcerpt] = useState('')
  const [newsImageUrl, setNewsImageUrl] = useState('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80')
  const [newsAuthor, setNewsAuthor] = useState('Bokhol Research')
  const [newsFormError, setNewsFormError] = useState<string | null>(null)

  const handleNewsImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setNewsFormError('Image file is too large (max 5MB)')
      return
    }
    setNewsFormError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewsImageUrl(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

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
    let isMounted = true

    // Safety timeout: Guarantee loading finishes in max 1 second
    const timer = setTimeout(() => {
      if (isMounted) {
        setAuthorized(true)
        setLoading(false)
      }
    }, 1000)

    async function initAdminAuthAndData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user

        if (!user) {
          if (isMounted) {
            setLoading(false)
            router.replace('/login?next=/dashboard/admin')
          }
          return
        }

        const isAdminEmail = user.email === 'admin@gmail.com'

        let userRole = user.user_metadata?.role
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()
          if (profile?.role) userRole = profile.role
        } catch (_) {}

        if (!isAdminEmail && userRole !== 'admin') {
          if (isMounted) {
            setLoading(false)
            router.replace('/dashboard')
          }
          return
        }

        if (isMounted) {
          setAuthorized(true)
          reloadCompanies()
          setSupplierPosts(getStoredSupplierPosts())
          setNewsArticles(getStoredNewsArticles())
          setPartnerBuyers(getStoredPartnerBuyers())
        }

        // Fetch stats in non-blocking background
        try {
          const [usersRes, requestsRes] = await Promise.all([
            supabase.from('users').select('id, role', { count: 'exact' }),
            supabase.from('buyer_requests').select('id', { count: 'exact' }),
          ])

          if (isMounted) {
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
          }
        } catch (_) {}
      } catch (err) {
        console.error('Admin initialization error:', err)
        if (isMounted) setAuthorized(true)
      } finally {
        if (isMounted) setLoading(false)
        clearTimeout(timer)
      }
    }

    initAdminAuthAndData()

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
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

  // ── Partner Buyer Handlers ──
  const openAddPartnerModal = () => {
    setEditingPartner(null)
    setPartnerName('')
    setPartnerLogo('')
    setPartnerCountry('')
    setPartnerWebsite('')
    setPartnerFormError(null)
    setShowPartnerModal(true)
  }

  const openEditPartnerModal = (partner: PartnerBuyer) => {
    setEditingPartner(partner)
    setPartnerName(partner.name)
    setPartnerLogo(partner.logo)
    setPartnerCountry(partner.country || '')
    setPartnerWebsite(partner.website || '')
    setPartnerFormError(null)
    setShowPartnerModal(true)
  }

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setPartnerFormError('Logo image file is too large (max 5MB)')
      return
    }
    setPartnerFormError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setPartnerLogo(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerName.trim()) {
      setPartnerFormError('Buyer Name is required.')
      return
    }
    if (!partnerLogo.trim()) {
      setPartnerFormError('Buyer Logo is required. Please upload a file or provide an image path.')
      return
    }

    if (editingPartner) {
      updatePartnerBuyer(editingPartner.id, {
        name: partnerName.trim(),
        logo: partnerLogo.trim(),
        country: partnerCountry.trim() || undefined,
        website: partnerWebsite.trim() || undefined,
      })
      setPartnerSuccessMsg(`Partner Buyer "${partnerName}" updated successfully!`)
    } else {
      addPartnerBuyer({
        name: partnerName.trim(),
        logo: partnerLogo.trim(),
        country: partnerCountry.trim() || undefined,
        website: partnerWebsite.trim() || undefined,
      })
      setPartnerSuccessMsg(`New Partner Buyer "${partnerName}" added to the Home Screen ticker!`)
    }

    setPartnerBuyers(getStoredPartnerBuyers())
    setShowPartnerModal(false)
    setTimeout(() => setPartnerSuccessMsg(null), 5000)
  }

  const handleDeletePartner = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the Partner Buyers list?`)) {
      deletePartnerBuyer(id)
      setPartnerBuyers(getStoredPartnerBuyers())
      setPartnerSuccessMsg(`Partner Buyer "${name}" was removed.`)
      setTimeout(() => setPartnerSuccessMsg(null), 4000)
    }
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

  const filteredPartnerBuyers = partnerBuyers.filter((p) => {
    if (!partnerSearchQuery.trim()) return true
    const q = partnerSearchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.country?.toLowerCase().includes(q) ?? false) ||
      (p.website?.toLowerCase().includes(q) ?? false)
    )
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
    { key: 'claimed-profiles', label: 'Claimed Profiles', icon: BadgeCheck, badge: claimedCompanies.length },
    { key: 'unclaimed-profiles', label: 'Unclaimed Profiles', icon: BadgeX, badge: companies.filter(c => c.status !== 'claimed').length },
    { key: 'add-supplier', label: 'Add Supplier', icon: UserPlus },
    { key: 'partners', label: 'Partner Buyers', icon: Handshake, badge: partnerBuyers.length },
    { key: 'posts', label: 'Product Offers', icon: Fish, badge: supplierPosts.length },
    { key: 'news', label: 'News & Articles', icon: Newspaper, badge: newsArticles.length },
    { key: 'indexes', label: 'Market Index', icon: TrendingUp },
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
              <p className="text-[10px] opacity-75 mt-0.5">Admin Security Console v2.4</p>
            </div>
          </div>
        </aside>

        {/* ── Right Content Area ── */}
        <main className="flex-1 p-6 sm:p-10 bg-slate-50/50 flex flex-col justify-between">
          <div>

            {/* VIEW: CLAIMED PROFILES */}
            {activeNav === 'claimed-profiles' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">✅ Claimed Profiles</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Suppliers who have successfully claimed their company profile on Bokhol
                  </p>
                </div>

                {claimedCompanies.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <BadgeCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-sm font-bold text-slate-800">No Claimed Profiles Yet</h3>
                    <p className="text-xs text-slate-400 mt-1">No supplier has claimed their profile yet. Claims appear here once approved.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <div className="col-span-4">Company</div>
                      <div className="col-span-3">Contact Email</div>
                      <div className="col-span-2">Country</div>
                      <div className="col-span-3 text-right">Action</div>
                    </div>
                    {claimedCompanies.map((company) => (
                      <div key={company.id} className="bg-white border border-emerald-200/80 rounded-2xl px-5 py-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                            {company.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{company.name}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Verified & Claimed
                            </span>
                          </div>
                        </div>
                        <div className="col-span-3 text-xs text-slate-500 font-medium">{company.claimRequest?.businessEmail || company.email || '—'}</div>
                        <div className="col-span-2 text-xs font-semibold text-slate-700">{company.country}</div>
                        <div className="col-span-3 flex justify-end gap-2">
                          <button
                            onClick={() => { handleRejectClaim(company.id); reloadCompanies() }}
                            className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition cursor-pointer"
                          >
                            Revoke Claim
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW: UNCLAIMED PROFILES */}
            {activeNav === 'unclaimed-profiles' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">🔓 Unclaimed Profiles</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Supplier profiles that have not yet been claimed — including pending requests awaiting review
                  </p>
                </div>

                {companies.filter(c => c.status !== 'claimed').length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
                    <h3 className="text-sm font-bold text-slate-800">All Profiles Are Claimed</h3>
                    <p className="text-xs text-slate-400 mt-1">Every supplier profile on Bokhol has been claimed by a verified company.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <div className="col-span-4">Company</div>
                      <div className="col-span-3">Country</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-3 text-right">Action</div>
                    </div>
                    {companies.filter(c => c.status !== 'claimed').map((company) => {
                      const isPending = company.status === 'claim_requested'
                      return (
                        <div key={company.id} className={`bg-white border rounded-2xl px-5 py-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center ${
                          isPending ? 'border-amber-300/80 bg-amber-50/30' : 'border-slate-200/80'
                        }`}>
                          <div className="col-span-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                              {company.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{company.name}</p>
                              {isPending && <p className="text-[10px] text-amber-700 font-semibold">{company.claimRequest?.businessEmail}</p>}
                            </div>
                          </div>
                          <div className="col-span-3 text-xs font-semibold text-slate-600">{company.country}</div>
                          <div className="col-span-2">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                              isPending ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
                              {isPending ? 'Pending Review' : 'Unclaimed'}
                            </span>
                          </div>
                          <div className="col-span-3 flex justify-end gap-2">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleApproveClaim(company.id)}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleRejectClaim(company.id)}
                                  className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition cursor-pointer"
                                >
                                  ✕ Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium italic">Awaiting claim</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW: ADD SUPPLIER */}
            {activeNav === 'add-supplier' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add New Supplier</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Manually register a new verified supplier company to the Bokhol platform
                  </p>
                </div>

                {addSupplierMsg && (
                  <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
                    addSupplierMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    {addSupplierMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {addSupplierMsg.text}
                  </div>
                )}

                <form
                  className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!newSupplierEmail || !newSupplierCompany) {
                      setAddSupplierMsg({ type: 'error', text: 'Company name and business email are required.' })
                      return
                    }
                    setAddSupplierLoading(true)
                    setAddSupplierMsg(null)
                    try {
                      const { error } = await supabase.auth.signInWithOtp({ email: newSupplierEmail, options: { data: { role: 'supplier', company: newSupplierCompany, country: newSupplierCountry, phone: newSupplierPhone } } })
                      const newEntry = { id: 'sup-' + Date.now(), logo: newSupplierLogo, email: newSupplierEmail, company: newSupplierCompany, country: newSupplierCountry, phone: newSupplierPhone, specialty: newSupplierSpecialty, addedAt: new Date().toLocaleDateString() }
                      const updated = [newEntry, ...addedSuppliers]
                      setAddedSuppliers(updated)
                      try { localStorage.setItem('admin_added_suppliers', JSON.stringify(updated)) } catch (_) {}
                      setAddSupplierMsg({ type: 'success', text: error ? `✅ "${newSupplierCompany}" saved. Login invite will be sent to ${newSupplierEmail} when email is active.` : `✅ Invite sent to ${newSupplierEmail}! They can now sign in.` })
                      setNewSupplierLogo(''); setNewSupplierEmail(''); setNewSupplierCompany(''); setNewSupplierCountry(''); setNewSupplierPhone(''); setNewSupplierSpecialty('')
                    } catch (_) {
                      setAddSupplierMsg({ type: 'error', text: 'Something went wrong. Please try again.' })
                    }
                    setAddSupplierLoading(false)
                  }}
                >
                  {/* Logo / Image Upload */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">Company Logo / Image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                        {newSupplierLogo
                          ? <img src={newSupplierLogo} alt="logo" className="w-full h-full object-contain" />
                          : <ImageIcon className="w-6 h-6 text-slate-300" />
                        }
                      </div>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition">
                        <Upload className="w-3.5 h-3.5" />
                        Upload Logo
                        <input type="file" accept="image/*" className="hidden" onChange={handleSupplierLogoUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">Company Name *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input type="text" required value={newSupplierCompany} onChange={e => setNewSupplierCompany(e.target.value)} placeholder="e.g. NordSea Seafood B.V." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#022B96] transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">Business Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input type="email" required value={newSupplierEmail} onChange={e => setNewSupplierEmail(e.target.value)} placeholder="info@company.com" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#022B96] transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">Country</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input type="text" value={newSupplierCountry} onChange={e => setNewSupplierCountry(e.target.value)} placeholder="e.g. Netherlands" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#022B96] transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input type="text" value={newSupplierPhone} onChange={e => setNewSupplierPhone(e.target.value)} placeholder="+31 6 1234 5678" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#022B96] transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">Specialty</label>
                      <div className="relative">
                        <Fish className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input type="text" value={newSupplierSpecialty} onChange={e => setNewSupplierSpecialty(e.target.value)} placeholder="e.g. Atlantic Salmon, Cod, Tuna" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#022B96] transition" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={addSupplierLoading}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-[#022B96] hover:bg-[#011a5e] disabled:opacity-60 text-white text-sm font-extrabold rounded-2xl shadow-md transition cursor-pointer"
                    >
                      {addSupplierLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      {addSupplierLoading ? 'Adding...' : 'Add Supplier'}
                    </button>
                  </div>
                </form>

                {/* Previously Added Suppliers */}
                {addedSuppliers.length > 0 && (
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-700 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#022B96]" />
                      Added Suppliers ({addedSuppliers.length})
                    </h2>
                    <div className="space-y-2">
                      {addedSuppliers.map((s) => (
                        <div key={s.id} className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {s.logo
                                ? <img src={s.logo} alt="" className="w-full h-full object-contain" />
                                : <Building2 className="w-4 h-4 text-slate-400" />
                              }
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{s.company}</p>
                              <p className="text-[11px] text-slate-500">{s.email} {s.country ? `· ${s.country}` : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {s.specialty && <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">{s.specialty}</span>}
                            <span className="text-[10px] text-slate-400 font-medium">{s.addedAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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

            {/* VIEW 6: NEWS MANAGEMENT */}
            {activeNav === 'news' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Seafood Market News &amp; Articles</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Publish, compose, and manage market insights broadcasted across the site.</p>
                  </div>
                  <button
                    onClick={() => setShowAddNewsModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Publish New Article
                  </button>
                </div>

                {newsArticles.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {newsArticles.map((article) => (
                      <div key={article.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#022B96]/30 transition flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {article.image ? (
                            <img src={article.image} alt={article.title} className="w-20 h-20 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-blue-50 text-[#022B96] font-bold text-xs flex items-center justify-center flex-shrink-0">News</div>
                          )}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-[#022B96] px-2.5 py-0.5 rounded-full border border-blue-100">
                                {article.category}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">{article.readTime}</span>
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">{article.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                            <p className="text-[10px] text-slate-400 font-medium">By {article.author} · {article.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <Link href="/news" target="_blank">
                            <button className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
                              Preview
                            </button>
                          </Link>
                          {article.id.startsWith('news-admin-') && (
                            <button
                              onClick={() => {
                                deleteNewsArticle(article.id)
                                setNewsArticles(getStoredNewsArticles())
                              }}
                              className="px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl space-y-2">
                    <Newspaper className="h-10 w-10 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">No News Articles Published Yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">Publish market updates, trade reports, and regulatory news to inform global seafood buyers.</p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 7: PARTNER BUYERS MANAGEMENT */}
            {activeNav === 'partners' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">EU Partner Buyers</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Manage buyer partners &amp; brand logos displayed in the Home Screen ticker.
                    </p>
                  </div>
                  <button
                    onClick={openAddPartnerModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add Partner Buyer
                  </button>
                </div>

                {/* Success Banner */}
                {partnerSuccessMsg && (
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{partnerSuccessMsg}</span>
                    </div>
                    <button
                      onClick={() => setPartnerSuccessMsg(null)}
                      className="text-emerald-500 hover:text-emerald-800 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Info & Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search partner buyers by name, country..."
                      value={partnerSearchQuery}
                      onChange={(e) => setPartnerSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live on Home Screen ({partnerBuyers.length} partners)</span>
                  </div>
                </div>

                {/* Partner Buyers Grid */}
                {filteredPartnerBuyers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPartnerBuyers.map((partner) => (
                      <div
                        key={partner.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-[#022B96]/30 transition flex flex-col justify-between group"
                      >
                        <div>
                          {/* Logo container */}
                          <div className="h-24 w-full bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-3 mb-3 overflow-hidden">
                            <img
                              src={partner.logo}
                              alt={`${partner.name} logo`}
                              className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* Info */}
                          <div className="space-y-1">
                            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight truncate">
                              {partner.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                              {partner.country && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                                  {partner.country}
                                </span>
                              )}
                              {partner.website && (
                                <a
                                  href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#022B96] hover:underline inline-flex items-center gap-1"
                                >
                                  <Globe className="w-3 h-3" />
                                  Website
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
                          <button
                            onClick={() => openEditPartnerModal(partner)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePartner(partner.id, partner.name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl space-y-3">
                    <Handshake className="h-10 w-10 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">No Partner Buyers Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Add seafood buyers, restaurant chains, and European hospitality partners to showcase them on the Bokhol homepage.
                    </p>
                    <button
                      onClick={openAddPartnerModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#022B96] text-white text-xs font-bold rounded-xl shadow-sm transition hover:bg-[#011a5e]"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Partner Buyer
                    </button>
                  </div>
                )}
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

      {/* ══ PUBLISH NEWS MODAL ══════════════════════════════════════════ */}
      {showAddNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Publish News Article</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Broadcast market updates across Bokhol</p>
              </div>
              <button
                onClick={() => setShowAddNewsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newsFormError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{newsFormError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!newsTitle.trim() || !newsExcerpt.trim()) {
                  setNewsFormError('Please provide both a Title and a Summary.')
                  return
                }

                const slug = newsTitle
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '')

                const categoryColors: Record<string, string> = {
                  'Market Update': 'bg-blue-50 text-[#022B96]',
                  'Trade': 'bg-emerald-50 text-emerald-700',
                  'Regulation': 'bg-orange-50 text-orange-700',
                  'Sustainability': 'bg-teal-50 text-teal-700',
                }

                addNewsArticle({
                  slug,
                  title: newsTitle.trim(),
                  category: newsCategory,
                  categoryColor: categoryColors[newsCategory] || 'bg-blue-50 text-[#022B96]',
                  excerpt: newsExcerpt.trim(),
                  author: newsAuthor.trim() || 'Bokhol Research',
                  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                  readTime: newsReadTime.trim() || '3 min read',
                  image: newsImageUrl.trim() || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
                })

                setNewsArticles(getStoredNewsArticles())
                setShowAddNewsModal(false)
                setNewsTitle('')
                setNewsExcerpt('')
                setNewsImageUrl('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80')
                setNewsFormError(null)
              }}
              className="px-6 py-5 space-y-4"
            >
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Global Salmon Prices Rise 12% in Q3"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition placeholder:text-slate-300"
                />
              </div>

              {/* Cover Image Upload Section */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Article Cover Image
                </label>

                {newsImageUrl ? (
                  <div className="relative border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-14 w-20 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                        <img
                          src={newsImageUrl}
                          alt="Cover preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="text-xs min-w-0">
                        <p className="font-bold text-slate-800 truncate">Cover Image Selected</p>
                        <p className="text-[10px] text-slate-400">Featured on news page &amp; feeds</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewsImageUrl('')}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-bold transition cursor-pointer shrink-0"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#022B96] rounded-2xl p-4 bg-slate-50/50 hover:bg-blue-50/20 cursor-pointer transition text-center group">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#022B96] mb-1.5 transition" />
                      <span className="text-xs font-bold text-slate-700 group-hover:text-[#022B96]">
                        Click to upload cover photo
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, WebP (max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleNewsImageUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">or paste image URL</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={newsImageUrl}
                      onChange={(e) => setNewsImageUrl(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#022B96]"
                    />
                  </div>
                )}
              </div>

              {/* Category + Read Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">Category</label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-medium outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition cursor-pointer bg-white"
                  >
                    <option value="Market Update">Market Update</option>
                    <option value="Trade">Trade</option>
                    <option value="Regulation">Regulation</option>
                    <option value="Sustainability">Sustainability</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">Read Time</label>
                  <input
                    type="text"
                    placeholder="3 min read"
                    value={newsReadTime}
                    onChange={(e) => setNewsReadTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Summary <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="A concise 2–3 sentence overview of the news update..."
                  value={newsExcerpt}
                  onChange={(e) => setNewsExcerpt(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition resize-none leading-relaxed placeholder:text-slate-300"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddNewsModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ ADD / EDIT PARTNER BUYER MODAL ════════════════════════════════ */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {editingPartner ? 'Edit Partner Buyer' : 'Add New Partner Buyer'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Logo will automatically appear on the Home Screen ticker
                </p>
              </div>
              <button
                onClick={() => setShowPartnerModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {partnerFormError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{partnerFormError}</span>
              </div>
            )}

            <form onSubmit={handleSavePartner} className="px-6 py-5 space-y-4">
              {/* Partner Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Buyer Company Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Van der Valk, Hilton, Tasty Food"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition placeholder:text-slate-300"
                />
              </div>

              {/* Logo Upload Section */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Buyer Logo <span className="text-rose-400">*</span>
                </label>

                {partnerLogo ? (
                  <div className="relative border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-24 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center overflow-hidden">
                        <img
                          src={partnerLogo}
                          alt="Logo preview"
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Logo selected</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPartnerLogo('')}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-bold transition cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* File Upload Box */}
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#022B96] rounded-2xl p-4 bg-slate-50/50 hover:bg-blue-50/20 cursor-pointer transition text-center group">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#022B96] mb-1.5 transition" />
                      <span className="text-xs font-bold text-slate-700 group-hover:text-[#022B96]">
                        Click to upload logo image
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, SVG, WebP (max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Or URL fallback */}
                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">or paste image URL / path</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. /partners/buyers/custom.png or https://..."
                      value={partnerLogo}
                      onChange={(e) => setPartnerLogo(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#022B96]"
                    />
                  </div>
                )}
              </div>

              {/* Country + Website */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Country (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Netherlands"
                    value={partnerCountry}
                    onChange={(e) => setPartnerCountry(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Website (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com"
                    value={partnerWebsite}
                    onChange={(e) => setPartnerWebsite(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-[#022B96] focus:ring-2 focus:ring-[#022B96]/10 transition"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPartnerModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  {editingPartner ? 'Update Partner' : 'Add to Home Screen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

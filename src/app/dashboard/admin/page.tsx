'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ReactCountryFlag from 'react-country-flag'
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  TrendingUp,
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
  Newspaper,
  Plus,
  PlusCircle,
  Key,
  Copy,
  ExternalLink,
  Briefcase,
  Mail,
  ShieldAlert,
  Award,
  ChevronRight,
  Lock,
  RefreshCw,
  Info,
  Upload,
  Image as ImageIcon,
  Globe,
  Phone,
  MapPin,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react'
import {
  CompanyProfile,
  getStoredCompanies,
  approveProfileClaim,
  rejectProfileClaim,
  addNewCompany,
  deleteCompany,
} from '@/lib/data/companies-data'
import {
  getStoredNewsArticles,
  addNewsArticle,
  deleteNewsArticle,
  NewsArticle,
} from '@/lib/data/news-data'
import {
  approveSupplierClaim,
  rejectSupplierClaim,
  createSupplierCompany,
  deleteSupplierCompany,
} from '@/features/claims/actions'

const COUNTRIES_LIST = [
  { name: 'Netherlands', code: 'NL' },
  { name: 'Norway', code: 'NO' },
  { name: 'Spain', code: 'ES' },
  { name: 'Greece', code: 'GR' },
  { name: 'Iceland', code: 'IS' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'France', code: 'FR' },
  { name: 'Italy', code: 'IT' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Germany', code: 'DE' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Turkey', code: 'TR' },
  { name: 'Vietnam', code: 'VN' },
  { name: 'Chile', code: 'CL' },
  { name: 'Ecuador', code: 'EC' },
  { name: 'United States', code: 'US' },
  { name: 'Canada', code: 'CA' },
  { name: 'Morocco', code: 'MA' },
  { name: 'Japan', code: 'JP' },
  { name: 'India', code: 'IN' },
]

const SPECIES_PRESETS = [
  'Atlantic Salmon',
  'Yellowfin Tuna',
  'Atlantic Cod',
  'Sea Bass',
  'Warmwater Shrimp',
  'Mackerel',
  'Turbot',
  'Halibut',
  'Haddock',
  'Plaice',
  'Squid',
  'Octopus',
  'King Crab',
  'Mussels',
]

const BANNER_COLORS = [
  '#022B96',
  '#0d9488',
  '#0284c7',
  '#16a34a',
  '#d97706',
  '#4f46e5',
  '#0f172a',
]

function generateRandomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*'
  let pass = 'Bokhol'
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pass + '!'
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  // Navigation tabs: overview, verification, add_supplier, news, claim, unclaim
  const [activeNav, setActiveNav] = useState<'overview' | 'verification' | 'add_supplier' | 'news' | 'claim' | 'unclaim'>('verification')

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuyers: 0,
    totalSuppliers: 0,
    totalBuyerRequests: 0,
  })

  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])

  // Search & Claim filter
  const [searchQuery, setSearchQuery] = useState('')
  const [claimFilter, setClaimFilter] = useState<'all' | 'pending' | 'claimed' | 'rejected'>('pending')

  // Modals
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<CompanyProfile | null>(null)
  
  // Approval Modal with Credential Provisioning
  const [approvingCompany, setApprovingCompany] = useState<CompanyProfile | null>(null)
  const [credUsername, setCredUsername] = useState('')
  const [credPassword, setCredPassword] = useState('')
  const [isApprovingLoading, setIsApprovingLoading] = useState(false)
  const [issuedCredentials, setIssuedCredentials] = useState<{ companyName: string; username: string; password: string } | null>(null)
  const [copiedNotification, setCopiedNotification] = useState(false)

  // Rejection Modal
  const [rejectingCompany, setRejectingCompany] = useState<CompanyProfile | null>(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState('')
  const [isRejectingLoading, setIsRejectingLoading] = useState(false)

  // View Credentials Modal
  const [viewCredsModal, setViewCredsModal] = useState<CompanyProfile | null>(null)

  // Delete Supplier Modal
  const [deletingCompany, setDeletingCompany] = useState<CompanyProfile | null>(null)
  const [isDeletingCompanyLoading, setIsDeletingCompanyLoading] = useState(false)

  // ── ADD SUPPLIER FORM STATE ──
  const [newCompName, setNewCompName] = useState('')
  const [newCompCategory, setNewCompCategory] = useState<'SEAFOOD SUPPLIER' | 'SEAFOOD WHOLESALER' | 'SEAFOOD IMPORTER' | 'PROCESSOR & DISTRIBUTOR' | 'AQUACULTURE FARM'>('SEAFOOD SUPPLIER')
  const [newCompCountry, setNewCompCountry] = useState('Netherlands')
  const [newCompCountryCode, setNewCompCountryCode] = useState('NL')
  const [newCompAddress, setNewCompAddress] = useState('')
  const [newCompCity, setNewCompCity] = useState('')
  const [newCompWebsite, setNewCompWebsite] = useState('')
  const [newCompEmail, setNewCompEmail] = useState('')
  const [newCompPhone, setNewCompPhone] = useState('')
  const [newCompLogoUrl, setNewCompLogoUrl] = useState('')
  const [newCompBannerColor, setNewCompBannerColor] = useState('#022B96')
  const [newCompDescription, setNewCompDescription] = useState('')
  const [newCompSelectedSpecies, setNewCompSelectedSpecies] = useState<string[]>(['Atlantic Salmon', 'Yellowfin Tuna'])
  const [customSpeciesInput, setCustomSpeciesInput] = useState('')
  const [newCompStatus, setNewCompStatus] = useState<'unclaimed' | 'claimed'>('unclaimed')
  const [newCompIsVerified, setNewCompIsVerified] = useState(false)
  const [isCreatingCompany, setIsCreatingCompany] = useState(false)
  const [createdCompanySuccess, setCreatedCompanySuccess] = useState<CompanyProfile | null>(null)

  // Publish News Modal states
  const [showAddNewsModal, setShowAddNewsModal] = useState(false)
  const [newsTitle, setNewsTitle] = useState('')
  const [newsCategory, setNewsCategory] = useState<'Market Update' | 'Trade' | 'Regulation' | 'Sustainability'>('Market Update')
  const [newsReadTime, setNewsReadTime] = useState('3 min read')
  const [newsExcerpt, setNewsExcerpt] = useState('')
  const [newsImageUrl, setNewsImageUrl] = useState('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80')
  const [newsAuthor, setNewsAuthor] = useState('Bokhol Research')

  const reloadCompanies = () => {
    setCompanies(getStoredCompanies())
  }

  useEffect(() => {
    let isMounted = true

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
          setNewsArticles(getStoredNewsArticles())
        }

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

  // Open Approval Modal
  const handleOpenApproveModal = (company: CompanyProfile) => {
    const defaultEmail = company.claimRequest?.businessEmail || company.email || ''
    setApprovingCompany(company)
    setCredUsername(defaultEmail)
    setCredPassword(generateRandomPassword())
  }

  // Submit Approval with Credentials
  const handleConfirmApproval = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!approvingCompany) return

    setIsApprovingLoading(true)

    try {
      await approveSupplierClaim({
        claimId: approvingCompany.claimRequest?.id,
        companyId: approvingCompany.id,
        supplierName: approvingCompany.name,
        email: credUsername.trim(),
        password: credPassword.trim(),
        fullName: approvingCompany.claimRequest?.fullName || approvingCompany.name,
        jobTitle: approvingCompany.claimRequest?.jobTitle || 'Supplier Representative',
      })

      approveProfileClaim(approvingCompany.id, {
        username: credUsername.trim(),
        email: credUsername.trim(),
        password: credPassword.trim(),
      })

      reloadCompanies()

      setIssuedCredentials({
        companyName: approvingCompany.name,
        username: credUsername.trim(),
        password: credPassword.trim(),
      })

      setApprovingCompany(null)
      if (selectedCompanyModal?.id === approvingCompany.id) {
        setSelectedCompanyModal(null)
      }
    } catch (err) {
      console.error('Error approving claim:', err)
    } finally {
      setIsApprovingLoading(false)
    }
  }

  // Open Rejection Modal
  const handleOpenRejectModal = (company: CompanyProfile) => {
    setRejectingCompany(company)
    setRejectionReasonInput('')
  }

  // Submit Rejection
  const handleConfirmRejection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingCompany) return

    setIsRejectingLoading(true)

    try {
      await rejectSupplierClaim({
        claimId: rejectingCompany.claimRequest?.id,
        companyId: rejectingCompany.id,
        reason: rejectionReasonInput.trim() || 'Business verification could not be validated.',
      })

      rejectProfileClaim(rejectingCompany.id, rejectionReasonInput.trim() || undefined)
      reloadCompanies()

      setRejectingCompany(null)
      setRejectionReasonInput('')
      if (selectedCompanyModal?.id === rejectingCompany.id) {
        setSelectedCompanyModal(null)
      }
    } catch (err) {
      console.error('Error rejecting claim:', err)
    } finally {
      setIsRejectingLoading(false)
    }
  }

  // Delete Supplier Action
  const handleConfirmDeleteSupplier = async () => {
    if (!deletingCompany) return

    setIsDeletingCompanyLoading(true)

    try {
      // 1. Call server action for DB cleanup
      await deleteSupplierCompany(deletingCompany.id, deletingCompany.slug)

      // 2. Delete from local storage
      deleteCompany(deletingCompany.id)
      reloadCompanies()

      if (selectedCompanyModal?.id === deletingCompany.id) {
        setSelectedCompanyModal(null)
      }
      setDeletingCompany(null)
    } catch (err) {
      console.error('Error deleting supplier company:', err)
    } finally {
      setIsDeletingCompanyLoading(false)
    }
  }

  const handleCopyCredentials = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedNotification(true)
    setTimeout(() => setCopiedNotification(false), 2500)
  }

  // Handle Logo Upload Simulation / Base64 conversion
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string
      if (base64Url) {
        setNewCompLogoUrl(base64Url)
      }
    }
    reader.readAsDataURL(file)
  }

  // Toggle Species Selection
  const toggleSpecies = (species: string) => {
    if (newCompSelectedSpecies.includes(species)) {
      setNewCompSelectedSpecies(newCompSelectedSpecies.filter((s) => s !== species))
    } else {
      setNewCompSelectedSpecies([...newCompSelectedSpecies, species])
    }
  }

  const handleAddCustomSpecies = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSpeciesInput.trim()) {
      e.preventDefault()
      const sp = customSpeciesInput.trim()
      if (!newCompSelectedSpecies.includes(sp)) {
        setNewCompSelectedSpecies([...newCompSelectedSpecies, sp])
      }
      setCustomSpeciesInput('')
    }
  }

  // Handle Create New Supplier Submission
  const handleCreateSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompName.trim()) return

    setIsCreatingCompany(true)

    try {
      const cleanWebsite = newCompWebsite.trim()
      const domain = cleanWebsite
        ? cleanWebsite.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '')
        : ''

      // 1. Create in local store
      const created = addNewCompany({
        name: newCompName.trim(),
        category: newCompCategory,
        country: newCompCountry,
        countryCode: newCompCountryCode,
        address: newCompAddress.trim() || `${newCompCity || 'Central'}, ${newCompCountry}`,
        website: cleanWebsite.startsWith('http') ? cleanWebsite : cleanWebsite ? `https://${cleanWebsite}` : '',
        email: newCompEmail.trim(),
        phone: newCompPhone.trim(),
        domain,
        description: newCompDescription.trim() || `${newCompName.trim()} is an international seafood company based in ${newCompCountry}.`,
        logoUrl: newCompLogoUrl.trim() || undefined,
        bannerColor: newCompBannerColor,
        status: newCompStatus,
        isVerified: newCompIsVerified,
        species: newCompSelectedSpecies,
        tags: [newCompCategory.split(' ')[0], 'EXPORT', 'SEAFOOD'],
      })

      // 2. Call server action for Supabase DB insertion
      await createSupplierCompany({
        name: newCompName.trim(),
        category: newCompCategory,
        country: newCompCountry,
        countryCode: newCompCountryCode,
        address: newCompAddress.trim(),
        city: newCompCity.trim(),
        website: cleanWebsite,
        email: newCompEmail.trim(),
        phone: newCompPhone.trim(),
        description: newCompDescription.trim(),
        logoUrl: newCompLogoUrl.trim(),
        bannerColor: newCompBannerColor,
        status: newCompStatus,
        isVerified: newCompIsVerified,
        species: newCompSelectedSpecies,
      })

      reloadCompanies()
      setCreatedCompanySuccess(created)

      // Reset form fields
      setNewCompName('')
      setNewCompAddress('')
      setNewCompCity('')
      setNewCompWebsite('')
      setNewCompEmail('')
      setNewCompPhone('')
      setNewCompLogoUrl('')
      setNewCompDescription('')
    } catch (err) {
      console.error('Error creating company:', err)
    } finally {
      setIsCreatingCompany(false)
    }
  }

  // Supplier classifications
  const pendingClaims = companies.filter((c) => c.status === 'claim_requested')
  const claimedCompanies = companies.filter((c) => c.status === 'claimed')
  const unclaimedCompanies = companies.filter((c) => c.status === 'unclaimed' || c.status === 'rejected')
  const rejectedClaims = companies.filter((c) => c.status === 'rejected')

  // Verification claims list
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
        (c.claimRequest?.businessEmail?.toLowerCase().includes(q) ?? false) ||
        (c.claimRequest?.jobTitle?.toLowerCase().includes(q) ?? false)
      )
    }
    return true
  })

  // Filtered Claimed suppliers
  const filteredClaimed = claimedCompanies.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      (c.claimedAccount?.fullName?.toLowerCase().includes(q) ?? false) ||
      (c.claimedAccount?.businessEmail?.toLowerCase().includes(q) ?? false)
    )
  })

  // Filtered Unclaimed suppliers
  const filteredUnclaimed = unclaimedCompanies.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
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
    { key: 'add_supplier', label: 'Add Supplier', icon: PlusCircle },
    { key: 'news', label: 'News & Articles', icon: Newspaper, badge: newsArticles.length },
    { key: 'claim', label: 'Claim', icon: CheckCircle2, badge: claimedCompanies.length },
    { key: 'unclaim', label: 'Unclaim', icon: Building2, badge: unclaimedCompanies.length },
  ]

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 px-4 sm:px-6 lg:px-8 font-sans">

      {/* ── Main Dashboard Container ── */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col lg:flex-row min-h-[780px]">

        {/* ── Left Sidebar ── */}
        <aside className="w-full lg:w-64 bg-[#022B96] text-white p-6 flex flex-col justify-start shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#022B96] font-black text-lg flex items-center justify-center shadow-md">B</div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight leading-none">Bokhol</h2>
                <span className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Admin Center</span>
              </div>
            </div>

            <nav className="space-y-1.5">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = activeNav === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveNav(item.key as any)
                      setSearchQuery('')
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
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
        </aside>

        {/* ── Right Content Area ── */}
        <main className="flex-1 p-6 sm:p-10 bg-slate-50/50 flex flex-col">
          <div className="flex-1">

            {/* ══ VIEW 1: VERIFICATION (SUPPLIER CLAIMS WORKFLOW) ══ */}
            {activeNav === 'verification' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Supplier Profile Claims</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Review identity and business claims submitted for supplier profiles
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search company, name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] transition font-medium"
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
                    <span>Realtime Sync</span>
                  </div>
                </div>

                {filteredClaims.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No claim requests found</h3>
                    <p className="text-xs text-slate-400">No supplier claims match your current filter.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <div className="col-span-4">Supplier / Company</div>
                      <div className="col-span-3">Claimant Details</div>
                      <div className="col-span-2">Claim Status</div>
                      <div className="col-span-3 text-right">Admin Actions</div>
                    </div>

                    {filteredClaims.map((company) => {
                      const req = company.claimRequest
                      const isPending = company.status === 'claim_requested'
                      const isClaimed = company.status === 'claimed'
                      const isRejected = company.status === 'rejected'

                      return (
                        <div
                          key={company.id}
                          className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:border-slate-300 hover:shadow-md transition flex flex-col md:grid md:grid-cols-12 gap-4 items-center"
                        >
                          {/* Supplier Info */}
                          <div className="col-span-4 flex items-center gap-3 w-full">
                            {company.logoUrl ? (
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#022B96] font-bold text-xs flex items-center justify-center shrink-0">
                                {company.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <h4 className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                                <span>{company.name}</span>
                                {company.countryCode && (
                                  <ReactCountryFlag countryCode={company.countryCode} svg style={{ width: '13px', height: '9px' }} />
                                )}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-medium truncate">
                                ID: {company.id} • {company.country}
                              </p>
                            </div>
                          </div>

                          {/* Claimant Info */}
                          <div className="col-span-3 w-full text-xs space-y-0.5">
                            {req ? (
                              <>
                                <p className="font-bold text-slate-800 truncate flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span>{req.fullName}</span>
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium truncate">
                                  {req.jobTitle}
                                </p>
                                <p className="text-[11px] text-blue-600 font-mono truncate flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{req.businessEmail}</span>
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No claimant info</p>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div className="col-span-2 w-full flex items-center">
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                                <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Review
                              </span>
                            )}
                            {isClaimed && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                                <XCircle className="w-3.5 h-3.5" /> Rejected
                              </span>
                            )}
                            {company.status === 'unclaimed' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                                Unclaimed
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="col-span-3 w-full flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedCompanyModal(company)}
                              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Review
                            </button>

                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleOpenApproveModal(company)}
                                  className="px-3 py-1.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => handleOpenRejectModal(company)}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {isClaimed && (
                              <button
                                onClick={() => setViewCredsModal(company)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                              >
                                <Key className="w-3.5 h-3.5 text-[#022B96]" /> Credentials
                              </button>
                            )}

                            {/* Delete Supplier Button */}
                            <button
                              title="Delete Supplier Profile"
                              onClick={() => setDeletingCompany(company)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══ VIEW 2: ADD SUPPLIER (CLEAN NEW COMPANY REGISTRATION) ══ */}
            {activeNav === 'add_supplier' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add New Supplier Profile</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Register and publish a new seafood supplier or company profile to the Fish Market Cap directory.
                  </p>
                </div>

                {createdCompanySuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between gap-4 animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900">
                          Supplier "{createdCompanySuccess.name}" Added Successfully!
                        </h4>
                        <p className="text-xs text-emerald-700">
                          Profile published under <strong>{createdCompanySuccess.country}</strong> network listing.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/suppliers/${createdCompanySuccess.slug}`}
                        target="_blank"
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Public Profile
                      </Link>
                      <button
                        onClick={() => setCreatedCompanySuccess(null)}
                        className="p-2 text-emerald-600 hover:text-emerald-900 text-xs font-bold"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleCreateSupplierSubmit} className="space-y-6">
                  
                  {/* Card 1: Logo & Basic Branding */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#022B96]" /> Company Branding & Logo
                    </h3>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      {/* Logo Preview Container */}
                      <div className="relative group">
                        {newCompLogoUrl ? (
                          <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 p-2 flex items-center justify-center overflow-hidden shadow-sm">
                            <img src={newCompLogoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs font-bold gap-1 shadow-inner">
                            <Building2 className="w-6 h-6 text-slate-300" />
                            <span>No Logo</span>
                          </div>
                        )}
                        {newCompLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setNewCompLogoUrl('')}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Upload Controls */}
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <label className="flex-1 border border-slate-200 hover:border-[#022B96] bg-slate-50/50 hover:bg-blue-50/20 p-3 rounded-2xl cursor-pointer transition flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                            <Upload className="w-4 h-4 text-[#022B96]" />
                            <span>Upload Logo Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="relative">
                          <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="url"
                            placeholder="Or paste external logo image URL (https://...)"
                            value={newCompLogoUrl}
                            onChange={(e) => setNewCompLogoUrl(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Banner Color Picker */}
                    <div className="border-t border-slate-100 pt-4">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Profile Header Theme Color
                      </label>
                      <div className="flex items-center gap-3">
                        {BANNER_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewCompBannerColor(color)}
                            style={{ backgroundColor: color }}
                            className={`w-7 h-7 rounded-xl transition cursor-pointer shadow-xs ${
                              newCompBannerColor === color ? 'ring-3 ring-offset-2 ring-[#022B96] scale-110' : 'opacity-80 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Company Details */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#022B96]" /> Company Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Company Name */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Company Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Nordic Seafood A/S"
                          value={newCompName}
                          onChange={(e) => setNewCompName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Industry Category <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={newCompCategory}
                          onChange={(e) => setNewCompCategory(e.target.value as any)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white cursor-pointer"
                        >
                          <option value="SEAFOOD SUPPLIER">SEAFOOD SUPPLIER</option>
                          <option value="SEAFOOD WHOLESALER">SEAFOOD WHOLESALER</option>
                          <option value="SEAFOOD IMPORTER">SEAFOOD IMPORTER</option>
                          <option value="PROCESSOR & DISTRIBUTOR">PROCESSOR & DISTRIBUTOR</option>
                          <option value="AQUACULTURE FARM">AQUACULTURE FARM</option>
                        </select>
                      </div>

                      {/* Country Selector */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Country of Origin <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={newCompCountry}
                          onChange={(e) => {
                            const selected = COUNTRIES_LIST.find((c) => c.name === e.target.value)
                            setNewCompCountry(e.target.value)
                            if (selected) setNewCompCountryCode(selected.code)
                          }}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white cursor-pointer"
                        >
                          {COUNTRIES_LIST.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          City / Port
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Bergen, Dronten, Vigo"
                          value={newCompCity}
                          onChange={(e) => setNewCompCity(e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Full Business Address
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Havnegata 12, 5003 Bergen"
                          value={newCompAddress}
                          onChange={(e) => setNewCompAddress(e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Contact & Web Information */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#022B96]" /> Digital & Contact Channels
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Website */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Official Website
                        </label>
                        <div className="relative">
                          <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            placeholder="https://company.com"
                            value={newCompWebsite}
                            onChange={(e) => setNewCompWebsite(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Corporate Contact Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="email"
                            placeholder="info@company.com"
                            value={newCompEmail}
                            onChange={(e) => setNewCompEmail(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            placeholder="+47 12 34 56 78"
                            value={newCompPhone}
                            onChange={(e) => setNewCompPhone(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Species & Products */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#022B96]" /> Seafood Species & Products Handled
                    </h3>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {SPECIES_PRESETS.map((sp) => {
                        const isSelected = newCompSelectedSpecies.includes(sp)
                        return (
                          <button
                            key={sp}
                            type="button"
                            onClick={() => toggleSpecies(sp)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#022B96] text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            <span>{sp}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder="Type custom species and press Enter (e.g. Wild Alaska Pollock)..."
                        value={customSpeciesInput}
                        onChange={(e) => setCustomSpeciesInput(e.target.value)}
                        onKeyDown={handleAddCustomSpecies}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Card 5: Description & Status */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Company Overview & Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Provide a concise description of the supplier's commercial capabilities, catch origins, processing facilities, and international logistics..."
                        value={newCompDescription}
                        onChange={(e) => setNewCompDescription(e.target.value)}
                        className="w-full p-4 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white resize-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      {/* Initial Status */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Initial Listing Status
                        </label>
                        <select
                          value={newCompStatus}
                          onChange={(e) => setNewCompStatus(e.target.value as any)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white cursor-pointer"
                        >
                          <option value="unclaimed">Unclaimed (Open for supplier claim)</option>
                          <option value="claimed">Claimed (Admin onboarded)</option>
                        </select>
                      </div>

                      {/* Verified Badge */}
                      <div className="flex items-center gap-3 pt-6">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newCompIsVerified}
                            onChange={(e) => setNewCompIsVerified(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                        <span className="text-xs font-bold text-slate-700">
                          Mark as Verified Supplier
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submission Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setNewCompName('')
                        setNewCompDescription('')
                        setNewCompLogoUrl('')
                      }}
                      className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl text-xs transition cursor-pointer"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingCompany || !newCompName.trim()}
                      className="px-8 py-3 bg-[#022B96] hover:bg-[#011a5e] text-white font-extrabold rounded-2xl text-xs transition cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {isCreatingCompany ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Publishing Supplier...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" /> Publish Supplier Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ══ VIEW 3: CLAIM (CLAIMED & VERIFIED SUPPLIERS) ══ */}
            {activeNav === 'claim' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Claimed Suppliers</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Verified supplier profiles with active claim ownership and login accounts ({claimedCompanies.length})
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search claimed suppliers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] transition font-medium"
                    />
                  </div>
                </div>

                {filteredClaimed.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No claimed suppliers yet</h3>
                    <p className="text-xs text-slate-400">
                      When supplier profile claims are approved in the Verification tab, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredClaimed.map((company) => {
                      const claimant = company.claimedAccount || company.claimRequest

                      return (
                        <div
                          key={company.id}
                          className="bg-white rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
                        >
                          {/* Top Tag */}
                          <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Claimed Profile
                            </span>
                            {company.countryCode && (
                              <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                                <ReactCountryFlag countryCode={company.countryCode} svg style={{ width: '13px', height: '9px' }} />
                                <span className="text-[10px] text-slate-700 font-bold">{company.countryCode}</span>
                              </div>
                            )}
                          </div>

                          <div className="p-5 space-y-4">
                            {/* Logo & Company Name */}
                            <div className="flex items-center gap-3.5">
                              {company.logoUrl ? (
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                  <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-[#022B96] text-white font-black text-base flex items-center justify-center shrink-0">
                                  {company.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="overflow-hidden">
                                <h3 className="text-base font-black text-slate-900 truncate">{company.name}</h3>
                                <span className="text-[10px] font-extrabold uppercase text-[#022B96] block tracking-wider">
                                  {company.category}
                                </span>
                              </div>
                            </div>

                            {/* Verified Claimant Information */}
                            {claimant && (
                              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5">
                                <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                                  Verified Claimant
                                </div>
                                <p className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{claimant.fullName}</span>
                                </p>
                                <p className="text-[11px] text-slate-600 flex items-center gap-1.5 truncate">
                                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{claimant.jobTitle}</span>
                                </p>
                                <p className="text-[11px] text-blue-700 font-mono flex items-center gap-1.5 truncate">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{claimant.businessEmail}</span>
                                </p>
                              </div>
                            )}

                            {/* Species Tags */}
                            <div>
                              <div className="flex flex-wrap gap-1.5">
                                {company.species.slice(0, 3).map((sp) => (
                                  <span key={sp} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                    {sp}
                                  </span>
                                ))}
                                {company.species.length > 3 && (
                                  <span className="text-[10px] text-slate-400 font-medium px-1 py-0.5">
                                    +{company.species.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="p-4 pt-0 border-t border-slate-100 flex items-center gap-2 mt-2">
                            <button
                              onClick={() => setViewCredsModal(company)}
                              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Key className="w-3.5 h-3.5 text-[#022B96]" /> Credentials
                            </button>
                            <Link
                              href={`/suppliers/${company.slug}`}
                              target="_blank"
                              className="flex-1 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View
                            </Link>
                            <button
                              title="Delete Supplier"
                              onClick={() => setDeletingCompany(company)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══ VIEW 4: UNCLAIM (UNCLAIMED SUPPLIERS) ══ */}
            {activeNav === 'unclaim' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Unclaimed Suppliers</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Supplier profiles in the Fish Market Cap network waiting for company ownership claim ({unclaimedCompanies.length})
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveNav('add_supplier')}
                      className="px-4 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Supplier
                    </button>
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search unclaimed suppliers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] transition font-medium"
                      />
                    </div>
                  </div>
                </div>

                {filteredUnclaimed.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No unclaimed suppliers</h3>
                    <p className="text-xs text-slate-400">All registered supplier profiles have active claim ownership.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredUnclaimed.map((company) => {
                      const isRejected = company.status === 'rejected'

                      return (
                        <div
                          key={company.id}
                          className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
                        >
                          {/* Top Unclaimed Banner */}
                          <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between text-[11px] font-bold text-slate-600">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Building2 className="w-3.5 h-3.5" />
                              {isRejected ? 'Claim Rejected — Unclaimed' : 'Unclaimed Profile'}
                            </span>
                            {company.countryCode && (
                              <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                <ReactCountryFlag countryCode={company.countryCode} svg style={{ width: '13px', height: '9px' }} />
                                <span className="text-[10px] text-slate-700 font-bold">{company.countryCode}</span>
                              </div>
                            )}
                          </div>

                          <div className="p-5 space-y-4">
                            {/* Logo & Company Name */}
                            <div className="flex items-center gap-3.5">
                              {company.logoUrl ? (
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                  <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-700 text-white font-black text-base flex items-center justify-center shrink-0">
                                  {company.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="overflow-hidden">
                                <h3 className="text-base font-black text-slate-900 truncate">{company.name}</h3>
                                <span className="text-[10px] font-extrabold uppercase text-slate-500 block tracking-wider">
                                  {company.category}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {company.description || 'Global seafood supplier in the network.'}
                            </p>

                            {/* Contact Domain & Score */}
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                              <span className="text-slate-400 font-mono text-[11px] truncate max-w-[160px]">
                                {company.domain || company.email}
                              </span>
                              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                {company.completenessScore}% complete
                              </span>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="p-4 pt-0 border-t border-slate-100 flex items-center gap-2 mt-2">
                            <button
                              onClick={() => setSelectedCompanyModal(company)}
                              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
                            </button>
                            <Link
                              href={`/suppliers/${company.slug}`}
                              target="_blank"
                              className="flex-1 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View
                            </Link>
                            <button
                              title="Delete Supplier"
                              onClick={() => setDeletingCompany(company)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══ VIEW 5: DASHBOARD OVERVIEW ══ */}
            {activeNav === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Bokhol seafood intelligence and network metrics</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Pending Claims</span>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-3xl font-black text-[#022B96]">{pendingClaims.length}</span>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Claimed Suppliers</span>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-3xl font-black text-emerald-600">{claimedCompanies.length}</span>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Unclaimed Profiles</span>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-3xl font-black text-slate-700">{unclaimedCompanies.length}</span>
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveNav('verification')}
                      className="px-4 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" /> Review Claims ({pendingClaims.length})
                    </button>
                    <button
                      onClick={() => setActiveNav('add_supplier')}
                      className="px-4 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" /> Add New Supplier
                    </button>
                    <button
                      onClick={() => setActiveNav('claim')}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> View Claimed Suppliers ({claimedCompanies.length})
                    </button>
                    <button
                      onClick={() => setActiveNav('unclaim')}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4" /> Unclaimed Profiles ({unclaimedCompanies.length})
                    </button>
                    <button
                      onClick={() => setShowAddNewsModal(true)}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Publish News Article
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══ VIEW 6: NEWS & ARTICLES ══ */}
            {activeNav === 'news' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Market News & Articles</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Broadcast seafood industry updates and market insights</p>
                  </div>
                  <button
                    onClick={() => setShowAddNewsModal(true)}
                    className="px-4 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Publish Article
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newsArticles.map((article) => (
                    <div key={article.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${article.categoryColor || 'bg-blue-50 text-[#022B96]'}`}>
                          {article.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{article.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{article.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-400 font-medium">By {article.author}</span>
                        <button
                          onClick={() => {
                            deleteNewsArticle(article.id)
                            setNewsArticles(getStoredNewsArticles())
                          }}
                          className="text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ══ MODAL 1: REVIEW CLAIM DETAILS MODAL ════════════════════════════ */}
      {selectedCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#022B96] text-white p-6 relative">
              <button
                onClick={() => setSelectedCompanyModal(null)}
                aria-label="Close"
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full">
                  Profile Review
                </span>
                <span className="text-xs font-semibold text-blue-200">ID: {selectedCompanyModal.id}</span>
              </div>
              <h2 className="text-xl font-extrabold mt-1 text-white">{selectedCompanyModal.name}</h2>
              <p className="text-xs text-blue-100/90 mt-0.5">{selectedCompanyModal.category} • {selectedCompanyModal.country}</p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Claim Request Information */}
              {selectedCompanyModal.claimRequest ? (
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                    <span className="font-extrabold uppercase text-[#022B96] tracking-wider text-[10px]">
                      Submitted Claim Information
                    </span>
                    <span className="font-semibold text-slate-500 text-[10px]">
                      {new Date(selectedCompanyModal.claimRequest.requestedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Full Name</p>
                      <p className="text-slate-900 font-bold text-xs">{selectedCompanyModal.claimRequest.fullName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Job Title</p>
                      <p className="text-slate-900 font-bold text-xs">{selectedCompanyModal.claimRequest.jobTitle}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Business Email</p>
                    <p className="text-blue-700 font-mono font-bold text-xs">{selectedCompanyModal.claimRequest.businessEmail}</p>
                  </div>

                  {selectedCompanyModal.claimRequest.rejectionReason && (
                    <div className="mt-2 pt-2 border-t border-rose-100 text-rose-700">
                      <p className="font-bold text-[10px] uppercase">Rejection Reason:</p>
                      <p className="text-xs">{selectedCompanyModal.claimRequest.rejectionReason}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center text-slate-500">
                  No claim has been submitted for this company profile yet.
                </div>
              )}

              {/* Company Profile Details */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <p><strong className="text-slate-900">Address:</strong> {selectedCompanyModal.address || 'N/A'}</p>
                <p><strong className="text-slate-900">Website:</strong> <a href={selectedCompanyModal.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{selectedCompanyModal.website}</a></p>
                <p><strong className="text-slate-900">Corporate Email:</strong> {selectedCompanyModal.email}</p>
                <p><strong className="text-slate-900">Description:</strong> {selectedCompanyModal.description}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setDeletingCompany(selectedCompanyModal)
                    setSelectedCompanyModal(null)
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Profile
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCompanyModal(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>

                  {selectedCompanyModal.status === 'claim_requested' && (
                    <>
                      <button
                        onClick={() => {
                          handleOpenRejectModal(selectedCompanyModal)
                          setSelectedCompanyModal(null)
                        }}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Reject Claim
                      </button>
                      <button
                        onClick={() => {
                          handleOpenApproveModal(selectedCompanyModal)
                          setSelectedCompanyModal(null)
                        }}
                        className="px-5 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Approve Claim
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL 2: APPROVE CLAIM & PROVISION SUPPLIER CREDENTIALS ═════════ */}
      {approvingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-[#022B96] to-blue-900 text-white p-6 relative">
              <button
                onClick={() => setApprovingCompany(null)}
                aria-label="Close"
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Approve Supplier Claim
                </span>
              </div>
              <h2 className="text-xl font-extrabold mt-1 text-white">{approvingCompany.name}</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Issue portal login credentials for {approvingCompany.claimRequest?.fullName || 'the claimant'}
              </p>
            </div>

            <form onSubmit={handleConfirmApproval} className="p-6 space-y-4 text-xs">
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 space-y-1">
                <p className="font-bold text-[#022B96] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Account Provisioning
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Approving this claim marks the supplier as <strong>Claimed & Verified</strong> and provisions their portal login account with supplier privileges.
                </p>
              </div>

              {/* Claimant Summary */}
              {approvingCompany.claimRequest && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Claimant</span>
                    <span className="font-bold text-xs">{approvingCompany.claimRequest.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Job Title</span>
                    <span className="font-bold text-xs">{approvingCompany.claimRequest.jobTitle}</span>
                  </div>
                </div>
              )}

              {/* Login Email / Username */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Supplier Login Email / Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={credUsername}
                    onChange={(e) => setCredUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCredPassword(generateRandomPassword())}
                    className="text-[11px] font-bold text-[#022B96] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={credPassword}
                    onChange={(e) => setCredPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApprovingCompany(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApprovingLoading}
                  className="px-6 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  {isApprovingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Provisioning Account...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Confirm & Issue Credentials
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL 3: CREDENTIALS ISSUED CONFIRMATION ════════════════════════ */}
      {issuedCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-center p-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Claim Approved & Credentials Issued!</h3>
              <p className="text-xs text-slate-500 mt-1">
                The profile for <strong>{issuedCredentials.companyName}</strong> has been successfully claimed.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                Supplier Portal Login Credentials
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Username / Email:</span>
                <span className="font-mono font-bold text-slate-900">{issuedCredentials.username}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Password:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{issuedCredentials.password}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleCopyCredentials(
                    `Bokhol Supplier Login Credentials:\nCompany: ${issuedCredentials.companyName}\nEmail: ${issuedCredentials.username}\nPassword: ${issuedCredentials.password}\nLogin URL: ${window.location.origin}/login`
                  )
                }
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#022B96]" /> Copy Credentials
                  </>
                )}
              </button>
              <button
                onClick={() => setIssuedCredentials(null)}
                className="px-6 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL 4: REJECT CLAIM MODAL ═════════════════════════════════════ */}
      {rejectingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-rose-600 text-white p-6 relative">
              <button
                onClick={() => setRejectingCompany(null)}
                aria-label="Close"
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Reject Verification Claim
              </span>
              <h2 className="text-lg font-extrabold mt-1 text-white">{rejectingCompany.name}</h2>
            </div>

            <form onSubmit={handleConfirmRejection} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Reason for Rejection
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Email domain does not match official company registration, or claimant authorization could not be verified."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition resize-none bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingCompany(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRejectingLoading}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isRejectingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL 5: VIEW CREDENTIALS MODAL ═════════════════════════════════ */}
      {viewCredsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Supplier Credentials</h3>
                <p className="text-xs text-slate-400 mt-0.5">{viewCredsModal.name}</p>
              </div>
              <button
                onClick={() => setViewCredsModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Claimant:</span>
                <span className="font-bold text-slate-900">
                  {viewCredsModal.claimedAccount?.fullName || viewCredsModal.claimRequest?.fullName || 'Verified Admin'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Username / Email:</span>
                <span className="font-mono font-bold text-slate-900">
                  {viewCredsModal.claimedAccount?.credentials?.username ||
                    viewCredsModal.claimedAccount?.businessEmail ||
                    viewCredsModal.claimRequest?.credentials?.username ||
                    viewCredsModal.claimRequest?.businessEmail ||
                    viewCredsModal.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Password:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {viewCredsModal.claimedAccount?.credentials?.password ||
                    viewCredsModal.claimRequest?.credentials?.password ||
                    '•••••••• (Saved in DB)'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const email =
                    viewCredsModal.claimedAccount?.credentials?.username ||
                    viewCredsModal.claimedAccount?.businessEmail ||
                    viewCredsModal.claimRequest?.credentials?.username ||
                    viewCredsModal.claimRequest?.businessEmail ||
                    viewCredsModal.email
                  const pass =
                    viewCredsModal.claimedAccount?.credentials?.password ||
                    viewCredsModal.claimRequest?.credentials?.password ||
                    'Contact admin'
                  handleCopyCredentials(`Supplier Login:\nCompany: ${viewCredsModal.name}\nEmail: ${email}\nPassword: ${pass}\nURL: ${window.location.origin}/login`)
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#022B96]" />}
                {copiedNotification ? 'Copied!' : 'Copy Credentials'}
              </button>
              <button
                onClick={() => setViewCredsModal(null)}
                className="px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL 6: DELETE SUPPLIER CONFIRMATION MODAL ═════════════════════ */}
      {deletingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 p-6 space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center">
              <span className="text-[10px] font-black tracking-wider uppercase text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                Admin Deletion Authority
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">Permanently Delete Supplier?</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Are you sure you want to permanently delete <strong>{deletingCompany.name}</strong> ({deletingCompany.country})?
                This will remove the company from all directory listings and purge all associated claim records.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1">
              <p className="text-slate-900 font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> {deletingCompany.name}
              </p>
              <p className="text-[11px] text-slate-400 font-mono truncate">ID: {deletingCompany.id} • Slug: {deletingCompany.slug}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCompany(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingCompanyLoading}
                onClick={handleConfirmDeleteSupplier}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isDeletingCompanyLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL 7: PUBLISH NEWS MODAL ═════════════════════════════════════ */}
      {showAddNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden">
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

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!newsTitle.trim() || !newsExcerpt.trim()) return

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
              }}
              className="px-6 py-5 space-y-4"
            >
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
    </div>
  )
}

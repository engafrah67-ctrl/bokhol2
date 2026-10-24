'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
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
  Info,
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
  Mail,
  Phone,
  MapPin,
  Package,
  Layers,
  Scale,
  Sparkles,
  ArrowLeft,
} from 'lucide-react'
import { performSignOut } from '@/lib/auth-helpers'
import ReactCountryFlag from 'react-country-flag'
import { getFishImageForProduct, SupplierPost } from '@/lib/data/products-data'
import {
  fetchNewsArticles,
  addNewsArticle,
  deleteNewsArticle,
  NewsArticle,
} from '@/lib/data/news-data'
import {
  PartnerBuyer,
  fetchPartnerBuyers,
  addPartnerBuyer,
  updatePartnerBuyer,
  deletePartnerBuyer,
} from '@/lib/data/partner-buyers-data'
import { ViewSuppliersTab } from '@/components/admin/view-suppliers'
import { ProductPublishModal } from '@/components/admin/product-publish-modal'
import { MarketIndexTab } from '@/components/admin/market-index-tab'

const KNOWN_SUPPLIERS: Record<string, { name: string; logoUrl: string | null; country: string }> = {
  'd154fad9-6250-425d-95bc-d87ad8ce685f': {
    name: 'Blue World Seafood B.V.',
    logoUrl: 'https://sfbixmrmdfignczavzbw.supabase.co/storage/v1/object/public/SupplyPC/logos/2198809e-0401-483a-ba3b-a6f18392c9ea-1790089815783.png',
    country: 'Germany',
  },
  'c541a2ff-6603-42dd-bf90-82b4d6f4fb77': {
    name: 'AnT Seafood B.V.',
    logoUrl: 'https://sfbixmrmdfignczavzbw.supabase.co/storage/v1/object/public/SupplyPC/logos/94ed9521-f787-43e4-8a1f-2dba1166ede4-1790177146518.jfif',
    country: 'Germany',
  },
  'eef79d74-b923-4f0e-a4d8-a56bd14ae492': {
    name: 'bokl Seafood',
    logoUrl: null,
    country: 'Germany',
  },
}

function getSupplierForPost(p: any, suppliersList: any[] = []): { name: string; logoUrl: string | null; country: string } {
  if (p?.company_id && KNOWN_SUPPLIERS[p.company_id]) {
    return KNOWN_SUPPLIERS[p.company_id]
  }

  if (p?.company_name && p.company_name !== 'Verified Supplier' && p.company_name !== 'Bokhol Supplier') {
    return {
      name: p.company_name,
      logoUrl: p.company_logo || null,
      country: p.company_country || '',
    }
  }

  const matched = suppliersList.find(
    (c: any) =>
      c.id === p?.company_id ||
      (p?.company_name && c.name?.toLowerCase() === p.company_name.toLowerCase())
  )
  if (matched && matched.name && matched.name !== 'Verified Supplier') {
    return {
      name: matched.name,
      logoUrl: matched.logoUrl || matched.logo_url || null,
      country: matched.country || '',
    }
  }

  const pName = (p?.product_name || p?.title || '').toLowerCase()
  if (pName.includes('brill') || pName.includes('sea bream')) {
    return KNOWN_SUPPLIERS['d154fad9-6250-425d-95bc-d87ad8ce685f']
  }
  if (pName.includes('crab') || pName.includes('king crab')) {
    return KNOWN_SUPPLIERS['c541a2ff-6603-42dd-bf90-82b4d6f4fb77']
  }
  if (pName.includes('tuna') || pName.includes('yellowfin')) {
    return KNOWN_SUPPLIERS['eef79d74-b923-4f0e-a4d8-a56bd14ae492']
  }

  return {
    name: 'Bokhol Seafood Supplier',
    logoUrl: null,
    country: p?.company_country || '',
  }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  // Clean Navigation Structure without obsolete verification/claim items
  const [activeNav, setActiveNav] = useState<
    'overview' | 'add-supplier' | 'view-suppliers' | 'posts' | 'buyer-users' | 'partners' | 'news' | 'market-index'
  >('overview')

  // Suppliers state (from actual database via /api/admin/add-supplier)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [suppliersLoading, setSuppliersLoading] = useState(false)

  // Add Supplier form state
  const [newSupplierLogo, setNewSupplierLogo] = useState('')
  const [newSupplierEmail, setNewSupplierEmail] = useState('')
  const [newSupplierCompany, setNewSupplierCompany] = useState('')
  const [newSupplierCountry, setNewSupplierCountry] = useState('')
  const [newSupplierPhone, setNewSupplierPhone] = useState('')
  const [newSupplierSpecialty, setNewSupplierSpecialty] = useState('')
  const [newSupplierAddress, setNewSupplierAddress] = useState('')
  const [addSupplierMsg, setAddSupplierMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [addSupplierLoading, setAddSupplierLoading] = useState(false)

  const handleSupplierLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) setNewSupplierLogo(ev.target.result as string)
    }
    reader.readAsDataURL(file)
  }

  // System Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuyers: 0,
    totalSuppliers: 0,
    totalProducts: 0,
  })

  // Supplier Posts (Seafood Products) state
  const [supplierPosts, setSupplierPosts] = useState<any[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postStatusFilter, setPostStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [postSupplierFilter, setPostSupplierFilter] = useState<string>('all')
  const [postSearchQuery, setPostSearchQuery] = useState('')
  const [priceUpdateMsg, setPriceUpdateMsg] = useState<string | null>(null)

  // Product Publishing Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<any | null>(null)
  const [defaultSupplierIdForModal, setDefaultSupplierIdForModal] = useState<string | null>(null)

  // News and Partner Buyers state
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [partnerBuyers, setPartnerBuyers] = useState<PartnerBuyer[]>([])
  const [buyerUsers, setBuyerUsers] = useState<any[]>([])
  const [buyerUsersLoading, setBuyerUsersLoading] = useState(false)
  const [buyerSearchQuery, setBuyerSearchQuery] = useState('')
  const [buyerSuccessMsg, setBuyerSuccessMsg] = useState<string | null>(null)

  // Toast & Confirm Modal states
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null)
  const [companyToDelete, setCompanyToDelete] = useState<{ id: string; name: string } | null>(null)
  const [postToDelete, setPostToDelete] = useState<{ id: string; title: string } | null>(null)
  const [isActionProcessing, setIsActionProcessing] = useState(false)

  // Partner Buyer Modal states
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [editingPartner, setEditingPartner] = useState<PartnerBuyer | null>(null)
  const [partnerName, setPartnerName] = useState('')
  const [partnerLogo, setPartnerLogo] = useState('')
  const [partnerCountry, setPartnerCountry] = useState('')
  const [partnerWebsite, setPartnerWebsite] = useState('')
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('')
  const [partnerSuccessMsg, setPartnerSuccessMsg] = useState<string | null>(null)
  const [partnerFormError, setPartnerFormError] = useState<string | null>(null)

  // News Modal states
  const [showAddNewsModal, setShowAddNewsModal] = useState(false)
  const [newsTitle, setNewsTitle] = useState('')
  const [newsCategory, setNewsCategory] = useState<'Market Update' | 'Trade' | 'Regulation' | 'Sustainability'>('Market Update')
  const [newsReadTime, setNewsReadTime] = useState('3 min read')
  const [newsExcerpt, setNewsExcerpt] = useState('')
  const [newsImageUrl, setNewsImageUrl] = useState('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80')
  const [newsAuthor, setNewsAuthor] = useState('Bokhol Research')
  const [newsFormError, setNewsFormError] = useState<string | null>(null)
  const [newsSuccessMsg, setNewsSuccessMsg] = useState<string | null>(null)

  // ── Reload Suppliers from Database ──
  const reloadSuppliers = async () => {
    setSuppliersLoading(true)
    try {
      const res = await fetch('/api/admin/add-supplier', { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.suppliers)) {
        setSuppliers(json.suppliers)
        setStats((prev) => ({ ...prev, totalSuppliers: json.suppliers.length }))
        try {
          localStorage.setItem('admin_suppliers_cache', JSON.stringify(json.suppliers))
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Failed to load suppliers:', err)
    } finally {
      setSuppliersLoading(false)
    }
  }

  // ── Reload Supplier Posts (All Products) ──
  const reloadPosts = async () => {
    setPostsLoading(true)
    try {
      const { data, error } = await supabase
        .from('supplier_posts')
        .select('id, title, content, created_at, updated_at, is_published, company_id, companies(id, name, logo_url, city, is_verified, countries(name, flag_emoji))')
        .order('created_at', { ascending: false })

      if (!error && Array.isArray(data)) {
        const mapped = data.map((row: any) => {
          let details: any = {}
          try {
            details = JSON.parse(row.content || '{}')
          } catch (_) {}

          const minPrice = parseFloat(details.minPricePerKg || details.pricePerKg || 0)
          const maxPrice = parseFloat(details.maxPricePerKg || 0)
          const compRel: any = Array.isArray(row.companies) ? row.companies[0] : row.companies
          const countryRel = Array.isArray(compRel?.countries) ? compRel.countries[0] : compRel?.countries
          const compCountry = countryRel?.name || compRel?.city || details.companyCountry || details.country || ''

          return {
            id: row.id,
            company_id: row.company_id || compRel?.id,
            company_name: compRel?.name || details.companyName || 'Verified Supplier',
            company_logo: compRel?.logo_url || details.companyLogo || null,
            company_country: compCountry,
            product_name: details.productName || row.title?.split(' —')[0]?.split(' -')[0] || 'Seafood Product',
            price_per_kg: minPrice,
            max_price_per_kg: maxPrice > minPrice ? maxPrice : 0,
            currency: details.currency || 'EUR',
            country_of_origin: details.countryOfOrigin || '',
            fresh_frozen: details.freshFrozen || 'Frozen',
            size_weight: details.sizeWeight || '',
            packaging: details.packagingFillet || details.packaging || '',
            availability: details.availability || 'In Stock — Ready to Ship',
            location: details.location || '',
            supplier_info_extra: details.supplierInfoExtra || '',
            custom_image: details.customImage || null,
            created_at: row.created_at,
            updated_at: details.lastAdminUpdate || row.updated_at,
            is_published: row.is_published !== false,
            status: row.is_published !== false ? 'Published' : 'Draft',
          }
        })
        setSupplierPosts(mapped)
        setStats((prev) => ({ ...prev, totalProducts: mapped.length }))
        try {
          localStorage.setItem('admin_supplier_posts_cache', JSON.stringify(mapped))
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Failed to load posts:', err)
    } finally {
      setPostsLoading(false)
    }
  }

  // ── Reload Buyer Users ──
  const fetchBuyerUsers = async () => {
    setBuyerUsersLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'buyer')
        .order('created_at', { ascending: false })

      if (!error && Array.isArray(data)) {
        setBuyerUsers(data)
        setStats((prev) => ({ ...prev, totalBuyers: data.length }))
      }
    } catch (_) {
    } finally {
      setBuyerUsersLoading(false)
    }
  }

  // ── Init Admin Auth & Load Data ──
  useEffect(() => {
    let isMounted = true

    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setAuthorized(true)
        setLoading(false)
      }
    }, 5000)

    async function init() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        let user = sessionData?.session?.user

        if (!user) {
          const { data: userData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))
          user = userData?.user
        }

        if (!user) {
          if (isMounted) {
            setLoading(false)
            router.replace('/login?next=/dashboard/admin')
          }
          return
        }

        const isAdminEmail = user.email?.toLowerCase() === 'superadminbkhol@gmail.com'
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
          await Promise.allSettled([
            reloadSuppliers(),
            reloadPosts(),
            fetchBuyerUsers(),
            fetchNewsArticles().then((articles) => {
              if (isMounted && articles) setNewsArticles(articles)
            }),
            fetchPartnerBuyers().then((partners) => {
              if (isMounted && partners) setPartnerBuyers(partners)
            }),
          ])

          // Count users
          try {
            const { count: usersCount } = await supabase.from('users').select('id', { count: 'exact', head: true })
            if (isMounted && usersCount !== null) {
              setStats((prev) => ({ ...prev, totalUsers: usersCount }))
            }
          } catch (_) {}

          setLoading(false)
          clearTimeout(safetyTimer)
        }
      } catch (err) {
        console.error('Admin init error:', err)
        if (isMounted) {
          setAuthorized(true)
          setLoading(false)
        }
      }
    }

    init()
    return () => {
      isMounted = false
      clearTimeout(safetyTimer)
    }
  }, [])

  // ── Map product counts per supplier ──
  const postsCountMap = React.useMemo(() => {
    const map: Record<string, number> = {}
    for (const post of supplierPosts) {
      if (post.company_id) {
        map[post.company_id] = (map[post.company_id] || 0) + 1
      }
      if (post.company_name) {
        const key = post.company_name.toLowerCase()
        map[key] = (map[key] || 0) + 1
      }
    }
    return map
  }, [supplierPosts])

  // ── Handlers for Supplier Management ──
  const handleOpenAddProductForSupplier = (supplier: any) => {
    setEditingPost(null)
    setDefaultSupplierIdForModal(supplier.id)
    setIsProductModalOpen(true)
  }

  const handleManageProductsForSupplier = (supplier: any) => {
    setPostSupplierFilter(supplier.id)
    setActiveNav('posts')
  }

  const handleDeleteSupplier = (id: string, name: string) => {
    setCompanyToDelete({ id, name })
  }

  const confirmDeleteSupplier = async () => {
    if (!companyToDelete) return
    const { id, name } = companyToDelete
    setIsActionProcessing(true)

    try {
      const res = await fetch(`/api/admin/add-supplier?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        setSuppliers((prev) => prev.filter((s) => s.id !== id && s.slug !== id))
        setActionToast({ type: 'success', message: `Supplier "${name}" was permanently deleted.` })
      } else {
        throw new Error(json.error || 'Failed to delete')
      }
    } catch (err: any) {
      setActionToast({ type: 'info', message: `Error: ${err?.message || 'Could not delete supplier'}` })
    } finally {
      setIsActionProcessing(false)
      setCompanyToDelete(null)
      setTimeout(() => setActionToast(null), 4000)
    }
  }

  // ── Handlers for Product Management ──
  const handleTogglePublishPost = async (post: any) => {
    const nextState = !post.is_published
    // Optimistic UI update
    setSupplierPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, is_published: nextState, status: nextState ? 'Published' : 'Draft' }
          : p
      )
    )

    try {
      const res = await fetch('/api/supplier/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          is_published: nextState,
          updated_at: new Date().toISOString(),
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setActionToast({
          type: 'success',
          message: nextState
            ? `"${post.product_name}" is now Published on the Products page!`
            : `"${post.product_name}" saved as Draft (hidden from public).`,
        })
      }
    } catch (_) {
      reloadPosts()
    }
    setTimeout(() => setActionToast(null), 4000)
  }

  const handleDeletePost = (id: string, title: string) => {
    setPostToDelete({ id, title })
  }

  const confirmDeletePost = async () => {
    if (!postToDelete) return
    const { id, title } = postToDelete
    setIsActionProcessing(true)

    try {
      const res = await fetch(`/api/supplier/posts?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setSupplierPosts((prev) => prev.filter((p) => p.id !== id))
        setActionToast({ type: 'success', message: `Product offer "${title}" deleted successfully.` })
      }
    } catch (err: any) {
      setActionToast({ type: 'info', message: `Failed to delete product: ${err?.message}` })
    } finally {
      setIsActionProcessing(false)
      setPostToDelete(null)
      setTimeout(() => setActionToast(null), 4000)
    }
  }

  const handleProductSaved = (savedPost: any) => {
    setActionToast({
      type: 'success',
      message: savedPost.is_published !== false
        ? `Product "${savedPost.product_name || 'Seafood'}" published successfully!`
        : `Product saved as Draft.`,
    })
    reloadPosts()
    setTimeout(() => setActionToast(null), 4000)
  }

  // Filtered product offers for the Product Offers tab
  const filteredProductOffers = supplierPosts.filter((p) => {
    // Status filter
    if (postStatusFilter === 'published' && p.is_published === false) return false
    if (postStatusFilter === 'draft' && p.is_published !== false) return false

    // Supplier filter
    if (postSupplierFilter !== 'all' && p.company_id !== postSupplierFilter) return false

    // Search query
    if (postSearchQuery.trim()) {
      const q = postSearchQuery.toLowerCase()
      const match =
        p.product_name?.toLowerCase().includes(q) ||
        p.company_name?.toLowerCase().includes(q) ||
        p.country_of_origin?.toLowerCase().includes(q)
      if (!match) return false
    }

    return true
  })

  // Buyer Users filtered list
  const filteredBuyerUsers = buyerUsers.filter((b) => {
    if (!buyerSearchQuery.trim()) return true
    const q = buyerSearchQuery.toLowerCase()
    return (
      (b.full_name?.toLowerCase().includes(q) ?? false) ||
      (b.email?.toLowerCase().includes(q) ?? false) ||
      (b.phone?.toLowerCase().includes(q) ?? false)
    )
  })

  if (loading || !authorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#022B96]" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Admin Center...</span>
        </div>
      </div>
    )
  }

  // ── Sidebar Items (redundant dashboard card tabs removed) ──
  const SIDEBAR_ITEMS = [
    { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'market-index', label: 'Seafood Index', icon: TrendingUp },
    { key: 'partners', label: 'Partner Buyers', icon: Handshake, badge: partnerBuyers.length },
    { key: 'news', label: 'News & Articles', icon: Newspaper, badge: newsArticles.length },
  ]

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col lg:flex-row min-h-[780px]">
        {/* ── Left Sidebar ── */}
        <aside className="w-full lg:w-64 bg-[#022B96] text-white p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#022B96] font-black text-lg flex items-center justify-center shadow-md">
                B
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight leading-none">Bokhol</h2>
                <span className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Admin Center</span>
              </div>
            </div>

            <nav className="space-y-1.5">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.key === 'overview'
                    ? ['overview', 'view-suppliers', 'posts', 'buyer-users', 'add-supplier'].includes(activeNav)
                    : activeNav === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveNav(item.key as any)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#022B96] shadow-md translate-x-1'
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
                          isActive ? 'bg-[#022B96] text-white' : 'bg-white/20 text-white'
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

          <div className="pt-4 border-t border-blue-400/20 space-y-3">
            <button
              onClick={() => performSignOut('/login')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-200 hover:text-white hover:bg-red-500/20 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-300" />
              <span>Sign Out</span>
            </button>

            <div className="text-[11px] text-blue-200 font-medium">
              <p className="font-bold text-white">Bokhol Fish Market</p>
              <p className="text-[10px] opacity-75 mt-0.5">Admin Security Console v3.0</p>
            </div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 p-6 sm:p-10 bg-slate-50/50 flex flex-col justify-between overflow-x-hidden">
          <div>
            {/* VIEW 1: SYSTEM OVERVIEW (DASHBOARD) */}
            {activeNav === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Overview</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Platform metrics &amp; verified seafood catalog data
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    {
                      key: 'buyer-users',
                      label: 'Total Users',
                      value: stats.totalUsers || buyerUsers.length + 1,
                      icon: Users,
                      color: 'text-[#022B96]',
                      hoverBorder: 'hover:border-[#022B96]',
                    },
                    {
                      key: 'buyer-users',
                      label: 'Buyers',
                      value: stats.totalBuyers || buyerUsers.length,
                      icon: User,
                      color: 'text-blue-600',
                      hoverBorder: 'hover:border-blue-500',
                    },
                    {
                      key: 'view-suppliers',
                      label: 'Suppliers',
                      value: suppliers.length,
                      icon: Building2,
                      color: 'text-emerald-600',
                      hoverBorder: 'hover:border-emerald-500',
                    },
                    {
                      key: 'posts',
                      label: 'Product Offers',
                      value: supplierPosts.length,
                      icon: Fish,
                      color: 'text-indigo-600',
                      hoverBorder: 'hover:border-indigo-500',
                    },
                  ].map((card) => {
                    const CardIcon = card.icon
                    return (
                      <button
                        key={card.label}
                        type="button"
                        onClick={() => setActiveNav(card.key as any)}
                        className={`text-left bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group ${card.hoverBorder}`}
                      >
                        <div className="flex items-center justify-between text-slate-400 mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider group-hover:text-slate-900 transition">
                            {card.label}
                          </span>
                          <CardIcon className={`w-5 h-5 ${card.color} group-hover:scale-110 transition-transform`} />
                        </div>
                        <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                      </button>
                    )
                  })}
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#F0F5FD] border border-blue-200/90 rounded-2xl p-6 space-y-3.5 shadow-xs hover:border-blue-300 transition-all">
                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-tight">Create &amp; Manage Supplier Profiles</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
                        Enter company contact details and seafood specialties directly from supplier data sheets.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setActiveNav('add-supplier')}
                        className="px-4 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                      >
                        + Add Supplier
                      </button>
                      <button
                        onClick={() => setActiveNav('view-suppliers')}
                        className="px-4 py-2 bg-white hover:bg-blue-50 text-[#022B96] border border-blue-200 font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
                      >
                        View Suppliers ({suppliers.length})
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#F0F5FD] border border-blue-200/90 rounded-2xl p-6 space-y-3.5 shadow-xs hover:border-blue-300 transition-all">
                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-tight">Publish Seafood Spot Prices &amp; Stock</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
                        Manually enter product prices, origins, packaging, and availability from PDFs to display on the live site.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setEditingPost(null)
                          setDefaultSupplierIdForModal(suppliers[0]?.id || null)
                          setIsProductModalOpen(true)
                        }}
                        className="px-4 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                      >
                        + Add New Product
                      </button>
                      <button
                        onClick={() => setActiveNav('posts')}
                        className="px-4 py-2 bg-white hover:bg-blue-50 text-[#022B96] border border-blue-200 font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
                      >
                        Manage Offers ({supplierPosts.length})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: ADD SUPPLIER */}
            {activeNav === 'add-supplier' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveNav('overview')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#022B96] hover:text-[#011a5e] mb-3 cursor-pointer transition group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Dashboard</span>
                  </button>
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add Supplier</h1>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        Manually create a seafood supplier profile using information from supplier PDFs
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveNav('view-suppliers')}
                      className="text-xs font-bold text-[#022B96] hover:underline cursor-pointer"
                    >
                      View All Suppliers →
                    </button>
                  </div>
                </div>

                {addSupplierMsg && (
                  <div
                    className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
                      addSupplierMsg.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {addSupplierMsg.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                    )}
                    <span className="flex-1">{addSupplierMsg.text}</span>
                    {addSupplierMsg.type === 'success' && (
                      <button
                        onClick={() => setActiveNav('view-suppliers')}
                        className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
                      >
                        View Profile
                      </button>
                    )}
                  </div>
                )}

                <form
                  className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-xs"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!newSupplierCompany.trim() || !newSupplierEmail.trim()) {
                      setAddSupplierMsg({ type: 'error', text: 'Company name and business email are required.' })
                      return
                    }
                    setAddSupplierLoading(true)
                    setAddSupplierMsg(null)

                    try {
                      const res = await fetch('/api/admin/add-supplier', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: newSupplierCompany.trim(),
                          email: newSupplierEmail.trim(),
                          phone: newSupplierPhone.trim() || null,
                          country: newSupplierCountry || 'Netherlands',
                          logoUrl: newSupplierLogo || null,
                          species: newSupplierSpecialty,
                          category: 'SEAFOOD SUPPLIER',
                          address: newSupplierAddress.trim() || null,
                        }),
                      })
                      const json = await res.json()

                      if (!json.success) {
                        throw new Error(json.error || 'Server error creating supplier')
                      }

                      // Reload suppliers so View Suppliers updates automatically
                      await reloadSuppliers()

                      setAddSupplierMsg({
                        type: 'success',
                        text: `Supplier "${newSupplierCompany}" profile created successfully!`,
                      })

                      // Reset form
                      setNewSupplierLogo('')
                      setNewSupplierEmail('')
                      setNewSupplierCompany('')
                      setNewSupplierCountry('')
                      setNewSupplierPhone('')
                      setNewSupplierSpecialty('')
                      setNewSupplierAddress('')
                    } catch (err: any) {
                      console.error('[AddSupplier] Error:', err)
                      setAddSupplierMsg({
                        type: 'error',
                        text: err?.message || 'Failed to create supplier profile. Please try again.',
                      })
                    } finally {
                      setAddSupplierLoading(false)
                    }
                  }}
                >
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Company Logo / Photo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                        {newSupplierLogo ? (
                          <img src={newSupplierLogo} alt="logo" className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
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
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Company Name *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={newSupplierCompany}
                          onChange={(e) => setNewSupplierCompany(e.target.value)}
                          placeholder="e.g. NordSea Seafood B.V."
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#022B96] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Business Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={newSupplierEmail}
                          onChange={(e) => setNewSupplierEmail(e.target.value)}
                          placeholder="info@company.com"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#022B96] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Country
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                          value={newSupplierCountry}
                          onChange={(e) => setNewSupplierCountry(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#022B96] transition cursor-pointer"
                        >
                          <option value="">-- Select Country --</option>
                          <option value="Germany">🇩🇪 Germany</option>
                          <option value="Norway">🇳🇴 Norway</option>
                          <option value="Netherlands">🇳🇱 Netherlands</option>
                          <option value="Belgium">🇧🇪 Belgium</option>
                          <option value="Spain">🇪🇸 Spain</option>
                          <option value="France">🇫🇷 France</option>
                          <option value="Denmark">🇩🇰 Denmark</option>
                          <option value="Iceland">🇮🇸 Iceland</option>
                          <option value="United Kingdom">🇬🇧 United Kingdom</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={newSupplierPhone}
                          onChange={(e) => setNewSupplierPhone(e.target.value)}
                          placeholder="+31 6 1234 5678"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#022B96] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        City / Port / Facility
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={newSupplierAddress}
                          onChange={(e) => setNewSupplierAddress(e.target.value)}
                          placeholder="e.g. Urk, Rotterdam, Bremerhaven"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#022B96] transition"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Specialty Species (comma separated)
                      </label>
                      <div className="relative">
                        <Fish className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={newSupplierSpecialty}
                          onChange={(e) => setNewSupplierSpecialty(e.target.value)}
                          placeholder="e.g. Atlantic Salmon, Cod, Yellowfin Tuna, Shrimp"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#022B96] transition"
                        />
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
                      {addSupplierLoading ? 'Creating Profile...' : 'Save Supplier Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW 3: VIEW SUPPLIERS */}
            {activeNav === 'view-suppliers' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setActiveNav('overview')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#022B96] hover:text-[#011a5e] cursor-pointer transition group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Dashboard</span>
                </button>
                <ViewSuppliersTab
                  suppliers={suppliers}
                  loading={suppliersLoading}
                  postsCountMap={postsCountMap}
                  onAddProduct={handleOpenAddProductForSupplier}
                  onManageProducts={handleManageProductsForSupplier}
                  onDeleteSupplier={handleDeleteSupplier}
                  onNavigateToAddSupplier={() => setActiveNav('add-supplier')}
                />
              </div>
            )}

            {/* VIEW 4: PRODUCT OFFERS (SEAFOOD PRODUCT MANAGEMENT) */}
            {activeNav === 'posts' && (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setActiveNav('overview')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#022B96] hover:text-[#011a5e] cursor-pointer transition group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Dashboard</span>
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Offers</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Publish and manage seafood products entered from supplier PDF documents
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPost(null)
                      setDefaultSupplierIdForModal(suppliers[0]?.id || null)
                      setIsProductModalOpen(true)
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>

                {/* Filters and Status Tabs Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
                  {/* Status Pills */}
                  <div className="flex items-center gap-2">
                    {[
                      { key: 'all', label: 'All Products', count: supplierPosts.length },
                      { key: 'published', label: 'Published', count: supplierPosts.filter((p) => p.is_published !== false).length },
                      { key: 'draft', label: 'Drafts', count: supplierPosts.filter((p) => p.is_published === false).length },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setPostStatusFilter(tab.key as any)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                          postStatusFilter === tab.key
                            ? 'bg-[#022B96] text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tab.label} <span className="opacity-75 ml-1">({tab.count})</span>
                      </button>
                    ))}
                  </div>

                  {/* Supplier & Search Filters */}
                  <div className="flex items-center gap-2.5">
                    <select
                      value={postSupplierFilter}
                      onChange={(e) => setPostSupplierFilter(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white font-medium text-slate-700 focus:outline-none focus:border-[#022B96]"
                    >
                      <option value="all">All Suppliers</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <div className="relative w-48">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search product..."
                        value={postSearchQuery}
                        onChange={(e) => setPostSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#022B96]"
                      />
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                {postsLoading && supplierPosts.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-16 flex flex-col items-center justify-center gap-3 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#022B96]" />
                    <p className="text-sm font-bold text-slate-700">Loading Product Offers...</p>
                  </div>
                ) : filteredProductOffers.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
                    <Fish className="w-12 h-12 mx-auto text-slate-300" />
                    <h3 className="text-base font-extrabold text-slate-800">No Product Offers Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {postSearchQuery || postSupplierFilter !== 'all' || postStatusFilter !== 'all'
                        ? 'No products matched your current filters.'
                        : 'No seafood product offers have been published yet.'}
                    </p>
                    <button
                      onClick={() => {
                        setEditingPost(null)
                        setDefaultSupplierIdForModal(suppliers[0]?.id || null)
                        setIsProductModalOpen(true)
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add First Product
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProductOffers.map((p) => {
                      const img = getFishImageForProduct(p.product_name, p.custom_image)
                      const symbol = p.currency === 'USD' ? '$' : p.currency === 'GBP' ? '£' : '€'
                      const maxPrice = p.max_price_per_kg
                      const priceDisplay =
                        p.price_per_kg > 0
                          ? maxPrice > 0
                            ? `${symbol}${p.price_per_kg.toFixed(2)} – ${symbol}${maxPrice.toFixed(2)}/kg`
                            : `${symbol}${p.price_per_kg.toFixed(2)}/kg`
                          : 'Price on request'

                      const isPublished = p.is_published !== false

                      return (
                        <div
                          key={p.id}
                          className={`bg-white rounded-3xl border p-5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group space-y-4 ${
                            isPublished ? 'border-slate-200/90 hover:border-blue-300' : 'border-amber-200/80 bg-amber-50/20'
                          }`}
                        >
                          <div className="space-y-3.5">
                            {/* Supplier Header */}
                            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                                  {p.company_logo ? (
                                    <img src={p.company_logo} alt={p.company_name} className="w-full h-full object-contain" />
                                  ) : (
                                    <div className="w-full h-full rounded-lg bg-[#022B96] text-white flex items-center justify-center font-black text-xs">
                                      {p.company_name?.charAt(0).toUpperCase() || 'S'}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-slate-900 text-xs truncate">
                                    {p.company_name}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 font-medium">
                                    {p.company_country || 'Europe'}
                                  </p>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <span
                                className={`text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                                  isPublished
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>

                            {/* Product Info */}
                            <div className="flex items-center gap-3.5">
                              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                <img src={img} alt={p.product_name} className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-black text-slate-900 text-base leading-tight truncate">
                                  {p.product_name}
                                </h3>
                                <p className="text-base font-black text-[#022B96] mt-0.5">{priceDisplay}</p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                  {p.fresh_frozen} · Origin: {p.country_of_origin || 'Europe'}
                                </p>
                              </div>
                            </div>

                            {/* Badges Grid */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100">
                                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Packaging</p>
                                <p className="font-bold text-slate-700 mt-0.5 truncate text-[11px]">{p.packaging || '—'}</p>
                              </div>
                              <div className="bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100">
                                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Availability</p>
                                <p className="font-bold text-slate-700 mt-0.5 truncate text-[11px]">{p.availability || 'In Stock'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            {/* Toggle Publish button */}
                            <button
                              type="button"
                              onClick={() => handleTogglePublishPost(p)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                                isPublished
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {isPublished ? 'Unpublish (Draft)' : 'Publish to Live'}
                            </button>

                            <div className="flex items-center gap-1.5">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPost(p)
                                  setDefaultSupplierIdForModal(p.company_id || null)
                                  setIsProductModalOpen(true)
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeletePost(p.id, p.product_name)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 5: BUYER USERS */}
            {activeNav === 'buyer-users' && (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setActiveNav('overview')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#022B96] hover:text-[#011a5e] cursor-pointer transition group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Dashboard</span>
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registered Buyer Users</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Commercial seafood buyers registered on the Bokhol platform
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search buyer name or email..."
                      value={buyerSearchQuery}
                      onChange={(e) => setBuyerSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96]"
                    />
                  </div>
                </div>

                {buyerSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {buyerSuccessMsg}
                  </div>
                )}

                {buyerUsersLoading ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-16 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#022B96]" />
                    <p className="text-sm font-bold text-slate-700">Loading Buyer Users...</p>
                  </div>
                ) : filteredBuyerUsers.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-2">
                    <Users className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No buyer accounts found</p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                    <div className="divide-y divide-slate-100">
                      {filteredBuyerUsers.map((buyer) => (
                        <div key={buyer.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-[#022B96] font-bold text-xs flex items-center justify-center shrink-0">
                              {buyer.full_name?.charAt(0).toUpperCase() || 'B'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{buyer.full_name || 'Buyer'}</p>
                              <p className="text-xs text-slate-500 truncate">{buyer.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Buyer
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 6: PARTNER BUYERS */}
            {activeNav === 'partners' && (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setActiveNav('overview')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#022B96] hover:text-[#011a5e] cursor-pointer transition group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Dashboard</span>
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Partner Buyers</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Commercial partner logos displayed on the home page</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPartner(null)
                      setPartnerName('')
                      setPartnerLogo('')
                      setPartnerCountry('')
                      setPartnerWebsite('')
                      setShowPartnerModal(true)
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add Partner
                  </button>
                </div>

                {partnerSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {partnerSuccessMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {partnerBuyers.map((partner) => (
                    <div key={partner.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between gap-3 text-center shadow-xs">
                      <div className="h-16 w-full flex items-center justify-center p-2">
                        {partner.logo ? (
                          <img src={partner.logo} alt={partner.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Building2 className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0 w-full">
                        <p className="font-bold text-slate-900 text-xs truncate">{partner.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{partner.country || 'Europe'}</p>
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm(`Remove partner "${partner.name}"?`)) return
                          await deletePartnerBuyer(partner.id)
                          setPartnerBuyers((prev) => prev.filter((p) => p.id !== partner.id))
                        }}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 7: SEAFOOD INDEX MANAGEMENT */}
            {activeNav === 'market-index' && (
              <div className="space-y-6">
                <MarketIndexTab onBackToDashboard={() => setActiveNav('overview')} />
              </div>
            )}

            {/* VIEW 8: NEWS ARTICLES */}
            {activeNav === 'news' && (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setActiveNav('overview')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#022B96] hover:text-[#011a5e] cursor-pointer transition group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Dashboard</span>
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Market News &amp; Articles</h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Publish, compose, and manage seafood market insights</p>
                  </div>
                  <button
                    onClick={() => setShowAddNewsModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Publish Article
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {newsArticles.map((article) => (
                    <div key={article.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between space-y-3 shadow-xs">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#022B96] border border-blue-100">
                          {article.category}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{article.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{article.excerpt}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                        <span>{article.date}</span>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete article "${article.title}"?`)) return
                            await deleteNewsArticle(article.id)
                            setNewsArticles((prev) => prev.filter((a) => a.id !== article.id))
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

      {/* ══ PRODUCT PUBLISH MODAL ══════════════════════════════════════════ */}
      <ProductPublishModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSaved={handleProductSaved}
        initialPost={editingPost}
        defaultSupplierId={defaultSupplierIdForModal}
        suppliers={suppliers}
      />

      {/* ══ DELETE SUPPLIER CONFIRM MODAL ═════════════════════════════════ */}
      {companyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900">Delete Supplier Profile?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-800">&quot;{companyToDelete.name}&quot;</strong>?
                This will also delete associated products.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                disabled={isActionProcessing}
                onClick={() => setCompanyToDelete(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionProcessing}
                onClick={confirmDeleteSupplier}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isActionProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE PRODUCT CONFIRM MODAL ══════════════════════════════════ */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900">Delete Product Offer?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-800">&quot;{postToDelete.title}&quot;</strong>?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                disabled={isActionProcessing}
                onClick={() => setPostToDelete(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionProcessing}
                onClick={confirmDeletePost}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isActionProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ACTION TOAST NOTIFICATION ═════════════════════════════════════ */}
      {actionToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200 ${
            actionToast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {actionToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span>{actionToast.message}</span>
          <button onClick={() => setActionToast(null)} className="ml-2 text-slate-400 hover:text-slate-600 p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Building2,
  Bell,
  Settings,
  Eye,
  Package,
  FileText,
  MessageSquare,
  Plus,
  ArrowUpRight,
  Award,
  Save,
  CheckCircle2,
  Loader2,
  Calendar,
  DollarSign,
  MapPin,
  Upload,
  X,
  Search,
  Fish,
  Pencil,
  Clock,
  Globe2,
  ShoppingBag,
  Send,
  Lock,
} from 'lucide-react'
import Link from 'next/link'
import {
  getStoredSupplierPosts,
  updateProductPrice,
  getFishImageForProduct,
  saveSupplierPosts,
  SupplierPost,
} from '@/lib/data/products-data'

/* ─── Fish category image map (for My Posts display) ─── */
const FISH_IMAGE_MAP: Record<string, string> = {
  'Salmon': '/fish-salmon.png',
  'Atlantic Salmon': '/fish-salmon.png',
  'Pacific Salmon': '/fish-salmon.png',
  'Salmon Fillet': '/fish-salmon.png',
  'Salmon Portions': '/fish-salmon.png',
  'Tuna': '/fish-tuna.png',
  'Yellowfin Tuna': '/fish-tuna.png',
  'Bluefin Tuna': '/fish-tuna.png',
  'Bigeye Tuna': '/fish-tuna.png',
  'Albacore Tuna': '/fish-tuna.png',
  'Skipjack Tuna': '/fish-tuna.png',
  'Tuna Loin': '/fish-tuna.png',
  'Sea Bass': '/fish-seabass.png',
  'European Sea Bass': '/fish-seabass.png',
  'Sea Bream': '/fish-seabass.png',
  'Gilthead Sea Bream': '/fish-seabass.png',
  'Cod': '/fish-cod.png',
  'Atlantic Cod': '/fish-cod.png',
  'Pacific Cod': '/fish-cod.png',
  'Haddock': '/fish-cod.png',
  'Pollock': '/fish-cod.png',
  'Alaska Pollock': '/fish-cod.png',
  'Hake': '/fish-cod.png',
  'Whiting': '/fish-cod.png',
  'Mackerel': '/fish-mackerel.png',
  'Herring': '/fish-mackerel.png',
  'Sardine': '/fish-mackerel.png',
  'Anchovy': '/fish-mackerel.png',
}

function getFishImage(productName: string): string | null {
  return FISH_IMAGE_MAP[productName] || null
}

const DASHBOARD_BUYER_REQUESTS = [
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

export default function SupplierDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  // Active tab — includes buyer-requests tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'myposts' | 'buyer-requests' | 'settings'>('dashboard')

  // Auth & Profile states
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [countries, setCountries] = useState<any[]>([])
  const [buyerRequests, setBuyerRequests] = useState<any[]>([])
  const [supplierPosts, setSupplierPosts] = useState<any[]>([])

  // Loading & Action states
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingUser, setSavingUser] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)

  // Profile Form States
  const [companyName, setCompanyName] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyCountryId, setCompanyCountryId] = useState('')
  const [companyYearFounded, setCompanyYearFounded] = useState('')
  const [companyEmployeeCount, setCompanyEmployeeCount] = useState('')
  const [companyLogoUrl, setCompanyLogoUrl] = useState('')
  // Update Price Modal states
  const [updatingPostModal, setUpdatingPostModal] = useState<any | null>(null)
  const [updatePriceInput, setUpdatePriceInput] = useState<string>('')
  const [updateCurrencyInput, setUpdateCurrencyInput] = useState<string>('EUR')
  const [updateAvailabilityInput, setUpdateAvailabilityInput] = useState<string>('In Stock — Ready to Ship')

  // Settings Form States
  const [userFullName, setUserFullName] = useState('')
  const [userPhone, setUserPhone] = useState('')

  useEffect(() => {
    // 1. Immediately load local supplier posts so UI has data right away
    const initialPosts = getStoredSupplierPosts()
    setSupplierPosts(initialPosts)

    let isMounted = true

    // 2. Safety timer: Guarantee loading finishes in 1.2 seconds max
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false)
    }, 1200)

    async function loadDashboardData() {
      try {
        // Fast race timeout for Supabase auth
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 1000)
        )

        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise,
        ])

        let currentUser = sessionResult?.data?.session?.user || null

        if (!currentUser) {
          const userResult = await Promise.race([
            supabase.auth.getUser(),
            new Promise<{ data: { user: null } }>((res) => setTimeout(() => res({ data: { user: null } }), 1000))
          ])
          currentUser = userResult?.data?.user || null
        }

        if (isMounted && currentUser) {
          setUser(currentUser)

          // 1. Fetch User Profile
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle()
          if (userProfile && isMounted) {
            setProfile(userProfile)
            setUserFullName(userProfile.full_name || '')
            setUserPhone(userProfile.phone || '')
          }

          // 2. Fetch Company Profile
          const { data: companyData } = await supabase
            .from('companies')
            .select('*')
            .eq('owner_id', currentUser.id)
            .maybeSingle()
          if (companyData && isMounted) {
            setCompany(companyData)
            setCompanyName(companyData.name || '')
            setCompanyDescription(companyData.description || '')
            setCompanyWebsite(companyData.website || '')
            setCompanyEmail(companyData.email || '')
            setCompanyPhone(companyData.phone || '')
            setCompanyAddress(companyData.address || '')
            setCompanyCity(companyData.city || '')
            setCompanyCountryId(companyData.country_id || '')
            setCompanyYearFounded(companyData.year_founded ? String(companyData.year_founded) : '')
            setCompanyEmployeeCount(companyData.employee_count || '')
            setCompanyLogoUrl(companyData.logo_url || '')
          }
        }

        // 3. Fetch Countries
        const { data: countriesData } = await supabase
          .from('countries')
          .select('id, name, flag_emoji')
          .order('name')
        if (countriesData && isMounted) setCountries(countriesData)

        // 4. Fetch Buyer Requests
        const { data: requestsData } = await supabase
          .from('buyer_requests')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(5)
        if (requestsData && isMounted) setBuyerRequests(requestsData)

      } catch (err) {
        console.error('Supplier dashboard load warning:', err)
      } finally {
        if (isMounted) setLoading(false)
        clearTimeout(safetyTimer)
      }
    }

    loadDashboardData()

    return () => {
      isMounted = false
      clearTimeout(safetyTimer)
    }
  }, [])

  const handleSavePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!updatingPostModal) return
    const numPrice = parseFloat(updatePriceInput)
    if (isNaN(numPrice) || numPrice < 0) return

    const updatedPosts = updateProductPrice(
      updatingPostModal.id,
      numPrice,
      updateCurrencyInput,
      updateAvailabilityInput
    )
    setSupplierPosts(updatedPosts)
    setMessage({
      type: 'success',
      text: `Price for "${updatingPostModal.product_name || updatingPostModal.productName || 'Product'}" updated to ${updateCurrencyInput} ${numPrice.toFixed(2)}/kg!`,
    })
    setUpdatingPostModal(null)
  }

  // Handle Logo Upload
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingLogo(true)
    setMessage(null)

    const processBase64Fallback = () => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyLogoUrl(reader.result as string)
        setMessage({ type: 'success', text: 'Logo ready! Click "Save Profile" to save.' })
        setUploadingLogo(false)
      }
      reader.onerror = () => {
        setMessage({ type: 'error', text: 'Failed to read image file.' })
        setUploadingLogo(false)
      }
      reader.readAsDataURL(file)
    }

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `logos/${user.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('SupplyPC')
        .upload(filePath, file, { upsert: true })
      if (uploadError) { processBase64Fallback(); return }
      const { data: publicUrlData } = supabase.storage.from('SupplyPC').getPublicUrl(filePath)
      setCompanyLogoUrl(publicUrlData.publicUrl)
      setMessage({ type: 'success', text: 'Logo uploaded! Click "Save Profile" to save.' })
      setUploadingLogo(false)
    } catch {
      processBase64Fallback()
    }
  }

  // Handle Save Company Profile
  async function handleSaveCompanyProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSavingProfile(true)
    setMessage(null)

    const slug = companyName
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      || 'company-' + Math.random().toString(36).substring(2, 7)

    const payload = {
      owner_id: user.id,
      name: companyName,
      slug: company?.slug || slug,
      description: companyDescription,
      website: companyWebsite,
      email: companyEmail,
      phone: companyPhone,
      address: companyAddress,
      city: companyCity,
      country_id: companyCountryId || null,
      year_founded: companyYearFounded ? parseInt(companyYearFounded) : null,
      employee_count: companyEmployeeCount || null,
      logo_url: companyLogoUrl || null,
      status: company?.status || 'active',
    }

    let error
    if (company?.id) {
      const { error: err } = await supabase.from('companies').update(payload).eq('id', company.id)
      error = err
    } else {
      const { data: newCompany, error: err } = await supabase.from('companies').insert(payload).select().maybeSingle()
      error = err
      if (newCompany) {
        setCompany(newCompany)
        await supabase.from('users').update({ company_id: newCompany.id }).eq('id', user.id)
      }
    }

    setSavingProfile(false)
    if (error) {
      setMessage({ type: 'error', text: 'Error saving profile: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Company profile saved successfully!' })
      const { data: updatedCompany } = await supabase.from('companies').select('*').eq('owner_id', user.id).maybeSingle()
      if (updatedCompany) setCompany(updatedCompany)
      setEditingProfile(false)
    }
  }

  // Handle Save User Settings
  async function handleSaveUserSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSavingUser(true)
    setMessage(null)
    const { error } = await supabase.from('users').update({ full_name: userFullName, phone: userPhone }).eq('id', user.id)
    setSavingUser(false)
    if (error) {
      setMessage({ type: 'error', text: 'Error updating settings: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Account settings updated!' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Loading Dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col md:flex-row">

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex-shrink-0 md:min-h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          {company?.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="h-9 w-9 rounded-xl object-cover border border-slate-200" />
          ) : (
            <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
              {company?.name ? company.name.charAt(0).toUpperCase() : 'S'}
            </div>
          )}
          <div>
            <h2 className="font-bold text-sm leading-tight text-slate-800">Supplier Account</h2>
            <p className="text-xs text-slate-500 truncate max-w-[150px]">{company?.name || 'Setup Required'}</p>
          </div>
        </div>

        {/* Post Product CTA */}
        <div className="p-4 border-b border-slate-100">
          <Link href="/dashboard/supplier/posts/new">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-bold rounded-xl transition cursor-pointer shadow-sm">
              <Plus className="h-4 w-4" />
              Post Product
            </button>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {[
            { key: 'dashboard', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard' },
            { key: 'profile', icon: <Building2 className="h-4 w-4" />, label: 'My Profile' },
            { key: 'myposts', icon: <FileText className="h-4 w-4" />, label: 'My Posts', badge: supplierPosts.length },
            { key: 'buyer-requests', icon: <ShoppingBag className="h-4 w-4" />, label: 'Buyer Requests', badge: 3 },
            { key: 'settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' },
          ].map(({ key, icon, label, badge }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key as any); setMessage(null) }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {icon}
              <span className="flex-1 text-left">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl">
        {message && (
          <div className={`mb-6 p-4 rounded-xl border text-sm flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* ══ TAB: DASHBOARD ══════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {company?.logo_url ? (
                  <img src={company.logo_url} alt={company.name} className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                ) : null}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                      Supplier Profile
                    </span>
                    {company?.is_verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                        <Award className="h-3.5 w-3.5 text-blue-600" /> Verified
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {company?.name || `Welcome, ${profile?.full_name || 'Supplier'}`}
                  </h1>
                  <p className="text-slate-500 text-sm mt-0.5 max-w-xl">
                    Overview of your profile and seafood market listings.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Link href="/dashboard/supplier/posts/new">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition cursor-pointer text-sm shadow-sm">
                    <Plus className="h-4 w-4 mr-1" /> Post Product
                  </Button>
                </Link>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Posts</span>
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-slate-800">{supplierPosts.length}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Active listings</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Views</span>
                  <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-slate-800">0</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Last 30 days</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enquiries</span>
                  <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-slate-800">0</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Direct RFQs</p>
              </div>
            </div>

            {/* Recent Posts Preview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">Recent Posts</h2>
                <button
                  onClick={() => setActiveTab('myposts')}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {supplierPosts.length > 0 ? (
                <div className="space-y-3">
                  {supplierPosts.slice(0, 3).map((post: any) => {
                    const img = getFishImage(post.product_name)
                    return (
                      <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                        {img ? (
                          <img src={img} alt={post.product_name} className="h-10 w-10 rounded-xl object-cover border border-slate-200 bg-white flex-shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <Fish className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-800 truncate">{post.product_name}</p>
                          <p className="text-xs text-slate-400">
                            {post.currency} {post.price_per_kg}/kg · {post.availability || 'In Stock'}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full flex-shrink-0">
                          Active
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-medium">No posts yet</p>
                  <p className="text-xs text-slate-400 mt-0.5 mb-3">Publish your seafood inventory to receive buyer enquiries.</p>
                  <Link href="/dashboard/supplier/posts/new">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Post Product
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB: MY PROFILE ════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {!editingProfile ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {company?.logo_url ? (
                      <img src={company.logo_url} alt={company.name} className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                    ) : (
                      <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl border border-blue-100">
                        {company?.name ? company.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Company Profile</p>
                      <h2 className="text-2xl font-bold text-slate-900">{company?.name || 'Your Company'}</h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500">
                        {company?.country_id && countries.find((c: any) => c.id === company.country_id) && (
                          <span>{countries.find((c: any) => c.id === company.country_id)?.flag_emoji} {countries.find((c: any) => c.id === company.country_id)?.name}</span>
                        )}
                        {company?.city && <span>• {company.city}</span>}
                        {company?.year_founded && <span>• Est. {company.year_founded}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit Profile
                  </button>
                </div>

                {company?.description ? (
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">About</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{company.description}</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center text-slate-400 text-sm">
                    No company description added yet.{' '}
                    <button onClick={() => setEditingProfile(true)} className="text-blue-600 underline cursor-pointer">Add one</button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {company?.website && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Website</p>
                      <a href={company.website} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline font-medium">{company.website}</a>
                    </div>
                  )}
                  {company?.email && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Email</p>
                      <p className="text-sm text-slate-700 font-medium">{company.email}</p>
                    </div>
                  )}
                  {company?.phone && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Phone</p>
                      <p className="text-sm text-slate-700 font-medium">{company.phone}</p>
                    </div>
                  )}
                  {company?.address && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Address</p>
                      <p className="text-sm text-slate-700 font-medium">{company.address}{company.city ? `, ${company.city}` : ''}</p>
                    </div>
                  )}
                </div>

                {company && (
                  <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Trust Score</p>
                      <p className="text-lg font-bold text-slate-800 mt-0.5">{company.trust_score ?? 0} <span className="text-xs font-medium text-slate-400">/ 100</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Activity Score</p>
                      <p className="text-lg font-bold text-slate-800 mt-0.5">{company.activity_score ?? 0} <span className="text-xs font-medium text-slate-400">/ 100</span></p>
                    </div>
                    {company.is_verified && (
                      <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                        <Award className="h-3.5 w-3.5" /> Verified Supplier
                      </span>
                    )}
                  </div>
                )}

                {!company && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center space-y-2">
                    <p className="text-sm font-semibold text-blue-800">No company profile set up yet</p>
                    <p className="text-xs text-blue-600">Complete your profile so buyers can find and contact you.</p>
                    <button onClick={() => setEditingProfile(true)} className="mt-2 bg-blue-600 text-white text-xs font-semibold px-5 py-2 rounded-xl hover:bg-blue-700 transition cursor-pointer">Set Up Profile</button>
                  </div>
                )}
              </div>
            ) : (
              /* EDIT FORM */
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Edit Company Profile</h2>
                    <p className="text-slate-500 text-sm mt-1">Update your company details and logo.</p>
                  </div>
                  <button onClick={() => setEditingProfile(false)} className="text-xs text-slate-500 hover:text-slate-700 underline transition cursor-pointer">← Back</button>
                </div>

                <form onSubmit={handleSaveCompanyProfile} className="space-y-6">
                  {/* Logo Upload */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <div className="relative flex-shrink-0">
                      {companyLogoUrl ? (
                        <img src={companyLogoUrl} alt="Logo Preview" className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shadow-md bg-white" />
                      ) : (
                        <div className="h-20 w-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                          <Building2 className="h-9 w-9 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <label className="block text-xs font-bold uppercase text-blue-900 tracking-wider">Company Logo</label>
                      <p className="text-xs text-slate-500">Upload your official company logo.</p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm">
                          {uploadingLogo ? (
                            <><Loader2 className="h-4 w-4 animate-spin text-white" /> Uploading...</>
                          ) : (
                            <><Upload className="h-4 w-4 text-white" /> Select Logo</>
                          )}
                          <input type="file" accept="image/*" disabled={uploadingLogo} onChange={handleLogoUpload} className="hidden" />
                        </label>
                        {companyLogoUrl && (
                          <button type="button" onClick={() => setCompanyLogoUrl('')} className="text-xs text-rose-600 hover:underline font-medium cursor-pointer">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Company Name</label>
                      <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="Enter company name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Country</label>
                      <select value={companyCountryId} onChange={(e) => setCompanyCountryId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition">
                        <option value="">Select country...</option>
                        {countries.map((c) => (
                          <option key={c.id} value={c.id}>{c.flag_emoji} {c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Website URL</label>
                      <input type="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="https://example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Company Email</label>
                      <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="info@company.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Phone Number</label>
                      <input type="text" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="+1 555-555-5555" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">City</label>
                      <input type="text" value={companyCity} onChange={(e) => setCompanyCity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="City name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Year Founded</label>
                      <input type="number" value={companyYearFounded} onChange={(e) => setCompanyYearFounded(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="e.g. 2015" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Employee Count</label>
                      <select value={companyEmployeeCount} onChange={(e) => setCompanyEmployeeCount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition">
                        <option value="">Select range...</option>
                        <option value="1-10">1–10 employees</option>
                        <option value="10-50">10–50 employees</option>
                        <option value="50-200">50–200 employees</option>
                        <option value="200-500">200–500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Address</label>
                      <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="Full street address" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Company Description</label>
                    <textarea value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} rows={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                      placeholder="Introduce your company, exporting capability, seafood variety, and history..." />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setEditingProfile(false)}
                      className="text-sm text-slate-500 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                      Cancel
                    </button>
                    <Button type="submit" disabled={savingProfile || uploadingLogo}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl cursor-pointer shadow-sm gap-2">
                      {savingProfile ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Profile</>}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: MY POSTS ══════════════════════════════════ */}
        {activeTab === 'myposts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">My Posted Products</h2>
                <p className="text-slate-500 text-sm mt-1">All fish & seafood listings you have published to the market.</p>
              </div>
              <Link href="/dashboard/supplier/posts/new">
                <Button className="bg-[#022B96] hover:bg-[#011a5e] text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-sm cursor-pointer">
                  <Plus className="h-4 w-4 mr-1" /> New Post
                </Button>
              </Link>
            </div>

            {supplierPosts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Fish className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No listings posted yet</h3>
                <p className="text-sm text-slate-400 mb-5">Post your seafood stock to connect with global buyers.</p>
                <Link href="/dashboard/supplier/posts/new">
                  <Button className="bg-[#022B96] hover:bg-[#011a5e] text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer">
                    <Plus className="h-4 w-4 mr-1" /> Post Product Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {supplierPosts.map((post: any) => {
                  let parsed = post
                  if (typeof post.content === 'string') {
                    try { parsed = { ...post, ...JSON.parse(post.content) } } catch (_) {}
                  }

                  const pName = parsed.product_name || parsed.productName || 'Seafood Product'
                  const pPrice = parsed.price_per_kg || parsed.pricePerKg ? `${parsed.currency || 'EUR'} ${parsed.price_per_kg || parsed.pricePerKg}/kg` : 'Contact for Price'
                  const pOrigin = parsed.country_of_origin || parsed.countryOfOrigin || 'Norway'
                  const pFresh = parsed.fresh_frozen || parsed.freshFrozen || 'Frozen'
                  const pSize = parsed.size_weight || parsed.sizeWeight || 'Medium (1-3 kg)'
                  const pPackaging = parsed.packaging || parsed.packagingFillet || 'Fillet Cut'
                  const pAvailability = parsed.availability || 'In Stock — Ready to Ship'
                  const pLocation = parsed.location || 'Urk, Netherlands'
                  const pExtra = parsed.supplier_info_extra || parsed.supplierInfoExtra || parsed.additionalInfo || 'Export quality certified.'
                  const img = getFishImage(pName)

                  return (
                    <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition space-y-4">
                      <div className="flex items-start gap-4">
                        {img ? (
                          <img src={img} alt={pName} className="h-16 w-16 rounded-2xl object-cover border border-slate-200 bg-slate-50 flex-shrink-0" />
                        ) : (
                          <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                            <Fish className="h-8 w-8" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate">{pName}</h3>
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full flex-shrink-0">
                              Active
                            </span>
                          </div>
                          <p className="text-sm font-bold text-[#022B96] mt-1">{pPrice}</p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 mt-1">
                            <span>❄️ {pFresh}</span>
                            <span>• 🌍 {pOrigin}</span>
                            <span>• <MapPin className="h-2.5 w-2.5 inline" /> {pLocation}</span>
                          </div>
                        </div>
                      </div>

                      {/* 9 Specs Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">5. Size / Weight</p>
                          <p className="font-bold text-slate-700 mt-0.5">{pSize}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">6. Packaging / Cut</p>
                          <p className="font-bold text-slate-700 mt-0.5">{pPackaging}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">7. Availability</p>
                          <p className="font-bold text-slate-700 mt-0.5">{pAvailability}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">8. Location</p>
                          <p className="font-bold text-slate-700 mt-0.5">{pLocation}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/60 text-xs">
                        <p className="text-[10px] font-bold uppercase text-blue-900 tracking-wider">9. Supplier Extra Info</p>
                        <p className="text-slate-600 font-medium mt-0.5">{pExtra}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          Updated: {new Date(post.updated_at || post.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              let parsed = post
                              if (typeof post.content === 'string') {
                                try { parsed = { ...post, ...JSON.parse(post.content) } } catch (_) {}
                              }
                              setUpdatingPostModal(post)
                              setUpdatePriceInput(String(parsed.price_per_kg || parsed.pricePerKg || ''))
                              setUpdateCurrencyInput(parsed.currency || 'EUR')
                              setUpdateAvailabilityInput(parsed.availability || 'In Stock — Ready to Ship')
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                          >
                            <DollarSign className="h-3.5 w-3.5" />
                            Update Price
                          </button>
                          <button
                            onClick={() => {
                              const updated = supplierPosts.filter((p: any) => p.id !== post.id)
                              setSupplierPosts(updated)
                              saveSupplierPosts(updated)
                            }}
                            className="text-xs text-red-500 hover:underline cursor-pointer font-medium px-2 py-1"
                          >
                            Delete
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

        {/* ══ TAB: SETTINGS ══════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
              <p className="text-slate-500 text-sm mt-1">Manage your login credentials and contact details.</p>
            </div>

            <form onSubmit={handleSaveUserSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Login Email (Read-Only)</label>
                  <input type="email" disabled value={user?.email || ''}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">User Role (Read-Only)</label>
                  <input type="text" disabled value="Supplier"
                    className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Full Name</label>
                  <input type="text" required value={userFullName} onChange={(e) => setUserFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                    placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Direct Contact Phone</label>
                  <input type="text" value={userPhone} onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                    placeholder="Direct telephone" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={savingUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl cursor-pointer shadow-sm gap-2">
                  {savingUser ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Settings</>}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ══ TAB: BUYER REQUESTS ══════════════════════════════ */}
        {activeTab === 'buyer-requests' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-[#022B96] text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-blue-200 text-xs font-semibold mb-2 border border-white/20">
                  <ShoppingBag className="h-3.5 w-3.5" /> Logged-In Supplier Access
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-white">Active Buyer Sourcing Requests</h1>
                <p className="text-blue-100/90 text-sm mt-1 max-w-xl">
                  Browse buyer tenders, review product specifications, and submit direct wholesale quotes.
                </p>
              </div>
              <Link href="/requests/buyer">
                <Button className="bg-white text-[#022B96] hover:bg-slate-100 font-bold px-4 py-2 rounded-xl transition cursor-pointer text-xs shadow-sm flex items-center gap-1.5">
                  Full Requests Portal <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {DASHBOARD_BUYER_REQUESTS.map((req) => (
                <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#022B96]/30 transition space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md mb-1">
                        Buyer Tender
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900">{req.productNeeded}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                      <span>Target: {req.targetPrice || 'Negotiable'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity Needed</span>
                      <span className="font-extrabold text-slate-800">{req.quantity}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">State / Condition</span>
                      <span className="font-semibold text-slate-800">{req.freshFrozen}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Port</span>
                      <span className="font-semibold text-slate-800">{req.location}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Date</span>
                      <span className="font-semibold text-slate-800">{req.deliveryDate}</span>
                    </div>
                  </div>

                  {req.additionalNotes && (
                    <p className="text-xs text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100/60 leading-relaxed italic">
                      "{req.additionalNotes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Posted recently by verified buyer
                    </span>
                    <Link href="/requests/buyer">
                      <Button className="bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" /> Send Quote to Buyer
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ══ UPDATE PRICE MODAL ══════════════════════════════════ */}
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
                Weekly Price Update
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                {(() => {
                  let p = updatingPostModal
                  if (typeof p.content === 'string') { try { p = { ...p, ...JSON.parse(p.content) } } catch (_) {} }
                  return p.product_name || p.productName || 'Seafood Product'
                })()}
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">Update your price &amp; availability to stay competitive.</p>
            </div>

            <form onSubmit={handleSavePriceUpdate} className="p-6 space-y-5">
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
                  value={updateAvailabilityInput}
                  onChange={(e) => setUpdateAvailabilityInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#022B96] focus:bg-white transition cursor-pointer"
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
                <button type="button" onClick={() => setUpdatingPostModal(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50 transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-sm flex items-center justify-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Save New Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

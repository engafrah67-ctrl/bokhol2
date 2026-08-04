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
  Search
} from 'lucide-react'
import Link from 'next/link'

export default function SupplierDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  // Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'products' | 'notifications' | 'settings'>('dashboard')

  // Auth & Profile states
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [countries, setCountries] = useState<any[]>([])
  const [buyerRequests, setBuyerRequests] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [companyProducts, setCompanyProducts] = useState<any[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [savingProduct, setSavingProduct] = useState<string | null>(null)
  
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

  // Settings Form States
  const [userFullName, setUserFullName] = useState('')
  const [userPhone, setUserPhone] = useState('')

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
          router.push('/login')
          return
        }
        setUser(currentUser)

        // 1. Fetch User Profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single()
        
        if (userProfile) {
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

        if (companyData) {
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

        // 3. Fetch Countries
        const { data: countriesData } = await supabase
          .from('countries')
          .select('id, name, flag_emoji')
          .order('name')
        if (countriesData) {
          setCountries(countriesData)
        }

        // 4. Fetch all available products catalog
        const { data: allProductsData } = await supabase
          .from('products')
          .select('id, name, slug, category, image_url, unit')
          .order('name')
        if (allProductsData) {
          setAllProducts(allProductsData)
        }

        // 5. Fetch company's linked products (if company exists)
        if (companyData?.id) {
          const { data: cpData } = await supabase
            .from('company_products')
            .select('id, product_id, product:products(id, name, slug, category, image_url, unit)')
            .eq('company_id', companyData.id)
          if (cpData) {
            setCompanyProducts(cpData)
          }
        }

        // 6. Fetch Buyer Requests
        const { data: requestsData } = await supabase
          .from('buyer_requests')
          .select(`
            id,
            title,
            description,
            quantity,
            quantity_unit,
            target_price,
            currency,
            destination,
            created_at,
            expires_at,
            product:products(name),
            country:countries(name, flag_emoji),
            user:users(full_name)
          `)
          .order('created_at', { ascending: false })
        if (requestsData) {
          setBuyerRequests(requestsData)
        }

      } catch (err) {
        console.error('Error loading supplier dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Add a product to company catalog
  async function handleAddProduct(productId: string) {
    if (!company?.id) return
    setSavingProduct(productId)
    const { error } = await supabase
      .from('company_products')
      .insert({ company_id: company.id, product_id: productId })
    if (!error) {
      const { data: cpData } = await supabase
        .from('company_products')
        .select('id, product_id, product:products(id, name, slug, category, image_url, unit)')
        .eq('company_id', company.id)
      if (cpData) setCompanyProducts(cpData)
    }
    setSavingProduct(null)
  }

  // Remove a product from company catalog
  async function handleRemoveProduct(productId: string) {
    if (!company?.id) return
    setSavingProduct(productId)
    await supabase
      .from('company_products')
      .delete()
      .eq('company_id', company.id)
      .eq('product_id', productId)
    setCompanyProducts((prev) => prev.filter((cp: any) => cp.product_id !== productId))
    setSavingProduct(null)
  }

  // Handle Logo Upload to Supabase Storage Bucket "SupplyPC" (with automatic Base64 fallback if bucket RLS fails)
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploadingLogo(true)
    setMessage(null)

    const processBase64Fallback = () => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64Url = reader.result as string
        setCompanyLogoUrl(base64Url)
        setMessage({ type: 'success', text: 'Logo image ready! Click "Save Profile" below to save changes.' })
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

      if (uploadError) {
        console.warn('Supabase storage upload error, using instant Base64 fallback:', uploadError.message)
        processBase64Fallback()
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('SupplyPC')
        .getPublicUrl(filePath)

      const publicUrl = publicUrlData.publicUrl
      setCompanyLogoUrl(publicUrl)
      setMessage({ type: 'success', text: 'Logo uploaded successfully! Click "Save Profile" below to save changes.' })
      setUploadingLogo(false)
    } catch (err: any) {
      console.warn('Storage upload exception, using instant Base64 fallback:', err)
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
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'company-' + Math.random().toString(36).substring(2, 7)

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
      status: company?.status || 'active'
    }

    let error;
    if (company?.id) {
      const { error: err } = await supabase
        .from('companies')
        .update(payload)
        .eq('id', company.id)
      error = err
    } else {
      const { data: newCompany, error: err } = await supabase
        .from('companies')
        .insert(payload)
        .select()
        .single()
      error = err
      if (newCompany) {
        setCompany(newCompany)
        await supabase
          .from('users')
          .update({ company_id: newCompany.id })
          .eq('id', user.id)
      }
    }

    setSavingProfile(false)
    if (error) {
      setMessage({ type: 'error', text: 'Error saving profile: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Company profile & logo saved successfully!' })
      const { data: updatedCompany } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle()
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

    const { error } = await supabase
      .from('users')
      .update({
        full_name: userFullName,
        phone: userPhone
      })
      .eq('id', user.id)

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
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex-shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          {company?.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="h-9 w-9 rounded-xl object-cover border border-slate-200" />
          ) : (
            <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
              {company?.name ? company.name.charAt(0).toUpperCase() : 'S'}
            </div>
          )}
          <div>
            <h2 className="font-bold text-sm leading-tight text-slate-800">Supplier Admin</h2>
            <p className="text-xs text-slate-500 truncate max-w-[150px]">{company?.name || 'Company Setup'}</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <button
            onClick={() => { setActiveTab('dashboard'); setMessage(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>

          <button
            onClick={() => { setActiveTab('profile'); setMessage(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-4 w-4" />
            My Profile
          </button>

          <button
            onClick={() => { setActiveTab('products'); setMessage(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'products'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Package className="h-4 w-4" />
            My Products
          </button>

          <button
            onClick={() => { setActiveTab('notifications'); setMessage(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'notifications'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Bell className="h-4 w-4" />
              {buyerRequests.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </div>
            Notification
          </button>

          <button
            onClick={() => { setActiveTab('settings'); setMessage(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'settings'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
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

        {/* TAB content: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
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
                        <Award className="h-3.5 w-3.5 text-blue-600" /> Verified Company
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {company?.name || `Welcome, ${profile?.full_name || 'Supplier'}`}
                  </h1>
                  <p className="text-slate-500 text-sm mt-0.5 max-w-xl">
                    Overview of your profile visibility, seafood catalog metrics, and marketplace notifications.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Link href="/dashboard/supplier/posts/new">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition cursor-pointer text-sm shadow-sm">
                    <Plus className="h-4 w-4 mr-1" /> Post Stock Availability
                  </Button>
                </Link>
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Views</span>
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">0</span>
                </div>
                <span className="text-[10px] text-slate-400">Last 30 days</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Views</span>
                  <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
                    <Package className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">0</span>
                </div>
                <span className="text-[10px] text-slate-400">Across catalog items</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Post Views</span>
                  <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">0</span>
                </div>
                <span className="text-[10px] text-slate-400">On active posts</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enquiries</span>
                  <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">0</span>
                </div>
                <span className="text-[10px] text-slate-400">Direct RFQs</span>
              </div>
            </div>

            {/* Sub-grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-800">Recent Posts</h2>
                  <Link href="/dashboard/supplier/posts/new" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5">
                    Create post <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 font-medium">No active stock availability posts</p>
                    <p className="text-xs text-slate-400 mt-0.5 mb-3">Publish your seafood inventory to receive buyer quotes.</p>
                    <Link href="/dashboard/supplier/posts/new">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Post Stock Availability
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-800">Top Products</h2>
                  <button onClick={() => setActiveTab('products')} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5">
                    Manage <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {companyProducts.length > 0 ? (
                    companyProducts.map((cp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                        <div className="font-semibold text-xs text-slate-700">{cp.product?.name || 'Seafood Product'}</div>
                        <span className="text-xs text-slate-400 font-medium">0 views</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">No products in catalog yet</p>
                      <button
                        onClick={() => setActiveTab('products')}
                        className="text-xs text-blue-600 font-semibold hover:underline mt-1 block mx-auto"
                      >
                        Add products from catalog →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB content: COMPANY PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {!editingProfile ? (
              /* PUBLIC PROFILE VIEW */
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {company?.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                      />
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
                        {company?.employee_count && <span>• {company.employee_count} employees</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingProfile(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" /> Edit Profile
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
                    <button onClick={() => setEditingProfile(true)} className="text-blue-600 underline">Add one</button>
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
                    <p className="text-slate-500 text-sm mt-1">Update your company details and logo to enhance trust score and help buyers verify your profile.</p>
                  </div>
                  <button onClick={() => setEditingProfile(false)} className="text-xs text-slate-500 hover:text-slate-700 underline transition cursor-pointer">← Back to Profile View</button>
                </div>

                <form onSubmit={handleSaveCompanyProfile} className="space-y-6">
                  {/* Prominent Company Logo Upload Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <div className="relative flex-shrink-0">
                      {companyLogoUrl ? (
                        <img
                          src={companyLogoUrl}
                          alt="Company Logo Preview"
                          className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shadow-md bg-white"
                        />
                      ) : (
                        <div className="h-20 w-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                          <Building2 className="h-9 w-9 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <label className="block text-xs font-bold uppercase text-blue-900 tracking-wider">Company Logo Image</label>
                      <p className="text-xs text-slate-500">Upload your official logo image to your Supabase public bucket (SupplyPC).</p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm">
                          {uploadingLogo ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-white" /> Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 text-white" /> Select Logo Image
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingLogo}
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        {companyLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setCompanyLogoUrl('')}
                            className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Company Name</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="Enter company name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Country Location</label>
                      <select
                        value={companyCountryId}
                        onChange={(e) => setCompanyCountryId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                      >
                        <option value="">Select country...</option>
                        {countries.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.flag_emoji} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Website URL</label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Company Email</label>
                      <input
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="info@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="+1 555-555-5555"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Year Founded</label>
                        <input
                          type="number"
                          value={companyYearFounded}
                          onChange={(e) => setCompanyYearFounded(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                          placeholder="e.g. 2015"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Employee Count</label>
                        <select
                          value={companyEmployeeCount}
                          onChange={(e) => setCompanyEmployeeCount(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        >
                          <option value="">Select range...</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="10-50">10-50 employees</option>
                          <option value="50-200">50-200 employees</option>
                          <option value="200-500">200-500 employees</option>
                          <option value="500+">500+ employees</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">City</label>
                      <input
                        type="text"
                        value={companyCity}
                        onChange={(e) => setCompanyCity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="City name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Address</label>
                      <input
                        type="text"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                        placeholder="Full street address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Company Description</label>
                    <textarea
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                      placeholder="Introduce your company, exporting capability, seafood variety, and history..."
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="text-sm text-slate-500 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      disabled={savingProfile || uploadingLogo}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl cursor-pointer shadow-sm gap-2"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB content: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {!company ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                <Package className="h-8 w-8 mx-auto text-amber-400 mb-2" />
                <p className="text-sm font-semibold text-amber-800">Set up your company profile first</p>
                <p className="text-xs text-amber-600 mt-1">Go to "My Profile" tab to create your company before adding products.</p>
              </div>
            ) : (
              <>
                {/* My Products List */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">My Product Catalog</h2>
                    <p className="text-slate-500 text-sm mt-1">These products are displayed on your public supplier profile.</p>
                  </div>

                  {companyProducts.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
                      <Package className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-semibold">No products added yet</p>
                      <p className="text-xs mt-1">Add seafood products from the catalog below.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {companyProducts.map((cp: any) => {
                        const product = cp.product
                        if (!product) return null
                        return (
                          <div key={cp.id} className="relative group flex flex-col items-center p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-xl object-cover border border-slate-100 mb-2" />
                            ) : (
                              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-2">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                            <p className="text-xs font-bold text-slate-800 leading-tight">{product.name}</p>
                            {product.category && (
                              <p className="text-[10px] text-slate-400 mt-0.5">{product.category}</p>
                            )}
                            <button
                              onClick={() => handleRemoveProduct(product.id)}
                              disabled={savingProduct === product.id}
                              className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 h-5 w-5 bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center transition cursor-pointer"
                            >
                              {savingProduct === product.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Catalog to Add From */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Add from Seafood Catalog</h2>
                    <p className="text-slate-500 text-xs mt-1">Select products you supply. They'll be shown on your profile.</p>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                    {allProducts
                      .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((product: any) => {
                        const isAdded = companyProducts.some((cp: any) => cp.product_id === product.id)
                        return (
                          <button
                            key={product.id}
                            onClick={() => !isAdded && handleAddProduct(product.id)}
                            disabled={isAdded || savingProduct === product.id}
                            className={`flex flex-col items-center p-4 border rounded-xl text-center transition ${
                              isAdded
                                ? 'bg-blue-50 border-blue-200 cursor-default'
                                : 'bg-slate-50 border-slate-100 hover:bg-blue-50 hover:border-blue-200 cursor-pointer'
                            }`}
                          >
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-xl object-cover border border-slate-100 mb-2" />
                            ) : (
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-2 ${isAdded ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                            <p className="text-xs font-bold text-slate-800 leading-tight">{product.name}</p>
                            {savingProduct === product.id ? (
                              <Loader2 className="h-3 w-3 animate-spin text-blue-600 mt-1" />
                            ) : isAdded ? (
                              <span className="text-[9px] font-bold text-blue-600 mt-1 flex items-center gap-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Added
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold text-slate-400 mt-1">+ Add</span>
                            )}
                          </button>
                        )
                      })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB content: NOTIFICATION / BUYER REQUEST FEED */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Incoming Buyer Requests</h2>
              <p className="text-slate-500 text-sm mt-1">
                Real-time active purchase demands submitted by verified global buyers. Reach out to coordinate deals.
              </p>
            </div>

            <div className="space-y-4">
              {buyerRequests.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                  <Bell className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-semibold">No buyer requests available</p>
                  <p className="text-xs text-slate-400 mt-1">Check back later for newly published requests.</p>
                </div>
              ) : (
                buyerRequests.map((req) => (
                  <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-slate-800">{req.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                          <span className="font-medium text-slate-600 flex items-center gap-1">
                            Buyer: {req.user?.full_name || 'Verified Buyer'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Destination: {req.destination || 'Global'}
                          </span>
                          <span>•</span>
                          {req.country && (
                            <span className="flex items-center gap-1">
                              Origin: {req.country.flag_emoji} {req.country.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-slate-50 border border-slate-100 text-slate-700 px-3 py-1 rounded-full">
                          Qty: {req.quantity} {req.quantity_unit}
                        </span>
                        {req.target_price && (
                          <span className="text-xs font-bold bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-0.5">
                            <DollarSign className="h-3 w-3" /> {req.target_price} / {req.quantity_unit} {req.currency}
                          </span>
                        )}
                      </div>
                    </div>

                    {req.description && (
                      <p className="text-sm text-slate-600 bg-slate-50/50 rounded-xl p-3.5 border border-slate-100">
                        {req.description.startsWith('{') ? 'Standard buyer request details' : req.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Published: {new Date(req.created_at).toLocaleDateString()}
                      </span>
                      {req.expires_at && (
                        <span className="text-rose-600 font-medium">
                          Expires: {new Date(req.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB content: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
              <p className="text-slate-500 text-sm mt-1">
                Manage your user login credentials, name, and contact details.
              </p>
            </div>

            <form onSubmit={handleSaveUserSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Login Email (Read-Only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">User Role (Read-Only)</label>
                  <input
                    type="text"
                    disabled
                    value="Supplier"
                    className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userFullName}
                    onChange={(e) => setUserFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Direct Contact Phone</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                    placeholder="Direct telephone"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={savingUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl cursor-pointer shadow-sm gap-2"
                >
                  {savingUser ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Settings
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

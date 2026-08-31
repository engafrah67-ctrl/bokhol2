'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
import { getFishImageForProduct, getStoredSupplierPosts } from '@/lib/data/products-data'
import { getStoredCompanies, INITIAL_COMPANIES } from '@/lib/data/companies-data'
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Award,
  Package,
  ArrowLeft,
  MessageSquare,
  X,
  CheckCircle2,
  Lock,
  ExternalLink,
  Plus,
  Send,
  Fish,
  CalendarDays,
  Scale,
  ThermometerSnowflake,
  Box,
  Truck
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface SupplierProductListing {
  id: string
  productName: string
  priceFormatted: string
  pricePerKg: number
  currency: string
  countryOfOrigin: string
  freshFrozen: string
  sizeWeight: string
  packagingFillet: string
  availability: string
  location: string
  supplierInfoExtra: string
  customImage: string
  createdAt?: string
}

export default function SupplierProfilePage() {
  const params = useParams()
  const router = useRouter()
  const rawSlug = params?.slug as string
  const slug = decodeURIComponent(rawSlug || '')
  const { user, profile: userProfile, isLoading: userLoading } = useUser()
  const supabase = createClient()

  const [company, setCompany] = useState<any>(null)
  const [products, setProducts] = useState<SupplierProductListing[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bannerBg, setBannerBg] = useState<string | null>(null)

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState<SupplierProductListing | null>(null)

  // Extract logo corner background color
  useEffect(() => {
    if (!company?.logo_url) return

    if (company.banner_color) {
      setBannerBg(company.banner_color)
      return
    }

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = company.logo_url
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0)

        // Sample corner pixels
        const samples = [
          ctx.getImageData(5, 5, 1, 1).data,
          ctx.getImageData(img.width - 5, 5, 1, 1).data,
          ctx.getImageData(5, img.height - 5, 1, 1).data,
          ctx.getImageData(img.width - 5, img.height - 5, 1, 1).data,
        ]

        for (const sample of samples) {
          const [r, g, b, a] = sample
          // If non-transparent and not pure white
          if (a > 200 && !(r > 245 && g > 245 && b > 245)) {
            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
            setBannerBg(hex)
            return
          }
        }
      } catch (err) {
        console.warn('Canvas color extraction note:', err)
      }
    }
  }, [company?.logo_url, company?.banner_color])

  useEffect(() => {
    if (!slug) return

    async function fetchProfile() {
      setLoading(true)
      try {
        // 1. Fetch company from Supabase by slug or id
        let matchedCompany: any = null

        const { data: dbCompany } = await supabase
          .from('companies')
          .select('*, country:countries(name, flag_emoji, slug)')
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .maybeSingle()

        if (dbCompany) {
          matchedCompany = dbCompany
        } else {
          // Fallback to local stored companies or initial companies
          const stored = getStoredCompanies()
          const normSlug = slug.toLowerCase()
          const found = stored.find(
            (c) => c.slug?.toLowerCase() === normSlug || c.id === slug || c.name?.toLowerCase() === normSlug
          ) || INITIAL_COMPANIES.find(
            (c) => c.slug?.toLowerCase() === normSlug || c.id === slug || c.name?.toLowerCase() === normSlug
          )

          if (found) {
            matchedCompany = {
              ...found,
              is_verified: found.isVerified ?? true,
              trust_score: found.completenessScore ?? 95,
              activity_score: found.completenessScore ?? 90,
              country: {
                name: found.country,
                flag_emoji: found.countryCode === 'NL' ? '🇳🇱' : found.countryCode === 'DE' ? '🇩🇪' : found.countryCode === 'BE' ? '🇧🇪' : '🌍'
              }
            }
          }
        }

        if (!matchedCompany) {
          setLoading(false)
          return
        }

        setCompany(matchedCompany)

        // 2. Fetch REAL uploaded products from supplier_posts
        let rawPosts: any[] = []

        if (matchedCompany.id) {
          const { data: dbPosts, error: postsErr } = await supabase
            .from('supplier_posts')
            .select('*')
            .eq('company_id', matchedCompany.id)
            .order('created_at', { ascending: false })

          if (dbPosts && dbPosts.length > 0) {
            rawPosts = [...dbPosts]
          }
        }

        // Also check localStorage posts (for local offline uploads or fallback)
        const storedPosts = getStoredSupplierPosts()
        const existingIds = new Set(rawPosts.map((p) => p.id))
        for (const sp of storedPosts) {
          const isMatch =
            (sp.company_id && matchedCompany.id && sp.company_id === matchedCompany.id) ||
            (sp.company_name && matchedCompany.name && sp.company_name.toLowerCase() === matchedCompany.name.toLowerCase()) ||
            (sp.user_id && user?.id && sp.user_id === user.id)

          if (isMatch && !existingIds.has(sp.id)) {
            rawPosts.push(sp)
            existingIds.add(sp.id)
          }
        }

        // Parse all 9 specification fields from real posts
        const parsedProducts: SupplierProductListing[] = rawPosts.map((post) => {
          let details: any = {}
          if (typeof post.content === 'string') {
            try {
              details = JSON.parse(post.content)
            } catch (_) {}
          } else if (post.content && typeof post.content === 'object') {
            details = post.content
          }

          const pName = details.productName || post.product_name || post.title?.split(' —')[0] || 'Seafood Product'
          const priceNum = parseFloat(details.pricePerKg || post.price_per_kg || 0)
          const currency = details.currency || post.currency || 'EUR'
          const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'
          const priceFormatted = priceNum > 0 ? `${symbol}${priceNum.toFixed(2)}/kg` : 'Contact for price'

          const origin = details.countryOfOrigin || post.country_of_origin || matchedCompany.country?.name || matchedCompany.country || 'Europe'
          const freshFrozen = details.freshFrozen || post.fresh_frozen || 'Fresh'
          const sizeWeight = details.sizeWeight || post.size_weight || 'Standard Size'
          const packaging = details.packagingFillet || post.packaging || 'Standard Packaging'
          const availability = details.availability || post.availability || 'In Stock — Ready to Ship'
          const location = details.location || post.location || matchedCompany.city || 'EU Port'
          const extra = details.supplierInfoExtra || post.supplier_info_extra || ''
          const image = details.customImage || post.custom_image || post.image_url || getFishImageForProduct(pName)

          return {
            id: post.id,
            productName: pName,
            priceFormatted,
            pricePerKg: priceNum,
            currency,
            countryOfOrigin: origin,
            freshFrozen,
            sizeWeight,
            packagingFillet: packaging,
            availability,
            location,
            supplierInfoExtra: extra,
            customImage: image,
            createdAt: post.created_at || details.createdAt,
          }
        })

        setProducts(parsedProducts)
        setPosts([])
      } catch (err) {
        console.error('Error loading supplier profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [slug, user?.id])

  const isOwner = Boolean(
    user &&
    company &&
    (userProfile?.company_id === company.id ||
      company.owner_id === user.id ||
      (company.email && user.email && company.email.toLowerCase() === user.email.toLowerCase()))
  )

  const handleContactClick = (product?: SupplierProductListing) => {
    setSelectedProductForEnquiry(product || null)
    if (!user) {
      setShowAuthModal(true)
    } else {
      setShowContactModal(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading supplier profile...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <Building2 className="h-10 w-10 text-slate-300" />
        <p className="text-base font-semibold">Supplier not found</p>
        <Link href="/" className="text-xs text-blue-600 hover:underline">← Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent pb-16">
      {/* HERO BANNER */}
      <div
        className="relative h-52 sm:h-60 w-full overflow-hidden transition-colors duration-500"
        style={{
          backgroundColor: bannerBg || '#022B96',
          backgroundImage: bannerBg ? 'none' : 'linear-gradient(to right, #022B96, #083abf, #0c45c4)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25 pointer-events-none" />

        {/* Top Left Back Button */}
        <div className="absolute top-4 left-4 sm:left-8 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-semibold transition-all border border-white/20 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>
      </div>

      {/* PROFILE SECTION */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo + Name Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl -mt-20 sm:-mt-24 p-6 sm:p-8 shadow-sm relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Logo */}
            <div className="relative flex-shrink-0 -mt-12 sm:-mt-16">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl object-cover bg-white p-1 border-4 border-white dark:border-slate-900 shadow-md ring-1 ring-slate-200/60"
                />
              ) : (
                <div className="h-28 w-28 sm:h-32 sm:w-32 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-4 border-white dark:border-slate-900 shadow-md rounded-2xl flex items-center justify-center font-bold text-4xl ring-1 ring-slate-200/60">
                  {company.name.charAt(0).toUpperCase()}
                </div>
              )}
              {company.is_verified && (
                <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1 min-w-0 pt-2 sm:pt-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{company.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {company.country && (
                      <span className="flex items-center gap-1 font-medium">
                        <span>{company.country.flag_emoji || '🌍'}</span>
                        <span>{company.country.name || company.country}</span>
                      </span>
                    )}
                    {company.city && (
                      <span className="flex items-center gap-1">
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{company.city}</span>
                      </span>
                    )}
                    {company.employee_count && (
                      <span className="flex items-center gap-1">
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <Users className="h-3.5 w-3.5" />
                        <span>{company.employee_count} employees</span>
                      </span>
                    )}
                    {company.year_founded && (
                      <span className="flex items-center gap-1">
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Est. {company.year_founded}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                  {isOwner && (
                    <Link
                      href="/dashboard/supplier/posts/new"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
                    >
                      <Plus className="h-4 w-4" /> Add Product
                    </Link>
                  )}
                  <Button
                    onClick={() => handleContactClick()}
                    className="bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm cursor-pointer flex items-center gap-2 transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contact Supplier
                  </Button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-8 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trust Score</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{company.trust_score ?? (company.is_verified ? 98 : 85)}<span className="text-xs font-normal text-slate-400">/100</span></p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Activity</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{company.activity_score ?? (products.length > 0 ? 95 : 60)}<span className="text-xs font-normal text-slate-400">/100</span></p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Live Products</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{products.length}</p>
                </div>
                {company.is_verified && (
                  <span className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
                    <Award className="h-3.5 w-3.5" /> Verified Supplier
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT COL: Company Details */}
          <div className="space-y-5">
            {/* About */}
            {company.description && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">About Company</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{company.description}</p>
              </div>
            )}

            {/* Contact Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Contact & Location</h2>

              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-sm text-blue-600 hover:underline">
                  <Globe className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="h-3 w-3 text-slate-300 flex-shrink-0" />
                </a>
              )}

              {user ? (
                <>
                  {company.email && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{company.email}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span>{company.address}{company.city ? `, ${company.city}` : ''}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-dashed border-slate-200 dark:border-slate-700">
                  <Lock className="h-3.5 w-3.5 flex-shrink-0 text-blue-600" />
                  <span>
                    <button onClick={() => setShowAuthModal(true)} className="text-blue-600 underline font-medium cursor-pointer">Sign in</button> to view full contact details
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COL: Real Uploaded Products */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#022B96] dark:text-blue-400" />
                  Product Listings ({products.length})
                </h2>
                {products.length > 0 && (
                  <span className="text-xs font-bold text-[#022B96] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-900">
                    Live Verified Offers
                  </span>
                )}
              </div>

              {/* REAL PRODUCT LISTINGS OR EMPTY STATE */}
              {products.length === 0 ? (
                <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 sm:p-12 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#022B96] dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-900 shadow-xs">
                    <Fish className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Product Listings Yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                    {company.name} has not published any live seafood product listings at this time. You can contact them directly for current inventory and custom price quotes.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <Button
                      onClick={() => handleContactClick()}
                      className="bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      Contact Supplier
                    </Button>
                    {isOwner && (
                      <Link
                        href="/dashboard/supplier/posts/new"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" /> Upload First Product
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {products.map((product) => {
                    const isFresh = product.freshFrozen.toLowerCase().includes('fresh')

                    return (
                      <div
                        key={product.id}
                        className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700 rounded-2xl p-5 transition space-y-4 shadow-xs"
                      >
                        {/* Product Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 overflow-hidden shadow-xs shrink-0">
                              {product.customImage ? (
                                <img src={product.customImage} alt={product.productName} className="h-full w-full object-contain" />
                              ) : (
                                <Fish className="h-7 w-7 text-blue-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug truncate">
                                {product.productName}
                              </h3>
                              <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                                {product.priceFormatted}
                              </p>
                            </div>
                          </div>

                          <span className="text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800 px-3 py-1 rounded-full shrink-0">
                            {product.availability}
                          </span>
                        </div>

                        {/* 9 Product Specification Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Country of Origin</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">🌍 {product.countryOfOrigin}</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Fresh / Frozen</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                              {isFresh ? '🌿' : '❄️'} {product.freshFrozen}
                            </span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Size / Weight</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">⚖️ {product.sizeWeight}</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Packaging / Cut</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">📦 {product.packagingFillet}</span>
                          </div>
                        </div>

                        {/* Location & Supplier Extra Info */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                              <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                              <span>Port / Location: <strong>{product.location}</strong></span>
                            </div>
                            <Button
                              onClick={() => handleContactClick(product)}
                              size="sm"
                              className="bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-semibold px-3 py-1.5 h-8 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <Send className="h-3 w-3" />
                              Request Quote
                            </Button>
                          </div>
                          {product.supplierInfoExtra && (
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                              <strong className="text-slate-700 dark:text-slate-300">Supplier Note:</strong> {product.supplierInfoExtra}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
              <Lock className="h-5 w-5" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Sign in to Contact</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Login to unlock full contact information and request quotations directly from {company.name}.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/login" className="bg-[#022B96] text-white text-sm font-semibold px-5 py-2.5 rounded-xl text-center hover:bg-[#011a5e] transition">
                Sign In
              </Link>
              <Link href="/signup" className="text-sm font-semibold text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl text-center border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT DETAILS MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 relative">
            <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Contact {company.name}</h3>
              {selectedProductForEnquiry ? (
                <div className="inline-block mt-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-[#022B96] dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-100 dark:border-blue-900">
                  Enquiry regarding: {selectedProductForEnquiry.productName} ({selectedProductForEnquiry.priceFormatted})
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verified supplier direct contact channels</p>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-700">
              {company.email && (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 min-w-0">
                    <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="font-medium truncate select-all">{company.email}</span>
                  </div>
                  <a
                    href={`mailto:${company.email}?subject=${encodeURIComponent(
                      selectedProductForEnquiry
                        ? `Bokhol Inquiry: ${selectedProductForEnquiry.productName}`
                        : `Bokhol Seafood Inquiry — ${company.name}`
                    )}`}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                  >
                    Email
                  </a>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 min-w-0">
                    <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="font-medium truncate select-all">{company.phone}</span>
                  </div>
                  <a
                    href={`tel:${company.phone}`}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                  >
                    Call
                  </a>
                </div>
              )}
              {company.website && (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 min-w-0">
                    <Globe className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="font-medium truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                  </div>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                  >
                    Visit
                  </a>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              Mention you found them on Bokhol to get prioritized trade response.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

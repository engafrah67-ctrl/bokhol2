'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
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
  Star
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
const DEFAULT_SUPPLIER_PRODUCTS = [
  {
    id: 'prod-1',
    productName: 'Atlantic Salmon',
    pricePerKg: '7.80 EUR',
    countryOfOrigin: 'Norway',
    freshFrozen: 'Fresh',
    sizeWeight: 'Medium (3–5 kg)',
    packagingFillet: 'Fillet (Skin On)',
    availability: 'In Stock — Ready to Ship',
    location: 'Alesund Port, Norway',
    supplierInfoExtra: 'ASC & MSC certified. Global export cold chain guaranteed with 48h dispatch.',
    customImage: '/fish-salmon.png'
  },
  {
    id: 'prod-2',
    productName: 'Yellowfin Tuna Loins',
    pricePerKg: '14.50 EUR',
    countryOfOrigin: 'Spain',
    freshFrozen: 'Frozen',
    sizeWeight: 'Large (> 5 kg)',
    packagingFillet: 'Vacuum Packed Loin',
    availability: 'Available within 7 days',
    location: 'Vigo Port, Spain',
    supplierInfoExtra: 'Sashimi grade -60°C ultra-deep frozen. HACCP and ISO 22000 certified.',
    customImage: '/fish-tuna.png'
  }
]

export default function SupplierProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const { user, isLoading: userLoading } = useUser()
  const supabase = createClient()

  const [company, setCompany] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bannerBg, setBannerBg] = useState<string | null>(null)

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)

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
        // Fetch company by slug
        const { data: companyData } = await supabase
          .from('companies')
          .select('*, country:countries(name, flag_emoji, slug)')
          .eq('slug', slug)
          .eq('status', 'active')
          .maybeSingle()

        if (!companyData) {
          setLoading(false)
          return
        }
        setCompany(companyData)

        // Fetch products linked to this company
        const { data: cpData } = await supabase
          .from('company_products')
          .select('product:products(id, name, slug, category, description, image_url, unit)')
          .eq('company_id', companyData.id)

        if (cpData) {
          setProducts(cpData.map((r: any) => r.product).filter(Boolean))
        }

        // Supplier posts fallback
        setPosts([])
      } catch (err) {
        console.error('Error loading supplier profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [slug])

  const handleContactClick = () => {
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
                      <span className="flex items-center gap-1">
                        <span>{company.country.flag_emoji}</span>
                        <span>{company.country.name}</span>
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
                  <Button
                    onClick={handleContactClick}
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
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{company.trust_score ?? 0}<span className="text-xs font-normal text-slate-400">/100</span></p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Activity</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{company.activity_score ?? 0}<span className="text-xs font-normal text-slate-400">/100</span></p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Products</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{products.length}</p>
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
          {/* LEFT COL */}
          <div className="space-y-5">
            {/* About */}
            {company.description && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 mb-3">About</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{company.description}</p>
              </div>
            )}

            {/* Contact Details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900">Contact & Details</h2>

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
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{company.email}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span>{company.address}{company.city ? `, ${company.city}` : ''}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl p-3 border border-dashed border-slate-200">
                  <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    <button onClick={() => setShowAuthModal(true)} className="text-blue-600 underline font-medium">Sign in</button> to view full contact details
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COL: Products + Posts */}
          <div className="lg:col-span-2 space-y-5">
            {/* Products */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Product Listings ({products.length > 0 ? products.length : DEFAULT_SUPPLIER_PRODUCTS.length})
                </h2>
                <span className="text-xs font-bold text-[#022B96] bg-blue-50 px-2.5 py-1 rounded-md">
                  Supplier Profile Products (9 Fields)
                </span>
              </div>

              {/* 9-Field Product Cards List */}
              <div className="grid grid-cols-1 gap-4">
                {(products.length > 0 ? products : DEFAULT_SUPPLIER_PRODUCTS).map((product: any, idx: number) => {
                  const pName = product.productName || product.name || 'Seafood Product'
                  const pPrice = product.pricePerKg ? `${product.pricePerKg}/kg` : (product.price_per_kg ? `${product.currency || 'EUR'} ${product.price_per_kg}/kg` : 'Contact for price')
                  const pOrigin = product.countryOfOrigin || product.country_of_origin || company?.country?.name || 'Global'
                  const pFresh = product.freshFrozen || product.fresh_frozen || 'Fresh / Frozen'
                  const pSize = product.sizeWeight || product.size_weight || 'Standard Size'
                  const pPackaging = product.packagingFillet || product.packaging || 'Fillet / Packed'
                  const pAvailability = product.availability || 'In Stock — Ready to Ship'
                  const pLocation = product.location || company?.city || 'Main Port'
                  const pExtra = product.supplierInfoExtra || product.supplier_info_extra || product.additional_info || 'Certified export quality seafood.'
                  const pImg = product.customImage || product.image_url || '/fish-salmon.png'

                  return (
                    <div key={product.id || idx} className="bg-slate-50 border border-slate-200/80 hover:border-blue-300 rounded-2xl p-5 transition space-y-4 shadow-xs">
                      {/* Product Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden shadow-xs shrink-0">
                            {pImg ? (
                              <img src={pImg} alt={pName} className="h-full w-full object-cover rounded-xl" />
                            ) : (
                              <Package className="h-7 w-7 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 leading-snug">{pName}</h3>
                            <p className="text-xs font-bold text-blue-600 mt-0.5">{pPrice}</p>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
                          {pAvailability}
                        </span>
                      </div>

                      {/* 9 Product Specification Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Country of Origin</span>
                          <span className="font-bold text-slate-800">🌍 {pOrigin}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Fresh / Frozen</span>
                          <span className="font-bold text-slate-800">❄️ {pFresh}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Size / Weight</span>
                          <span className="font-bold text-slate-800">⚖️ {pSize}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Packaging / Cut</span>
                          <span className="font-bold text-slate-800">📦 {pPackaging}</span>
                        </div>
                      </div>

                      {/* Location & Supplier Extra Info */}
                      <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          <span>Location: <strong>{pLocation}</strong></span>
                        </div>
                        <p className="text-slate-500 leading-relaxed text-[11px]">
                          <strong>Supplier Info Extra:</strong> {pExtra}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Posts */}
            {posts.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 mb-4">Recent Updates</h2>
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div key={post.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                      <p className="text-sm font-semibold text-slate-800">{post.title}</p>
                      {post.content && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{post.content}</p>
                      )}
                      <p className="text-[10px] text-slate-400">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-200 space-y-4">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Lock className="h-5 w-5" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-800 text-base">Sign in to Contact</h3>
              <p className="text-xs text-slate-500 mt-1">Login to unlock full contact information and send enquiries to {company.name}.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/login" className="bg-[#022B96] text-white text-sm font-semibold px-5 py-2.5 rounded-xl text-center hover:bg-[#011a5e] transition">
                Sign In
              </Link>
              <Link href="/signup" className="text-sm font-semibold text-slate-600 px-5 py-2.5 rounded-xl text-center border border-slate-200 hover:bg-slate-50 transition">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT DETAILS MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-200 space-y-4 relative">
            <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-800 text-base">Contact {company.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Verified supplier contact details</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
              {company.email && (
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="font-medium select-all">{company.email}</span>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="font-medium select-all">{company.phone}</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 text-center">Mention you found them on FishMarketCap to speed up quotation.</p>
          </div>
        </div>
      )}
    </div>
  )
}

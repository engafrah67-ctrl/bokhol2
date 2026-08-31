'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { addSupplierPost, getFishImageForProduct } from '@/lib/data/products-data'
import {
  ArrowLeft,
  Fish,
  DollarSign,
  Globe2,
  Package,
  MapPin,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Search,
  X,
  ChevronRight,
  Camera,
  Upload,
  Plus,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Scale
} from 'lucide-react'

const FISH_CATALOG: {
  category: string
  color: string
  image?: string
  items: string[]
}[] = [
  {
    category: 'Salmon',
    color: '#FF6B35',
    image: '/fish-salmon.png',
    items: ['Atlantic Salmon', 'Pacific Salmon', 'Salmon Fillet', 'Salmon Portions'],
  },
  {
    category: 'Tuna',
    color: '#1A56DB',
    image: '/fish-tuna.png',
    items: [
      'Yellowfin Tuna', 'Bluefin Tuna', 'Bigeye Tuna',
      'Albacore Tuna', 'Skipjack Tuna', 'Tuna Loin',
    ],
  },
  {
    category: 'Sea Bass & Sea Bream',
    color: '#0694A2',
    image: '/fish-seabass.png',
    items: ['Sea Bass', 'European Sea Bass', 'Sea Bream', 'Gilthead Sea Bream'],
  },
  {
    category: 'Cod Family',
    color: '#3F83F8',
    image: '/fish-cod.png',
    items: [
      'Cod', 'Atlantic Cod', 'Pacific Cod',
      'Haddock', 'Pollock', 'Alaska Pollock', 'Hake', 'Whiting',
    ],
  },
  {
    category: 'Pelagic & Small Fish',
    color: '#057A55',
    image: '/fish-mackerel.png',
    items: ['Mackerel', 'Herring', 'Sardine', 'Anchovy'],
  },
  {
    category: 'Flatfish',
    color: '#C27803',
    image: '/fish-turbot.jpg',
    items: ['Turbot', 'Plaice', 'Sole', 'Lemon Sole', 'Brill', 'Halibut'],
  },
  {
    category: 'Crustaceans & Shellfish',
    color: '#5850EC',
    image: '/fish-crab.jpg',
    items: [
      'Shrimp', 'King Crab', 'Crab', 'Lobster',
      'Prawn', 'Mussels', 'Clams', 'Oysters',
      'Octopus', 'Squid',
    ],
  },
  {
    category: 'Other Finfish',
    color: '#0D9488',
    image: '/fish-trout.jpg',
    items: [
      'Trout', 'Rainbow Trout', 'Monkfish', 'Swordfish', 'Tilapia', 'Pangasius',
    ],
  },
]

const ALL_PRODUCTS = FISH_CATALOG.flatMap((cat) =>
  cat.items.map((item) => ({ name: item, category: cat.category, color: cat.color, image: cat.image }))
)

const COUNTRIES = [
  'Holland (Netherlands)',
  'Germany',
  'Belgium',
]

const SIZE_OPTIONS = [
  'Small (< 1 kg)', 'Medium (1–3 kg)', 'Large (3–6 kg)',
  'Extra Large (> 6 kg)', 'Mixed Sizes', 'Custom',
]

const PACKAGING_OPTIONS = [
  'Whole Fish', 'Fillet (Skin On)', 'Fillet (Skinless)',
  'Portion Cut', 'Loin', 'Butterfly Cut',
  'IQF (Individually Quick Frozen)', 'Block Frozen',
  'Vacuum Packed', 'Bulk / Loose', 'Custom',
]

const AVAILABILITY_OPTIONS = [
  'In Stock — Ready to Ship', 'Available within 7 days',
  'Available within 2 weeks', 'Available within 1 month',
  'Pre-order Only', 'Seasonal',
]

export interface Product9Fields {
  productName: string          // 1
  pricePerKg: string           // 2
  currency: string
  countryOfOrigin: string      // 3
  freshFrozen: string          // 4: Fresh / Frozen / Both
  sizeWeight: string           // 5
  packagingFillet: string      // 6
  availability: string         // 7
  location: string             // 8
  supplierInfoExtra: string    // 9
  customImage?: string
}

export default function PostStockPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)

  // Product picker state
  const [searchQuery, setSearchQuery] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Form State covering all 9 requested fields
  const [form, setForm] = useState<Product9Fields>({
    productName: '',
    pricePerKg: '',
    currency: 'EUR',
    countryOfOrigin: 'Holland (Netherlands)',
    freshFrozen: 'Frozen',
    sizeWeight: 'Medium (1–3 kg)',
    packagingFillet: 'Fillet (Skin On)',
    availability: 'In Stock — Ready to Ship',
    location: '',
    supplierInfoExtra: '',
    customImage: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    let isMounted = true
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false)
    }, 1000)

    async function checkAuth() {
      try {
        const timeoutPromise = new Promise<{ data: { session: null } }>((res) =>
          setTimeout(() => res({ data: { session: null } }), 800)
        )
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise,
        ])
        const currentUser = sessionResult?.data?.session?.user
        if (currentUser && isMounted) {
          setUser(currentUser)
          const { data: companyData } = await supabase
            .from('companies')
            .select('id')
            .eq('owner_id', currentUser.id)
            .maybeSingle()
          if (companyData && isMounted) setCompanyId(companyData.id)
        }
      } catch (err) {
        console.error('Auth check error:', err)
      } finally {
        if (isMounted) setLoading(false)
        clearTimeout(safetyTimer)
      }
    }
    checkAuth()

    return () => {
      isMounted = false
      clearTimeout(safetyTimer)
    }
  }, [])

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    if (pickerOpen) document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [pickerOpen])

  function set(field: keyof Product9Fields, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function selectProduct(name: string) {
    set('productName', name)
    setPickerOpen(false)
    setSearchQuery('')
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      set('customImage', reader.result as string)
      setUploadingImage(false)
    }
    reader.readAsDataURL(file)
  }

  const selectedProductMeta = ALL_PRODUCTS.find((p) => p.name === form.productName)
  const displayImage = form.customImage || selectedProductMeta?.image

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    // Build the content JSON with all 9 product fields
    const details = {
      productName: form.productName,
      pricePerKg: parseFloat(form.pricePerKg) || 0,
      currency: form.currency,
      countryOfOrigin: form.countryOfOrigin,
      freshFrozen: form.freshFrozen,
      sizeWeight: form.sizeWeight,
      packagingFillet: form.packagingFillet,
      availability: form.availability,
      location: form.location,
      supplierInfoExtra: form.supplierInfoExtra,
      customImage: displayImage,
      createdAt: new Date().toISOString()
    }

    if (companyId) {
      // Save to Supabase — content JSON holds all 9 fields
      try {
        const { data: newPost, error } = await supabase
          .from('supplier_posts')
          .insert({
            company_id: companyId,
            category: 'product_availability',
            title: `${form.productName} — ${form.currency} ${form.pricePerKg}/kg`,
            content: JSON.stringify(details),
            is_published: true,
          })
          .select('id')
          .maybeSingle()

        if (error) {
          console.error('Failed to save post to DB:', error)
          // Fallback to localStorage
          addSupplierPost({
            id: 'post-' + Date.now(),
            user_id: user?.id,
            company_id: companyId,
            ...details,
            product_name: form.productName,
            price_per_kg: parseFloat(form.pricePerKg) || 0,
            currency: form.currency,
            country_of_origin: form.countryOfOrigin,
            fresh_frozen: form.freshFrozen,
            size_weight: form.sizeWeight,
            packaging: form.packagingFillet,
            availability: form.availability,
            location: form.location,
            supplier_info_extra: form.supplierInfoExtra,
            status: 'active',
            created_at: new Date().toISOString(),
          })
        }
        // Success — DB is the source of truth, no localStorage needed
      } catch (err) {
        console.error('Post submit error:', err)
      }
    } else {
      // No company yet — save to localStorage as temporary fallback
      addSupplierPost({
        id: 'post-' + Date.now(),
        user_id: user?.id || 'supplier-user',
        product_name: form.productName,
        price_per_kg: parseFloat(form.pricePerKg) || 0,
        currency: form.currency,
        country_of_origin: form.countryOfOrigin,
        fresh_frozen: form.freshFrozen,
        size_weight: form.sizeWeight,
        packaging: form.packagingFillet,
        availability: form.availability,
        location: form.location,
        supplier_info_extra: form.supplierInfoExtra,
        status: 'active',
        created_at: new Date().toISOString(),
      })
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  const resetForm = () => {
    setSubmitted(false)
    setForm({
      productName: '', pricePerKg: '', currency: 'EUR', countryOfOrigin: 'Holland (Netherlands)',
      freshFrozen: 'Frozen', sizeWeight: 'Medium (1–3 kg)', packagingFillet: 'Fillet (Skin On)',
      availability: 'In Stock — Ready to Ship', location: '', supplierInfoExtra: '', customImage: '',
    })
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#022B96] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="bg-white rounded-[32px] shadow-2xl p-12 max-w-md w-full text-center space-y-6 relative z-10">
          <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#022B96]">
            <CheckCircle2 className="h-10 w-10 text-[#022B96]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Product Listing Published!</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Your 9-field listing for <strong>{form.productName}</strong> is now active on your profile and accessible to global buyers.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="w-full py-4 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold rounded-full transition cursor-pointer text-sm shadow-lg"
            >
              Post Another Product
            </button>
            <Link href="/dashboard/supplier">
              <button type="button" className="w-full py-3.5 border border-slate-200 text-slate-700 font-semibold rounded-full hover:bg-slate-50 transition cursor-pointer text-sm">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#011440] via-[#022B96] to-[#011440] py-10 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Top Nav Back Link */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link
          href="/dashboard/supplier"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-[32px] shadow-2xl p-8 sm:p-12 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
                Supplier Profile Product Listing
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">Post Product Listing (9 Fields)</h1>
              <p className="text-sm text-slate-400 mt-1">Complete all 9 profile product listing parameters for buyers.</p>
            </div>

            {/* Photo Upload */}
            <div className="flex flex-col items-center flex-shrink-0">
              <label className="relative group cursor-pointer">
                {displayImage ? (
                  <div className="relative">
                    <img
                      src={displayImage}
                      alt="Product"
                      className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-xl ring-2 ring-[#022B96]/20 bg-slate-50"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#022B96] to-[#0440D9] text-white flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition">
                    {uploadingImage ? <Loader2 className="h-7 w-7 animate-spin" /> : <Camera className="h-7 w-7" />}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <span className="text-[11px] font-bold text-slate-500 mt-1.5">
                {form.customImage ? 'Change Image' : 'Add Photo'}
              </span>
            </div>
          </div>

          {/* 9 Product Specification Fields */}
          <div className="space-y-6">

            {/* Field 1: Product Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                1. Product Name *
              </label>
              {form.productName ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50/60 border border-blue-200 rounded-2xl">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-12 w-16 rounded-xl bg-white border border-blue-200/80 shadow-xs flex items-center justify-center p-1 overflow-hidden shrink-0">
                        <img
                          src={displayImage || getFishImageForProduct(form.productName)}
                          alt={form.productName}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 text-base leading-tight truncate">{form.productName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{selectedProductMeta?.category || 'Seafood Item'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { set('productName', ''); setPickerOpen(true) }}
                      className="text-xs font-bold text-[#022B96] hover:underline cursor-pointer shrink-0 ml-3"
                    >
                      Change Species
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl text-slate-500 transition cursor-pointer"
                >
                  <span className="text-sm font-medium text-slate-400">Select product species...</span>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Field 2: Price per KG */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  2. Price per KG *
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.currency}
                    onChange={(e) => set('currency', e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-2xl px-3.5 py-3.5 text-sm outline-none focus:border-[#022B96] transition cursor-pointer"
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
                    value={form.pricePerKg}
                    onChange={(e) => set('pricePerKg', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Field 3: Country of Origin */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  3. Country of Origin *
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.countryOfOrigin}
                    onChange={(e) => set('countryOfOrigin', e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#022B96] focus:bg-white transition cursor-pointer pr-10"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Field 4: Fresh / Frozen */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  4. Fresh / Frozen *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Fresh', 'Frozen', 'Both'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set('freshFrozen', opt)}
                      className={`py-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                        form.freshFrozen === opt
                          ? 'bg-[#022B96] text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 5: Size / Weight */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  5. Size / Weight *
                </label>
                <select
                  value={form.sizeWeight}
                  onChange={(e) => set('sizeWeight', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#022B96] focus:bg-white transition cursor-pointer"
                >
                  {SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Field 6: Packaging / Fillet */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  6. Packaging / Fillet Cut *
                </label>
                <select
                  value={form.packagingFillet}
                  onChange={(e) => set('packagingFillet', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#022B96] focus:bg-white transition cursor-pointer"
                >
                  {PACKAGING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Field 7: Availability */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  7. Availability *
                </label>
                <select
                  value={form.availability}
                  onChange={(e) => set('availability', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#022B96] focus:bg-white transition cursor-pointer"
                >
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Field 8: Location */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  8. Stock Location (City / Port) *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amsterdam, Netherlands"
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Field 9: Supplier Extra Information */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  9. Supplier Extra Information *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter certifications (MSC/ASC/HACCP), catch method, export capabilities, minimum order details..."
                  value={form.supplierInfoExtra}
                  onChange={(e) => set('supplierInfoExtra', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 outline-none focus:border-[#022B96] focus:bg-white transition resize-none font-medium"
                />
              </div>

            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-4 flex flex-col items-center justify-center">
            <button
              type="submit"
              disabled={submitting || !form.productName || !form.pricePerKg || !form.location}
              className="w-full sm:w-auto min-w-[260px] py-4 px-12 bg-gradient-to-r from-[#022B96] to-[#0440D9] hover:from-[#011a5e] hover:to-[#022B96] disabled:opacity-50 text-white font-extrabold text-base rounded-full shadow-xl shadow-[#022B96]/30 transition hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-3"
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
              ) : (
                <>Save & Publish Product Listing</>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Catalog Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            ref={pickerRef}
            className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="font-black text-slate-900 text-xl">Select Seafood Species</h3>
                <p className="text-xs text-slate-400 mt-0.5">{ALL_PRODUCTS.length}+ catalog species available</p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 border-b border-slate-100 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search species (e.g. Salmon, Tuna)..."
                  className="w-full pl-11 pr-4 py-3.5 bg-[#F3F6FA] border border-transparent rounded-2xl text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-8">
              {FISH_CATALOG.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-700">{cat.category}</p>
                    <div className="flex-1 h-px bg-slate-100 ml-2" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {cat.items.map((item) => {
                      const itemImg = getFishImageForProduct(item, cat.image)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => selectProduct(item)}
                          className="p-2.5 bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left font-bold text-xs text-slate-800 hover:text-[#022B96] transition cursor-pointer flex items-center gap-2.5 group"
                        >
                          <div className="h-9 w-12 bg-white rounded-lg border border-slate-200/80 group-hover:border-blue-200 flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs">
                            <img src={itemImg} alt={item} className="h-full w-full object-contain" />
                          </div>
                          <span className="truncate">{item}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

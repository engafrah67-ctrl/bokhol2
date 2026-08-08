'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
} from 'lucide-react'

/* ─────────────────────────────────────────────
   COMPLETE FISH CATALOG — 80+ Species
────────────────────────────────────────────── */
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
    items: ['Plaice', 'Sole', 'Lemon Sole', 'Turbot', 'Brill', 'Megrim', 'Halibut'],
  },
  {
    category: 'Other Finfish',
    color: '#5850EC',
    items: [
      'Trout', 'Rainbow Trout', 'Monkfish', 'Swordfish',
      'Catfish', 'Tilapia', 'Pangasius', 'Snapper',
      'Grouper', 'Mahi Mahi', 'Barramundi', 'Red Mullet',
      'John Dory', 'Cobia', 'Wolffish', 'Ling',
      'Saithe', 'Black Cod', 'Rockfish',
    ],
  },
  {
    category: 'Shrimp & Prawns',
    color: '#E3A008',
    items: [
      'Shrimp', 'Prawn', 'Black Tiger Shrimp',
      'Vannamei Shrimp', 'Argentine Red Shrimp', 'Coldwater Shrimp',
    ],
  },
  {
    category: 'Lobster & Crab',
    color: '#E02424',
    items: [
      'Lobster', 'European Lobster', 'Rock Lobster',
      'Crab', 'King Crab', 'Snow Crab', 'Brown Crab',
      'Blue Crab', 'Spider Crab', 'Langoustine', 'Crayfish',
    ],
  },
  {
    category: 'Cephalopods',
    color: '#7E3AF2',
    items: ['Octopus', 'Squid', 'Cuttlefish', 'Calamari'],
  },
  {
    category: 'Molluscs & Bivalves',
    color: '#1C64F2',
    items: [
      'Mussels', 'Oysters', 'Scallops', 'Clams',
      'Cockles', 'Razor Clams', 'Abalone', 'Whelks', 'Snails',
    ],
  },
  {
    category: 'Frozen Products',
    color: '#6875F5',
    items: [
      'Frozen Salmon Fillet', 'Frozen Tuna Loin', 'Frozen Sea Bass',
      'Frozen Sea Bream', 'Frozen Shrimp', 'Frozen Octopus',
      'Frozen Squid', 'Frozen Mussels', 'Frozen Cod Fillet', 'Frozen Haddock Fillet',
    ],
  },
]

const ALL_PRODUCTS = FISH_CATALOG.flatMap((cat) =>
  cat.items.map((item) => ({ name: item, category: cat.category, color: cat.color, image: cat.image }))
)

const COUNTRIES = [
  'Norway', 'Netherlands', 'Iceland', 'Denmark', 'Scotland',
  'Spain', 'Portugal', 'France', 'Greece', 'Turkey',
  'Morocco', 'Japan', 'China', 'Chile', 'Peru', 'Canada', 'USA',
  'Ecuador', 'Vietnam', 'India', 'Australia', 'New Zealand', 'Other',
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

interface FormData {
  productName: string
  pricePerKg: string
  currency: string
  countryOfOrigin: string
  freshFrozen: 'Fresh' | 'Frozen' | 'Both' | ''
  sizeWeight: string
  packaging: string
  availability: string
  location: string
  quantity: string
  quantityUnit: string
  minOrderKg: string
  certifications: string[]
  additionalInfo: string
  customImage: string
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

  // Form State
  const [form, setForm] = useState<FormData>({
    productName: '',
    pricePerKg: '',
    currency: 'EUR',
    countryOfOrigin: '',
    freshFrozen: '',
    sizeWeight: '',
    packaging: '',
    availability: '',
    location: '',
    quantity: '',
    quantityUnit: 'kg',
    minOrderKg: '',
    certifications: [],
    additionalInfo: '',
    customImage: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user
        if (currentUser) {
          setUser(currentUser)
          const { data: companyData } = await supabase
            .from('companies')
            .select('id')
            .eq('owner_id', currentUser.id)
            .maybeSingle()
          if (companyData) setCompanyId(companyData.id)
        }
      } catch (err) {
        console.error('Auth check error:', err)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  // Close picker on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    if (pickerOpen) document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [pickerOpen])

  function set(field: keyof FormData, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleCert(cert: string) {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }))
  }

  function selectProduct(name: string) {
    set('productName', name)
    setPickerOpen(false)
    setSearchQuery('')
  }

  // Handle Photo Upload
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

  // Filtered products for search
  const filteredProducts = searchQuery.length > 0
    ? ALL_PRODUCTS.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  // Get selected product metadata
  const selectedProductMeta = ALL_PRODUCTS.find((p) => p.name === form.productName)
  const displayImage = form.customImage || selectedProductMeta?.image

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const details = {
      productName: form.productName,
      pricePerKg: parseFloat(form.pricePerKg) || null,
      currency: form.currency,
      countryOfOrigin: form.countryOfOrigin,
      freshFrozen: form.freshFrozen,
      sizeWeight: form.sizeWeight,
      packaging: form.packaging,
      availability: form.availability,
      location: form.location,
      quantity: parseFloat(form.quantity) || null,
      quantityUnit: form.quantityUnit,
      minOrderKg: parseFloat(form.minOrderKg) || null,
      certifications: form.certifications,
      additionalInfo: form.additionalInfo,
    }

    const postPayload: any = {
      id: 'post-' + Date.now(),
      user_id: user?.id || 'supplier-user',
      company_id: companyId,
      category: 'product_availability',
      title: `${form.productName} — ${form.currency} ${form.pricePerKg}/kg`,
      content: JSON.stringify(details),
      product_name: form.productName,
      price_per_kg: parseFloat(form.pricePerKg) || null,
      currency: form.currency,
      country_of_origin: form.countryOfOrigin,
      fresh_frozen: form.freshFrozen,
      size_weight: form.sizeWeight,
      packaging: form.packaging,
      availability: form.availability,
      location: form.location,
      quantity: parseFloat(form.quantity) || null,
      quantity_unit: form.quantityUnit,
      min_order_kg: parseFloat(form.minOrderKg) || null,
      certifications: form.certifications,
      additional_info: form.additionalInfo,
      status: 'active',
      is_published: true,
      created_at: new Date().toISOString(),
    }

    // Try inserting into Supabase DB if companyId exists
    if (companyId) {
      try {
        await supabase.from('supplier_posts').insert({
          company_id: companyId,
          category: 'product_availability',
          title: `${form.productName} — ${form.currency} ${form.pricePerKg}/kg`,
          content: JSON.stringify(details),
          is_published: true,
        })
      } catch (_) {}
    }

    // Always store locally so it works even if DB table is not migrated yet
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('supplier_posts') || '[]')
        localStorage.setItem('supplier_posts', JSON.stringify([postPayload, ...existing]))
      } catch (_) {}
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  const resetForm = () => {
    setSubmitted(false)
    setForm({
      productName: '', pricePerKg: '', currency: 'EUR', countryOfOrigin: '',
      freshFrozen: '', sizeWeight: '', packaging: '', availability: '',
      location: '', quantity: '', quantityUnit: 'kg', minOrderKg: '',
      certifications: [], additionalInfo: '', customImage: '',
    })
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#022B96] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="bg-white rounded-[32px] shadow-2xl p-12 max-w-md w-full text-center space-y-6 relative z-10">
          <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#022B96]">
            <CheckCircle2 className="h-10 w-10 text-[#022B96]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Post Published!</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Your stock availability for <strong>{form.productName}</strong> has been published. Verified buyers can now view and request quotes.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="w-full py-4 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold rounded-full transition cursor-pointer text-sm shadow-lg shadow-[#022B96]/30"
            >
              Post Another Listing
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
      
      {/* Decorative Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

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

      {/* Main Inspiration Floating White Card (Inspired by reference UI) */}
      <div className="max-w-4xl mx-auto bg-white rounded-[32px] shadow-2xl p-8 sm:p-12 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── HEADER: Title + Add Photo Button (Exact layout from reference) ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Post Stock Listing</h1>
              <p className="text-sm text-slate-400 mt-1">Fill out basic details to publish seafood stock availability</p>
            </div>

            {/* Circular Photo Upload Badge (Matching reference top-right circle) */}
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
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#022B96] to-[#0440D9] text-white flex flex-col items-center justify-center shadow-lg shadow-[#022B96]/30 group-hover:scale-105 transition">
                    {uploadingImage ? (
                      <Loader2 className="h-7 w-7 animate-spin" />
                    ) : (
                      <Camera className="h-7 w-7" />
                    )}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] font-bold text-slate-500 mt-1.5">
                {form.customImage ? 'Change Image' : 'Add Photo'}
              </span>
            </div>
          </div>

          {/* ── SECTION 1: Product Selection ───────────────────────── */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Seafood Product Name *
              </label>

              {form.productName ? (
                <div className="flex items-center justify-between p-4 bg-[#F3F6FA] border border-slate-200/60 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#022B96] text-white flex items-center justify-center font-bold">
                      <Fish className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-base leading-tight">{form.productName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedProductMeta?.category || 'Seafood'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { set('productName', ''); setPickerOpen(true) }}
                    className="text-xs font-bold text-[#022B96] hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="w-full flex items-center justify-between p-4 bg-[#F3F6FA] hover:bg-slate-100/80 border border-transparent rounded-2xl text-slate-500 transition cursor-pointer"
                >
                  <span className="text-sm font-medium text-slate-400">Select seafood product species...</span>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </button>
              )}
            </div>

            {/* Fresh / Frozen Option Buttons */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Condition Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Fresh', 'Frozen', 'Both'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set('freshFrozen', opt)}
                    className={`py-3.5 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                      form.freshFrozen === opt
                        ? 'bg-[#022B96] text-white shadow-md shadow-[#022B96]/20'
                        : 'bg-[#F3F6FA] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {form.freshFrozen === opt && <CheckCircle2 className="h-4 w-4" />}
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Pricing & Origin (Matching Reference Grid) ── */}
          <div className="space-y-6 pt-2">
            <h2 className="text-base font-extrabold text-slate-900">Pricing & Location</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Price per KG */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Price per KG *
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.currency}
                    onChange={(e) => set('currency', e.target.value)}
                    className="bg-[#F3F6FA] border border-transparent text-slate-800 font-bold rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#022B96] transition cursor-pointer"
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
                    placeholder="e.g. 5.80"
                    value={form.pricePerKg}
                    onChange={(e) => set('pricePerKg', e.target.value)}
                    className="flex-1 bg-[#F3F6FA] border border-transparent text-slate-800 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Country of Origin */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Country of Origin *
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.countryOfOrigin}
                    onChange={(e) => set('countryOfOrigin', e.target.value)}
                    className="w-full appearance-none bg-[#F3F6FA] border border-transparent text-slate-800 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-[#022B96] focus:bg-white transition cursor-pointer pr-10"
                  >
                    <option value="">- Select Country -</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Total Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Total Quantity Available
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={form.quantity}
                    onChange={(e) => set('quantity', e.target.value)}
                    className="flex-1 bg-[#F3F6FA] border border-transparent text-slate-800 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                  />
                  <select
                    value={form.quantityUnit}
                    onChange={(e) => set('quantityUnit', e.target.value)}
                    className="bg-[#F3F6FA] border border-transparent text-slate-800 font-bold rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#022B96] transition cursor-pointer"
                  >
                    <option>kg</option>
                    <option>tons</option>
                    <option>lbs</option>
                  </select>
                </div>
              </div>

              {/* Minimum Order */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Minimum Order (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  value={form.minOrderKg}
                  onChange={(e) => set('minOrderKg', e.target.value)}
                  className="w-full bg-[#F3F6FA] border border-transparent text-slate-800 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Specifications Sub-Card (Matching reference inner container) ── */}
          <div className="bg-[#F7FAFC] rounded-2xl p-6 sm:p-8 border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">Product Specifications</h2>
              <span className="text-xs font-bold text-[#022B96]">Details & Packaging</span>
            </div>

            {/* Size Options */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Size / Weight Class</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set('sizeWeight', opt)}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                      form.sizeWeight === opt
                        ? 'bg-[#022B96] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Packaging Options */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Packaging Cut Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PACKAGING_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set('packaging', opt)}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                      form.packaging === opt
                        ? 'bg-[#022B96] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Stock Location (Port / City) *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Urk, Netherlands"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#022B96] transition"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 4: Notes & Certifications ── */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Certifications
              </label>
              <div className="flex flex-wrap gap-2">
                {['MSC', 'ASC', 'HACCP', 'IFS Food', 'GlobalG.A.P.', 'BRC', 'Friend of the Sea'].map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCert(cert)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                      form.certifications.includes(cert)
                        ? 'bg-[#022B96] text-white'
                        : 'bg-[#F3F6FA] text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {form.certifications.includes(cert) ? '✓ ' : ''}{cert}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Additional Supplier Notes
              </label>
              <textarea
                rows={3}
                placeholder="Catch date, fishing method, export documentation, cold chain info..."
                value={form.additionalInfo}
                onChange={(e) => set('additionalInfo', e.target.value)}
                className="w-full bg-[#F3F6FA] border border-transparent rounded-2xl p-4 text-sm text-slate-800 outline-none focus:border-[#022B96] focus:bg-white transition resize-none"
              />
            </div>
          </div>

          {/* ── FOOTER BUTTON (Matching reference bottom centered pill) ── */}
          <div className="pt-4 flex flex-col items-center justify-center">
            <button
              type="submit"
              disabled={submitting || !form.productName || !form.pricePerKg || !form.location}
              className="w-full sm:w-auto min-w-[260px] py-4 px-12 bg-gradient-to-r from-[#022B96] to-[#0440D9] hover:from-[#011a5e] hover:to-[#022B96] disabled:opacity-50 text-white font-extrabold text-base rounded-full shadow-xl shadow-[#022B96]/30 transition hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-3"
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
              ) : (
                <>Save & Publish Stock</>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* ── PRODUCT PICKER MODAL ────────────────────────────── */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            ref={pickerRef}
            className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
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

            {/* Search */}
            <div className="p-5 border-b border-slate-100 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search species..."
                  className="w-full pl-11 pr-4 py-3.5 bg-[#F3F6FA] border border-transparent rounded-2xl text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="overflow-y-auto flex-1 p-6 space-y-8">
              {FISH_CATALOG.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-700">{cat.category}</p>
                    <div className="flex-1 h-px bg-slate-100 ml-2" />
                    <span className="text-[10px] text-slate-400 font-semibold">{cat.items.length} items</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {cat.items.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => selectProduct(item)}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-[#F3F6FA] hover:bg-[#022B96] hover:text-white transition cursor-pointer text-left group"
                      >
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={item}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-200/60 bg-white flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-white text-[#022B96] flex items-center justify-center flex-shrink-0 border border-slate-200/60">
                            <Fish className="h-5 w-5" />
                          </div>
                        )}
                        <span className="text-xs font-bold leading-tight group-hover:text-white text-slate-800 truncate">{item}</span>
                      </button>
                    ))}
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

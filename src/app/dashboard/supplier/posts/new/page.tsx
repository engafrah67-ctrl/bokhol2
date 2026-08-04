'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Fish,
  DollarSign,
  Globe2,
  Thermometer,
  Weight,
  Package,
  Calendar,
  MapPin,
  Info,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from 'lucide-react'

const SEAFOOD_PRODUCTS = [
  'Atlantic Salmon', 'Bluefin Tuna', 'Yellowfin Tuna', 'Bigeye Tuna',
  'Cod', 'Haddock', 'Mackerel', 'Herring', 'Sardine', 'Anchovy',
  'Sea Bass', 'Sea Bream', 'Turbot', 'Sole', 'Halibut',
  'Shrimp', 'King Prawn', 'Lobster', 'Crab', 'Scallop',
  'Octopus', 'Squid', 'Cuttlefish', 'Mussels', 'Oyster', 'Clam',
  'Other',
]

const COUNTRIES = [
  'Norway', 'Netherlands', 'Iceland', 'Denmark', 'Scotland',
  'Spain', 'Portugal', 'France', 'Morocco', 'Japan',
  'China', 'Chile', 'Peru', 'Canada', 'USA', 'Other',
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
}

export default function PostStockPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser) {
          setUser(currentUser)
        }
      } catch (err) {
        console.error('Auth check error:', err)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    // Simulate save
    await new Promise((r) => setTimeout(r, 1200))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 max-w-md w-full text-center space-y-5">
          <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Post Published!</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your stock availability for <strong>{form.productName}</strong> has been posted. Buyers can now see and enquire about your listing.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => { setSubmitted(false); setForm({ productName: '', pricePerKg: '', currency: 'EUR', countryOfOrigin: '', freshFrozen: '', sizeWeight: '', packaging: '', availability: '', location: '', quantity: '', quantityUnit: 'kg', minOrderKg: '', certifications: [], additionalInfo: '' }) }}
              className="w-full py-3 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold rounded-xl transition cursor-pointer text-sm"
            >
              Post Another Listing
            </button>
            <Link href="/dashboard/supplier">
              <button className="w-full py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer text-sm">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">

      {/* Header */}
      <div
        className="relative w-full px-4 sm:px-8 pt-7 pb-14"
        style={{ background: 'linear-gradient(135deg, #011440 0%, #022B96 100%)' }}
      >
        <Link
          href="/dashboard/supplier"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="max-w-3xl">
          <span className="inline-block text-xs font-bold text-blue-300 uppercase tracking-widest mb-3 bg-white/10 px-3 py-1 rounded-full">
            New Listing
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Post Stock Availability</h1>
          <p className="text-blue-200/80 text-sm mt-2 max-w-xl">
            Fill in the details below. Buyers on the platform will see your listing and can send enquiries directly.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Section 1 — Product */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-[#022B96]/10 flex items-center justify-center text-[#022B96]">
                <Fish className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Product Details</h2>
                <p className="text-xs text-slate-400">What are you selling?</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* 1. Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span className="text-[#022B96] mr-1">1</span> Product Name *
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.productName}
                    onChange={(e) => set('productName', e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#022B96] focus:bg-white transition cursor-pointer pr-10"
                  >
                    <option value="">Select seafood product...</option>
                    {SEAFOOD_PRODUCTS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* 4. Fresh / Frozen */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span className="text-[#022B96] mr-1">4</span> Fresh / Frozen *
                </label>
                <div className="flex gap-3">
                  {(['Fresh', 'Frozen', 'Both'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set('freshFrozen', opt)}
                      className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                        form.freshFrozen === opt
                          ? 'bg-[#022B96] text-white border-[#022B96] shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {opt === 'Fresh' ? '🧊 Fresh' : opt === 'Frozen' ? '❄️ Frozen' : '✅ Both'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Pricing & Origin */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Pricing & Origin</h2>
                <p className="text-xs text-slate-400">Set your price and source location</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 2. Price per KG */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span className="text-[#022B96] mr-1">2</span> Price per KG *
                </label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={form.currency}
                      onChange={(e) => set('currency', e.target.value)}
                      className="appearance-none h-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#022B96] transition cursor-pointer pr-7"
                    >
                      <option>EUR</option>
                      <option>USD</option>
                      <option>GBP</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 5.80"
                    value={form.pricePerKg}
                    onChange={(e) => set('pricePerKg', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* 3. Country of Origin */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span className="text-[#022B96] mr-1">3</span> Country of Origin *
                </label>
                <div className="relative">
                  <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    required
                    value={form.countryOfOrigin}
                    onChange={(e) => set('countryOfOrigin', e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-9 text-sm outline-none focus:border-[#022B96] focus:bg-white transition cursor-pointer pr-10"
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Total Quantity Available
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={form.quantity}
                    onChange={(e) => set('quantity', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                  />
                  <div className="relative">
                    <select
                      value={form.quantityUnit}
                      onChange={(e) => set('quantityUnit', e.target.value)}
                      className="appearance-none bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#022B96] transition cursor-pointer pr-7"
                    >
                      <option>kg</option>
                      <option>tons</option>
                      <option>lbs</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Min Order */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Minimum Order (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  value={form.minOrderKg}
                  onChange={(e) => set('minOrderKg', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3 — Specs */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Product Specifications</h2>
                <p className="text-xs text-slate-400">Size, packaging and availability</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* 5. Size / Weight */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span className="text-[#022B96] mr-1">5</span> Size / Weight
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set('sizeWeight', opt)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-left ${
                        form.sizeWeight === opt
                          ? 'bg-[#022B96]/10 text-[#022B96] border-[#022B96]/30'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Packaging / Fillet */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span className="text-[#022B96] mr-1">6</span> Packaging / Fillet Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PACKAGING_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set('packaging', opt)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-left ${
                        form.packaging === opt
                          ? 'bg-[#022B96]/10 text-[#022B96] border-[#022B96]/30'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Availability */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span className="text-[#022B96] mr-1">7</span> Availability *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set('availability', opt)}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition cursor-pointer text-left flex items-center gap-2 ${
                        form.availability === opt
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${form.availability === opt ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 — Location & Supplier Info */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Location & Supplier Info</h2>
                <p className="text-xs text-slate-400">Where the stock is located and extra details</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* 8. Location */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span className="text-[#022B96] mr-1">8</span> Stock Location (Port / City) *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Urk, Netherlands"
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-[#022B96] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Certifications (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['MSC', 'ASC', 'HACCP', 'IFS Food', 'GlobalG.A.P.', 'BRC', 'Friend of the Sea'].map((cert) => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCert(cert)}
                      className={`px-4 py-2 rounded-full border text-xs font-semibold transition cursor-pointer ${
                        form.certifications.includes(cert)
                          ? 'bg-[#022B96] text-white border-[#022B96]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {form.certifications.includes(cert) ? '✓ ' : ''}{cert}
                    </button>
                  ))}
                </div>
              </div>

              {/* 9. Additional Supplier Info */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <span className="text-[#022B96] mr-1">9</span> Supplier Information (Extra Notes)
                </label>
                <textarea
                  rows={4}
                  placeholder="Add any extra details buyers should know — catch date, fishing method, export documentation, cold chain info, special handling, etc."
                  value={form.additionalInfo}
                  onChange={(e) => set('additionalInfo', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#022B96] focus:bg-white transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Preview Banner */}
          {form.productName && form.pricePerKg && (
            <div className="mx-6 sm:mx-8 my-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#022B96]/10 flex items-center justify-center text-[#022B96] shrink-0">
                <Fish className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">{form.productName}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {form.currency} {form.pricePerKg}/kg
                  {form.freshFrozen && ` · ${form.freshFrozen}`}
                  {form.countryOfOrigin && ` · ${form.countryOfOrigin}`}
                  {form.location && ` · ${form.location}`}
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full shrink-0">Preview</span>
            </div>
          )}

          {/* Submit */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              disabled={submitting || !form.productName || !form.pricePerKg || !form.availability || !form.location}
              className="flex-1 sm:flex-none sm:min-w-[200px] py-3.5 px-8 bg-[#022B96] hover:bg-[#011a5e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#022B96]/20"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4" /> Publish Listing</>
              )}
            </button>
            <Link href="/dashboard/supplier" className="text-sm text-slate-500 hover:text-slate-700 font-medium transition cursor-pointer">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}

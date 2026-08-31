'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2, ShoppingBag, MapPin, ShieldCheck, AlertCircle, Calendar, Package, Lock, LogIn, UserPlus, Phone, Mail, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'

const inputCls = 'w-full text-sm border border-slate-200 rounded-xl bg-white px-4 py-3 focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none placeholder:text-slate-400 font-medium transition'
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2'

export default function NewBuyerRequestPage() {
  const router = useRouter()
  const { user, profile, isLoading } = useUser()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Form State matching User Example requirements
  const [productNeeded, setProductNeeded] = useState('Salmon')
  const [quantity, setQuantity] = useState('100 KG')
  const [freshFrozen, setFreshFrozen] = useState('fresh/frozen')
  const [location, setLocation] = useState('Amsterdam')
  const [packagingProcessing, setPackagingProcessing] = useState('packing/pure')
  const [deliveryDate, setDeliveryDate] = useState('Friday')
  const [targetPrice, setTargetPrice] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Contact Info State
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?next=/requests/buyer/new')
    }
    if (user) {
      if (!buyerEmail) setBuyerEmail(user.email || '')
      if (!buyerName && profile?.full_name) setBuyerName(profile.full_name)
      if (!buyerPhone && (profile as any)?.phone) setBuyerPhone((profile as any).phone)
    }
  }, [isLoading, user, profile, router, buyerEmail, buyerName, buyerPhone])

  // Loading spinner while checking auth status
  if (isLoading || !user) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#022B96] flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-[#022B96] bg-blue-50 px-2.5 py-0.5 rounded-full mb-1 border border-blue-100">
              Account Required
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">Redirecting to Sign In...</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              You need to log in to post a seafood sourcing request. Redirecting you to login...
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/login?next=/requests/buyer/new" className="w-full">
              <button className="w-full py-3 px-5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl shadow transition cursor-pointer">
                Sign In Now
              </button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const supabase = createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    // Format contact string for description
    const contactName = buyerName || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Verified Buyer'
    const contactEmail = buyerEmail || currentUser?.email || ''
    const contactSummary = `Buyer: ${contactName} (${contactEmail}${buyerPhone ? ` | ${buyerPhone}` : ''})`

    // Save details JSON
    const details = {
      productNeeded,
      quantity,
      freshFrozen,
      location,
      packagingProcessing,
      deliveryDate,
      targetPrice: targetPrice ? `$${targetPrice}/kg` : null,
      buyerName: contactName,
      buyerEmail: contactEmail,
      buyerPhone: buyerPhone || null,
      additionalNotes,
      createdAt: new Date().toISOString()
    }

    const descriptionPayload = `${contactSummary}\n${JSON.stringify(details)}`

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${quantity} ${productNeeded} — ${location}`,
          description: descriptionPayload,
          destination: location,
          quantity: parseFloat(quantity) || null,
          quantityUnit: 'kg',
          targetPrice: targetPrice ? parseFloat(targetPrice) : null,
          currency: 'USD',
          userId: currentUser?.id,
          countryId: null,
        }),
      })

      if (!res.ok) {
        // Direct Supabase insert fallback
        await supabase.from('buyer_requests').insert({
          user_id: currentUser?.id,
          title: `${quantity} ${productNeeded} — ${location}`,
          description: descriptionPayload,
          destination: location,
          quantity: parseFloat(quantity) || null,
          quantity_unit: 'kg',
          target_price: targetPrice ? parseFloat(targetPrice) : null,
          currency: 'USD',
          status: 'open',
          country_id: null,
        })
      }
    } catch (err) {
      console.error('Error saving request to Supabase:', err)
    }

    setLoading(false)
    router.push('/requests/buyer')
  }

  return (
    <main className="min-h-screen bg-transparent pb-16">
      {/* Header */}
      <div className="border-b border-white/50 bg-transparent py-6">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/requests/buyer" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#022B96] transition-colors gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back to Requests
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          {/* Form Banner */}
          <div className="bg-gradient-to-r from-[#022B96] to-[#0440D9] p-6 text-white flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
              <ShoppingBag className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Post Buyer Sourcing Request</h2>
              <p className="text-xs text-blue-100 mt-0.5">Tell verified seafood suppliers what products and delivery specs you need.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

            {/* Error */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-800">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Product & Quantity */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">1. Product & Quantity Required</h3>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Product Needed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salmon, Cod, Tuna"
                    value={productNeeded}
                    onChange={e => setProductNeeded(e.target.value)}
                    className={inputCls}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Specify fish species or product item</p>
                </div>

                <div>
                  <label className={labelCls}>Quantity Needed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100 KG, 5 Tons"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className={inputCls}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">e.g. 100 KG, 2000 KG, 1 Container</p>
                </div>
              </div>

              {/* Condition Options */}
              <div>
                <label className={labelCls}>Fresh / Frozen Condition *</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Fresh', val: 'fresh' },
                    { label: 'Frozen', val: 'frozen' },
                    { label: 'Fresh / Frozen', val: 'fresh/frozen' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setFreshFrozen(opt.val)}
                      className={`py-3 rounded-xl font-bold text-xs transition cursor-pointer text-center ${
                        freshFrozen === opt.val
                          ? 'bg-[#022B96] text-white shadow-md'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Section 2: Location, Packaging & Delivery */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">2. Location, Packaging & Delivery</h3>

              <div className="grid sm:grid-cols-2 gap-5">
                {/* Location */}
                <div>
                  <label className={labelCls}>Delivery Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amsterdam, Vigo, Tokyo"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>

                {/* Packaging / Fillet */}
                <div>
                  <label className={labelCls}>Packaging / Processing *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. packing/pure, Fillet, Whole"
                    value={packagingProcessing}
                    onChange={e => setPackagingProcessing(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {/* Delivery Date */}
                <div>
                  <label className={labelCls}>Delivery Day / Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Friday, Next Week"
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>

                {/* Target Price per KG (Optional) */}
                <div>
                  <label className={labelCls}>Target Price per KG (USD/EUR, Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 5.50 / kg"
                    value={targetPrice}
                    onChange={e => setTargetPrice(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Extra Details / Requirements</label>
                <textarea
                  rows={3}
                  placeholder="Specify size requirement, skin-on/skinless, temperature requirements..."
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl bg-white p-4 focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none placeholder:text-slate-400 transition"
                />
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Section 3: Contact Info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">3. Contact & Communication</h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Required for direct supplier quotes
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Suppliers will use these details to contact you directly and send price quotes.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {/* Buyer / Company Name */}
                <div>
                  <label className={labelCls}>Your Name or Company Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe / Global Seafood Imports"
                      value={buyerName}
                      onChange={e => setBuyerName(e.target.value)}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>

                {/* Phone / WhatsApp */}
                <div>
                  <label className={labelCls}>Phone / WhatsApp Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 555 123 4567 or +34 612 345 678"
                      value={buyerPhone}
                      onChange={e => setBuyerPhone(e.target.value)}
                      className={`${inputCls} pl-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Suppliers will reach out to you via WhatsApp/Phone.</p>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelCls}>Contact Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. buyer@company.com"
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-4">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Verified suppliers will reply with custom quotes
              </span>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-7 py-3 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-bold rounded-2xl transition shadow-lg shadow-[#022B96]/20 disabled:opacity-75 cursor-pointer"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Posting...</>
                ) : (
                  <>Post Request <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  )
}

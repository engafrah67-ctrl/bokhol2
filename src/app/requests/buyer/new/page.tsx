'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2, Ship, MapPin, ShieldCheck, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const COUNTRIES = [
  { name: 'China', flag: 'https://flagcdn.com/w40/cn.png' },
  { name: 'Chile', flag: 'https://flagcdn.com/w40/cl.png' },
  { name: 'Vietnam', flag: 'https://flagcdn.com/w40/vn.png' },
  { name: 'Spain', flag: 'https://flagcdn.com/w40/es.png' },
  { name: 'Norway', flag: 'https://flagcdn.com/w40/no.png' },
  { name: 'Japan', flag: 'https://flagcdn.com/w40/jp.png' },
  { name: 'Ecuador', flag: 'https://flagcdn.com/w40/ec.png' },
  { name: 'United States', flag: 'https://flagcdn.com/w40/us.png' },
  { name: 'Greece', flag: 'https://flagcdn.com/w40/gr.png' },
  { name: 'Iceland', flag: 'https://flagcdn.com/w40/is.png' },
  { name: 'Morocco', flag: 'https://flagcdn.com/w40/ma.png' },
  { name: 'India', flag: 'https://flagcdn.com/w40/in.png' },
]

const FISH_TYPES = [
  'Atlantic Salmon', 'Bluefin Tuna', 'Yellowfin Tuna', 'Cod', 'Mackerel',
  'Herring', 'Sardine', 'Shrimp / Prawn', 'Tilapia', 'Squid', 'Octopus',
  'Sea Bass', 'Bream', 'Halibut', 'Pangasius', 'Other'
]

const inputCls = 'w-full text-sm border border-slate-200 rounded-lg bg-white px-3 py-2.5 focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none placeholder:text-slate-400'
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5'

export default function NewBuyerRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Location
  const [originCountryName, setOriginCountryName] = useState('China')
  const [originPort, setOriginPort] = useState('')
  const [destCountryName, setDestCountryName] = useState('Chile')
  const [destPort, setDestPort] = useState('')

  // Product
  const [fishType, setFishType] = useState('Atlantic Salmon')
  const [quantityTons, setQuantityTons] = useState('')
  const [processingState, setProcessingState] = useState('Frozen')
  const [targetPrice, setTargetPrice] = useState('')

  // Logistics
  const [shippingType, setShippingType] = useState('Port to Port')
  const [containerType, setContainerType] = useState('40RF')
  const [carrierPreference, setCarrierPreference] = useState('Any')
  const [deadlineDays, setDeadlineDays] = useState('30')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErrorMessage('You must be signed in as a buyer to post a request.')
      setLoading(false)
      return
    }

    const selectedOrigin = COUNTRIES.find(c => c.name === originCountryName) || COUNTRIES[0]
    const selectedDest = COUNTRIES.find(c => c.name === destCountryName) || COUNTRIES[1]
    const expiresDate = new Date()
    expiresDate.setDate(expiresDate.getDate() + parseInt(deadlineDays))

    const details = {
      originCountry: selectedOrigin.name,
      originFlag: selectedOrigin.flag,
      originPort: originPort,
      destCountry: selectedDest.name,
      destFlag: selectedDest.flag,
      destPort: destPort,
      fishType,
      quantityTons,
      processingState,
      targetPrice,
      shippingType,
      carrierPreference,
      containerType,
    }

    const { error } = await supabase.from('buyer_requests').insert({
      user_id: user.id,
      title: `${fishType} — ${originPort || originCountryName} to ${destPort || destCountryName}`,
      description: JSON.stringify(details),
      destination: destPort || destCountryName,
      quantity: quantityTons ? parseFloat(quantityTons) : null,
      quantity_unit: 'ton',
      target_price: targetPrice ? parseFloat(targetPrice) : null,
      status: 'open',
      expires_at: expiresDate.toISOString().split('T')[0],
    })

    if (error) {
      setErrorMessage(error.message || 'Failed to post sourcing request.')
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/requests/buyer')
  }

  return (
    <main className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white py-6">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/requests/buyer" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#022B96] transition-colors gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back to requests
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-10">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {/* Form Banner */}
          <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-[#022B96] rounded-xl">
              <Ship className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Post sourcing request</h2>
              <p className="text-xs text-slate-500 mt-0.5">Let verified carrier lines and seafood exporters offer you rates.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Error */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-800">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section: What do you need? */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500">What do you need?</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Fish / seafood type</label>
                  <select value={fishType} onChange={e => setFishType(e.target.value)} className={inputCls}>
                    {FISH_TYPES.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Processing state</label>
                  <select value={processingState} onChange={e => setProcessingState(e.target.value)} className={inputCls}>
                    <option>Frozen</option>
                    <option>Fresh / chilled</option>
                    <option>Live</option>
                    <option>Dried / salted</option>
                    <option>Smoked</option>
                    <option>Canned</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Quantity needed (metric tons)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    placeholder="e.g. 25"
                    value={quantityTons}
                    onChange={e => setQuantityTons(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Target price per kg (USD, optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 4.50"
                    value={targetPrice}
                    onChange={e => setTargetPrice(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Section: Route */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500">Shipping route</h3>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Origin */}
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-400" /> Origin
                  </p>
                  <div>
                    <label className={labelCls}>Country</label>
                    <select value={originCountryName} onChange={e => setOriginCountryName(e.target.value)} className={inputCls}>
                      {COUNTRIES.map(c => <option key={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Port name</label>
                    <input type="text" required placeholder="e.g. Zhanjiang" value={originPort} onChange={e => setOriginPort(e.target.value)} className={inputCls} />
                  </div>
                </div>

                {/* Destination */}
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" /> Destination
                  </p>
                  <div>
                    <label className={labelCls}>Country</label>
                    <select value={destCountryName} onChange={e => setDestCountryName(e.target.value)} className={inputCls}>
                      {COUNTRIES.map(c => <option key={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Port name</label>
                    <input type="text" required placeholder="e.g. Caldera" value={destPort} onChange={e => setDestPort(e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Section: Logistics */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500">Logistics details</h3>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Shipping type</label>
                  <select value={shippingType} onChange={e => setShippingType(e.target.value)} className={inputCls}>
                    <option>Port to Port</option>
                    <option>Door to Door</option>
                    <option>Port to Door</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Container type</label>
                  <select value={containerType} onChange={e => setContainerType(e.target.value)} className={inputCls}>
                    <option value="40RF">40RF (Reefer)</option>
                    <option value="20RF">20RF (Reefer)</option>
                    <option value="40GP">40GP (General)</option>
                    <option value="20GP">20GP (General)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Carrier preference</label>
                  <select value={carrierPreference} onChange={e => setCarrierPreference(e.target.value)} className={inputCls}>
                    <option>Any</option>
                    <option>HPL</option>
                    <option>MSK</option>
                    <option>ONE</option>
                    <option>COSCO</option>
                    <option>CMA CGM</option>
                  </select>
                </div>
              </div>

              <div className="sm:w-1/2">
                <label className={labelCls}>Offer deadline</label>
                <select value={deadlineDays} onChange={e => setDeadlineDays(e.target.value)} className={inputCls}>
                  <option value="7">7 days</option>
                  <option value="15">15 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-4">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Requests are reviewed before going live
              </span>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-semibold rounded-xl transition shadow-md disabled:opacity-75 cursor-pointer"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Posting...</>
                ) : (
                  <>Post request <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle2, Loader2, ImagePlus } from 'lucide-react'

const ORIGIN_COUNTRIES = [
  { name: 'Norway', flag: '🇳🇴' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Belgium', flag: '🇧🇪' },
  { name: 'Iceland', flag: '🇮🇸' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Denmark', flag: '🇩🇰' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Ireland', flag: '🇮🇪' },
  { name: 'Faroe Islands', flag: '🇫🇴' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Greece', flag: '🇬🇷' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Chile', flag: '🇨🇱' },
  { name: 'Peru', flag: '🇵🇪' },
  { name: 'Ecuador', flag: '🇪🇨' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Vietnam', flag: '🇻🇳' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Thailand', flag: '🇹🇭' },
  { name: 'China', flag: '🇨🇳' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Mauritania', flag: '🇲🇷' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'New Zealand', flag: '🇳🇿' },
  { name: 'Australia', flag: '🇦🇺' },
]

interface ProductPublishModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: (post: any) => void
  initialPost?: any | null
  defaultSupplierId?: string | null
  suppliers: Array<{
    id: string
    name: string
    logoUrl?: string | null
    country?: string
  }>
}

const lbl = 'block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1'
const inp = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#022B96] transition'
const sel = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#022B96] cursor-pointer'

export function ProductPublishModal({
  isOpen,
  onClose,
  onSaved,
  initialPost,
  defaultSupplierId,
  suppliers,
}: ProductPublishModalProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('')
  const [productName, setProductName] = useState('')
  const [pricePerKg, setPricePerKg] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [freshFrozen, setFreshFrozen] = useState<'Fresh' | 'Frozen' | 'Smoked' | 'Live'>('Frozen')
  const [countryOfOrigin, setCountryOfOrigin] = useState('Norway')
  const [sizeWeight, setSizeWeight] = useState('')
  const [packagingFillet, setPackagingFillet] = useState('')
  const [availability, setAvailability] = useState('In Stock — Ready to Ship')
  const [location, setLocation] = useState('')
  const [supplierInfoExtra, setSupplierInfoExtra] = useState('')
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setErrorMsg(null)
    if (initialPost) {
      setSelectedSupplierId(initialPost.company_id || defaultSupplierId || suppliers[0]?.id || '')
      setProductName(initialPost.product_name || '')
      setPricePerKg(initialPost.price_per_kg ? String(initialPost.price_per_kg) : '')
      setCurrency(initialPost.currency || 'EUR')
      setFreshFrozen(initialPost.fresh_frozen || 'Frozen')
      setCountryOfOrigin(initialPost.country_of_origin || 'Norway')
      setSizeWeight(initialPost.size_weight || '')
      setPackagingFillet(initialPost.packaging || '')
      setAvailability(initialPost.availability || 'In Stock — Ready to Ship')
      setLocation(initialPost.location || '')
      setSupplierInfoExtra(initialPost.supplier_info_extra || '')
      setCustomImage(initialPost.custom_image || null)
    } else {
      setSelectedSupplierId(defaultSupplierId || suppliers[0]?.id || '')
      setProductName('')
      setPricePerKg('')
      setCurrency('EUR')
      setFreshFrozen('Frozen')
      setCountryOfOrigin('Norway')
      setSizeWeight('')
      setPackagingFillet('')
      setAvailability('In Stock — Ready to Ship')
      setLocation('')
      setSupplierInfoExtra('')
      setCustomImage(null)
    }
  }, [isOpen, initialPost, defaultSupplierId, suppliers])

  if (!isOpen) return null

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) setCustomImage(ev.target.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setErrorMsg(null)
    const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId)
    if (!selectedSupplierId || !selectedSupplier) { setErrorMsg('Please select a supplier.'); return }
    if (!productName.trim()) { setErrorMsg('Please enter a product name.'); return }
    const priceNum = parseFloat(pricePerKg)
    if (isNaN(priceNum) || priceNum <= 0) { setErrorMsg('Please enter a valid price per kg.'); return }

    setSaving(true)
    const priceLabel = `${currency} ${priceNum.toFixed(2)}/kg`
    const details = {
      productName: productName.trim(), pricePerKg: priceNum, minPricePerKg: priceNum, maxPricePerKg: 0,
      currency, countryOfOrigin, freshFrozen, sizeWeight, packagingFillet, availability, location,
      supplierInfoExtra, customImage, companyId: selectedSupplier.id, companyName: selectedSupplier.name,
      companyLogo: selectedSupplier.logoUrl || null, companyCountry: selectedSupplier.country || '',
      lastAdminUpdate: new Date().toISOString(), createdAt: initialPost?.created_at || new Date().toISOString(),
    }

    try {
      if (initialPost?.id) {
        const res = await fetch('/api/supplier/posts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: initialPost.id, title: `${productName.trim()} — ${priceLabel}`, content: JSON.stringify(details), is_published: true, updated_at: new Date().toISOString() }),
        })
        const json = await res.json()
        if (!res.ok || json.error) throw new Error(json.error || 'Failed to update product')
        onSaved({ ...initialPost, company_id: selectedSupplier.id, company_name: selectedSupplier.name, company_logo: selectedSupplier.logoUrl, company_country: selectedSupplier.country, product_name: productName.trim(), price_per_kg: priceNum, max_price_per_kg: 0, currency, country_of_origin: countryOfOrigin, fresh_frozen: freshFrozen, size_weight: sizeWeight, packaging: packagingFillet, availability, location, supplier_info_extra: supplierInfoExtra, custom_image: customImage, is_published: true, updated_at: new Date().toISOString() })
      } else {
        const res = await fetch('/api/supplier/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId: selectedSupplier.id, companyName: selectedSupplier.name, category: 'product_availability', title: `${productName.trim()} — ${priceLabel}`, content: JSON.stringify(details), details, is_published: true }),
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to publish product')
        onSaved(json.post || { id: `post-${Date.now()}`, company_id: selectedSupplier.id, company_name: selectedSupplier.name, company_logo: selectedSupplier.logoUrl, company_country: selectedSupplier.country, product_name: productName.trim(), price_per_kg: priceNum, max_price_per_kg: 0, currency, country_of_origin: countryOfOrigin, fresh_frozen: freshFrozen, size_weight: sizeWeight, packaging: packagingFillet, availability, location, supplier_info_extra: supplierInfoExtra, custom_image: customImage, is_published: true, created_at: new Date().toISOString() })
      }
      onClose()
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 bg-[#022B96] text-white">
          <div>
            <h2 className="text-base font-black">{initialPost ? 'Edit Product' : 'Add Seafood Product'}</h2>
            <p className="text-xs text-blue-200 mt-0.5">Manual entry from supplier data sheet</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[76vh]">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <X className="w-3.5 h-3.5 shrink-0" />{errorMsg}
            </div>
          )}

          <div>
            <label className={lbl}>Product Photo</label>
            <label className="cursor-pointer block">
              <div className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition overflow-hidden ${customImage ? 'border-slate-200 bg-slate-50' : 'border-blue-200 bg-blue-50/40 hover:bg-blue-50'}`}>
                {customImage ? (
                  <img src={customImage} alt="preview" className="w-full h-full object-contain" />
                ) : (
                  <>
                    <ImagePlus className="w-7 h-7 text-blue-400" />
                    <span className="text-xs font-bold text-blue-500">Click to upload product photo</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {customImage && (
              <button type="button" onClick={() => setCustomImage(null)} className="mt-1 text-[10px] text-rose-500 hover:text-rose-700 font-bold cursor-pointer">
                Remove photo
              </button>
            )}
          </div>

          <div>
            <label className={lbl}>Supplier *</label>
            <select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} className={sel}>
              <option value="">— Select Supplier —</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}{s.country ? ` (${s.country})` : ''}</option>)}
            </select>
          </div>

          <div>
            <label className={lbl}>Product Name *</label>
            <input type="text" required value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Atlantic Salmon" className={inp} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Price per KG *</label>
              <input type="number" step="0.01" required value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} placeholder="14.50" className={inp + ' font-bold'} />
            </div>
            <div>
              <label className={lbl}>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={sel}>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Form / Processing</label>
              <div className="grid grid-cols-4 gap-1">
                {(['Fresh', 'Frozen', 'Smoked', 'Live'] as const).map((type) => (
                  <button key={type} type="button" onClick={() => setFreshFrozen(type)}
                    className={`py-2 text-[10px] font-bold rounded-lg border text-center transition cursor-pointer ${freshFrozen === type ? 'bg-[#022B96] text-white border-[#022B96]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={lbl}>Country of Origin</label>
              <select value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} className={sel}>
                {ORIGIN_COUNTRIES.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Size / Weight</label>
              <input type="text" value={sizeWeight} onChange={(e) => setSizeWeight(e.target.value)} placeholder="e.g. 1–3 kg" className={inp} />
            </div>
            <div>
              <label className={lbl}>Packaging / Cut</label>
              <input type="text" value={packagingFillet} onChange={(e) => setPackagingFillet(e.target.value)} placeholder="e.g. Fillet (Skin On)" className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Availability</label>
              <select value={availability} onChange={(e) => setAvailability(e.target.value)} className={sel}>
                <option value="In Stock — Ready to Ship">In Stock — Ready to Ship</option>
                <option value="Weekly Catch Available">Weekly Catch Available</option>
                <option value="Available Next Week">Available Next Week</option>
                <option value="Pre-order Required">Pre-order Required</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Port / City</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Rotterdam" className={inp} />
            </div>
          </div>

          <div>
            <label className={lbl}>Notes</label>
            <textarea rows={2} value={supplierInfoExtra} onChange={(e) => setSupplierInfoExtra(e.target.value)}
              placeholder="e.g. Wild-caught North Sea, MSC certified. Min order: 500 kg."
              className={inp + ' resize-none'} />
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-t border-slate-200">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer">
            Cancel
          </button>
          <button type="button" disabled={saving} onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-extrabold rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {saving ? 'Publishing...' : initialPost ? 'Update Product' : 'Publish Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

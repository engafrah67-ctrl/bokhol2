'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Loader2,
  Fish,
  Building2,
  ImagePlus,
  Trash2,
  ChevronDown,
  Search,
  Check,
  AlertCircle,
  Snowflake,
  Droplets,
  Flame,
  Waves,
} from 'lucide-react'
import { getFishImageForProduct } from '@/lib/data/products-data'
import { resizeImage, uploadImage, validateImageFile } from '@/lib/media'

const ORIGIN_COUNTRIES = [
  { name: 'Norway', code: 'no' },
  { name: 'Netherlands', code: 'nl' },
  { name: 'Germany', code: 'de' },
  { name: 'Belgium', code: 'be' },
  { name: 'Iceland', code: 'is' },
  { name: 'Spain', code: 'es' },
  { name: 'France', code: 'fr' },
  { name: 'Denmark', code: 'dk' },
  { name: 'United Kingdom', code: 'gb' },
  { name: 'Ireland', code: 'ie' },
  { name: 'Faroe Islands', code: 'fo' },
  { name: 'Portugal', code: 'pt' },
  { name: 'Italy', code: 'it' },
  { name: 'Greece', code: 'gr' },
  { name: 'Turkey', code: 'tr' },
  { name: 'Chile', code: 'cl' },
  { name: 'Peru', code: 'pe' },
  { name: 'Ecuador', code: 'ec' },
  { name: 'Canada', code: 'ca' },
  { name: 'United States', code: 'us' },
  { name: 'Japan', code: 'jp' },
  { name: 'Vietnam', code: 'vn' },
  { name: 'Indonesia', code: 'id' },
  { name: 'India', code: 'in' },
  { name: 'Thailand', code: 'th' },
  { name: 'China', code: 'cn' },
  { name: 'Morocco', code: 'ma' },
  { name: 'Mauritania', code: 'mr' },
  { name: 'Senegal', code: 'sn' },
  { name: 'South Africa', code: 'za' },
  { name: 'New Zealand', code: 'nz' },
  { name: 'Australia', code: 'au' },
]

const FORMS = [
  { value: 'Fresh', icon: Droplets },
  { value: 'Frozen', icon: Snowflake },
  { value: 'Smoked', icon: Flame },
  { value: 'Live', icon: Waves },
] as const

type FormType = (typeof FORMS)[number]['value']

const PACKAGING_SUGGESTIONS = ['Fillet (Skin On)', 'Fillet (Skinless)', 'Whole Round', 'Gutted', 'IQF Frozen', 'Loins']

const AVAILABILITY_OPTIONS = [
  { value: 'In Stock — Ready to Ship', label: 'In stock — ready to ship' },
  { value: 'Available within 7 days', label: 'Within 7 days' },
  { value: 'Available within 2 weeks', label: 'Within 2 weeks' },
  { value: 'Pre-order Required', label: 'Pre-order' },
]

const flagUrl = (code: string) => `https://flagcdn.com/w40/${code}.png`

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

const label = 'block text-xs font-semibold text-slate-600 mb-1.5'
const input =
  'w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-4 focus:ring-[#022B96]/10 focus:border-[#022B96] transition'

function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const selected = ORIGIN_COUNTRIES.find((c) => c.name === value)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const filtered = ORIGIN_COUNTRIES.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${input} flex items-center gap-2.5 text-left cursor-pointer`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <img src={flagUrl(selected.code)} alt="" className="h-3.5 w-5 rounded-[3px] object-cover ring-1 ring-black/5" />
        ) : null}
        <span className={`flex-1 truncate ${selected ? '' : 'text-slate-400'}`}>{selected?.name || 'Select country'}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country"
                className="w-full h-8 pl-8 pr-2 text-sm bg-slate-50 rounded-lg focus:outline-none"
              />
            </div>
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.name === value}
                  onClick={() => {
                    onChange(c.name)
                    setOpen(false)
                    setQuery('')
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <img src={flagUrl(c.code)} alt="" className="h-3.5 w-5 rounded-[3px] object-cover ring-1 ring-black/5" />
                  <span className="flex-1 text-left">{c.name}</span>
                  {c.name === value && <Check className="h-4 w-4 text-[#022B96]" />}
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-3 py-3 text-sm text-slate-400">No country found</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

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
  const [freshFrozen, setFreshFrozen] = useState<FormType>('Fresh')
  const [countryOfOrigin, setCountryOfOrigin] = useState('Norway')
  const [sizeWeight, setSizeWeight] = useState('')
  const [packagingFillet, setPackagingFillet] = useState('')
  const [availability, setAvailability] = useState(AVAILABILITY_OPTIONS[0].value)
  const [location, setLocation] = useState('')
  const [supplierInfoExtra, setSupplierInfoExtra] = useState('')
  // `photo` is what we display: an existing URL, or a local preview of a not-yet-uploaded file
  const [photo, setPhoto] = useState<string>('')
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = Boolean(initialPost?.id)

  useEffect(() => {
    if (!isOpen) return
    setErrorMsg(null)

    if (initialPost) {
      setSelectedSupplierId(initialPost.company_id || defaultSupplierId || suppliers[0]?.id || '')
      setProductName(initialPost.product_name || '')
      setPricePerKg(initialPost.price_per_kg ? String(initialPost.price_per_kg) : '')
      setFreshFrozen(FORMS.some((f) => f.value === initialPost.fresh_frozen) ? initialPost.fresh_frozen : 'Fresh')
      setCountryOfOrigin(initialPost.country_of_origin || 'Norway')
      setSizeWeight(initialPost.size_weight || '')
      setPackagingFillet(initialPost.packaging || '')
      setAvailability(initialPost.availability || AVAILABILITY_OPTIONS[0].value)
      setLocation(initialPost.location || '')
      setSupplierInfoExtra(initialPost.supplier_info_extra || '')
      setPhoto(initialPost.custom_image || '')
      setPhotoBlob(null)
    } else {
      setSelectedSupplierId(defaultSupplierId || suppliers[0]?.id || '')
      setProductName('')
      setPricePerKg('')
      setFreshFrozen('Fresh')
      setCountryOfOrigin('Norway')
      setSizeWeight('')
      setPackagingFillet('')
      setAvailability(AVAILABILITY_OPTIONS[0].value)
      setLocation('')
      setSupplierInfoExtra('')
      setPhoto('')
      setPhotoBlob(null)
    }
  }, [isOpen, initialPost, defaultSupplierId, suppliers])

  if (!isOpen) return null

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setErrorMsg(null)
    setPhotoBusy(true)
    try {
      validateImageFile(file)
      const blob = await resizeImage(file)
      setPhotoBlob(blob)
      setPhoto(URL.createObjectURL(blob))
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not read this image.')
    } finally {
      setPhotoBusy(false)
    }
  }

  const priceNum = parseFloat(pricePerKg)
  const priceValid = Number.isFinite(priceNum) && priceNum > 0
  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId)

  const handleSave = async () => {
    setErrorMsg(null)
    if (!selectedSupplier) {
      setErrorMsg('Please select a supplier.')
      return
    }
    if (!productName.trim()) {
      setErrorMsg('Please enter the seafood name.')
      return
    }
    if (!priceValid) {
      setErrorMsg('Please enter a valid price per kg (e.g. 14.50).')
      return
    }

    setSaving(true)
    const name = productName.trim()
    const currency = 'EUR'
    const priceLabel = `${currency} ${priceNum.toFixed(2)}/kg`
    let photoToSave = photo || getFishImageForProduct(name)
    if (photoBlob) {
      try {
        photoToSave = await uploadImage(photoBlob, 'products')
      } catch (err: any) {
        setErrorMsg(err?.message || 'Photo upload failed.')
        setSaving(false)
        return
      }
    }

    const details = {
      productName: name,
      pricePerKg: priceNum,
      minPricePerKg: priceNum,
      maxPricePerKg: 0,
      currency,
      countryOfOrigin,
      freshFrozen,
      sizeWeight: sizeWeight.trim(),
      packagingFillet: packagingFillet.trim(),
      availability,
      location: location.trim(),
      supplierInfoExtra: supplierInfoExtra.trim(),
      customImage: photoToSave,
      companyId: selectedSupplier.id,
      companyName: selectedSupplier.name,
      companyLogo: selectedSupplier.logoUrl || null,
      companyCountry: selectedSupplier.country || '',
      lastAdminUpdate: new Date().toISOString(),
      createdAt: initialPost?.created_at || new Date().toISOString(),
    }

    const savedView = {
      company_id: selectedSupplier.id,
      company_name: selectedSupplier.name,
      company_logo: selectedSupplier.logoUrl,
      company_country: selectedSupplier.country,
      product_name: name,
      price_per_kg: priceNum,
      max_price_per_kg: 0,
      currency,
      country_of_origin: countryOfOrigin,
      fresh_frozen: freshFrozen,
      size_weight: details.sizeWeight,
      packaging: details.packagingFillet,
      availability,
      location: details.location,
      supplier_info_extra: details.supplierInfoExtra,
      custom_image: photoToSave,
      is_published: true,
    }

    try {
      if (isEditing) {
        const res = await fetch('/api/supplier/posts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: initialPost.id,
            title: `${name} — ${priceLabel}`,
            content: JSON.stringify(details),
            is_published: true,
          }),
        })
        const json = await res.json()
        if (!res.ok || json.error) throw new Error(json.error || 'Failed to update product')
        onSaved({ ...initialPost, ...savedView, updated_at: new Date().toISOString() })
      } else {
        const res = await fetch('/api/supplier/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: selectedSupplier.id,
            category: 'product_availability',
            title: `${name} — ${priceLabel}`,
            content: JSON.stringify(details),
            is_published: true,
          }),
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to publish product')
        onSaved({ ...savedView, ...json.post })
      }
      onClose()
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-[#022B96]/8 text-[#022B96] flex items-center justify-center">
              <Fish className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {isEditing ? 'Edit product' : 'Add seafood product'}
              </h2>
              <p className="text-sm text-slate-500">Publish a supplier offer to the marketplace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
            {/* Photo */}
            <div className="space-y-3">
              <span className={label}>Product photo</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              {photo ? (
                <div className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={photo} alt={productName || 'Product photo'} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-2.5 flex gap-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 h-8 rounded-lg bg-white/95 text-xs font-semibold text-slate-800 hover:bg-white cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto('')
                        setPhotoBlob(null)
                      }}
                      className="h-8 w-8 rounded-lg bg-white/95 text-red-600 flex items-center justify-center hover:bg-white cursor-pointer"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    handleFile(e.dataTransfer.files?.[0])
                  }}
                  className={`w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 text-center px-6 transition cursor-pointer ${
                    dragOver
                      ? 'border-[#022B96] bg-[#022B96]/5'
                      : 'border-slate-200 bg-slate-50/60 hover:border-[#022B96]/50 hover:bg-[#022B96]/[0.03]'
                  }`}
                >
                  {photoBusy ? (
                    <Loader2 className="h-7 w-7 text-[#022B96] animate-spin" />
                  ) : (
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      <ImagePlus className="h-5 w-5 text-[#022B96]" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Upload a photo</p>
                    <p className="text-xs text-slate-500 mt-0.5">Drag & drop or click · JPG, PNG, WebP</p>
                  </div>
                </button>
              )}
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Photos are resized automatically. Without a photo, a standard image is used.
              </p>
            </div>

            {/* Fields */}
            <div className="space-y-6">
              {/* Product */}
              <section className="space-y-4">
                <div>
                  <label htmlFor="pp-name" className={label}>Seafood name *</label>
                  <input
                    id="pp-name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Atlantic Salmon"
                    className={input}
                    maxLength={80}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pp-price" className={label}>Price per kg *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">€</span>
                      <input
                        id="pp-price"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={pricePerKg}
                        onChange={(e) => setPricePerKg(e.target.value)}
                        placeholder="14.50"
                        className={`${input} pl-8 pr-14`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">EUR/kg</span>
                    </div>
                  </div>
                  <div>
                    <span className={label}>Country of origin</span>
                    <CountrySelect value={countryOfOrigin} onChange={setCountryOfOrigin} />
                  </div>
                </div>

                <div>
                  <span className={label}>Form</span>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    {FORMS.map(({ value, icon: Icon }) => {
                      const active = freshFrozen === value
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFreshFrozen(value)}
                          aria-pressed={active}
                          className={`h-9 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            active ? 'bg-white text-[#022B96] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              {/* Details */}
              <section className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pp-size" className={label}>Size / weight</label>
                    <input
                      id="pp-size"
                      value={sizeWeight}
                      onChange={(e) => setSizeWeight(e.target.value)}
                      placeholder="e.g. 1–3 kg"
                      className={input}
                    />
                  </div>
                  <div>
                    <label htmlFor="pp-pack" className={label}>Packaging / cut</label>
                    <input
                      id="pp-pack"
                      value={packagingFillet}
                      onChange={(e) => setPackagingFillet(e.target.value)}
                      placeholder="e.g. Fillet (Skin On)"
                      className={input}
                      list="pp-pack-options"
                    />
                    <datalist id="pp-pack-options">
                      {PACKAGING_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label htmlFor="pp-notes" className={label}>Notes for buyers</label>
                  <textarea
                    id="pp-notes"
                    value={supplierInfoExtra}
                    onChange={(e) => setSupplierInfoExtra(e.target.value)}
                    placeholder="e.g. Wild-caught North Sea, MSC certified. Minimum order 500 kg."
                    rows={3}
                    className={`${input} h-auto py-2.5 resize-none`}
                  />
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              {/* Supplier */}
              <section className="space-y-4">
                <div>
                  <label htmlFor="pp-supplier" className={label}>Supplier *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <select
                      id="pp-supplier"
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className={`${input} pl-10 pr-9 appearance-none cursor-pointer`}
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}{s.country ? ` · ${s.country}` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pp-avail" className={label}>Availability</label>
                    <div className="relative">
                      <select
                        id="pp-avail"
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className={`${input} pr-9 appearance-none cursor-pointer`}
                      >
                        {AVAILABILITY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="pp-loc" className={label}>Location (port / city)</label>
                    <input
                      id="pp-loc"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Rotterdam"
                      className={input}
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/70 px-6 sm:px-8 py-4">
          {errorMsg && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <p className="hidden sm:block text-sm text-slate-500 truncate">
              {productName.trim() ? (
                <>
                  <span className="font-semibold text-slate-800">{productName.trim()}</span>
                  {priceValid && <> · €{priceNum.toFixed(2)}/kg</>} · {freshFrozen}
                  {selectedSupplier && <> · {selectedSupplier.name}</>}
                </>
              ) : (
                'Fill in the name and price to publish'
              )}
            </p>
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || photoBusy}
                className="h-10 px-5 rounded-xl bg-[#022B96] hover:bg-[#011a5e] disabled:opacity-60 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {isEditing ? 'Save changes' : 'Publish product'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

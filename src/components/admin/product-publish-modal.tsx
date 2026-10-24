'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  Loader2,
  Search,
  Layers,
  Fish,
  Building2,
  DollarSign,
  Upload,
  Check,
  Sparkles,
} from 'lucide-react'
import { getFishImageForProduct } from '@/lib/data/products-data'

export const READY_SEAFOOD_PRESETS = [
  // Salmon
  { name: 'Atlantic Salmon', image: '/fish-salmon.png', category: 'Salmon', defaultOrigin: 'Norway' },
  { name: 'Fresh Salmon Fillet', image: '/fish-salmonfillet.jpg', category: 'Salmon', defaultOrigin: 'Norway' },
  { name: 'Salmon Portions', image: '/fish-salmonfillet.jpg', category: 'Salmon', defaultOrigin: 'Norway' },
  { name: 'Pacific Salmon', image: '/fish-salmon.png', category: 'Salmon', defaultOrigin: 'United States' },

  // Tuna
  { name: 'Yellowfin Tuna', image: '/fish-tuna.png', category: 'Tuna', defaultOrigin: 'Spain' },
  { name: 'Bluefin Tuna', image: '/fish-tuna.png', category: 'Tuna', defaultOrigin: 'Spain' },
  { name: 'Bigeye Tuna', image: '/fish-tuna.png', category: 'Tuna', defaultOrigin: 'Maldives' },
  { name: 'Albacore Tuna', image: '/fish-tuna.png', category: 'Tuna', defaultOrigin: 'Spain' },
  { name: 'Tuna Loin', image: '/fish-tuna.png', category: 'Tuna', defaultOrigin: 'Spain' },
  { name: 'Skipjack Tuna', image: '/fish-tuna.png', category: 'Tuna', defaultOrigin: 'Indonesia' },

  // Sea Bass & Sea Bream
  { name: 'European Sea Bass', image: '/fish-seabass.png', category: 'Sea Bass & Bream', defaultOrigin: 'Greece' },
  { name: 'Sea Bass', image: '/fish-seabass.png', category: 'Sea Bass & Bream', defaultOrigin: 'Greece' },
  { name: 'Gilthead Sea Bream', image: '/fish-seabream.jpg', category: 'Sea Bass & Bream', defaultOrigin: 'Greece' },
  { name: 'Sea Bream (Dorade)', image: '/fish-seabream.jpg', category: 'Sea Bass & Bream', defaultOrigin: 'Turkey' },

  // Cod Family
  { name: 'Atlantic Cod', image: '/fish-cod.png', category: 'Cod Family', defaultOrigin: 'Iceland' },
  { name: 'Cod Fillet', image: '/fish-cod.png', category: 'Cod Family', defaultOrigin: 'Norway' },
  { name: 'Pacific Cod', image: '/fish-cod.png', category: 'Cod Family', defaultOrigin: 'United States' },
  { name: 'Haddock', image: '/fish-haddock.jpg', category: 'Cod Family', defaultOrigin: 'United Kingdom' },
  { name: 'Alaska Pollock', image: '/fish-cod.png', category: 'Cod Family', defaultOrigin: 'United States' },
  { name: 'Hake', image: '/fish-cod.png', category: 'Cod Family', defaultOrigin: 'Spain' },

  // Pelagic
  { name: 'Atlantic Mackerel', image: '/fish-mackerel.png', category: 'Pelagic & Small', defaultOrigin: 'Netherlands' },
  { name: 'Herring', image: '/fish-mackerel.png', category: 'Pelagic & Small', defaultOrigin: 'Netherlands' },
  { name: 'Sardine', image: '/fish-mackerel.png', category: 'Pelagic & Small', defaultOrigin: 'Morocco' },
  { name: 'Anchovy', image: '/fish-mackerel.png', category: 'Pelagic & Small', defaultOrigin: 'Spain' },

  // Flatfish
  { name: 'Turbot', image: '/fish-turbot.jpg', category: 'Flatfish', defaultOrigin: 'Netherlands' },
  { name: 'Halibut', image: '/fish-turbot.jpg', category: 'Flatfish', defaultOrigin: 'Norway' },
  { name: 'Plaice', image: '/fish-turbot.jpg', category: 'Flatfish', defaultOrigin: 'Netherlands' },
  { name: 'Sole', image: '/fish-turbot.jpg', category: 'Flatfish', defaultOrigin: 'France' },
  { name: 'Brill', image: '/fish-turbot.jpg', category: 'Flatfish', defaultOrigin: 'Netherlands' },

  // Shellfish & Cephalopods
  { name: 'Squid (Calamari)', image: '/fish-squid.jpg', category: 'Crustaceans & Shellfish', defaultOrigin: 'Spain' },
  { name: 'Whole Octopus', image: '/fish-octopus.jpg', category: 'Crustaceans & Shellfish', defaultOrigin: 'Morocco' },
  { name: 'King Crab', image: '/fish-crab.jpg', category: 'Crustaceans & Shellfish', defaultOrigin: 'Norway' },
  { name: 'Crab', image: '/fish-crab.jpg', category: 'Crustaceans & Shellfish', defaultOrigin: 'United Kingdom' },
  { name: 'Shrimp / Prawn', image: '/shrimp.png', category: 'Crustaceans & Shellfish', defaultOrigin: 'Ecuador' },
  { name: 'Lobster', image: '/fish-lobster.jpg', category: 'Crustaceans & Shellfish', defaultOrigin: 'Canada' },
  { name: 'Mussels', image: '/shrimp.png', category: 'Crustaceans & Shellfish', defaultOrigin: 'Spain' },

  // Other Finfish
  { name: 'Red Snapper', image: '/fish-redsnapper.jpg', category: 'Other Finfish', defaultOrigin: 'Spain' },
  { name: 'Rainbow Trout', image: '/fish-trout.jpg', category: 'Other Finfish', defaultOrigin: 'Denmark' },
  { name: 'Trout', image: '/fish-trout.jpg', category: 'Other Finfish', defaultOrigin: 'France' },
  { name: 'Swordfish', image: '/fish-tuna.png', category: 'Other Finfish', defaultOrigin: 'Spain' },
]

export const READY_SEAFOOD_PHOTOS = [
  { label: 'Salmon', image: '/fish-salmon.png' },
  { label: 'Salmon Fillet', image: '/fish-salmonfillet.jpg' },
  { label: 'Tuna', image: '/fish-tuna.png' },
  { label: 'Cod', image: '/fish-cod.png' },
  { label: 'Sea Bass', image: '/fish-seabass.png' },
  { label: 'Sea Bream', image: '/fish-seabream.jpg' },
  { label: 'Red Snapper', image: '/fish-redsnapper.jpg' },
  { label: 'Turbot', image: '/fish-turbot.jpg' },
  { label: 'Mackerel', image: '/fish-mackerel.png' },
  { label: 'Squid', image: '/fish-squid.jpg' },
  { label: 'Octopus', image: '/fish-octopus.jpg' },
  { label: 'Shrimp', image: '/shrimp.png' },
  { label: 'King Crab', image: '/fish-crab.jpg' },
  { label: 'Lobster', image: '/fish-lobster.jpg' },
  { label: 'Trout', image: '/fish-trout.jpg' },
  { label: 'Haddock', image: '/fish-haddock.jpg' },
]

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

const lbl = 'block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1'
const inp = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#022B96] focus:bg-white transition'
const sel = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#022B96] focus:bg-white transition cursor-pointer'

export function ProductPublishModal({
  isOpen,
  onClose,
  onSaved,
  initialPost,
  defaultSupplierId,
  suppliers,
}: ProductPublishModalProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('')
  const [productName, setProductName] = useState('Atlantic Salmon')
  const [pricePerKg, setPricePerKg] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [freshFrozen, setFreshFrozen] = useState<'Fresh' | 'Frozen' | 'Smoked' | 'Live'>('Frozen')
  const [countryOfOrigin, setCountryOfOrigin] = useState('Norway')
  const [sizeWeight, setSizeWeight] = useState('1–3 kg')
  const [packagingFillet, setPackagingFillet] = useState('Fillet (Skin On)')
  const [availability, setAvailability] = useState('In Stock — Ready to Ship')
  const [location, setLocation] = useState('')
  const [supplierInfoExtra, setSupplierInfoExtra] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<string>('/fish-salmon.png')
  const [isCustomUpload, setIsCustomUpload] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Drawer / Visual Catalog Modal state
  const [isCatalogDrawerOpen, setIsCatalogDrawerOpen] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setErrorMsg(null)
    setIsCatalogDrawerOpen(false)

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

      const existingImg = initialPost.custom_image || getFishImageForProduct(initialPost.product_name || '')
      setSelectedPhoto(existingImg)
      setIsCustomUpload(Boolean(initialPost.custom_image && !initialPost.custom_image.startsWith('/fish-') && initialPost.custom_image !== '/shrimp.png'))
    } else {
      setSelectedSupplierId(defaultSupplierId || suppliers[0]?.id || '')
      setProductName('Atlantic Salmon')
      setPricePerKg('')
      setCurrency('EUR')
      setFreshFrozen('Frozen')
      setCountryOfOrigin('Norway')
      setSizeWeight('1–3 kg')
      setPackagingFillet('Fillet (Skin On)')
      setAvailability('In Stock — Ready to Ship')
      setLocation('')
      setSupplierInfoExtra('')
      setSelectedPhoto('/fish-salmon.png')
      setIsCustomUpload(false)
    }
  }, [isOpen, initialPost, defaultSupplierId, suppliers])

  if (!isOpen) return null

  // Handler when user selects a preset product
  const handleSelectPresetProduct = (preset: (typeof READY_SEAFOOD_PRESETS)[0]) => {
    setProductName(preset.name)
    setSelectedPhoto(preset.image)
    setIsCustomUpload(false)
    if (preset.defaultOrigin) {
      setCountryOfOrigin(preset.defaultOrigin)
    }
    setIsCatalogDrawerOpen(false)
  }

  // Handler for custom file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setSelectedPhoto(ev.target.result as string)
        setIsCustomUpload(true)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setErrorMsg(null)
    const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId)
    if (!selectedSupplierId || !selectedSupplier) {
      setErrorMsg('Please select a supplier.')
      return
    }
    if (!productName.trim()) {
      setErrorMsg('Please enter or select a seafood product name.')
      return
    }
    const priceNum = parseFloat(pricePerKg)
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Please enter a valid price per kg (e.g. 14.50).')
      return
    }

    setSaving(true)
    const priceLabel = `${currency} ${priceNum.toFixed(2)}/kg`
    const photoToSave = selectedPhoto || getFishImageForProduct(productName.trim())

    const details = {
      productName: productName.trim(),
      pricePerKg: priceNum,
      minPricePerKg: priceNum,
      maxPricePerKg: 0,
      currency,
      countryOfOrigin,
      freshFrozen,
      sizeWeight,
      packagingFillet,
      availability,
      location,
      supplierInfoExtra,
      customImage: photoToSave,
      companyId: selectedSupplier.id,
      companyName: selectedSupplier.name,
      companyLogo: selectedSupplier.logoUrl || null,
      companyCountry: selectedSupplier.country || '',
      lastAdminUpdate: new Date().toISOString(),
      createdAt: initialPost?.created_at || new Date().toISOString(),
    }

    try {
      if (initialPost?.id) {
        const res = await fetch('/api/supplier/posts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: initialPost.id,
            title: `${productName.trim()} — ${priceLabel}`,
            content: JSON.stringify(details),
            is_published: true,
            updated_at: new Date().toISOString(),
          }),
        })
        const json = await res.json()
        if (!res.ok || json.error) throw new Error(json.error || 'Failed to update product')
        onSaved({
          ...initialPost,
          company_id: selectedSupplier.id,
          company_name: selectedSupplier.name,
          company_logo: selectedSupplier.logoUrl,
          company_country: selectedSupplier.country,
          product_name: productName.trim(),
          price_per_kg: priceNum,
          max_price_per_kg: 0,
          currency,
          country_of_origin: countryOfOrigin,
          fresh_frozen: freshFrozen,
          size_weight: sizeWeight,
          packaging: packagingFillet,
          availability,
          location,
          supplier_info_extra: supplierInfoExtra,
          custom_image: photoToSave,
          is_published: true,
          updated_at: new Date().toISOString(),
        })
      } else {
        const res = await fetch('/api/supplier/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: selectedSupplier.id,
            companyName: selectedSupplier.name,
            category: 'product_availability',
            title: `${productName.trim()} — ${priceLabel}`,
            content: JSON.stringify(details),
            details,
            is_published: true,
          }),
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to publish product')
        onSaved(
          json.post || {
            id: `post-${Date.now()}`,
            company_id: selectedSupplier.id,
            company_name: selectedSupplier.name,
            company_logo: selectedSupplier.logoUrl,
            company_country: selectedSupplier.country,
            product_name: productName.trim(),
            price_per_kg: priceNum,
            max_price_per_kg: 0,
            currency,
            country_of_origin: countryOfOrigin,
            fresh_frozen: freshFrozen,
            size_weight: sizeWeight,
            packaging: packagingFillet,
            availability,
            location,
            supplier_info_extra: supplierInfoExtra,
            custom_image: photoToSave,
            is_published: true,
            created_at: new Date().toISOString(),
          }
        )
      }
      onClose()
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Filtered presets for visual drawer
  const filteredCatalog = READY_SEAFOOD_PRESETS.filter((p) => {
    if (!catalogSearch.trim()) return true
    const q = catalogSearch.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  })

  // Group catalog presets by category
  const categories = Array.from(new Set(READY_SEAFOOD_PRESETS.map((p) => p.category)))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* ── Wide Clean Modal Card ── */}
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-3.5 bg-[#022B96] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Fish className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight leading-tight">
                {initialPost ? 'Edit Seafood Product' : 'Add Seafood Product'}
              </h2>
              <p className="text-[11px] text-blue-200 font-medium">
                Fast entry with ready seafood catalog species &amp; photos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <X className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* ══ LEFT COLUMN: Ready Photos & Supplier Info (5 cols) ══ */}
            <div className="lg:col-span-5 space-y-3.5">
              {/* Ready Product Photo Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className={lbl}>Product Photo</label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Ready to Use
                  </span>
                </div>

                {/* Big Active Photo Preview */}
                <div className="w-full h-36 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center overflow-hidden shadow-2xs relative group">
                  <img
                    src={selectedPhoto || getFishImageForProduct(productName)}
                    alt={productName}
                    className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105 duration-200"
                  />
                  {isCustomUpload && (
                    <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                      Custom Upload
                    </span>
                  )}
                </div>

                {/* Ready Seafood Quick Photo Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      Choose Ready Photo ({READY_SEAFOOD_PHOTOS.length}):
                    </span>
                    {isCustomUpload && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPhoto(getFishImageForProduct(productName))
                          setIsCustomUpload(false)
                        }}
                        className="text-[10px] font-bold text-[#022B96] hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {READY_SEAFOOD_PHOTOS.map((item) => {
                      const isCurrent = selectedPhoto === item.image
                      return (
                        <button
                          key={item.label}
                          type="button"
                          title={item.label}
                          onClick={() => {
                            setSelectedPhoto(item.image)
                            setIsCustomUpload(false)
                          }}
                          className={`h-9 rounded-lg p-0.5 bg-white border flex items-center justify-center transition-all cursor-pointer overflow-hidden ${
                            isCurrent
                              ? 'border-[#022B96] ring-2 ring-[#022B96]/30 bg-blue-50/50'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <img src={item.image} alt={item.label} className="h-full w-full object-contain" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Upload Custom Photo Option */}
                <div className="pt-1 border-t border-slate-200/80">
                  <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition">
                    <Upload className="w-3 h-3 text-slate-500" />
                    <span>Upload Custom Photo</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Supplier Selection */}
              <div>
                <label className={lbl}>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#022B96]" /> Supplier Company *
                  </span>
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className={sel}
                >
                  <option value="">— Select Supplier Profile —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.country ? `(${s.country})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability & Location row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={lbl}>Availability</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className={sel}
                  >
                    <option value="In Stock — Ready to Ship">In Stock — Ready to Ship</option>
                    <option value="Available within 7 days">Within 7 days</option>
                    <option value="Available within 2 weeks">Within 2 weeks</option>
                    <option value="Pre-order Required">Pre-order</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Location (Port / City)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Rotterdam, Bergen"
                    className={inp}
                  />
                </div>
              </div>
            </div>

            {/* ══ RIGHT COLUMN: Product Species & Specifications (7 cols) ══ */}
            <div className="lg:col-span-7 space-y-3.5">
              {/* Product Name with Ready Dropdown & Drawer Button */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className={lbl}>Seafood Species &amp; Name *</label>
                  <button
                    type="button"
                    onClick={() => setIsCatalogDrawerOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#022B96] hover:text-[#011a5e] bg-blue-100/70 hover:bg-blue-100 px-2 py-0.5 rounded-lg transition cursor-pointer"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Visual Catalog Drawer</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Ready Species Quick Dropdown */}
                  <select
                    value={productName}
                    onChange={(e) => {
                      const val = e.target.value
                      setProductName(val)
                      const match = READY_SEAFOOD_PRESETS.find((p) => p.name === val)
                      if (match) {
                        setSelectedPhoto(match.image)
                        setIsCustomUpload(false)
                        if (match.defaultOrigin) setCountryOfOrigin(match.defaultOrigin)
                      }
                    }}
                    className={sel + ' font-bold'}
                  >
                    <option value="">— Choose Species —</option>
                    {categories.map((cat) => (
                      <optgroup key={cat} label={`── ${cat} ──`}>
                        {READY_SEAFOOD_PRESETS.filter((p) => p.category === cat).map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  {/* Title / Description */}
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Custom Title / Grade"
                    className={inp}
                  />
                </div>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Price per KG *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                      {currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value)}
                      placeholder="14.50"
                      className={inp + ' pl-7 text-sm font-black text-[#022B96]'}
                    />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={sel}
                  >
                    <option value="EUR">EUR (€) — Euro</option>
                    <option value="USD">USD ($) — US Dollar</option>
                    <option value="GBP">GBP (£) — British Pound</option>
                  </select>
                </div>
              </div>

              {/* Form & Processing */}
              <div>
                <label className={lbl}>Form / Processing</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Fresh', 'Frozen', 'Smoked', 'Live'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFreshFrozen(type)}
                      className={`py-1.5 text-xs font-bold rounded-xl border text-center transition cursor-pointer ${
                        freshFrozen === type
                          ? 'bg-[#022B96] text-white border-[#022B96] shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Origin Country & Size/Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Country of Origin</label>
                  <select
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    className={sel}
                  >
                    {ORIGIN_COUNTRIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={lbl}>Size / Weight Grading</label>
                  <input
                    type="text"
                    value={sizeWeight}
                    onChange={(e) => setSizeWeight(e.target.value)}
                    placeholder="e.g. 1–3 kg, 3–5 kg, 500–800g"
                    className={inp}
                  />
                </div>
              </div>

              {/* Packaging / Cut with quick pills */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={lbl}>Packaging / Cut</label>
                  <div className="flex flex-wrap gap-1">
                    {['Fillet (Skin On)', 'Whole Round', 'IQF Frozen'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPackagingFillet(opt)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition cursor-pointer ${
                          packagingFillet === opt
                            ? 'bg-[#022B96] text-white border-[#022B96]'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={packagingFillet}
                  onChange={(e) => setPackagingFillet(e.target.value)}
                  placeholder="e.g. Fillet (Skin On), Whole Round, IQF"
                  className={inp}
                />
              </div>

              {/* Notes */}
              <div>
                <label className={lbl}>Specifications / Supplier Notes</label>
                <textarea
                  rows={2}
                  value={supplierInfoExtra}
                  onChange={(e) => setSupplierInfoExtra(e.target.value)}
                  placeholder="e.g. Wild-caught North Sea, MSC certified. Min order: 500 kg."
                  className={inp + ' resize-none font-medium text-xs'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-3.5 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{saving ? 'Publishing...' : initialPost ? 'Update Product' : 'Publish Product'}</span>
          </button>
        </div>
      </div>

      {/* ══ Visual Species Catalog Drawer / Overlay ══ */}
      {isCatalogDrawerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[82vh]">
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-base">Select Seafood Catalog Species</h3>
                <p className="text-xs text-slate-500">
                  Click any species to load its name and ready high-res photo
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search species (e.g. Salmon, Tuna, Cod, Crab, Squid, Octopus, Snapper)..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#022B96]"
                />
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {categories.map((cat) => {
                const items = filteredCatalog.filter((p) => p.category === cat)
                if (items.length === 0) return null
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                        {cat}
                      </span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {items.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleSelectPresetProduct(preset)}
                          className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center gap-2.5 text-left transition cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                            <img src={preset.image} alt={preset.name} className="h-full w-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-[#022B96] truncate">
                              {preset.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{preset.defaultOrigin}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

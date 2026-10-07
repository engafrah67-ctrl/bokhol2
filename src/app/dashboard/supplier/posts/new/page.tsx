'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getFishImageForProduct } from '@/lib/data/products-data'
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

// Full world country list — Origin Country = where the product was actually produced/manufactured
const COUNTRIES = [
  // Top seafood-producing nations (shown first for convenience)
  'Norway',
  'Vietnam',
  'China',
  'Chile',
  'India',
  'Indonesia',
  'Ecuador',
  'Peru',
  'Thailand',
  'Bangladesh',
  'Iceland',
  'Russia',
  'Canada',
  'United States',
  'Japan',
  'South Korea',
  'Morocco',
  'Mauritania',
  'Senegal',
  'Myanmar',
  'Philippines',
  'Malaysia',
  'Australia',
  'New Zealand',
  'Argentina',
  'Brazil',
  'Mexico',
  'Cuba',
  'Ghana',
  'South Africa',
  'Madagascar',
  'Tanzania',
  'Kenya',
  'Sri Lanka',
  'Maldives',
  'Faroe Islands',
  'Greenland',
  // European producing countries
  'Netherlands',
  'Germany',
  'Belgium',
  'Denmark',
  'Sweden',
  'Finland',
  'France',
  'Spain',
  'Portugal',
  'Italy',
  'Greece',
  'Poland',
  'United Kingdom',
  'Ireland',
  'Turkey',
  // Rest of world
  'Afghanistan',
  'Albania',
  'Algeria',
  'Angola',
  'Armenia',
  'Austria',
  'Azerbaijan',
  'Bahrain',
  'Belarus',
  'Belize',
  'Benin',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Bulgaria',
  'Burkina Faso',
  'Cambodia',
  'Cameroon',
  'Colombia',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cyprus',
  'Czech Republic',
  'Côte d\'Ivoire',
  'Dominican Republic',
  'Egypt',
  'El Salvador',
  'Ethiopia',
  'Fiji',
  'Georgia',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iran',
  'Iraq',
  'Israel',
  'Jamaica',
  'Jordan',
  'Kazakhstan',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Liberia',
  'Libya',
  'Lithuania',
  'Luxembourg',
  'Malawi',
  'Mali',
  'Malta',
  'Mozambique',
  'Namibia',
  'Nepal',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Korea',
  'Oman',
  'Pakistan',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Qatar',
  'Romania',
  'Saudi Arabia',
  'Serbia',
  'Sierra Leone',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'Sudan',
  'Suriname',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Togo',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkmenistan',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'Uruguay',
  'Uzbekistan',
  'Venezuela',
  'Yemen',
  'Zambia',
  'Zimbabwe',
  'Other',
]

// ISO-2 country code map for flag images (flagcdn.com)
const COUNTRY_ISO: Record<string, string> = {
  'Norway': 'no', 'Vietnam': 'vn', 'China': 'cn', 'Chile': 'cl', 'India': 'in',
  'Indonesia': 'id', 'Ecuador': 'ec', 'Peru': 'pe', 'Thailand': 'th', 'Bangladesh': 'bd',
  'Iceland': 'is', 'Russia': 'ru', 'Canada': 'ca', 'United States': 'us', 'Japan': 'jp',
  'South Korea': 'kr', 'Morocco': 'ma', 'Mauritania': 'mr', 'Senegal': 'sn', 'Myanmar': 'mm',
  'Philippines': 'ph', 'Malaysia': 'my', 'Australia': 'au', 'New Zealand': 'nz',
  'Argentina': 'ar', 'Brazil': 'br', 'Mexico': 'mx', 'Cuba': 'cu', 'Ghana': 'gh',
  'South Africa': 'za', 'Madagascar': 'mg', 'Tanzania': 'tz', 'Kenya': 'ke',
  'Sri Lanka': 'lk', 'Maldives': 'mv', 'Faroe Islands': 'fo', 'Greenland': 'gl',
  'Netherlands': 'nl', 'Germany': 'de', 'Belgium': 'be', 'Denmark': 'dk',
  'Sweden': 'se', 'Finland': 'fi', 'France': 'fr', 'Spain': 'es', 'Portugal': 'pt',
  'Italy': 'it', 'Greece': 'gr', 'Poland': 'pl', 'United Kingdom': 'gb', 'Ireland': 'ie',
  'Turkey': 'tr', 'Afghanistan': 'af', 'Albania': 'al', 'Algeria': 'dz', 'Angola': 'ao',
  'Armenia': 'am', 'Austria': 'at', 'Azerbaijan': 'az', 'Bahrain': 'bh', 'Belarus': 'by',
  'Belize': 'bz', 'Benin': 'bj', 'Bolivia': 'bo', 'Bosnia and Herzegovina': 'ba',
  'Botswana': 'bw', 'Bulgaria': 'bg', 'Burkina Faso': 'bf', 'Cambodia': 'kh',
  'Cameroon': 'cm', 'Colombia': 'co', 'Congo': 'cg', 'Costa Rica': 'cr', 'Croatia': 'hr',
  'Cyprus': 'cy', 'Czech Republic': 'cz', "Côte d'Ivoire": 'ci',
  'Dominican Republic': 'do', 'Egypt': 'eg', 'El Salvador': 'sv', 'Ethiopia': 'et',
  'Fiji': 'fj', 'Georgia': 'ge', 'Guatemala': 'gt', 'Guinea': 'gn',
  'Guinea-Bissau': 'gw', 'Guyana': 'gy', 'Haiti': 'ht', 'Honduras': 'hn',
  'Hungary': 'hu', 'Iran': 'ir', 'Iraq': 'iq', 'Israel': 'il', 'Jamaica': 'jm',
  'Jordan': 'jo', 'Kazakhstan': 'kz', 'Kuwait': 'kw', 'Kyrgyzstan': 'kg',
  'Laos': 'la', 'Latvia': 'lv', 'Lebanon': 'lb', 'Liberia': 'lr', 'Libya': 'ly',
  'Lithuania': 'lt', 'Luxembourg': 'lu', 'Malawi': 'mw', 'Mali': 'ml', 'Malta': 'mt',
  'Mozambique': 'mz', 'Namibia': 'na', 'Nepal': 'np', 'Nicaragua': 'ni',
  'Niger': 'ne', 'Nigeria': 'ng', 'North Korea': 'kp', 'Oman': 'om', 'Pakistan': 'pk',
  'Panama': 'pa', 'Papua New Guinea': 'pg', 'Paraguay': 'py', 'Qatar': 'qa',
  'Romania': 'ro', 'Saudi Arabia': 'sa', 'Serbia': 'rs', 'Sierra Leone': 'sl',
  'Slovakia': 'sk', 'Slovenia': 'si', 'Solomon Islands': 'sb', 'Somalia': 'so',
  'Sudan': 'sd', 'Suriname': 'sr', 'Syria': 'sy', 'Taiwan': 'tw', 'Tajikistan': 'tj',
  'Togo': 'tg', 'Trinidad and Tobago': 'tt', 'Tunisia': 'tn', 'Turkmenistan': 'tm',
  'Uganda': 'ug', 'Ukraine': 'ua', 'United Arab Emirates': 'ae', 'Uruguay': 'uy',
  'Uzbekistan': 'uz', 'Venezuela': 've', 'Yemen': 'ye', 'Zambia': 'zm', 'Zimbabwe': 'zw',
}

function getFlagUrl(country: string): string | null {
  const iso = COUNTRY_ISO[country]
  return iso ? `https://flagcdn.com/w40/${iso}.png` : null
}

// Custom searchable country picker with flags
function CountryOriginPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const ref = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filtered = search.trim()
    ? COUNTRIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES

  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleOutside)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const flagUrl = value ? getFlagUrl(value) : null

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full h-[38px] flex items-center gap-2.5 bg-white border ${
          open ? 'border-[#022B96]' : 'border-slate-200'
        } rounded-xl px-3.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition cursor-pointer hover:border-slate-300`}
      >
        {flagUrl ? (
          <img src={flagUrl} alt={value} className="w-4 h-3 object-cover rounded-xs shadow-xs shrink-0" />
        ) : (
          <Globe2 className="h-4 w-4 text-slate-400 shrink-0" />
        )}
        <span className={`flex-1 text-left ${!value ? 'text-slate-400' : ''}`}>
          {value || 'Select production country…'}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country…"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#022B96] transition"
              />
            </div>
          </div>
          {/* List */}
          <ul className="max-h-56 overflow-y-auto py-1.5">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-slate-400 text-center">No countries found</li>
            )}
            {filtered.map((c) => {
              const flag = getFlagUrl(c)
              const isSelected = c === value
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => { onChange(c); setOpen(false); setSearch('') }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-[#022B96] font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {flag ? (
                      <img src={flag} alt={c} className="w-5 h-3.5 object-cover rounded-xs shadow-xs shrink-0" />
                    ) : (
                      <span className="w-5 h-3.5 bg-slate-200 rounded-xs shrink-0" />
                    )}
                    <span>{c}</span>
                    {isSelected && <span className="ml-auto text-[#022B96]">✓</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}


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
  minPricePerKg: string        // 2a — minimum price
  maxPricePerKg: string        // 2b — maximum price
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
  const [companyName, setCompanyName] = useState<string>('')

  // Product picker state
  const [searchQuery, setSearchQuery] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Form State covering all 9 requested fields
  const [form, setForm] = useState<Product9Fields>({
    productName: '',
    minPricePerKg: '',
    maxPricePerKg: '',
    currency: 'EUR',
    countryOfOrigin: '',
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
    }, 3000)

    async function checkAuth() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const currentUser = sessionData?.session?.user
        if (currentUser && isMounted) {
          setUser(currentUser)
          // Try owner_id first, then user_id as fallback
          let companyData: any = null
          const { data: byOwner } = await supabase
            .from('companies')
            .select('id, name')
            .eq('owner_id', currentUser.id)
            .maybeSingle()
          companyData = byOwner

          if (!companyData) {
            const { data: byUser } = await supabase
              .from('companies')
              .select('id, name')
              .eq('user_id', currentUser.id)
              .maybeSingle()
            companyData = byUser
          }

          if (!companyData && currentUser.email) {
            const { data: byEmail } = await supabase
              .from('companies')
              .select('id, name')
              .ilike('email', currentUser.email)
              .maybeSingle()
            companyData = byEmail
          }

          if (!companyData) {
            const { data: userProfile } = await supabase
              .from('users')
              .select('company_id')
              .eq('id', currentUser.id)
              .maybeSingle()
            if (userProfile?.company_id) {
              const { data: byUserCo } = await supabase
                .from('companies')
                .select('id, name')
                .eq('id', userProfile.company_id)
                .maybeSingle()
              companyData = byUserCo || { id: userProfile.company_id }
            }
          }

          if (!companyData) {
            const { data: claim } = await supabase
              .from('profile_claims')
              .select('company_id')
              .eq('user_id', currentUser.id)
              .eq('status', 'approved')
              .maybeSingle()
            if (claim?.company_id) {
              const { data: byClaimCo } = await supabase
                .from('companies')
                .select('id, name')
                .eq('id', claim.company_id)
                .maybeSingle()
              companyData = byClaimCo || { id: claim.company_id }
            }
          }

          if (companyData && isMounted) {
            setCompanyId(companyData.id)
            if (companyData.name) setCompanyName(companyData.name)
          } else {
            const metaName = currentUser.user_metadata?.company_name || currentUser.user_metadata?.company
            if (metaName && isMounted) setCompanyName(metaName)
          }
        } else {
          console.warn('[PostStock] No active session found')
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

    // Validate min price
    if (!form.minPricePerKg || parseFloat(form.minPricePerKg) <= 0) {
      alert('Please enter a valid minimum price per KG.')
      return
    }

    setSubmitting(true)

    // Build the content JSON with all 9 product fields
    const minPrice = parseFloat(form.minPricePerKg) || 0
    const maxPrice = parseFloat(form.maxPricePerKg) || 0
    const priceLabel = form.maxPricePerKg
      ? `${form.currency} ${form.minPricePerKg}–${form.maxPricePerKg}/kg`
      : `${form.currency} ${form.minPricePerKg}/kg`

    const details = {
      productName: form.productName,
      minPricePerKg: minPrice,
      maxPricePerKg: maxPrice,
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

    try {
      console.log('[PostStock] Saving post via API for companyId:', companyId)
      const res = await fetch('/api/supplier/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          companyName,
          category: 'product_availability',
          title: `${form.productName} — ${priceLabel}`,
          content: JSON.stringify(details),
          details,
          is_published: true,
        }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        console.error('[PostStock] API insert error:', json.error)
        setSubmitting(false)
        alert(`Failed to publish: ${json.error || 'Server error'}. Please try again.`)
        return
      }

      console.log('[PostStock] Post saved successfully:', json.post)
      setSubmitting(false)
      setSubmitted(true)
    } catch (err: any) {
      console.error('[PostStock] Unexpected error:', err)
      setSubmitting(false)
      alert(`An unexpected error occurred: ${err?.message || String(err)}`)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setForm({
      productName: '', minPricePerKg: '', maxPricePerKg: '', currency: 'EUR', countryOfOrigin: '',
      freshFrozen: 'Frozen', sizeWeight: 'Medium (1–3 kg)', packagingFillet: 'Fillet (Skin On)',
      availability: 'In Stock — Ready to Ship', location: '', supplierInfoExtra: '', customImage: '',
    })
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center space-y-5">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Product Listing Published!</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Your listing for <strong>{form.productName}</strong> is now active on your profile and accessible to global buyers.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="w-full py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold rounded-xl transition cursor-pointer text-xs"
            >
              Post Another Product
            </button>
            <Link
              href="/dashboard/supplier"
              className="w-full py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer text-xs text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6">
      
      {/* Top Nav Back Link */}
      <div className="max-w-4xl mx-auto mb-4">
        <Link
          href="/dashboard/supplier"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-8 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Post Product Listing</h1>
              <p className="text-xs text-slate-400 mt-0.5">Complete product listing parameters for buyers.</p>
            </div>

            {/* Photo Upload */}
            <div className="flex flex-col items-center shrink-0">
              <label className="relative group cursor-pointer">
                {displayImage ? (
                  <div className="relative">
                    <img
                      src={displayImage}
                      alt="Product"
                      className="h-14 w-14 rounded-full object-cover border border-slate-200 shadow-xs bg-slate-50"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="h-14 w-14 rounded-full bg-slate-50 border border-dashed border-slate-300 group-hover:border-[#022B96] text-slate-400 group-hover:text-[#022B96] flex items-center justify-center transition">
                    {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <span className="text-[10px] font-semibold text-slate-400 mt-1">
                {form.customImage ? 'Change' : 'Add Photo'}
              </span>
            </div>
          </div>

          {/* 9 Product Specification Fields */}
          <div className="space-y-5">

            {/* Field 1: Product Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                1. Product Name <span className="text-rose-500">*</span>
              </label>
              {form.productName ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      <img
                        src={displayImage || getFishImageForProduct(form.productName)}
                        alt={form.productName}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm leading-tight truncate">{form.productName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{selectedProductMeta?.category || 'Seafood Item'}</p>
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
              ) : (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="w-full h-[42px] flex items-center justify-between px-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs transition cursor-pointer"
                >
                  <span>Select product species...</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

              {/* Field 2: Price per KG — Min & Max */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. Price per KG <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={form.currency}
                    onChange={(e) => set('currency', e.target.value)}
                    className="h-[38px] w-20 shrink-0 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl px-2.5 text-xs outline-none focus:border-[#022B96] transition cursor-pointer"
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
                    placeholder="Min"
                    value={form.minPricePerKg}
                    onChange={(e) => set('minPricePerKg', e.target.value)}
                    className="h-[38px] w-full min-w-0 flex-1 bg-white border border-slate-200 text-slate-800 font-semibold rounded-xl px-3 text-xs outline-none focus:border-[#022B96] transition placeholder:text-slate-300"
                  />
                  <span className="text-slate-400 text-xs font-medium shrink-0">—</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Max"
                    value={form.maxPricePerKg}
                    onChange={(e) => set('maxPricePerKg', e.target.value)}
                    className="h-[38px] w-full min-w-0 flex-1 bg-white border border-slate-200 text-slate-800 font-semibold rounded-xl px-3 text-xs outline-none focus:border-[#022B96] transition placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Field 3: Country of Origin */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  3. Country of Origin <span className="text-rose-500">*</span>
                </label>
                <CountryOriginPicker
                  value={form.countryOfOrigin}
                  onChange={(v) => set('countryOfOrigin', v)}
                />
                <input
                  type="text"
                  required
                  value={form.countryOfOrigin}
                  onChange={() => {}}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>

              {/* Field 4: Fresh / Frozen */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  4. Fresh / Frozen <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Fresh', 'Frozen', 'Both'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set('freshFrozen', opt)}
                      className={`h-[38px] rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center ${
                        form.freshFrozen === opt
                          ? 'bg-[#022B96] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 5: Size / Weight */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  5. Size / Weight <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.sizeWeight}
                  onChange={(e) => set('sizeWeight', e.target.value)}
                  className="h-[38px] w-full bg-white border border-slate-200 text-slate-800 font-medium rounded-xl px-3 text-xs outline-none focus:border-[#022B96] transition cursor-pointer"
                >
                  {SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Field 6: Packaging / Fillet */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  6. Packaging / Fillet Cut <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.packagingFillet}
                  onChange={(e) => set('packagingFillet', e.target.value)}
                  className="h-[38px] w-full bg-white border border-slate-200 text-slate-800 font-medium rounded-xl px-3 text-xs outline-none focus:border-[#022B96] transition cursor-pointer"
                >
                  {PACKAGING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Field 7: Availability */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  7. Availability <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.availability}
                  onChange={(e) => set('availability', e.target.value)}
                  className="h-[38px] w-full bg-white border border-slate-200 text-slate-800 font-medium rounded-xl px-3 text-xs outline-none focus:border-[#022B96] transition cursor-pointer"
                >
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Field 8: Location */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  8. Stock Location (City / Port) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amsterdam, Netherlands"
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    className="h-[38px] w-full bg-white border border-slate-200 text-slate-800 font-medium rounded-xl pl-9 pr-3 text-xs outline-none focus:border-[#022B96] transition placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Field 9: Supplier Extra Information */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  9. Supplier Extra Information <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter certifications (MSC/ASC/HACCP), catch method, export capabilities, minimum order details..."
                  value={form.supplierInfoExtra}
                  onChange={(e) => set('supplierInfoExtra', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#022B96] transition resize-none font-medium placeholder:text-slate-300"
                />
              </div>

            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !form.productName || !form.minPricePerKg || !form.location}
              className="px-6 py-2.5 bg-[#022B96] hover:bg-[#011a5e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <>Save &amp; Publish Listing</>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Catalog Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            ref={pickerRef}
            className="bg-white w-full max-w-3xl rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Select Seafood Species</h3>
                <p className="text-xs text-slate-400 mt-0.5">{ALL_PRODUCTS.length}+ catalog species available</p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition cursor-pointer text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search species (e.g. Salmon, Tuna)..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#022B96] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-6">
              {FISH_CATALOG.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{cat.category}</p>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {cat.items.map((item) => {
                      const itemImg = getFishImageForProduct(item, cat.image)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => selectProduct(item)}
                          className="p-2 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 rounded-xl text-left font-bold text-xs text-slate-800 hover:text-[#022B96] transition cursor-pointer flex items-center gap-2 group"
                        >
                          <div className="h-8 w-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
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

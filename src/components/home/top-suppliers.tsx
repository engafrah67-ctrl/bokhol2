'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
import { Building2, Award, ArrowRight, Lock, Loader2, Sparkles, X, MessageSquare, Phone, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DEFAULT_SUPPLIERS = [
  {
    id: 's1',
    slug: null as string | null,
    name: 'Norway Seafoods AS',
    country: 'Norway',
    flag: '🇳🇴',
    yearFounded: 1994,
    employees: '200-500',
    description: 'Premier harvester and exporter of Atlantic Cod, Haddock, and Saithe from the pristine Arctic waters.',
    isVerified: true,
    activityScore: 98,
    trustScore: 96,
    email: 'sales@norwayseafoods.no',
    phone: '+47 70 10 12 34',
    logoUrl: null as string | null
  },
  {
    id: 's2',
    slug: null as string | null,
    name: 'Chilean Salmon Packers',
    country: 'Chile',
    flag: '🇨🇱',
    yearFounded: 2008,
    employees: '50-200',
    description: 'Eco-certified aquaculture operations delivering fresh and frozen Atlantic salmon globally.',
    isVerified: true,
    activityScore: 92,
    trustScore: 94,
    email: 'info@chilesalmon.cl',
    phone: '+56 65 224 8899',
    logoUrl: null as string | null
  },
  {
    id: 's3',
    slug: null as string | null,
    name: 'Tokyo Marine Products',
    country: 'Japan',
    flag: '🇯🇵',
    yearFounded: 1982,
    employees: '500+',
    description: 'Global distributor specializing in Bluefin Tuna, Sea Bream, and premium sashimi-grade products.',
    isVerified: true,
    activityScore: 95,
    trustScore: 97,
    email: 'contact@tokyomarine.co.jp',
    phone: '+81 3 5540 1234',
    logoUrl: null as string | null
  },
  {
    id: 's4',
    slug: null as string | null,
    name: 'Icelandic Premium Cod',
    country: 'Iceland',
    flag: '🇮🇸',
    yearFounded: 2001,
    employees: '10-50',
    description: 'Line-caught Atlantic Cod and Halibut, processed using 100% renewable geothermal energy.',
    isVerified: true,
    activityScore: 88,
    trustScore: 91,
    email: 'orders@icelandiccod.is',
    phone: '+354 515 2000',
    logoUrl: null as string | null
  }
]

export function TopSuppliers() {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const supabase = createClient()

  const [dbSuppliers, setDbSuppliers] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  
  // Modal states
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showContactDetails, setShowContactDetails] = useState<any | null>(null)

  useEffect(() => {
    async function getSuppliers() {
      try {
        const { data } = await supabase
          .from('companies')
          .select('*, country:countries(name, flag_emoji)')
          .eq('status', 'active')
          .limit(4)

        if (data && data.length > 0) {
          setDbSuppliers(data)
        }
      } catch (err) {
        console.error('Error fetching suppliers:', err)
      } finally {
        setFetching(false)
      }
    }
    if (!isLoading) {
      getSuppliers()
    }
  }, [user, isLoading])

  // Merge database suppliers with defaults if needed
  const displaySuppliers = dbSuppliers.length > 0 
    ? dbSuppliers.map((s, idx) => {
        const fallback = DEFAULT_SUPPLIERS[idx % DEFAULT_SUPPLIERS.length]
        return {
          id: s.id,
          slug: s.slug,
          name: s.name,
          country: s.country?.name || fallback.country,
          flag: s.country?.flag_emoji || fallback.flag,
          yearFounded: s.year_founded || fallback.yearFounded,
          employees: s.employee_count || fallback.employees,
          description: s.description || fallback.description,
          isVerified: s.is_verified,
          activityScore: s.activity_score || fallback.activityScore,
          trustScore: s.trust_score || fallback.trustScore,
          email: s.email || fallback.email,
          phone: s.phone || fallback.phone,
          logoUrl: s.logo_url || null
        }
      })
    : DEFAULT_SUPPLIERS

  const isAuthenticated = !!user

  const handleContactClick = (sup: any) => {
    if (!isAuthenticated) {
      setSelectedSupplier(sup)
      setShowAuthModal(true)
    } else {
      setShowContactDetails(sup)
    }
  }

  return (
    <div className="my-6">
      {/* Grid of suppliers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displaySuppliers.map((sup, idx) => (
          <div 
            key={idx} 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition duration-200"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                {sup.logoUrl ? (
                  <img src={sup.logoUrl} alt={sup.name} className="h-10 w-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800" />
                ) : (
                  <div className="h-10 w-10 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight">{sup.name}</h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <span>{sup.flag}</span>
                  <span>{sup.country}</span>
                  <span>•</span>
                  <span>Est. {sup.yearFounded}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {sup.description}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Trust Score: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{sup.trustScore}/100</strong></span>
                <span>Employees: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{sup.employees}</strong></span>
              </div>
              
              {sup.slug ? (
                <Link
                  href={`/suppliers/${sup.slug}`}
                  className="w-full bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  View Profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <Button
                  onClick={() => handleContactClick(sup)}
                  className="w-full bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  View Profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* LOGIN PROMPT MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1.5px] p-4">
          <div className="relative max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>

            <div className="text-center">
              <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-100">Sign in to Contact {selectedSupplier?.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Connect with verified exporters, access full catalogs, view verified ratings, and communicate directly with suppliers by registering a buyer account.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/login">
                <Button size="sm" variant="outline" className="px-4 py-2 text-xs font-semibold cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold cursor-pointer">
                  Register Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER CONTACT INFO MODAL (FOR LOGGED IN USERS) */}
      {showContactDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1.5px] p-4">
          <div className="relative max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <button 
              onClick={() => setShowContactDetails(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div className="text-center">
              <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-100">Contact {showContactDetails.name}</h4>
              <p className="text-xs text-slate-500 mt-1">Verified Supplier coordinates are unlocked.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium select-all">{showContactDetails.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium select-all">{showContactDetails.phone}</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[10px] text-slate-400">Mention you found them on FishMarketCap to speed up quotation.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

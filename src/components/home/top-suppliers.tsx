'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
import { Building2, Award, ArrowRight, Lock, Loader2, Sparkles, X, MessageSquare, Phone, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'



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

  // Merge database suppliers
  const displaySuppliers = dbSuppliers.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    country: s.country?.name || 'Europe',
    flag: s.country?.flag_emoji || '🌐',
    yearFounded: s.year_founded || 2020,
    employees: s.employee_count || '10-50',
    description: s.description || '',
    isVerified: s.is_verified,
    activityScore: s.activity_score || 90,
    trustScore: s.trust_score || 90,
    email: s.email || '',
    phone: s.phone || '',
    logoUrl: s.logo_url || null
  }))

  if (displaySuppliers.length === 0) {
    return null
  }

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
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified Exporter
                </span>
                {sup.employees && <span>Employees: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{sup.employees}</strong></span>}
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

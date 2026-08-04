'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, ArrowRight, Search, Ship, Calendar, MapPin } from 'lucide-react'
import { useUser } from '@/hooks/use-user'

import { createClient } from '@/lib/supabase/client'

interface BuyerRequest {
  id: string
  originCountry: string
  originFlag: string
  originPort: string
  destCountry: string
  destFlag: string
  destPort: string
  shippingType: string // "Port to Port", "Door to Door", etc.
  carrierPreference: string // "HPL", "MSK", "Any", etc.
  containerType: string // "40RF" (40ft Reefer), "20RF", etc.
  date: string
}

const DEFAULT_REQUESTS: BuyerRequest[] = [
  {
    id: '1',
    originCountry: 'China',
    originFlag: 'https://flagcdn.com/w40/cn.png',
    originPort: 'Zhanjiang',
    destCountry: 'Chile',
    destFlag: 'https://flagcdn.com/w40/cl.png',
    destPort: 'Caldera',
    shippingType: 'Port to Port',
    carrierPreference: 'HPL',
    containerType: '40RF',
    date: 'August 14, 2026'
  },
  {
    id: '2',
    originCountry: 'Vietnam',
    originFlag: 'https://flagcdn.com/w40/vn.png',
    originPort: 'Ho Chi Minh Port',
    destCountry: 'Spain',
    destFlag: 'https://flagcdn.com/w40/es.png',
    destPort: 'Valencia',
    shippingType: 'Port to Port',
    carrierPreference: 'MSK',
    containerType: '40RF',
    date: 'August 18, 2026'
  },
  {
    id: '3',
    originCountry: 'Norway',
    originFlag: 'https://flagcdn.com/w40/no.png',
    originPort: 'Bergen',
    destCountry: 'Japan',
    destFlag: 'https://flagcdn.com/w40/jp.png',
    destPort: 'Tokyo Port',
    shippingType: 'Port to Port',
    carrierPreference: 'ONE',
    containerType: '20RF',
    date: 'August 22, 2026'
  },
  {
    id: '4',
    originCountry: 'Ecuador',
    originFlag: 'https://flagcdn.com/w40/ec.png',
    originPort: 'Guayaquil',
    destCountry: 'China',
    destFlag: 'https://flagcdn.com/w40/cn.png',
    destPort: 'Qingdao',
    shippingType: 'Port to Port',
    carrierPreference: 'COSCO',
    containerType: '40RF',
    date: 'August 29, 2026'
  }
]

export default function BuyerRequestsPage() {
  const { user, profile } = useUser()
  const [requests, setRequests] = useState<BuyerRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRequests() {
      const supabase = createClient()

      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setLoading(false)
        return
      }

      // Fetch ONLY this buyer's own requests
      const { data, error } = await supabase
        .from('buyer_requests')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error || !data) {
        setLoading(false)
        return
      }

      // Map Supabase rows to our BuyerRequest structure
      const dbRequests: BuyerRequest[] = data.map((row: { id: string; title?: string; description?: string; destination?: string; expires_at?: string; created_at?: string }) => {
        try {
          // Attempt to parse description as JSON containing custom fields
          const custom = JSON.parse(row.description || '{}')
          return {
            id: row.id,
            originCountry: custom.originCountry || 'China',
            originFlag: custom.originFlag || 'https://flagcdn.com/w40/cn.png',
            originPort: custom.originPort || row.title || 'Port',
            destCountry: custom.destCountry || 'Chile',
            destFlag: custom.destFlag || 'https://flagcdn.com/w40/cl.png',
            destPort: custom.destPort || row.destination || 'Port',
            shippingType: custom.shippingType || 'Port to Port',
            carrierPreference: custom.carrierPreference || 'HPL',
            containerType: custom.containerType || '40RF',
            date: new Date(row.expires_at || row.created_at || '').toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })
          }
        } catch (e) {
          // Fallback if description is not JSON
          return {
            id: row.id,
            originCountry: 'China',
            originFlag: 'https://flagcdn.com/w40/cn.png',
            originPort: row.title || 'Port',
            destCountry: 'Chile',
            destFlag: 'https://flagcdn.com/w40/cl.png',
            destPort: row.destination || 'Port',
            shippingType: 'Port to Port',
            carrierPreference: 'HPL',
            containerType: '40RF',
            date: new Date(row.expires_at || row.created_at || '').toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })
          }
        }
      })

      // Only show this buyer's own real requests
      setRequests(dbRequests)
      setLoading(false)
    }

    fetchRequests()
  }, [user])

  const filteredRequests = requests.filter(r => 
    r.originPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.originCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destCountry.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Buyer Requests</h1>
              <p className="mt-2 text-slate-500 text-sm">Active cargo demands and logistics tenders from verified seafood importers.</p>
            </div>
            {profile?.role === 'buyer' && (
              <Link href="/requests/buyer/new">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#022B96]/10 transition cursor-pointer">
                  <Plus className="h-4 w-4" />
                  Post Sourcing Request
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search Bar */}
        <div className="max-w-md mb-8">
          <div className="relative flex items-center bg-white rounded-xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-[#022B96]/20 focus-within:border-[#022B96] transition-all p-1.5">
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="Search ports or countries..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-0 py-2 px-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-sm"
            />
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => (
              <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Route Header */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-4 text-sm font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <img src={req.originFlag} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                    <span>{req.originPort}</span>
                  </div>
                  <span className="text-slate-400 font-normal">→</span>
                  <div className="flex items-center gap-2">
                    <img src={req.destFlag} alt="" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                    <span>{req.destPort}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">{req.shippingType}</span>
                    <span className="text-slate-700 font-bold">{req.carrierPreference}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-800 font-bold">{req.containerType}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 my-4" />

                {/* Footer Actions */}
                <div className="flex items-center justify-between">
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg transition cursor-pointer">
                    Request offer
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {req.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="h-8 w-8 border-2 border-[#022B96] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
            <Ship className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800">No requests yet</h3>
            <p className="text-sm text-slate-400 mt-1 mb-6">Post your first sourcing request to receive offers from verified suppliers.</p>
            <Link href="/requests/buyer/new">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-semibold rounded-xl shadow-md transition cursor-pointer">
                <Plus className="h-4 w-4" />
                Post sourcing request
              </button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

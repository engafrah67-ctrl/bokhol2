'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Search, Loader2, AlertCircle, Building2, Mail, Phone, MessageCircle, MapPin, RefreshCw, Inbox,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { BuyerRequest, RequestStatus } from '@/types/database'

const STATUS_OPTIONS: { value: RequestStatus; label: string; style: string }[] = [
  { value: 'open', label: 'Open', style: 'bg-blue-50 text-[#022B96] ring-blue-100' },
  { value: 'fulfilled', label: 'Fulfilled', style: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  { value: 'closed', label: 'Closed', style: 'bg-slate-100 text-slate-500 ring-slate-200' },
]

const FILTERS: { key: 'all' | RequestStatus; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'fulfilled', label: 'Fulfilled' },
  { key: 'closed', label: 'Closed' },
  { key: 'all', label: 'All' },
]

const digits = (phone: string) => phone.replace(/[^\d]/g, '')
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function whatsappLink(r: BuyerRequest) {
  const number = digits(r.whatsapp || r.contact_phone || '')
  if (!number) return null
  const qty = r.quantity ? `${r.quantity} ${r.quantity_unit === 'tons' ? 'tons' : r.quantity_unit || ''}` : ''
  const msg = `Hello ${r.contact_name || ''}, this is Bokhol Fish Market about your request for ${qty} ${r.product_name || r.title}.`
  return `https://wa.me/${number}?text=${encodeURIComponent(msg.replace(/\s+/g, ' ').trim())}`
}

/** Admin inbox of buyer sourcing requests (RLS: only admins see other buyers' requests). */
export function BuyerRequestsTab({ onCountChange }: { onCountChange?: (openCount: number) => void }) {
  const [requests, setRequests] = useState<BuyerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | RequestStatus>('open')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await createClient()
      .from('buyer_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    if (err) setError(err.message)
    else setRequests((data || []) as BuyerRequest[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    onCountChange?.(requests.filter((r) => r.status === 'open').length)
  }, [requests, onCountChange])

  const setStatus = async (id: string, status: RequestStatus) => {
    setUpdatingId(id)
    const { error: err } = await createClient().from('buyer_requests').update({ status }).eq('id', id)
    setUpdatingId(null)
    if (err) return setError(`Could not update status: ${err.message}`)
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  const q = search.trim().toLowerCase()
  const visible = requests.filter(
    (r) =>
      (filter === 'all' || r.status === filter) &&
      (!q ||
        [r.product_name, r.title, r.company_name, r.contact_name, r.contact_email, r.destination].some((v) =>
          v?.toLowerCase().includes(q)
        ))
  )
  const countOf = (key: 'all' | RequestStatus) => (key === 'all' ? requests.length : requests.filter((r) => r.status === key).length)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Buyer Requests</h2>
          <p className="text-sm text-slate-500 mt-0.5">Sourcing requests from buyers. Only admins can see these.</p>
        </div>
        <button onClick={load} disabled={loading}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60 cursor-pointer">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`h-8 px-3 rounded-lg text-sm font-semibold transition cursor-pointer ${
                filter === key ? 'bg-white text-[#022B96] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}>
              {label} <span className="ml-1 text-xs opacity-60">{countOf(key)}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, company, contact…"
            className="w-full h-10 pl-10 pr-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#022B96]/10 focus:border-[#022B96]" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {loading && requests.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-sm text-slate-500 gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#022B96]" /> Loading requests…
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-2 bg-white rounded-2xl border border-dashed border-slate-300">
          <Inbox className="h-7 w-7 text-slate-300" />
          <p className="text-sm text-slate-500">{requests.length === 0 ? 'No buyer requests yet.' : 'No requests match this filter.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => {
            const status = STATUS_OPTIONS.find((s) => s.value === r.status) || STATUS_OPTIONS[0]
            const wa = whatsappLink(r)
            const qty = r.quantity ? `${r.quantity} ${r.quantity_unit === 'tons' ? 't' : r.quantity_unit || ''}`.trim() : '—'
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">{r.product_name || r.title}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ring-1 ${status.style}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Received {fmtDate(r.created_at)}</p>
                  </div>
                  <select value={r.status} disabled={updatingId === r.id}
                    onChange={(e) => setStatus(r.id, e.target.value as RequestStatus)}
                    aria-label="Request status"
                    className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 cursor-pointer disabled:opacity-60">
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { k: 'Quantity', v: qty },
                    { k: 'Target price', v: r.target_price != null ? `€${Number(r.target_price).toFixed(2)}/kg` : '—' },
                    { k: 'Form', v: r.fresh_frozen || '—' },
                    { k: 'Needed by', v: r.delivery_date ? fmtDate(r.delivery_date) : '—' },
                  ].map(({ k, v }) => (
                    <div key={k} className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-[11px] text-slate-400">{k}</p>
                      <p className="text-sm font-semibold text-slate-800">{v}</p>
                    </div>
                  ))}
                </div>

                {(r.destination || r.description) && (
                  <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                    {r.destination && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {r.destination}</p>}
                    {r.description && <p className="whitespace-pre-line">{r.description}</p>}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm min-w-0">
                    <p className="font-semibold text-slate-800 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" /> {r.company_name || 'Company not given'}
                    </p>
                    <p className="text-slate-500 mt-0.5 truncate">
                      {[r.contact_name, r.contact_email, r.contact_phone].filter(Boolean).join(' · ') || 'No contact details'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#1fb857] text-white text-sm font-semibold">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </a>
                    )}
                    {r.contact_phone && (
                      <a href={`tel:${r.contact_phone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold">
                        <Phone className="h-4 w-4" /> Call
                      </a>
                    )}
                    {r.contact_email && (
                      <a href={`mailto:${r.contact_email}?subject=${encodeURIComponent(`Your Bokhol request: ${r.product_name || r.title}`)}`}
                        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold">
                        <Mail className="h-4 w-4" /> Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

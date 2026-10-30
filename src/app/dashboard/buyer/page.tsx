'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ShoppingBag,
  TrendingUp,
  Plus,
  Search,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
  User,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  CalendarDays,
  Fish,
  Scale,
  Euro,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/use-user'
import { SeafoodIndexViewer } from '@/components/market/seafood-index-viewer'
import type { BuyerRequest } from '@/types/database'

type Tab = 'requests' | 'index'

const FORMS = ['Any', 'Fresh', 'Frozen', 'Smoked', 'Live'] as const

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-blue-50 text-[#022B96] ring-blue-100',
  fulfilled: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  closed: 'bg-slate-100 text-slate-500 ring-slate-200',
}
const STATUS_LABEL: Record<string, string> = { open: 'Open', fulfilled: 'Fulfilled', closed: 'Closed' }

const label = 'block text-xs font-semibold text-slate-600 mb-1.5'
const input =
  'w-full h-11 pl-10 pr-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#022B96]/10 focus:border-[#022B96] transition'

const emptyForm = {
  productName: '',
  freshFrozen: 'Any' as (typeof FORMS)[number],
  quantityTons: '',
  targetPricePerKg: '',
  destination: '',
  deliveryDate: '',
  notes: '',
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  whatsapp: '',
}
type FormState = typeof emptyForm

function Field({
  id, label: text, icon: Icon, children,
}: { id: string; label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={label}>{text}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        {children}
      </div>
    </div>
  )
}

function NewRequestModal({
  initial, onClose, onCreated,
}: { initial: FormState; onClose: () => void; onCreated: (r: BuyerRequest) => void }) {
  const [form, setForm] = useState<FormState>(initial)
  const [sameAsPhone, setSameAsPhone] = useState(!initial.whatsapp || initial.whatsapp === initial.phone)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, whatsapp: sameAsPhone ? form.phone : form.whatsapp }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not submit your request.')
      onCreated(json.data)
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/50 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">New sourcing request</h2>
            <p className="text-sm text-slate-500">Tell us what you need — our team will find the right supplier.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-7">
          {/* What you need */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">What you need</h3>
            <Field id="rq-product" label="Seafood product *" icon={Fish}>
              <input id="rq-product" required maxLength={80} value={form.productName}
                onChange={(e) => set('productName', e.target.value)} placeholder="e.g. Atlantic Salmon" className={input} />
            </Field>
            <div>
              <span className={label}>Form</span>
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
                {FORMS.map((f) => (
                  <button key={f} type="button" onClick={() => set('freshFrozen', f)} aria-pressed={form.freshFrozen === f}
                    className={`h-9 rounded-lg text-sm font-semibold transition cursor-pointer ${
                      form.freshFrozen === f ? 'bg-white text-[#022B96] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="rq-qty" label="Quantity (tons) *" icon={Scale}>
                <input id="rq-qty" required type="number" inputMode="decimal" min="0.01" step="0.01" value={form.quantityTons}
                  onChange={(e) => set('quantityTons', e.target.value)} placeholder="e.g. 20" className={`${input} pr-10`} />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">t</span>
              </Field>
              <Field id="rq-price" label="Target price (€ per kg)" icon={Euro}>
                <input id="rq-price" type="number" inputMode="decimal" min="0" step="0.01" value={form.targetPricePerKg}
                  onChange={(e) => set('targetPricePerKg', e.target.value)} placeholder="Optional, e.g. 7.50" className={input} />
              </Field>
              <Field id="rq-dest" label="Delivery location" icon={MapPin}>
                <input id="rq-dest" maxLength={160} value={form.destination}
                  onChange={(e) => set('destination', e.target.value)} placeholder="e.g. Rotterdam, NL" className={input} />
              </Field>
              <Field id="rq-date" label="Needed by" icon={CalendarDays}>
                <input id="rq-date" type="date" value={form.deliveryDate} min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => set('deliveryDate', e.target.value)} className={input} />
              </Field>
            </div>
            <div>
              <label htmlFor="rq-notes" className={label}>Details for suppliers</label>
              <textarea id="rq-notes" rows={3} maxLength={2000} value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Size grade, packaging, certification (MSC/ASC), Incoterms…"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#022B96]/10 focus:border-[#022B96] transition resize-none" />
            </div>
          </section>

          <div className="h-px bg-slate-100" />

          {/* Your company */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Your company & contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="rq-company" label="Company name *" icon={Building2}>
                <input id="rq-company" required maxLength={120} value={form.companyName}
                  onChange={(e) => set('companyName', e.target.value)} placeholder="e.g. Hotel Amsterdam B.V." className={input} />
              </Field>
              <Field id="rq-contact" label="Contact person *" icon={User}>
                <input id="rq-contact" required maxLength={120} value={form.contactName}
                  onChange={(e) => set('contactName', e.target.value)} placeholder="Full name" className={input} />
              </Field>
              <Field id="rq-email" label="Email *" icon={Mail}>
                <input id="rq-email" required type="email" maxLength={160} value={form.email}
                  onChange={(e) => set('email', e.target.value)} placeholder="you@company.com" className={input} />
              </Field>
              <Field id="rq-phone" label="Phone *" icon={Phone}>
                <input id="rq-phone" required type="tel" maxLength={30} value={form.phone}
                  onChange={(e) => set('phone', e.target.value)} placeholder="+31 6 1234 5678" className={input} />
              </Field>
            </div>
            <div className="space-y-2.5">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input type="checkbox" checked={sameAsPhone} onChange={(e) => setSameAsPhone(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-[#022B96]" />
                WhatsApp is the same number as my phone
              </label>
              {!sameAsPhone && (
                <Field id="rq-wa" label="WhatsApp number" icon={MessageCircle}>
                  <input id="rq-wa" type="tel" maxLength={30} value={form.whatsapp}
                    onChange={(e) => set('whatsapp', e.target.value)} placeholder="+31 6 1234 5678" className={input} />
                </Field>
              )}
            </div>
          </section>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/70 px-6 sm:px-8 py-4">
          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <div className="flex justify-end gap-2.5">
            <button type="button" onClick={onClose}
              className="h-10 px-4 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="h-10 px-5 rounded-xl bg-[#022B96] hover:bg-[#011a5e] disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center gap-2 shadow-sm cursor-pointer">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Submit request
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function RequestCard({ r, onClose, closing }: { r: BuyerRequest; onClose: () => void; closing: boolean }) {
  const product = r.product_name || r.title
  const qty = r.quantity ? `${r.quantity} ${r.quantity_unit === 'tons' ? 't' : r.quantity_unit || ''}`.trim() : null
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 truncate">{product}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Submitted {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${STATUS_STYLE[r.status] || STATUS_STYLE.open}`}>
          {STATUS_LABEL[r.status] || r.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { k: 'Quantity', v: qty },
          { k: 'Target price', v: r.target_price != null ? `€${Number(r.target_price).toFixed(2)}/kg` : null },
          { k: 'Form', v: r.fresh_frozen },
          { k: 'Delivery', v: [r.destination, r.delivery_date && new Date(r.delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })].filter(Boolean).join(' · ') || null },
        ].map(({ k, v }) => (
          <div key={k} className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[11px] text-slate-400">{k}</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{v || '—'}</p>
          </div>
        ))}
      </div>

      {r.description && <p className="mt-3 text-sm text-slate-600 line-clamp-2">{r.description}</p>}

      {r.status === 'open' && (
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} disabled={closing}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 disabled:opacity-50 cursor-pointer">
            {closing ? 'Closing…' : 'Close request'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function BuyerDashboardPage() {
  const { user, profile } = useUser()
  const [tab, setTab] = useState<Tab>('requests')
  const [requests, setRequests] = useState<BuyerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [closingId, setClosingId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const loadRequests = useCallback(async (userId: string) => {
    const { data, error } = await createClient()
      .from('buyer_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) setLoadError(error.message)
    else setRequests((data || []) as BuyerRequest[])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user?.id) loadRequests(user.id)
  }, [user?.id, loadRequests])

  const closeRequest = async (id: string) => {
    if (!confirm('Close this request? Our team will stop sourcing it.')) return
    setClosingId(id)
    const { error } = await createClient().from('buyer_requests').update({ status: 'closed' }).eq('id', id)
    setClosingId(null)
    if (error) return setNotice(`Could not close request: ${error.message}`)
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'closed' } : r)))
  }

  // Pre-fill contact details from the buyer's latest request, then their profile
  const last = requests[0]
  const initialForm: FormState = {
    ...emptyForm,
    companyName: last?.company_name || '',
    contactName: last?.contact_name || profile?.full_name || '',
    email: last?.contact_email || user?.email || '',
    phone: last?.contact_phone || profile?.phone || '',
    whatsapp: last?.whatsapp || '',
  }

  const q = search.trim().toLowerCase()
  const visible = requests.filter((r) =>
    !q || [r.product_name, r.title, r.destination, r.company_name].some((v) => v?.toLowerCase().includes(q))
  )
  const openCount = requests.filter((r) => r.status === 'open').length

  const TABS = [
    { key: 'requests' as const, label: 'Requests', icon: ShoppingBag, badge: openCount },
    { key: 'index' as const, label: 'Seafood Index', icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="lg:w-60 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 lg:p-5">
          <div className="hidden lg:flex items-center gap-2.5 mb-8 pb-5 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-[#022B96] text-white font-black flex items-center justify-center">B</div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">Bokhol</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Buyer Center</p>
            </div>
          </div>
          <nav className="flex lg:flex-col gap-1">
            {TABS.map(({ key, label: text, icon: Icon, badge }) => {
              const active = tab === key
              return (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex-1 lg:flex-none flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    active ? 'bg-[#022B96] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}>
                  <span className="flex items-center gap-2.5"><Icon className="h-4 w-4" /> {text}</span>
                  {!!badge && (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {tab === 'requests' ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Sourcing requests</h1>
                  <p className="text-sm text-slate-500 mt-0.5">Tell us what seafood you need — our team finds the supplier and contacts you.</p>
                </div>
                <button onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-semibold shadow-sm cursor-pointer">
                  <Plus className="h-4 w-4" /> New request
                </button>
              </div>

              {notice && (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-800">
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {notice}</span>
                  <button onClick={() => setNotice(null)} aria-label="Dismiss" className="cursor-pointer"><X className="h-4 w-4" /></button>
                </div>
              )}

              {requests.length > 0 && (
                <div className="relative max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search requests"
                    className="w-full h-10 pl-10 pr-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#022B96]/10 focus:border-[#022B96]" />
                </div>
              )}

              {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[0, 1].map((i) => <div key={i} className="h-40 rounded-2xl bg-white border border-slate-200 animate-pulse" />)}
                </div>
              ) : loadError ? (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" /> Could not load your requests: {loadError}
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 px-6 text-center">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-[#022B96]/8 text-[#022B96] flex items-center justify-center mb-4">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-slate-800">No requests yet</p>
                  <p className="text-sm text-slate-500 mt-1">Post what you need and we&apos;ll source it from verified suppliers.</p>
                  <button onClick={() => setShowForm(true)}
                    className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#022B96] text-white text-sm font-semibold cursor-pointer">
                    <Plus className="h-4 w-4" /> Post your first request
                  </button>
                </div>
              ) : visible.length === 0 ? (
                <p className="text-sm text-slate-500 py-10 text-center">No requests match &ldquo;{search}&rdquo;.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {visible.map((r) => (
                    <RequestCard key={r.id} r={r} onClose={() => closeRequest(r.id)} closing={closingId === r.id} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">European Seafood Index</h1>
                <p className="text-sm text-slate-500 mt-0.5">Benchmark prices and 12-month trends, updated by the Bokhol market team.</p>
              </div>
              <SeafoodIndexViewer />
            </div>
          )}
        </main>
      </div>

      {showForm && (
        <NewRequestModal
          initial={initialForm}
          onClose={() => setShowForm(false)}
          onCreated={(r) => {
            setRequests((prev) => [r, ...prev])
            setShowForm(false)
            setNotice('Request submitted. Our team will contact you shortly.')
          }}
        />
      )}
    </div>
  )
}

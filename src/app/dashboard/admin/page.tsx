'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  Plus,
  Edit,
  TrendingUp,
  Fish,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  AlertCircle,
  Globe2,
  DollarSign,
  Package,
  Building2,
  Mail,
  User,
  Phone,
  Briefcase,
  ExternalLink,
} from 'lucide-react'
import {
  CompanyProfile,
  getStoredCompanies,
  approveProfileClaim,
  rejectProfileClaim,
} from '@/lib/data/companies-data'

/* ─── Fish category image map ─── */
const FISH_IMAGE_MAP: Record<string, string> = {
  'Atlantic Salmon': '/fish-salmon.png', 'Pacific Salmon': '/fish-salmon.png',
  'Salmon Fillet': '/fish-salmon.png', 'Salmon Portions': '/fish-salmon.png',
  'Yellowfin Tuna': '/fish-[#022B96].png', 'Bluefin Tuna': '/fish-tuna.png',
  'Bigeye Tuna': '/fish-tuna.png', 'Albacore Tuna': '/fish-tuna.png',
  'Skipjack Tuna': '/fish-tuna.png', 'Tuna Loin': '/fish-tuna.png',
  'Sea Bass': '/fish-seabass.png', 'European Sea Bass': '/fish-seabass.png',
  'Sea Bream': '/fish-seabass.png', 'Gilthead Sea Bream': '/fish-seabass.png',
  'Cod': '/fish-cod.png', 'Atlantic Cod': '/fish-cod.png',
  'Pacific Cod': '/fish-cod.png', 'Haddock': '/fish-cod.png',
  'Pollock': '/fish-cod.png', 'Alaska Pollock': '/fish-cod.png',
  'Hake': '/fish-cod.png', 'Whiting': '/fish-cod.png',
  'Mackerel': '/fish-mackerel.png', 'Herring': '/fish-mackerel.png',
  'Sardine': '/fish-mackerel.png', 'Anchovy': '/fish-mackerel.png',
}

function getFishImage(name: string): string | null {
  return FISH_IMAGE_MAP[name] || null
}

const SAMPLE_MARKET_INDEXES = [
  { country: 'Spain', product: 'Tuna', avg: '€5.31', low: '€5.10', high: '€5.55', updated: 'July 2026' },
  { country: 'Greece', product: 'Sea Bass', avg: '€5.20', low: '€4.95', high: '€5.60', updated: 'July 2026' },
  { country: 'Norway', product: 'Salmon', avg: '€8.45', low: '€8.10', high: '€8.90', updated: 'July 2026' },
  { country: 'Turkey', product: 'Seabream', avg: '€4.30', low: '€4.00', high: '€4.70', updated: 'July 2026' },
  { country: 'Morocco', product: 'Sardine', avg: '€1.45', low: '€1.20', high: '€1.70', updated: 'July 2026' },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [supplierPosts, setSupplierPosts] = useState<any[]>([])
  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [activeSection, setActiveSection] = useState<'posts' | 'claims' | 'indexes'>('claims')
  const [postFilter, setPostFilter] = useState<'all' | 'active' | 'pending'>('all')

  const reloadCompanies = () => {
    setCompanies(getStoredCompanies())
  }

  useEffect(() => {
    async function loadAdminData() {
      try {
        reloadCompanies()
        const { data: { session } } = await supabase.auth.getSession()

        if (typeof window !== 'undefined') {
          try {
            const stored = JSON.parse(localStorage.getItem('supplier_posts') || '[]')
            if (stored && Array.isArray(stored)) {
              setSupplierPosts(stored)
            }
          } catch (_) {}
        }
      } catch (err) {
        console.error('Admin load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAdminData()
  }, [])

  async function handleApprovePost(id: string) {
    try {
      await supabase.from('supplier_posts').update({ status: 'active' }).eq('id', id)
      setSupplierPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: 'active' } : p))
    } catch (_) {}
  }

  async function handleRejectPost(id: string) {
    try {
      await supabase.from('supplier_posts').update({ status: 'rejected' }).eq('id', id)
      setSupplierPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: 'rejected' } : p))
    } catch (_) {}
  }

  const handleApproveCompanyClaim = (companyId: string) => {
    approveProfileClaim(companyId)
    reloadCompanies()
  }

  const handleRejectCompanyClaim = (companyId: string) => {
    rejectProfileClaim(companyId)
    reloadCompanies()
  }

  const pendingClaims = companies.filter((c) => c.status === 'claim_requested')
  const claimedCompanies = companies.filter((c) => c.status === 'claimed')

  const filteredPosts = supplierPosts.filter((p) => {
    if (postFilter === 'all') return true
    return p.status === postFilter
  })

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Loading Admin Panel...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Admin Header ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Control Panel
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Bokhol FishMarketCap Administration</h1>
          <p className="text-slate-300 text-xs mt-1">
            Manage company profile claims, verify business email domains, and approve supplier access.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Pending Claims</p>
            <p className="text-2xl font-black text-amber-400">{pendingClaims.length}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Claimed Profiles</p>
            <p className="text-2xl font-black text-emerald-400">{claimedCompanies.length}</p>
          </div>
        </div>
      </div>

      {/* ── Section Tabs ────────────────────────────────── */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { key: 'claims', label: 'Pending Claims', count: pendingClaims.length },
          { key: 'posts', label: 'Supplier Posts', count: supplierPosts.length },
          { key: 'indexes', label: 'Market Indexes', count: SAMPLE_MARKET_INDEXES.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as any)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeSection === key
                ? 'border-[#022B96] text-[#022B96]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeSection === key ? 'bg-[#022B96] text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ══ SECTION: PENDING COMPANY CLAIMS ════════════════ */}
      {activeSection === 'claims' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Unclaimed Company Profile Requests</h2>
              <p className="text-xs text-slate-500">
                Verify business email domains and approve ownership transfer to supplier accounts.
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#022B96] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Total Managed Profiles: {companies.length}
            </span>
          </div>

          {pendingClaims.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No pending claim requests</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All company claims are up-to-date! When users click "Claim Profile" on unclaimed directory profiles, their requests will appear here for verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingClaims.map((company) => {
                const req = company.claimRequest
                const companyDomain = company.domain || company.email.split('@')[1] || ''
                const applicantDomain = req?.businessEmail ? req.businessEmail.split('@')[1] : ''
                const domainMatches = companyDomain.toLowerCase() === applicantDomain.toLowerCase()

                return (
                  <div
                    key={company.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition"
                  >
                    {/* Left: Company & Domain Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                          CLAIM REQUESTED
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          Submitted {req?.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                          {company.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{company.name}</h3>
                          <span className="text-xs font-semibold text-blue-600">{company.category} • {company.country}</span>
                        </div>
                      </div>

                      {/* Domain Match verification badge */}
                      <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-bold ${
                          domainMatches
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {domainMatches ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Domain Matched (<code>@{applicantDomain}</code>)
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              Domain Mismatch (User: <code>@{applicantDomain}</code> vs Target: <code>@{companyDomain}</code>)
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: User Info */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1.5 text-xs text-slate-700 w-full md:w-72 shrink-0">
                      <div className="font-bold text-slate-900 border-b border-slate-200/60 pb-1 flex items-center justify-between">
                        <span>Applicant Info</span>
                        <User className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <p><strong className="text-slate-900">Name:</strong> {req?.fullName || 'N/A'}</p>
                      <p><strong className="text-slate-900">Title:</strong> {req?.jobTitle || 'N/A'}</p>
                      <p className="truncate"><strong className="text-slate-900">Email:</strong> {req?.businessEmail || 'N/A'}</p>
                      <p><strong className="text-slate-900">Phone:</strong> {req?.phone || 'N/A'}</p>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                      <button
                        onClick={() => handleApproveCompanyClaim(company.id)}
                        className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition"
                      >
                        Approve & Transfer Profile
                      </button>
                      <button
                        onClick={() => handleRejectCompanyClaim(company.id)}
                        className="flex-1 md:flex-none bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs px-5 py-2.5 rounded-xl transition"
                      >
                        Reject Claim
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ SECTION: SUPPLIER POSTS ══════════════════════ */}
      {activeSection === 'posts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">All Supplier Posts</h2>
              <p className="text-sm text-slate-500">Review and manage all fish & seafood listings posted by suppliers.</p>
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'pending'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setPostFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer capitalize ${
                    postFilter === f
                      ? 'bg-[#022B96] text-white border-[#022B96]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {f === 'all' ? `All (${supplierPosts.length})` : f === 'active' ? `Active (${supplierPosts.filter(p => p.status === 'active').length})` : `Pending (${supplierPosts.filter(p => p.status !== 'active' && p.status !== 'rejected').length})`}
                </button>
              ))}
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Fish className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">No supplier posts yet</h3>
              <p className="text-sm text-slate-400">When suppliers post their seafood products, they will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <div className="col-span-4">Product / Supplier</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Origin</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredPosts.map((post: any) => {
                  const img = getFishImage(post.product_name)
                  const isActive = post.status === 'active'
                  const isRejected = post.status === 'rejected'

                  return (
                    <div key={post.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/60 transition">
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        {img ? (
                          <img src={img} alt={post.product_name} className="h-12 w-12 rounded-xl object-cover border border-slate-200 bg-white flex-shrink-0 shadow-sm" />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                            <Fish className="h-6 w-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{post.product_name}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {post.company?.name || 'Unknown Supplier'}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2 text-center">
                        <p className="font-extrabold text-[#022B96] text-sm">{post.currency} {post.price_per_kg}</p>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="text-xs font-semibold text-slate-700">{post.origin_country || 'N/A'}</span>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isRejected ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {post.status || 'pending'}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {!isActive && (
                          <button
                            onClick={() => handleApprovePost(post.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        {!isRejected && (
                          <button
                            onClick={() => handleRejectPost(post.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ SECTION: MARKET INDEXES ══════════════════════ */}
      {activeSection === 'indexes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Market Price Index Benchmarks</h2>
            <button className="bg-[#022B96] hover:bg-[#022B96]/90 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow">
              <Plus className="w-4 h-4" /> Add Benchmark Index
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_MARKET_INDEXES.map((idx) => (
              <div key={idx.country + idx.product} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-[#022B96] tracking-wider">{idx.country}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Updated {idx.updated}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{idx.product} Price Index</h3>
                <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Weekly Avg</span>
                    <span className="text-xl font-black text-slate-900">{idx.avg} /kg</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Range</span>
                    <span className="text-xs font-bold text-slate-600">{idx.low} - {idx.high}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Building2,
  Tag,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Globe2,
  Store,
  ChefHat,
  Truck,
  Hotel,
  UtensilsCrossed,
  Fish,
  ShoppingBag,
} from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'
import { Button } from '@/components/ui/button'
import {
  CompanyProfile,
  getStoredCompanies,
} from '@/lib/data/companies-data'
import { ClaimProfileModal } from '@/components/directory/claim-profile-modal'
import { CompanyDetailModal } from '@/components/directory/company-detail-modal'

const QUICK_FILTERS = [
  'Salmon suppliers',
  'Shrimp traders',
  'Norway sourcing',
  'MSC certified',
  'Wholesaler',
  'Fresh',
  'Frozen',
  'Aquaculture',
]

const COMMUNITY_AUDIENCE = [
  { label: 'Seafood Importers', icon: Globe2 },
  { label: 'Seafood Wholesalers', icon: Building2 },
  { label: 'Processors', icon: Fish },
  { label: 'Distributors', icon: Truck },
  { label: 'Restaurants', icon: UtensilsCrossed },
  { label: 'Hotels', icon: Hotel },
  { label: 'Fish Shops', icon: Store },
  { label: 'Catering Companies', icon: ChefHat },
  { label: 'Foodservice Buyers', icon: ShoppingBag },
]

export default function OurNetworkDirectoryPage() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Modals state
  const [selectedCompanyForClaim, setSelectedCompanyForClaim] = useState<CompanyProfile | null>(null)
  const [selectedCompanyForDetail, setSelectedCompanyForDetail] = useState<CompanyProfile | null>(null)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const reloadData = () => {
    setCompanies(getStoredCompanies())
  }

  useEffect(() => {
    reloadData()
  }, [])

  // Filtering logic
  const filteredCompanies = companies.filter((company) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      company.name.toLowerCase().includes(q) ||
      company.country.toLowerCase().includes(q) ||
      company.category.toLowerCase().includes(q) ||
      company.species.some((s) => s.toLowerCase().includes(q)) ||
      company.tags.some((t) => t.toLowerCase().includes(q))

    const matchesTag =
      !selectedTag ||
      company.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase())) ||
      company.species.some((s) => s.toLowerCase().includes(selectedTag.toLowerCase())) ||
      company.category.toLowerCase().includes(selectedTag.toLowerCase()) ||
      company.country.toLowerCase().includes(selectedTag.toLowerCase())

    return matchesSearch && matchesTag
  })

  const handleOpenClaim = (comp: CompanyProfile) => {
    setSelectedCompanyForClaim(comp)
    setIsClaimModalOpen(true)
  }

  const handleOpenDetail = (comp: CompanyProfile) => {
    setSelectedCompanyForDetail(comp)
    setIsDetailModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-transparent text-slate-900 pb-20 font-sans">
      
      {/* Import Distinctive Google Font Plus Jakarta Sans */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        main {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
        }
      `}</style>

      {/* ── 1. Clean Header Section ────────────────────────────────── */}
      <section className="bg-transparent border-b border-white/50 pt-12 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Clean Hero Header */}
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Bokhol FishMarketCap
            </h1>
            <p className="text-sm sm:text-base text-slate-700 font-normal leading-relaxed">
              At Bokhol FishMarketCap, our network is built around real businesses, real supplier activity, and real market information. Connecting seafood suppliers, importers, wholesalers, processors, and professional buyers through one growing business network.
            </p>

            {/* Clean Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {QUICK_FILTERS.slice(0, 4).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedTag(selectedTag === filter ? null : filter)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    selectedTag === filter
                      ? 'bg-[#022B96] text-white border-[#022B96] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Modern Search Bar */}
          <div className="mt-8 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company name, species, country, certification or city..."
                className="w-full pl-12 pr-4 py-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
              />
            </div>
            <Button
              onClick={() => {}}
              className="w-full sm:w-auto bg-[#022B96] hover:bg-[#022B96]/90 text-white font-bold text-xs px-8 py-3.5 h-auto rounded-xl shadow"
            >
              Search
            </Button>
          </div>

          {/* Quick Filter Tags Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Quick Filters:</span>
              {['Salmon', 'Cod', 'Mackerel', 'Germany', 'Frozen', 'Aquaculture'].map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedTag(selectedTag === item ? null : item)}
                  className={`text-xs font-medium px-3 py-1 rounded-lg border transition ${
                    selectedTag === item
                      ? 'bg-[#022B96] text-white border-[#022B96]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              ))}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-xs text-rose-600 hover:underline font-bold ml-2"
                >
                  Reset filter
                </button>
              )}
            </div>

            <span className="font-bold text-slate-400 uppercase tracking-widest text-[11px]">
              {filteredCompanies.length} / 5000 LIVE RESULTS LOADED
            </span>
          </div>

        </div>
      </section>

      {/* ── 2. Ultra Clean Supplier Cards Grid ────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {filteredCompanies.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No company profiles match your search</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search query or clearing your active quick filter.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedTag(null)
              }}
              variant="outline"
              className="rounded-xl text-xs font-bold mt-2"
            >
              Reset Search & Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => {
              const isUnclaimed = company.status === 'unclaimed'
              const isPending = company.status === 'claim_requested'

              return (
                <div
                  key={company.id}
                  className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative hover:-translate-y-0.5"
                >
                  {/* Top Bar inside card */}
                  <div className="p-5 pb-3">

                    {/* Top Bar inside card - Country Flag Top Right */}
                    <div className="flex items-center justify-end mb-2">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700">
                        {company.countryCode ? (
                          <ReactCountryFlag
                            countryCode={company.countryCode}
                            svg
                            style={{ width: '15px', height: '11px' }}
                          />
                        ) : null}
                        <span>{company.countryCode || company.country}</span>
                      </div>
                    </div>

                    {/* REAL COMPANY LOGO & Name Header */}
                    <div className="flex items-center gap-3.5 my-2">
                      {company.logoUrl ? (
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 shadow-xs p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                          <img
                            src={company.logoUrl}
                            alt={company.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-14 h-14 rounded-2xl text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform border border-white/20"
                          style={{
                            background: company.bannerColor
                              ? `linear-gradient(135deg, ${company.bannerColor}, #022B96)`
                              : 'linear-gradient(135deg, #022B96, #1e3a8a)',
                          }}
                        >
                          {company.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="overflow-hidden">
                        <h3 className="text-base font-black text-slate-900 group-hover:text-[#022B96] transition-colors truncate">
                          {company.name}
                        </h3>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#022B96] block mt-0.5">
                          {company.category}
                        </span>
                      </div>
                    </div>

                    {/* Species & Tag Pills */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-2">
                        SPECIES & PRODUCTS
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {company.species.map((sp) => (
                          <span
                            key={sp}
                            className="bg-[#022B96]/5 text-[#022B96] border border-[#022B96]/15 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Card Actions */}
                  <div className="p-5 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      {isUnclaimed ? (
                        <Button
                          onClick={() => handleOpenClaim(company)}
                          className="w-full bg-[#022B96] hover:bg-[#022B96]/90 text-white font-bold text-xs rounded-xl py-2.5 shadow-xs"
                        >
                          Claim Profile
                        </Button>
                      ) : isPending ? (
                        <Button
                          disabled
                          className="w-full bg-slate-100 text-slate-500 font-bold text-xs rounded-xl py-2.5 border border-slate-200"
                        >
                          Claim Pending
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleOpenDetail(company)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl py-2.5 shadow-xs"
                        >
                          Request a Quote
                        </Button>
                      )}

                      <Button
                        onClick={() => handleOpenDetail(company)}
                        variant="outline"
                        className="w-full text-slate-700 hover:text-slate-900 border-slate-200 font-bold text-xs rounded-xl py-2.5"
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </section>

      {/* ── 3. Official Network Statement & Intelligence Overview ────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="bg-gradient-to-br from-slate-900 via-[#022B96] to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-10 relative overflow-hidden">
          
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Network Slogan & Statement Hero Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-blue-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 inline-block">
              OUR NETWORK STATEMENT
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Real businesses. Real supplier data. Real market visibility.
            </h2>
            <p className="text-sm sm:text-base text-blue-100 font-medium">
              Powered by supplier partnerships. Driven by market intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 relative z-10">
            
            {/* Real Market Intelligence Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-300 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Real Market Intelligence</h3>
                  <p className="text-xs text-blue-200">Built on real supplier data & network partner contributions</p>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                Rather than relying solely on public information, our goal is to provide a clearer view of the market through supplier participation, product availability, commercial activity, and industry engagement.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  'Supplier activity',
                  'Product availability',
                  'Market supply trends',
                  'Buyer demand signals',
                  'Commercial market participation',
                  'Data contributed by network partners',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-semibold text-white bg-white/5 p-2 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* A Growing Business Community & Our Vision */}
            <div className="space-y-6">
              
              {/* Target Audience */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">A Growing Business Community</h3>
                    <p className="text-xs text-blue-200">Connecting companies across the seafood supply chain</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {COMMUNITY_AUDIENCE.map((item) => {
                    const Icon = item.icon
                    return (
                      <span
                        key={item.label}
                        className="bg-white/10 hover:bg-white/20 transition text-xs text-white font-medium px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5"
                      >
                        <Icon className="w-3.5 h-3.5 text-blue-300" />
                        {item.label}
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Our Vision */}
              <div className="bg-gradient-to-r from-blue-600/30 to-indigo-600/30 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-300">
                  <Target className="w-4 h-4 text-amber-300" />
                  OUR VISION
                </div>
                <p className="text-xs text-white leading-relaxed font-medium">
                  We aim to build one of Europe's most trusted seafood business networks where companies can connect, discover opportunities, and access market insights based on real supplier participation and industry activity.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Claim Profile Modal */}
      <ClaimProfileModal
        company={selectedCompanyForClaim}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={() => {
          reloadData()
        }}
      />

      {/* Company Detail Modal */}
      <CompanyDetailModal
        company={selectedCompanyForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenClaimModal={(comp) => handleOpenClaim(comp)}
      />

    </main>
  )
}

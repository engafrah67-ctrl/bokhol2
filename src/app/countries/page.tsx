'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'

const REGIONS = ['All', 'Europe', 'Africa']

interface CountryCardData {
  id: string
  name: string
  region: string
  flagCode: string
  species: string[]
  extraCount: number
  suppliersCount: number
  liveOffers: number
  speciesCovered: number
  lastUpdated: string
}

const COUNTRIES_DATA: CountryCardData[] = [
  {
    id: 'spain',
    name: 'Spain',
    region: 'Europe',
    flagCode: 'es',
    species: ['Yellowfin Tuna', 'Octopus', 'Squid', 'Sea Bass', 'Sea Bream', 'Mussels'],
    extraCount: 0,
    suppliersCount: 4,
    liveOffers: 2,
    speciesCovered: 6,
    lastUpdated: 'July 26, 2026',
  },
  {
    id: 'greece',
    name: 'Greece',
    region: 'Europe',
    flagCode: 'gr',
    species: ['Sea Bass', 'Sea Bream', 'Octopus', 'Sardines', 'Mullet', 'Red Mullet'],
    extraCount: 0,
    suppliersCount: 3,
    liveOffers: 1,
    speciesCovered: 6,
    lastUpdated: 'July 26, 2026',
  },
  {
    id: 'morocco',
    name: 'Morocco',
    region: 'Africa',
    flagCode: 'ma',
    species: ['Octopus', 'Sardines', 'Anchovy', 'Cuttlefish', 'Squid', 'Mackerel'],
    extraCount: 0,
    suppliersCount: 5,
    liveOffers: 3,
    speciesCovered: 6,
    lastUpdated: 'July 26, 2026',
  },
  {
    id: 'norway',
    name: 'Norway',
    region: 'Europe',
    flagCode: 'no',
    species: ['Atlantic Salmon', 'Atlantic Cod', 'Mackerel', 'Haddock', 'Saithe', 'Redfish'],
    extraCount: 0,
    suppliersCount: 6,
    liveOffers: 4,
    speciesCovered: 6,
    lastUpdated: 'July 26, 2026',
  },
  {
    id: 'denmark',
    name: 'Denmark',
    region: 'Europe',
    flagCode: 'dk',
    species: ['Atlantic Cod', 'Herring', 'Coldwater Prawns', 'Plaice', 'Turbot', 'Mackerel'],
    extraCount: 0,
    suppliersCount: 3,
    liveOffers: 1,
    speciesCovered: 6,
    lastUpdated: 'July 26, 2026',
  },
]

export default function CountriesPage() {
  const [activeRegion, setActiveRegion] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCountries = COUNTRIES_DATA.filter((country) => {
    const matchesRegion = activeRegion === 'All' || country.region === activeRegion
    const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.species.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesRegion && matchesSearch
  })

  return (
    <main className="min-h-screen bg-background text-foreground pb-12 md:pb-20">
      {/* 1. Full-width Hero Header Banner with Network Globe BG */}
      <section className="relative w-full flex flex-col items-center justify-center min-h-[300px] md:min-h-[360px] overflow-hidden mb-10">
        
        {/* World Map Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/map-bg.jpg"
            alt="Global Seafood Map"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Light tint overlay for text readability */}
          <div className="absolute inset-0 bg-slate-950/40" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 flex flex-col items-center text-center py-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
            Global Seafood Markets
          </h1>
          
          {/* Search Bar */}
          <div className="mt-6 w-full max-w-lg relative flex items-center bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 focus-within:ring-4 focus-within:ring-blue-400/30 focus-within:border-blue-400/60 transition-all p-1.5">
            <div className="pl-4 pr-2 flex items-center pointer-events-none text-white/60">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="Search by country or species..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-0 py-2.5 px-2 bg-transparent outline-none text-white placeholder:text-white/50 text-sm sm:text-base cursor-text"
            />
            <button className="flex-none px-5 py-2.5 bg-[#022B96] hover:bg-[#1a47c4] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-blue-500/30 text-xs sm:text-sm whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 border-b border-border pb-4">
          {REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`px-4 py-1.5 text-xs font-bold rounded-sm transition-all cursor-pointer ${
                activeRegion === region
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Country Cards Grid — 4 Columns */}
        {filteredCountries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCountries.map((country) => (
              <div
                key={country.id}
                className="border border-border bg-background hover:border-foreground/40 transition-all duration-200 p-5 rounded-sm flex flex-col justify-between group shadow-2xs hover:shadow-xs"
              >
                <div>
                  {/* Card Header: Country Name & Flag */}
                  <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border">
                    <h3 className="font-extrabold text-base text-foreground tracking-tight group-hover:underline">
                      {country.name}
                    </h3>
                    <img
                      src={`https://flagcdn.com/w40/${country.flagCode}.png`}
                      alt={`${country.name} flag`}
                      className="h-4 w-6 object-cover rounded-2xs border border-border shrink-0"
                    />
                  </div>

                  {/* Species SKUs list */}
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {country.species.join(' • ')}
                    </p>
                  </div>
                </div>

                {/* Metrics Section */}
                <div className="space-y-3 pt-4 border-t border-border/60 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Verified suppliers</span>
                    <strong className="text-foreground font-extrabold">{country.suppliersCount}</strong>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Active listings</span>
                    <strong className="text-foreground font-extrabold">{country.liveOffers}</strong>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Species tracked</span>
                    <strong className="text-foreground font-extrabold">{country.speciesCovered}</strong>
                  </div>

                  <div className="pt-2 text-[10px] text-muted-foreground flex items-center justify-between border-t border-border/40">
                    <span>Last updated</span>
                    <span className="font-medium text-foreground">{country.lastUpdated}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-border rounded-sm">
            <p className="text-sm font-semibold text-muted-foreground">No countries found for &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveRegion('All') }}
              className="mt-3 text-xs font-bold text-foreground hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}

      </div>
    </main>
  )
}

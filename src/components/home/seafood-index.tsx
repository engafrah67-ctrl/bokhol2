'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface SpeciesData {
  id: string
  label: string
  currency: string
  unit: string
  latest: number
  weekHigh: number
  weekLow: number
  change: number
  color: string
  data: { week: string; price: number }[]
}

export interface CountryIndexData {
  id: string
  name: string
  flagUrl: string
  source: string
  description: string
  species: SpeciesData[]
}

const COUNTRIES_MARKET_DATA: CountryIndexData[] = [
  {
    id: 'eu',
    name: 'All Europe',
    flagUrl: 'https://flagcdn.com/w40/eu.png',
    source: 'EU Spot Market Average',
    description: 'Weekly benchmark prices · Updated every Monday',
    species: [
      {
        id: 'salmon',
        label: 'Atlantic Salmon',
        currency: 'EUR',
        unit: 'kg',
        latest: 7.40,
        weekHigh: 8.10,
        weekLow: 6.80,
        change: 2.3,
        color: '#f97316',
        data: [
          { week: 'W1', price: 6.90 },
          { week: 'W2', price: 7.05 },
          { week: 'W3', price: 6.95 },
          { week: 'W4', price: 7.15 },
          { week: 'W5', price: 7.30 },
          { week: 'W6', price: 7.10 },
          { week: 'W7', price: 7.25 },
          { week: 'W8', price: 7.40 },
        ],
      },
      {
        id: 'cod',
        label: 'Atlantic Cod',
        currency: 'EUR',
        unit: 'kg',
        latest: 4.20,
        weekHigh: 4.90,
        weekLow: 3.70,
        change: -1.1,
        color: '#3b82f6',
        data: [
          { week: 'W1', price: 4.55 },
          { week: 'W2', price: 4.40 },
          { week: 'W3', price: 4.50 },
          { week: 'W4', price: 4.30 },
          { week: 'W5', price: 4.45 },
          { week: 'W6', price: 4.35 },
          { week: 'W7', price: 4.25 },
          { week: 'W8', price: 4.20 },
        ],
      },
      {
        id: 'shrimp',
        label: 'Pacific Shrimp',
        currency: 'EUR',
        unit: 'kg',
        latest: 5.80,
        weekHigh: 6.50,
        weekLow: 5.10,
        change: 0.8,
        color: '#8b5cf6',
        data: [
          { week: 'W1', price: 5.40 },
          { week: 'W2', price: 5.55 },
          { week: 'W3', price: 5.60 },
          { week: 'W4', price: 5.50 },
          { week: 'W5', price: 5.65 },
          { week: 'W6', price: 5.75 },
          { week: 'W7', price: 5.70 },
          { week: 'W8', price: 5.80 },
        ],
      },
      {
        id: 'tuna',
        label: 'Yellowfin Tuna',
        currency: 'EUR',
        unit: 'kg',
        latest: 9.20,
        weekHigh: 10.10,
        weekLow: 8.50,
        change: 1.4,
        color: '#10b981',
        data: [
          { week: 'W1', price: 8.60 },
          { week: 'W2', price: 8.80 },
          { week: 'W3', price: 8.75 },
          { week: 'W4', price: 9.00 },
          { week: 'W5', price: 8.90 },
          { week: 'W6', price: 9.05 },
          { week: 'W7', price: 9.10 },
          { week: 'W8', price: 9.20 },
        ],
      },
    ]
  },
  {
    id: 'be',
    name: 'Belgium',
    flagUrl: 'https://flagcdn.com/w40/be.png',
    source: 'Zeebrugge & Ostend Auction',
    description: 'Belgium spot market auction & wholesale benchmark prices',
    species: [
      {
        id: 'salmon',
        label: 'Atlantic Salmon',
        currency: 'EUR',
        unit: 'kg',
        latest: 7.65,
        weekHigh: 8.25,
        weekLow: 7.10,
        change: 1.8,
        color: '#f97316',
        data: [
          { week: 'W1', price: 7.15 },
          { week: 'W2', price: 7.25 },
          { week: 'W3', price: 7.30 },
          { week: 'W4', price: 7.45 },
          { week: 'W5', price: 7.60 },
          { week: 'W6', price: 7.50 },
          { week: 'W7', price: 7.55 },
          { week: 'W8', price: 7.65 },
        ],
      },
      {
        id: 'cod',
        label: 'Atlantic Cod',
        currency: 'EUR',
        unit: 'kg',
        latest: 4.45,
        weekHigh: 5.10,
        weekLow: 4.00,
        change: -0.5,
        color: '#3b82f6',
        data: [
          { week: 'W1', price: 4.80 },
          { week: 'W2', price: 4.70 },
          { week: 'W3', price: 4.65 },
          { week: 'W4', price: 4.60 },
          { week: 'W5', price: 4.55 },
          { week: 'W6', price: 4.50 },
          { week: 'W7', price: 4.48 },
          { week: 'W8', price: 4.45 },
        ],
      },
      {
        id: 'shrimp',
        label: 'Pacific Shrimp',
        currency: 'EUR',
        unit: 'kg',
        latest: 6.20,
        weekHigh: 6.80,
        weekLow: 5.50,
        change: 1.2,
        color: '#8b5cf6',
        data: [
          { week: 'W1', price: 5.80 },
          { week: 'W2', price: 5.90 },
          { week: 'W3', price: 5.95 },
          { week: 'W4', price: 6.05 },
          { week: 'W5', price: 6.10 },
          { week: 'W6', price: 6.15 },
          { week: 'W7', price: 6.18 },
          { week: 'W8', price: 6.20 },
        ],
      },
      {
        id: 'tuna',
        label: 'Yellowfin Tuna',
        currency: 'EUR',
        unit: 'kg',
        latest: 9.60,
        weekHigh: 10.40,
        weekLow: 8.90,
        change: 2.1,
        color: '#10b981',
        data: [
          { week: 'W1', price: 8.95 },
          { week: 'W2', price: 9.10 },
          { week: 'W3', price: 9.25 },
          { week: 'W4', price: 9.35 },
          { week: 'W5', price: 9.45 },
          { week: 'W6', price: 9.50 },
          { week: 'W7', price: 9.55 },
          { week: 'W8', price: 9.60 },
        ],
      },
    ]
  },
  {
    id: 'nl',
    name: 'Netherlands',
    flagUrl: 'https://flagcdn.com/w40/nl.png',
    source: 'Urk & IJmuiden Fish Auction',
    description: 'Dutch seafood market indices from Urk & IJmuiden trade centers',
    species: [
      {
        id: 'salmon',
        label: 'Atlantic Salmon',
        currency: 'EUR',
        unit: 'kg',
        latest: 7.35,
        weekHigh: 7.95,
        weekLow: 6.75,
        change: 2.5,
        color: '#f97316',
        data: [
          { week: 'W1', price: 6.80 },
          { week: 'W2', price: 6.95 },
          { week: 'W3', price: 6.90 },
          { week: 'W4', price: 7.10 },
          { week: 'W5', price: 7.25 },
          { week: 'W6', price: 7.15 },
          { week: 'W7', price: 7.25 },
          { week: 'W8', price: 7.35 },
        ],
      },
      {
        id: 'cod',
        label: 'Atlantic Cod',
        currency: 'EUR',
        unit: 'kg',
        latest: 4.15,
        weekHigh: 4.80,
        weekLow: 3.65,
        change: -1.4,
        color: '#3b82f6',
        data: [
          { week: 'W1', price: 4.50 },
          { week: 'W2', price: 4.40 },
          { week: 'W3', price: 4.45 },
          { week: 'W4', price: 4.30 },
          { week: 'W5', price: 4.35 },
          { week: 'W6', price: 4.28 },
          { week: 'W7', price: 4.20 },
          { week: 'W8', price: 4.15 },
        ],
      },
      {
        id: 'shrimp',
        label: 'Pacific Shrimp',
        currency: 'EUR',
        unit: 'kg',
        latest: 5.90,
        weekHigh: 6.40,
        weekLow: 5.20,
        change: 0.9,
        color: '#8b5cf6',
        data: [
          { week: 'W1', price: 5.50 },
          { week: 'W2', price: 5.60 },
          { week: 'W3', price: 5.68 },
          { week: 'W4', price: 5.72 },
          { week: 'W5', price: 5.80 },
          { week: 'W6', price: 5.82 },
          { week: 'W7', price: 5.86 },
          { week: 'W8', price: 5.90 },
        ],
      },
      {
        id: 'tuna',
        label: 'Yellowfin Tuna',
        currency: 'EUR',
        unit: 'kg',
        latest: 9.15,
        weekHigh: 9.95,
        weekLow: 8.45,
        change: 1.5,
        color: '#10b981',
        data: [
          { week: 'W1', price: 8.55 },
          { week: 'W2', price: 8.70 },
          { week: 'W3', price: 8.75 },
          { week: 'W4', price: 8.95 },
          { week: 'W5', price: 8.90 },
          { week: 'W6', price: 9.02 },
          { week: 'W7', price: 9.08 },
          { week: 'W8', price: 9.15 },
        ],
      },
    ]
  },
  {
    id: 'de',
    name: 'Germany',
    flagUrl: 'https://flagcdn.com/w40/de.png',
    source: 'Bremerhaven & Hamburg Exchange',
    description: 'German seafood trade index from Bremerhaven and Hamburg port hubs',
    species: [
      {
        id: 'salmon',
        label: 'Atlantic Salmon',
        currency: 'EUR',
        unit: 'kg',
        latest: 7.55,
        weekHigh: 8.15,
        weekLow: 6.90,
        change: 2.0,
        color: '#f97316',
        data: [
          { week: 'W1', price: 7.00 },
          { week: 'W2', price: 7.15 },
          { week: 'W3', price: 7.10 },
          { week: 'W4', price: 7.30 },
          { week: 'W5', price: 7.42 },
          { week: 'W6', price: 7.35 },
          { week: 'W7', price: 7.48 },
          { week: 'W8', price: 7.55 },
        ],
      },
      {
        id: 'cod',
        label: 'Atlantic Cod',
        currency: 'EUR',
        unit: 'kg',
        latest: 4.30,
        weekHigh: 4.95,
        weekLow: 3.80,
        change: -0.8,
        color: '#3b82f6',
        data: [
          { week: 'W1', price: 4.60 },
          { week: 'W2', price: 4.50 },
          { week: 'W3', price: 4.52 },
          { week: 'W4', price: 4.40 },
          { week: 'W5', price: 4.45 },
          { week: 'W6', price: 4.38 },
          { week: 'W7', price: 4.32 },
          { week: 'W8', price: 4.30 },
        ],
      },
      {
        id: 'shrimp',
        label: 'Pacific Shrimp',
        currency: 'EUR',
        unit: 'kg',
        latest: 6.15,
        weekHigh: 6.75,
        weekLow: 5.40,
        change: 1.5,
        color: '#8b5cf6',
        data: [
          { week: 'W1', price: 5.70 },
          { week: 'W2', price: 5.82 },
          { week: 'W3', price: 5.88 },
          { week: 'W4', price: 5.95 },
          { week: 'W5', price: 6.02 },
          { week: 'W6', price: 6.08 },
          { week: 'W7', price: 6.10 },
          { week: 'W8', price: 6.15 },
        ],
      },
      {
        id: 'tuna',
        label: 'Yellowfin Tuna',
        currency: 'EUR',
        unit: 'kg',
        latest: 9.40,
        weekHigh: 10.20,
        weekLow: 8.70,
        change: 1.8,
        color: '#10b981',
        data: [
          { week: 'W1', price: 8.80 },
          { week: 'W2', price: 8.95 },
          { week: 'W3', price: 9.05 },
          { week: 'W4', price: 9.18 },
          { week: 'W5', price: 9.25 },
          { week: 'W6', price: 9.30 },
          { week: 'W7', price: 9.35 },
          { week: 'W8', price: 9.40 },
        ],
      },
    ]
  }
]

import { LiveCountryMarketData, LiveSpeciesIndex } from '@/lib/data/market-data'

export interface SpeciesData {
  id: string
  label: string
  currency: string
  unit: string
  latest: number
  weekHigh: number
  weekLow: number
  change: number
  color: string
  data: { week: string; price: number }[]
}

export interface CountryIndexData {
  id: string
  name: string
  flagUrl: string
  source: string
  description: string
  species: SpeciesData[]
}

// Custom tooltip
function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-slate-800 dark:text-slate-100">
        {currency === 'EUR' ? '€' : '$'} {payload[0].value.toFixed(2)} / kg
      </p>
    </div>
  )
}

interface SeafoodIndexCardProps {
  initialCountryData?: LiveCountryMarketData[]
}

export function SeafoodIndexCard({ initialCountryData }: SeafoodIndexCardProps) {
  const countryList = (initialCountryData && initialCountryData.length > 0) ? initialCountryData : COUNTRIES_MARKET_DATA
  const [selectedCountryId, setSelectedCountryId] = useState(countryList[0]?.id || 'eu')
  
  const currentCountry = countryList.find(c => c.id === selectedCountryId) || countryList[0]
  const [activeSpeciesId, setActiveSpeciesId] = useState(currentCountry?.species[0]?.id || 'yellowfin-tuna')
  const [isMounted, setIsMounted] = useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-switch active species if current country doesn't have it
  const activeSpecies = currentCountry?.species.find(s => s.id === activeSpeciesId) || currentCountry?.species[0]
  const isUp = (activeSpecies?.change ?? 0) >= 0

  if (!currentCountry || !activeSpecies) return null

  return (
    <section id="indexes" className="py-10 px-8 border border-border bg-background text-foreground rounded-2xl shadow-sm">

      {/* Sleek, Clean Header with Integrated Country Selector & Species Selector */}
      <div className="space-y-6 mb-8">
        
        {/* Top Row: Title + Country Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {currentCountry.id === 'eu' ? 'European Seafood Index' : `${currentCountry.name} Seafood Index`}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {currentCountry.description}
            </p>
          </div>

          {/* Clean Country Selector Tabs with Real Flags */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 self-start lg:self-auto">
            {countryList.map((c) => {
              const isSelected = selectedCountryId === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCountryId(c.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#022B96] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <img
                    src={c.flagUrl}
                    alt={c.name}
                    className="w-4 h-3 object-cover rounded-xs shadow-2xs"
                  />
                  <span>{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom Row: Species Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex flex-wrap gap-2">
            {currentCountry.species.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSpeciesId(s.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                  activeSpeciesId === s.id
                    ? 'bg-[#022B96] text-white border-[#022B96] shadow-xs'
                    : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Benchmark Source: <strong className="text-slate-700 dark:text-slate-300">{currentCountry.source}</strong>
          </span>
        </div>

      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left stats */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Current index price ({currentCountry.name})
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black tracking-tight text-foreground">
                {activeSpecies.currency === 'EUR' ? 'EUR' : '$'} {activeSpecies.latest.toFixed(2)}
              </span>
              <span className="text-sm font-bold" style={{ color: activeSpecies.color }}>
                / {activeSpecies.unit}
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${
                isUp
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
              }`}
            >
              {isUp ? '▲' : '▼'} {Math.abs(activeSpecies.change)}% this week
            </span>
          </div>

          <hr className="border-border" />

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Weekly high',  value: `${activeSpecies.currency === 'EUR' ? 'EUR' : '$'} ${activeSpecies.weekHigh.toFixed(2)}` },
              { label: 'Weekly low',   value: `${activeSpecies.currency === 'EUR' ? 'EUR' : '$'} ${activeSpecies.weekLow.toFixed(2)}` },
              { label: 'Source',       value: currentCountry.source },
              { label: 'Components',   value: `${currentCountry.species.length} species` },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-0.5">
                <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                <p className="text-sm font-bold text-foreground truncate" title={value}>{value}</p>
              </div>
            ))}
          </div>

          {/* Color legend chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {currentCountry.species.map(s => (
              <span key={s.id} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Interactive Recharts Graph */}
        <div className="lg:col-span-8 w-full" style={{ height: 260 }}>
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeSpecies.data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${selectedCountryId}-${activeSpecies.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={activeSpecies.color} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={activeSpecies.color} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={['dataMin - 0.3', 'dataMax + 0.3']}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `€${v.toFixed(1)}`}
                />
                <Tooltip content={<CustomTooltip currency={activeSpecies.currency} />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={activeSpecies.color}
                  strokeWidth={2.5}
                  fill={`url(#grad-${selectedCountryId}-${activeSpecies.id})`}
                  dot={{ r: 3.5, fill: activeSpecies.color, strokeWidth: 0 }}
                  activeDot={{ r: 5.5, fill: activeSpecies.color, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-100/50 dark:bg-slate-800/30 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400">
              Loading graph...
            </div>
          )}
        </div>

      </div>
    </section>
  )
}

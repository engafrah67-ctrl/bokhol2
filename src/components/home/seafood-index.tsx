'use client'

import React, { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
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

// Custom tooltip for chart hover
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
  const countryList = initialCountryData && initialCountryData.length > 0 ? initialCountryData : []
  const [selectedCountryId, setSelectedCountryId] = useState(countryList[0]?.id || 'eu')
  const [activeSpeciesId, setActiveSpeciesId] = useState<string>('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Find active country or fallback to first
  const currentCountry = countryList.find(c => c.id === selectedCountryId) || countryList[0]
  const currentSpeciesList = currentCountry?.species || []

  // Update activeSpeciesId if current active is invalid or empty
  useEffect(() => {
    if (currentSpeciesList.length > 0) {
      if (!currentSpeciesList.some(s => s.id === activeSpeciesId)) {
        setActiveSpeciesId(currentSpeciesList[0].id)
      }
    }
  }, [selectedCountryId, currentSpeciesList, activeSpeciesId])

  const activeSpecies = currentSpeciesList.find(s => s.id === activeSpeciesId) || currentSpeciesList[0]
  const isUp = (activeSpecies?.change ?? 0) >= 0

  if (!currentCountry || currentSpeciesList.length === 0 || !activeSpecies) {
    return (
      <section id="indexes" className="py-12 px-8 border border-border bg-background text-foreground rounded-2xl shadow-sm text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="inline-flex p-3 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">European Seafood Index</h2>
          <p className="text-sm text-muted-foreground">
            No active supplier listings available yet. As suppliers publish active products, real-time pricing benchmarks and price trends will display here automatically.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="indexes" className="py-10 px-8 border border-border bg-background text-foreground rounded-2xl shadow-sm">
      {/* Header with Integrated Country Selector & Species Selector */}
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

          {/* Country Selector Tabs */}
          {countryList.length > 1 && (
            <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 self-start lg:self-auto">
              {countryList.map((c) => {
                const isSelected = (currentCountry?.id || selectedCountryId) === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCountryId(c.id)
                      if (c.species.length > 0) {
                        setActiveSpeciesId(c.species[0].id)
                      }
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#022B96] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white/60 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {c.flagUrl && (
                      <img
                        src={c.flagUrl}
                        alt={c.name}
                        className="w-4 h-3 object-cover rounded-xs shadow-2xs"
                      />
                    )}
                    <span>{c.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom Row: Species Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex flex-wrap gap-2">
            {currentSpeciesList.map(s => {
              const isSelected = activeSpecies.id === s.id
              const count = (s as any).suppliersCount || 0
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSpeciesId(s.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#022B96] text-white border-[#022B96] shadow-xs'
                      : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {s.label}
                  {count > 0 && (
                    <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" title={`${count} active listing${count > 1 ? 's' : ''}`} />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            {(activeSpecies as any).suppliersCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live · {(activeSpecies as any).suppliersCount} offer{(activeSpecies as any).suppliersCount !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                Market Index
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium">
              Source: <strong className="text-slate-700 dark:text-slate-300">{currentCountry.source}</strong>
            </span>
          </div>
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
                {activeSpecies.currency === 'EUR' ? '€' : '$'} {activeSpecies.latest.toFixed(2)}
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
            {activeSpecies.weekHigh === activeSpecies.weekLow ? (
              <>
                <div className="space-y-0.5 col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground">Supplier price</p>
                  <p className="text-sm font-bold text-foreground">
                    {activeSpecies.currency === 'EUR' ? '€' : '$'} {activeSpecies.weekHigh.toFixed(2)}
                    <span className="ml-2 text-[11px] font-normal text-muted-foreground">(Single listing)</span>
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">Source</p>
                  <p className="text-sm font-bold text-foreground truncate" title={currentCountry.source}>{currentCountry.source}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">Products listed</p>
                  <p className="text-sm font-bold text-foreground">{currentSpeciesList.length} active</p>
                </div>
              </>
            ) : (
              [
                { label: 'Weekly high', value: `${activeSpecies.currency === 'EUR' ? '€' : '$'} ${activeSpecies.weekHigh.toFixed(2)}` },
                { label: 'Weekly low',  value: `${activeSpecies.currency === 'EUR' ? '€' : '$'} ${activeSpecies.weekLow.toFixed(2)}` },
                { label: 'Source',      value: currentCountry.source },
                { label: 'Products listed', value: `${currentSpeciesList.length} active` },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <p className="text-sm font-bold text-foreground truncate" title={value}>{value}</p>
                </div>
              ))
            )}
          </div>

          {/* Color legend chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {currentSpeciesList.map(s => (
              <span key={s.id} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Interactive Recharts Graph */}
        <div className="lg:col-span-8 w-full" style={{ height: 260 }}>
          {isMounted && activeSpecies.data && activeSpecies.data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeSpecies.data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${currentCountry.id}-${activeSpecies.id}`} x1="0" y1="0" x2="0" y2="1">
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
                  fill={`url(#grad-${currentCountry.id}-${activeSpecies.id})`}
                  dot={{ r: 3.5, fill: activeSpecies.color, strokeWidth: 0 }}
                  activeDot={{ r: 5.5, fill: activeSpecies.color, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-100/50 dark:bg-slate-800/30 rounded-xl flex items-center justify-center text-xs text-muted-foreground">
              {isMounted ? 'No trend data available' : 'Loading graph...'}
            </div>
          )}
        </div>

      </div>
    </section>
  )
}

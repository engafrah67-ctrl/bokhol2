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

// Expanded static fallback with all benchmark species (used when live data isn't available)
const COUNTRIES_MARKET_DATA: CountryIndexData[] = [
  {
    id: 'eu',
    name: 'All Europe',
    flagUrl: 'https://flagcdn.com/w40/eu.png',
    source: 'EU Spot Market Average',
    description: 'Weekly benchmark prices · Updated every Monday',
    species: [
      { id: 'atlantic-salmon', label: 'Atlantic Salmon', currency: 'EUR', unit: 'kg', latest: 7.85, weekHigh: 8.40, weekLow: 7.20, change: 2.3, color: '#f97316', data: [{ week: 'W1', price: 7.30 }, { week: 'W2', price: 7.45 }, { week: 'W3', price: 7.40 }, { week: 'W4', price: 7.60 }, { week: 'W5', price: 7.72 }, { week: 'W6', price: 7.65 }, { week: 'W7', price: 7.75 }, { week: 'W8', price: 7.85 }] },
      { id: 'atlantic-cod', label: 'Atlantic Cod', currency: 'EUR', unit: 'kg', latest: 4.60, weekHigh: 5.10, weekLow: 4.10, change: -1.1, color: '#3b82f6', data: [{ week: 'W1', price: 4.95 }, { week: 'W2', price: 4.80 }, { week: 'W3', price: 4.85 }, { week: 'W4', price: 4.70 }, { week: 'W5', price: 4.75 }, { week: 'W6', price: 4.65 }, { week: 'W7', price: 4.62 }, { week: 'W8', price: 4.60 }] },
      { id: 'yellowfin-tuna', label: 'Yellowfin Tuna', currency: 'EUR', unit: 'kg', latest: 9.20, weekHigh: 9.80, weekLow: 8.40, change: 1.8, color: '#0284c7', data: [{ week: 'W1', price: 8.60 }, { week: 'W2', price: 8.80 }, { week: 'W3', price: 8.75 }, { week: 'W4', price: 9.00 }, { week: 'W5', price: 8.90 }, { week: 'W6', price: 9.05 }, { week: 'W7', price: 9.12 }, { week: 'W8', price: 9.20 }] },
      { id: 'bluefin-tuna', label: 'Bluefin Tuna', currency: 'EUR', unit: 'kg', latest: 42.00, weekHigh: 46.50, weekLow: 39.00, change: 2.1, color: '#1d4ed8', data: [{ week: 'W1', price: 39.50 }, { week: 'W2', price: 40.20 }, { week: 'W3', price: 40.80 }, { week: 'W4', price: 41.50 }, { week: 'W5', price: 41.00 }, { week: 'W6', price: 41.80 }, { week: 'W7', price: 41.90 }, { week: 'W8', price: 42.00 }] },
      { id: 'mackerel', label: 'Mackerel', currency: 'EUR', unit: 'kg', latest: 2.35, weekHigh: 2.70, weekLow: 2.10, change: 0.5, color: '#059669', data: [{ week: 'W1', price: 2.20 }, { week: 'W2', price: 2.25 }, { week: 'W3', price: 2.22 }, { week: 'W4', price: 2.28 }, { week: 'W5', price: 2.30 }, { week: 'W6', price: 2.32 }, { week: 'W7', price: 2.33 }, { week: 'W8', price: 2.35 }] },
      { id: 'shrimp', label: 'Shrimp', currency: 'EUR', unit: 'kg', latest: 6.40, weekHigh: 7.10, weekLow: 5.80, change: 1.2, color: '#8b5cf6', data: [{ week: 'W1', price: 5.90 }, { week: 'W2', price: 6.00 }, { week: 'W3', price: 6.05 }, { week: 'W4', price: 6.15 }, { week: 'W5', price: 6.20 }, { week: 'W6', price: 6.28 }, { week: 'W7', price: 6.35 }, { week: 'W8', price: 6.40 }] },
      { id: 'sea-bass', label: 'Sea Bass', currency: 'EUR', unit: 'kg', latest: 6.90, weekHigh: 7.40, weekLow: 6.30, change: -0.4, color: '#0d9488', data: [{ week: 'W1', price: 7.10 }, { week: 'W2', price: 7.05 }, { week: 'W3', price: 7.00 }, { week: 'W4', price: 6.95 }, { week: 'W5', price: 6.92 }, { week: 'W6', price: 6.88 }, { week: 'W7', price: 6.90 }, { week: 'W8', price: 6.90 }] },
      { id: 'sea-bream', label: 'Sea Bream', currency: 'EUR', unit: 'kg', latest: 6.50, weekHigh: 7.00, weekLow: 5.90, change: 0.7, color: '#0891b2', data: [{ week: 'W1', price: 6.10 }, { week: 'W2', price: 6.18 }, { week: 'W3', price: 6.22 }, { week: 'W4', price: 6.30 }, { week: 'W5', price: 6.35 }, { week: 'W6', price: 6.40 }, { week: 'W7', price: 6.45 }, { week: 'W8', price: 6.50 }] },
      { id: 'haddock', label: 'Haddock', currency: 'EUR', unit: 'kg', latest: 3.80, weekHigh: 4.40, weekLow: 3.20, change: 0.3, color: '#7c3aed', data: [{ week: 'W1', price: 3.60 }, { week: 'W2', price: 3.65 }, { week: 'W3', price: 3.68 }, { week: 'W4', price: 3.70 }, { week: 'W5', price: 3.73 }, { week: 'W6', price: 3.76 }, { week: 'W7', price: 3.78 }, { week: 'W8', price: 3.80 }] },
    ],
  },
  {
    id: 'nl',
    name: 'Netherlands',
    flagUrl: 'https://flagcdn.com/w40/nl.png',
    source: 'Urk & IJmuiden Fish Auction',
    description: 'Dutch seafood market indices from Urk & IJmuiden trade centers',
    species: [
      { id: 'atlantic-salmon', label: 'Atlantic Salmon', currency: 'EUR', unit: 'kg', latest: 7.69, weekHigh: 8.23, weekLow: 7.06, change: 2.5, color: '#f97316', data: [{ week: 'W1', price: 7.16 }, { week: 'W2', price: 7.29 }, { week: 'W3', price: 7.25 }, { week: 'W4', price: 7.45 }, { week: 'W5', price: 7.56 }, { week: 'W6', price: 7.51 }, { week: 'W7', price: 7.60 }, { week: 'W8', price: 7.69 }] },
      { id: 'atlantic-cod', label: 'Atlantic Cod', currency: 'EUR', unit: 'kg', latest: 4.51, weekHigh: 5.00, weekLow: 4.02, change: -1.4, color: '#3b82f6', data: [{ week: 'W1', price: 4.85 }, { week: 'W2', price: 4.70 }, { week: 'W3', price: 4.75 }, { week: 'W4', price: 4.61 }, { week: 'W5', price: 4.65 }, { week: 'W6', price: 4.55 }, { week: 'W7', price: 4.52 }, { week: 'W8', price: 4.51 }] },
      { id: 'yellowfin-tuna', label: 'Yellowfin Tuna', currency: 'EUR', unit: 'kg', latest: 9.02, weekHigh: 9.61, weekLow: 8.23, change: 1.5, color: '#0284c7', data: [{ week: 'W1', price: 8.42 }, { week: 'W2', price: 8.61 }, { week: 'W3', price: 8.58 }, { week: 'W4', price: 8.82 }, { week: 'W5', price: 8.72 }, { week: 'W6', price: 8.87 }, { week: 'W7', price: 8.95 }, { week: 'W8', price: 9.02 }] },
      { id: 'mackerel', label: 'Mackerel', currency: 'EUR', unit: 'kg', latest: 2.30, weekHigh: 2.65, weekLow: 2.06, change: 0.5, color: '#059669', data: [{ week: 'W1', price: 2.15 }, { week: 'W2', price: 2.20 }, { week: 'W3', price: 2.18 }, { week: 'W4', price: 2.22 }, { week: 'W5', price: 2.25 }, { week: 'W6', price: 2.27 }, { week: 'W7', price: 2.28 }, { week: 'W8', price: 2.30 }] },
      { id: 'shrimp', label: 'Shrimp', currency: 'EUR', unit: 'kg', latest: 6.27, weekHigh: 6.96, weekLow: 5.68, change: 1.2, color: '#8b5cf6', data: [{ week: 'W1', price: 5.78 }, { week: 'W2', price: 5.88 }, { week: 'W3', price: 5.93 }, { week: 'W4', price: 6.03 }, { week: 'W5', price: 6.08 }, { week: 'W6', price: 6.15 }, { week: 'W7', price: 6.22 }, { week: 'W8', price: 6.27 }] },
      { id: 'sea-bass', label: 'Sea Bass', currency: 'EUR', unit: 'kg', latest: 6.76, weekHigh: 7.25, weekLow: 6.17, change: -0.4, color: '#0d9488', data: [{ week: 'W1', price: 6.96 }, { week: 'W2', price: 6.91 }, { week: 'W3', price: 6.86 }, { week: 'W4', price: 6.81 }, { week: 'W5', price: 6.78 }, { week: 'W6', price: 6.74 }, { week: 'W7', price: 6.76 }, { week: 'W8', price: 6.76 }] },
    ],
  },
  {
    id: 'de',
    name: 'Germany',
    flagUrl: 'https://flagcdn.com/w40/de.png',
    source: 'Bremerhaven & Hamburg Exchange',
    description: 'German seafood trade index from Bremerhaven and Hamburg port hubs',
    species: [
      { id: 'atlantic-salmon', label: 'Atlantic Salmon', currency: 'EUR', unit: 'kg', latest: 8.09, weekHigh: 8.65, weekLow: 7.42, change: 2.0, color: '#f97316', data: [{ week: 'W1', price: 7.51 }, { week: 'W2', price: 7.67 }, { week: 'W3', price: 7.62 }, { week: 'W4', price: 7.83 }, { week: 'W5', price: 7.95 }, { week: 'W6', price: 7.88 }, { week: 'W7', price: 7.99 }, { week: 'W8', price: 8.09 }] },
      { id: 'atlantic-cod', label: 'Atlantic Cod', currency: 'EUR', unit: 'kg', latest: 4.74, weekHigh: 5.25, weekLow: 4.22, change: -0.8, color: '#3b82f6', data: [{ week: 'W1', price: 5.10 }, { week: 'W2', price: 4.99 }, { week: 'W3', price: 5.00 }, { week: 'W4', price: 4.87 }, { week: 'W5', price: 4.88 }, { week: 'W6', price: 4.80 }, { week: 'W7', price: 4.76 }, { week: 'W8', price: 4.74 }] },
      { id: 'yellowfin-tuna', label: 'Yellowfin Tuna', currency: 'EUR', unit: 'kg', latest: 9.48, weekHigh: 10.10, weekLow: 8.65, change: 1.8, color: '#0284c7', data: [{ week: 'W1', price: 8.86 }, { week: 'W2', price: 9.02 }, { week: 'W3', price: 9.10 }, { week: 'W4', price: 9.24 }, { week: 'W5', price: 9.31 }, { week: 'W6', price: 9.37 }, { week: 'W7', price: 9.42 }, { week: 'W8', price: 9.48 }] },
      { id: 'mackerel', label: 'Mackerel', currency: 'EUR', unit: 'kg', latest: 2.42, weekHigh: 2.78, weekLow: 2.16, change: 0.5, color: '#059669', data: [{ week: 'W1', price: 2.27 }, { week: 'W2', price: 2.31 }, { week: 'W3', price: 2.29 }, { week: 'W4', price: 2.35 }, { week: 'W5', price: 2.37 }, { week: 'W6', price: 2.39 }, { week: 'W7', price: 2.41 }, { week: 'W8', price: 2.42 }] },
      { id: 'shrimp', label: 'Shrimp', currency: 'EUR', unit: 'kg', latest: 6.59, weekHigh: 7.31, weekLow: 5.97, change: 1.2, color: '#8b5cf6', data: [{ week: 'W1', price: 6.08 }, { week: 'W2', price: 6.18 }, { week: 'W3', price: 6.22 }, { week: 'W4', price: 6.33 }, { week: 'W5', price: 6.38 }, { week: 'W6', price: 6.46 }, { week: 'W7', price: 6.53 }, { week: 'W8', price: 6.59 }] },
    ],
  },
  {
    id: 'be',
    name: 'Belgium',
    flagUrl: 'https://flagcdn.com/w40/be.png',
    source: 'Zeebrugge & Ostend Auction',
    description: 'Belgium spot market auction & wholesale benchmark prices',
    species: [
      { id: 'atlantic-salmon', label: 'Atlantic Salmon', currency: 'EUR', unit: 'kg', latest: 7.93, weekHigh: 8.48, weekLow: 7.27, change: 1.8, color: '#f97316', data: [{ week: 'W1', price: 7.39 }, { week: 'W2', price: 7.50 }, { week: 'W3', price: 7.55 }, { week: 'W4', price: 7.70 }, { week: 'W5', price: 7.83 }, { week: 'W6', price: 7.76 }, { week: 'W7', price: 7.84 }, { week: 'W8', price: 7.93 }] },
      { id: 'atlantic-cod', label: 'Atlantic Cod', currency: 'EUR', unit: 'kg', latest: 4.65, weekHigh: 5.15, weekLow: 4.14, change: -0.5, color: '#3b82f6', data: [{ week: 'W1', price: 4.95 }, { week: 'W2', price: 4.84 }, { week: 'W3', price: 4.80 }, { week: 'W4', price: 4.74 }, { week: 'W5', price: 4.71 }, { week: 'W6', price: 4.67 }, { week: 'W7', price: 4.66 }, { week: 'W8', price: 4.65 }] },
      { id: 'yellowfin-tuna', label: 'Yellowfin Tuna', currency: 'EUR', unit: 'kg', latest: 9.29, weekHigh: 9.89, weekLow: 8.48, change: 2.1, color: '#0284c7', data: [{ week: 'W1', price: 8.68 }, { week: 'W2', price: 8.85 }, { week: 'W3', price: 8.99 }, { week: 'W4', price: 9.10 }, { week: 'W5', price: 9.18 }, { week: 'W6', price: 9.22 }, { week: 'W7', price: 9.26 }, { week: 'W8', price: 9.29 }] },
      { id: 'mackerel', label: 'Mackerel', currency: 'EUR', unit: 'kg', latest: 2.38, weekHigh: 2.74, weekLow: 2.12, change: 0.5, color: '#059669', data: [{ week: 'W1', price: 2.22 }, { week: 'W2', price: 2.27 }, { week: 'W3', price: 2.24 }, { week: 'W4', price: 2.30 }, { week: 'W5', price: 2.33 }, { week: 'W6', price: 2.35 }, { week: 'W7', price: 2.36 }, { week: 'W8', price: 2.38 }] },
      { id: 'shrimp', label: 'Shrimp', currency: 'EUR', unit: 'kg', latest: 6.46, weekHigh: 7.17, weekLow: 5.86, change: 1.2, color: '#8b5cf6', data: [{ week: 'W1', price: 5.96 }, { week: 'W2', price: 6.06 }, { week: 'W3', price: 6.11 }, { week: 'W4', price: 6.21 }, { week: 'W5', price: 6.26 }, { week: 'W6', price: 6.34 }, { week: 'W7', price: 6.40 }, { week: 'W8', price: 6.46 }] },
    ],
  },
]

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
  // Always prefer real Supabase data; only use static fallback if nothing arrived from server
  const countryList = (initialCountryData && initialCountryData.length > 0) ? initialCountryData : COUNTRIES_MARKET_DATA
  const [selectedCountryId, setSelectedCountryId] = useState(countryList[0]?.id || 'eu')
  
  const currentCountry = countryList.find(c => c.id === selectedCountryId) || countryList[0]
  const [activeSpeciesId, setActiveSpeciesId] = useState(currentCountry?.species[0]?.id || 'yellowfin-tuna')
  const [isMounted, setIsMounted] = useState(false)
  // Track whether we have real Supabase data
  const hasRealData = !!(initialCountryData && initialCountryData.length > 0)

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
            {currentCountry.species.map(s => {
              // A species with suppliersCount > 0 has real offer data
              const isLive = hasRealData && (s as any).suppliersCount > 0
              return (
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
                  {isLive && (
                    <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" title="Live data" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            {hasRealData && activeSpecies && (activeSpecies as any).suppliersCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live · {(activeSpecies as any).suppliersCount} offer{(activeSpecies as any).suppliersCount !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-full">
                Benchmark rate
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
            {activeSpecies.weekHigh === activeSpecies.weekLow ? (
              // Single supplier — only one price point, show it honestly
              <>
                <div className="space-y-0.5 col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground">Supplier price</p>
                  <p className="text-sm font-bold text-foreground">
                    {activeSpecies.currency === 'EUR' ? 'EUR' : '$'} {activeSpecies.weekHigh.toFixed(2)}
                    <span className="ml-2 text-[11px] font-normal text-amber-600 dark:text-amber-400">(1 offer — no range yet)</span>
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">Source</p>
                  <p className="text-sm font-bold text-foreground truncate" title={currentCountry.source}>{currentCountry.source}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">Components</p>
                  <p className="text-sm font-bold text-foreground">{currentCountry.species.length} species</p>
                </div>
              </>
            ) : (
              [
                { label: 'Weekly high', value: `${activeSpecies.currency === 'EUR' ? 'EUR' : '$'} ${activeSpecies.weekHigh.toFixed(2)}` },
                { label: 'Weekly low',  value: `${activeSpecies.currency === 'EUR' ? 'EUR' : '$'} ${activeSpecies.weekLow.toFixed(2)}` },
                { label: 'Source',      value: currentCountry.source },
                { label: 'Components',  value: `${currentCountry.species.length} species` },
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

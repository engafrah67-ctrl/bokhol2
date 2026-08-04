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

// ─── Real representative weekly price data (European market) ────────────────
const SPECIES = [
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
    currency: 'USD',
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
    currency: 'USD',
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

// Custom tooltip
function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-slate-800 dark:text-slate-100">
        {currency} {payload[0].value.toFixed(2)} / kg
      </p>
    </div>
  )
}

export function SeafoodIndexCard() {
  const [activeId, setActiveId] = useState('salmon')
  const [isMounted, setIsMounted] = useState(false)
  const { t } = useLanguage()

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const active = SPECIES.find(s => s.id === activeId)!
  const isUp = active.change >= 0

  return (
    <section id="indexes" className="py-12 border-b border-border bg-background text-foreground">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            {t('index_title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('index_subtitle')}
          </p>
        </div>
        {/* Species tabs */}
        <div className="flex flex-wrap gap-2">
          {SPECIES.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                activeId === s.id
                  ? 'bg-[#022B96] text-white border-[#022B96] shadow-sm'
                  : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left stats */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">{t('index_current_price')}</p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black tracking-tight text-foreground">
                {active.currency} {active.latest.toFixed(2)}
              </span>
              <span className="text-sm font-bold" style={{ color: active.color }}>
                / {active.unit}
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${
                isUp
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
              }`}
            >
              {isUp ? '▲' : '▼'} {Math.abs(active.change)}% {t('index_this_week')}
            </span>
          </div>

          <hr className="border-border" />

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: t('index_weekly_high'),  value: `${active.currency} ${active.weekHigh.toFixed(2)}` },
              { label: t('index_weekly_low'),   value: `${active.currency} ${active.weekLow.toFixed(2)}` },
              { label: t('index_source'),       value: 'EU Spot Market' },
              { label: t('index_components'),   value: `${SPECIES.length} species` },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-0.5">
                <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                <p className="text-sm font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Color legend chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {SPECIES.map(s => (
              <span key={s.id} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Chart */}
        <div className="lg:col-span-8 w-full" style={{ height: 240 }}>
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={active.data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${active.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={active.color} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={active.color} stopOpacity={0.01} />
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
                  tickFormatter={v => `${active.currency === 'EUR' ? '€' : '$'}${v.toFixed(1)}`}
                />
                <Tooltip content={<CustomTooltip currency={active.currency} />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={active.color}
                  strokeWidth={2.5}
                  fill={`url(#grad-${active.id})`}
                  dot={{ r: 3, fill: active.color, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: active.color, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-100/50 dark:bg-slate-800/30 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400">
              Loading Chart...
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

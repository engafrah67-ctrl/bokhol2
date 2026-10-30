'use client'

import React, { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react'
import type { ManagedIndexItem } from '@/lib/data/seafood-index-data'

// Shared across tab switches so returning to the tab is instant
let cachedItems: ManagedIndexItem[] | null = null

const euro = (n: number | undefined) => `€${(n ?? 0).toFixed(2)}`

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-slate-400">{label}</p>
      <p className="font-bold text-sm">{euro(payload[0].value)} / kg</p>
    </div>
  )
}

function ChangeBadge({ pct, size = 'sm' }: { pct: number; size?: 'sm' | 'lg' }) {
  const up = pct >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${
        up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
      } ${size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5'}`}
    >
      <Icon className={size === 'lg' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      {up ? '+' : ''}
      {pct.toFixed(1)}%
    </span>
  )
}

/** Read-only view of the admin-managed European Seafood Index (same data as the home page). */
export function SeafoodIndexViewer() {
  const [items, setItems] = useState<ManagedIndexItem[]>(() => cachedItems ?? [])
  const [activeId, setActiveId] = useState<string>(() => cachedItems?.[0]?.id ?? '')
  const [loading, setLoading] = useState(cachedItems === null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Live: load now, re-check every 30s while visible and when the tab regains focus,
  // so admin edits (add / delete / price changes) reach the buyer without a reload.
  useEffect(() => {
    let active = true

    const load = () =>
      fetch('/api/admin/seafood-index', { cache: 'no-store' })
        .then((r) => r.json())
        .then((json) => {
          if (!active) return
          if (!json.success) throw new Error(json.error || 'Could not load the index.')
          cachedItems = json.items
          setItems(json.items)
          setError(null)
          setActiveId((prev) => (json.items.some((i: ManagedIndexItem) => i.id === prev) ? prev : json.items[0]?.id ?? ''))
        })
        .catch((err) => {
          // Keep showing the last good data if a background refresh fails
          if (active && cachedItems === null) setError(err.message)
        })
        .finally(() => active && setLoading(false))

    load()
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, 30_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      active = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-slate-500 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-[#022B96]" /> Loading index…
      </div>
    )
  }

  if (error || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-2">
        <AlertCircle className="h-6 w-6 text-slate-300" />
        <p className="text-sm text-slate-500">{error || 'The Seafood Index has no species yet.'}</p>
      </div>
    )
  }

  const active = items.find((i) => i.id === activeId) || items[0]
  const prices = active.data.map((p) => p.price)
  const yMin = Math.min(...prices, active.monthLow)
  const yMax = Math.max(...prices, active.monthHigh)
  const pad = Math.max((yMax - yMin) * 0.15, 0.2)

  return (
    <div className="space-y-5">
      {/* Species selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {items.map((item) => {
          const selected = item.id === active.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`shrink-0 inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm font-semibold border transition cursor-pointer ${
                selected
                  ? 'bg-[#022B96] text-white border-[#022B96] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selected ? '#fff' : item.color }} />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Price + chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold text-slate-500">{active.label} · {active.source || 'All Europe'}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black tracking-tight text-slate-900">{euro(active.latestPrice)}</span>
              <span className="text-sm font-bold text-slate-400">/ kg</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <ChangeBadge pct={active.monthlyChangePct} size="lg" />
              <span className="text-xs text-slate-400">this month</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-right">
            <p className="text-xs text-slate-400">Monthly high</p>
            <p className="text-xs text-slate-400">Monthly low</p>
            <p className="text-sm font-bold text-emerald-700">{euro(active.monthHigh)}</p>
            <p className="text-sm font-bold text-red-600">{euro(active.monthLow)}</p>
          </div>
        </div>

        <div className="h-72">
          {mounted && active.data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={active.data} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id={`buyer-grad-${active.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={active.color} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={active.color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[yMin - pad, yMax + pad]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `€${Number(v).toFixed(1)}`}
                  width={56}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={active.color}
                  strokeWidth={2.5}
                  fill={`url(#buyer-grad-${active.id})`}
                  dot={{ r: 3.5, fill: active.color, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: active.color, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-xl bg-slate-50 animate-pulse" />
          )}
        </div>
      </div>

      {/* Market overview */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_7rem_6rem_7rem] gap-4 px-5 py-3 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Species</span>
          <span className="text-right">Price / kg</span>
          <span className="text-right">Change</span>
          <span className="hidden sm:block text-right">High / Low</span>
        </div>
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`w-full grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_7rem_6rem_7rem] items-center gap-4 px-5 py-3.5 text-left transition cursor-pointer ${
                item.id === active.id ? 'bg-blue-50/60' : 'hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-semibold text-slate-800 truncate">{item.label}</span>
              </span>
              <span className="text-sm font-bold text-slate-900 text-right tabular-nums">{euro(item.latestPrice)}</span>
              <span className="text-right">
                <ChangeBadge pct={item.monthlyChangePct} />
              </span>
              <span className="hidden sm:block text-xs text-slate-500 text-right tabular-nums">
                {euro(item.monthHigh)} / {euro(item.monthLow)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

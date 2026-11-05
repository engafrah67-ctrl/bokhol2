'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Loader2, AlertCircle, ArrowUpRight, ChevronRight } from 'lucide-react'
import type { ManagedIndexItem, ManagedIndexPoint } from '@/lib/data/seafood-index-data'
import { createClient } from '@/lib/supabase/client'

/**
 * One live product in the index. `fromOffers` = built from real offer prices (no admin index entry);
 * `priced` = false when every offer is "price on request".
 */
type LiveIndexItem = Omit<ManagedIndexItem, 'data'> & {
  /** Always the last 12 months; `price` is null for months before the product's first offer. */
  data: { week: string; price: number | null }[]
  productSlug: string
  fromOffers: boolean
  offerCount: number
  priced: boolean
}

// Shared across tab switches so returning to the tab is instant
let cachedItems: LiveIndexItem[] | null = null

const SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' }
const symbolFor = (currency?: string) => SYMBOLS[(currency || 'EUR').toUpperCase()] ?? `${currency} `
const money = (n: number | undefined, currency?: string) => `${symbolFor(currency)}${(n ?? 0).toFixed(2)}`

// Same slug rule the product page uses to match offers (e.g. "Blue fish" → "blue-fish")
const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const FALLBACK_COLORS = ['#022B96', '#0d9488', '#f97316', '#7c3aed', '#0284c7', '#dc2626']
const round2 = (n: number) => Math.round(n * 100) / 100

interface LiveProduct {
  name: string
  slug: string
  currency: string
  postCount: number
  offers: { price: number; date: Date }[]
}

/**
 * The admin enters one price per calendar month (Jan–Dec, no year). Show them as the last
 * 12 real months ending with the current month, e.g. in Nov 2026: Dec '25, Jan '26 … Nov.
 * Values are unchanged; only the order and labels are corrected.
 */
function toRollingMonths(data: ManagedIndexPoint[]): LiveIndexItem['data'] {
  const byMonth = new Map(data.map((p) => [p.week, p.price]))
  if (![...byMonth.keys()].every((k) => MONTHS.includes(k))) return data // not month-labelled; leave as is
  return lastTwelveMonths().map((m) => ({ week: m.label, price: byMonth.get(MONTHS[m.month]) ?? null }))
}

/** The last 12 months ending with the current one, labelled the same way for every product. */
function lastTwelveMonths(now = new Date()) {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    // Show the year on the first point and on January so the year change is clear
    const showYear = i === 0 || d.getMonth() === 0
    return {
      key: d.getFullYear() * 12 + d.getMonth(),
      month: d.getMonth(),
      label: showYear ? `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}` : MONTHS[d.getMonth()],
    }
  })
}

/** Group the published supplier offers by product (same naming rule as the product page). */
function groupOffers(posts: { title: string | null; content: string | null; created_at: string; updated_at: string | null }[]) {
  const products = new Map<string, LiveProduct>()
  for (const post of posts) {
    let details: any = {}
    try { details = JSON.parse(post.content || '{}') } catch {}
    const name = String(details.productName || post.title?.split(' —')[0] || '').trim()
    const slug = toSlug(name)
    if (!slug) continue
    if (!products.has(slug)) {
      products.set(slug, { name, slug, currency: details.currency || 'EUR', postCount: 0, offers: [] })
    }
    const product = products.get(slug)!
    product.postCount++
    const price = parseFloat(details.pricePerKg ?? details.minPricePerKg ?? 0)
    if (price > 0) product.offers.push({ price, date: new Date(post.updated_at || post.created_at) })
  }
  return products
}

/** Index entry built only from real offers: average price, real high/low, monthly averages for the chart. */
function itemFromOffers(p: LiveProduct, colorIndex: number): LiveIndexItem {
  const base = {
    id: `offers-${p.slug}`,
    slug: p.slug,
    label: p.name,
    currency: p.currency,
    unit: 'kg',
    source: 'Live supplier offers',
    activeOffersCount: p.postCount,
    color: FALLBACK_COLORS[colorIndex % FALLBACK_COLORS.length],
    productSlug: p.slug,
    fromOffers: true,
    offerCount: p.postCount,
  }

  // Posted without a price (price on request) — still listed so every live product appears
  if (p.offers.length === 0) {
    return { ...base, latestPrice: 0, monthlyChangePct: 0, monthHigh: 0, monthLow: 0, data: [], priced: false }
  }

  const prices = p.offers.map((o) => o.price)

  // Average offer price per month the product was posted/updated in
  const byMonth = new Map<number, number[]>()
  for (const o of p.offers) {
    const key = o.date.getFullYear() * 12 + o.date.getMonth()
    byMonth.set(key, [...(byMonth.get(key) || []), o.price])
  }
  const monthAvg = (key: number) => {
    const ps = byMonth.get(key)
    return ps ? round2(ps.reduce((a, b) => a + b, 0) / ps.length) : null
  }

  // Same 12-month axis as every other product. A live offer stays at its price until it changes,
  // so months after the first offer carry the last real price forward; earlier months stay empty.
  const months = lastTwelveMonths()
  const firstKey = Math.min(...byMonth.keys())
  let carried: number | null = null
  for (const key of [...byMonth.keys()].sort((a, b) => a - b)) {
    if (key < months[0].key) carried = monthAvg(key) // offers older than the window
  }
  const data = months.map((m) => {
    const avg = monthAvg(m.key)
    if (avg !== null) carried = avg
    return { week: m.label, price: m.key >= firstKey ? carried : null }
  })

  const last = data[11].price ?? 0
  const prev = data[10].price ?? last
  return {
    ...base,
    latestPrice: round2(prices.reduce((a, b) => a + b, 0) / prices.length),
    monthlyChangePct: prev > 0 ? round2(((last - prev) / prev) * 100) : 0,
    monthHigh: Math.max(...prices),
    monthLow: Math.min(...prices),
    data,
    priced: true,
  }
}

/**
 * One entry per live product: the admin's index entry when there is one,
 * otherwise an entry computed from that product's real supplier offers.
 * Demo index rows with no live product are left out.
 */
async function loadLiveIndex(): Promise<LiveIndexItem[]> {
  const [indexRes, postsRes] = await Promise.all([
    fetch('/api/admin/seafood-index', { cache: 'no-store' }).then((r) => r.json()),
    createClient()
      .from('supplier_posts')
      .select('title, content, created_at, updated_at')
      .eq('is_published', true),
  ])
  if (!indexRes.success) throw new Error(indexRes.error || 'Could not load the index.')
  if (postsRes.error) throw new Error(postsRes.error.message)

  const products = groupOffers(postsRes.data || [])
  const managed = indexRes.items as ManagedIndexItem[]
  const result: LiveIndexItem[] = []

  let colorIndex = 0
  for (const p of products.values()) {
    const adminItem = managed.find((m) => toSlug(m.label) === p.slug || m.slug === p.slug)
    result.push(
      adminItem
        ? {
            ...adminItem,
            data: toRollingMonths(adminItem.data),
            productSlug: p.slug,
            fromOffers: false,
            offerCount: p.postCount,
            priced: true,
          }
        : itemFromOffers(p, colorIndex++)
    )
  }
  return result.sort((a, b) => a.label.localeCompare(b.label))
}

function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-slate-400">{label}</p>
      <p className="font-bold text-sm">{money(payload[0].value, currency)} / kg</p>
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
  const [items, setItems] = useState<LiveIndexItem[]>(() => cachedItems ?? [])
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
      loadLiveIndex()
        .then((live) => {
          if (!active) return
          cachedItems = live
          setItems(live)
          setError(null)
          setActiveId((prev) => (live.some((i) => i.id === prev) ? prev : live[0]?.id ?? ''))
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
        <p className="text-sm text-slate-500">
          {error || 'No live products are in the Seafood Index yet.'}
        </p>
      </div>
    )
  }

  const active = items.find((i) => i.id === activeId) || items[0]
  const prices = active.data.flatMap((p) => (p.price === null ? [] : [p.price]))
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
            <p className="text-xs font-semibold text-slate-500">
              {active.label} ·{' '}
              {active.fromOffers
                ? `Based on ${active.offerCount} live offer${active.offerCount === 1 ? '' : 's'}`
                : active.source || 'All Europe'}
            </p>
            {active.priced ? (
              <>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black tracking-tight text-slate-900">
                    {money(active.latestPrice, active.currency)}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/ kg</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ChangeBadge pct={active.monthlyChangePct} size="lg" />
                  <span className="text-xs text-slate-400">this month</span>
                </div>
              </>
            ) : (
              <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">Price on request</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            {active.priced && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-right">
                <p className="text-xs text-slate-400">Monthly high</p>
                <p className="text-xs text-slate-400">Monthly low</p>
                <p className="text-sm font-bold text-emerald-700">{money(active.monthHigh, active.currency)}</p>
                <p className="text-sm font-bold text-red-600">{money(active.monthLow, active.currency)}</p>
              </div>
            )}
            <Link
              href={`/products/${active.productSlug}`}
              className="inline-flex items-center gap-1 rounded-lg bg-[#022B96] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#011a5e]"
            >
              View offers <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="h-72">
          {!active.priced || active.data.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
              No price history yet — open the product to see current offers.
            </div>
          ) : mounted ? (
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
                  tickFormatter={(v) => `${symbolFor(active.currency)}${Number(v).toFixed(1)}`}
                  width={56}
                />
                <Tooltip content={<ChartTooltip currency={active.currency} />} />
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
            <Link
              key={item.id}
              href={`/products/${item.productSlug}`}
              className="group w-full grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_7rem_6rem_7rem] items-center gap-4 px-5 py-3.5 text-left transition hover:bg-slate-50"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#022B96]">{item.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#022B96]" />
              </span>
              <span className="text-sm font-bold text-slate-900 text-right tabular-nums">
                {item.priced ? money(item.latestPrice, item.currency) : 'On request'}
              </span>
              <span className="text-right">
                {item.priced ? <ChangeBadge pct={item.monthlyChangePct} /> : <span className="text-xs text-slate-400">—</span>}
              </span>
              <span className="hidden sm:block text-xs text-slate-500 text-right tabular-nums">
                {item.priced
                  ? `${money(item.monthHigh, item.currency)} / ${money(item.monthLow, item.currency)}`
                  : '—'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

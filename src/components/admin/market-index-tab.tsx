'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Plus, Trash2, Save, RotateCcw, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp, Edit3,
} from 'lucide-react'
import { ManagedIndexItem, ManagedIndexPoint, DEFAULT_MANAGED_INDEX_ITEMS } from '@/lib/data/seafood-index-data'

interface MarketIndexTabProps {
  onBackToDashboard: () => void
}

const SPECIES_COLORS = ['#1d4ed8','#3b82f6','#f97316','#0d9488','#0284c7','#7c3aed','#dc2626','#059669']

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Shared across tab switches so re-opening the tab is instant; refreshed in the background
let cachedItems: ManagedIndexItem[] | null = null
let inflight: Promise<ManagedIndexItem[] | null> | null = null

function loadSeafoodIndex(): Promise<ManagedIndexItem[] | null> {
  if (!inflight) {
    inflight = fetch('/api/admin/seafood-index', { cache: 'no-store' })
      .then(r => r.json())
      .then(json => {
        if (json.success && Array.isArray(json.items)) cachedItems = json.items
        return cachedItems
      })
      .catch(() => cachedItems)
      .finally(() => { inflight = null })
  }
  return inflight
}

/** Warm the cache while the admin dashboard loads, so the tab opens instantly. */
export function prefetchSeafoodIndex(): Promise<unknown> {
  return loadSeafoodIndex()
}

function generateSmoothedCurve(latestPrice: number, monthlyChangePct: number): ManagedIndexPoint[] {
  const offsets = [-0.09, -0.07, -0.05, -0.03, -0.01, 0.01, 0.02, 0.01, 0.03, 0.02, 0.01, 0]
  return MONTH_LABELS.map((month, i) => ({
    week: month,
    price: parseFloat(Math.max(0.1, latestPrice * (1 + offsets[i] - (monthlyChangePct / 100) * (11 - i) * 0.08)).toFixed(2)),
  }))
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-slate-800">€ {payload[0].value?.toFixed(2)} / kg</p>
    </div>
  )
}

export function MarketIndexTab({ onBackToDashboard }: MarketIndexTabProps) {
  const [items, setItems] = useState<ManagedIndexItem[]>(() => cachedItems ?? [])
  const [activeItemId, setActiveItemId] = useState<string>(() => cachedItems?.[0]?.id ?? '')
  const [loading, setLoading] = useState(() => cachedItems === null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [expandedMonths, setExpandedMonths] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => { setIsMounted(true) }, [])

  // Show cached items instantly; refresh only when nothing is cached yet
  // (a background refresh would overwrite unsaved edits)
  useEffect(() => {
    if (cachedItems !== null) return
    let active = true
    loadSeafoodIndex()
      .then(fresh => {
        if (active && fresh && fresh.length > 0) {
          setItems(fresh)
          setActiveItemId(prev => prev || fresh[0].id)
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const activeItem = items.find(i => i.id === activeItemId) || items[0]

  function updateActiveItem(changes: Partial<ManagedIndexItem>) {
    setItems(prev => prev.map(it => it.id === activeItemId ? { ...it, ...changes } : it))
  }

  function updateWeekPoint(weekIndex: number, value: number) {
    if (!activeItem) return
    const newData = activeItem.data.map((p, i) => i === weekIndex ? { ...p, price: value } : p)
    updateActiveItem({ data: newData })
  }

  function autoCalculateCurve() {
    if (!activeItem) return
    const curve = generateSmoothedCurve(activeItem.latestPrice, activeItem.monthlyChangePct)
    updateActiveItem({ data: curve })
  }

  // Next.js keeps visited pages in a client cache; clear it so the home page shows the change
  function refreshSite() {
    router.refresh()
  }

  async function addNewSpecies() {
    if (!newLabel.trim() || busy) return
    const slug = newLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0, 64)
    if (!slug) {
      setSaveMsg({ type: 'error', text: 'Use letters or numbers in the species name.' })
      return
    }
    if (items.some(it => it.id === slug)) {
      setSaveMsg({ type: 'error', text: `"${newLabel.trim()}" is already in the index.` })
      return
    }
    const colorIndex = items.length % SPECIES_COLORS.length
    const newItem: ManagedIndexItem = {
      id: slug,
      slug,
      label: newLabel.trim(),
      currency: 'EUR',
      unit: 'kg',
      latestPrice: 10.00,
      monthlyChangePct: 1.0,
      monthHigh: 10.60,
      monthLow: 9.40,
      source: 'EU Spot Market Average',
      activeOffersCount: 1,
      color: SPECIES_COLORS[colorIndex],
      data: generateSmoothedCurve(10.00, 1.0),
    }

    setBusy(true)
    setSaveMsg(null)
    try {
      const res = await fetch('/api/admin/seafood-index', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: newItem }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not add species.')

      const next = [...items, newItem]
      setItems(next)
      cachedItems = next
      setActiveItemId(slug)
      setNewLabel('')
      setShowAddForm(false)
      setSaveMsg({ type: 'success', text: `✓ "${newItem.label}" added and live on the home page. Set its prices, then Save & Publish.` })
      refreshSite()
    } catch (err: any) {
      setSaveMsg({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    const target = items.find(it => it.id === pendingDeleteId)
    if (!target) return setPendingDeleteId(null)

    setBusy(true)
    setSaveMsg(null)
    try {
      const res = await fetch(`/api/admin/seafood-index?id=${encodeURIComponent(target.id)}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not delete species.')

      const remaining = items.filter(it => it.id !== target.id)
      setItems(remaining)
      cachedItems = remaining
      if (activeItemId === target.id) setActiveItemId(remaining[0]?.id || '')
      setSaveMsg({ type: 'success', text: `✓ "${target.label}" deleted from the index and the home page.` })
      refreshSite()
    } catch (err: any) {
      setSaveMsg({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
      setPendingDeleteId(null)
    }
  }

  async function saveAndPublish() {
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch('/api/admin/seafood-index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const json = await res.json()
      if (json.success) {
        cachedItems = items
        refreshSite()
        setSaveMsg({ type: 'success', text: `✓ ${json.saved} species published to live site!` })
      } else {
        setSaveMsg({ type: 'error', text: json.error || 'Save failed.' })
      }
    } catch (err: any) {
      setSaveMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 5000)
    }
  }

  function resetToDefaults() {
    if (!confirm('Replace the editor with the default species and prices? Nothing changes on the site until you click Save & Publish.')) return
    setItems(DEFAULT_MANAGED_INDEX_ITEMS)
    setActiveItemId(DEFAULT_MANAGED_INDEX_ITEMS[0]?.id || '')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-slate-500 text-sm">Loading index data...</span>
      </div>
    )
  }

  const isUp = (activeItem?.monthlyChangePct ?? 0) >= 0

  const pendingDelete = items.find(it => it.id === pendingDeleteId)

  return (
    <div className="space-y-6">
      {/* Delete confirmation */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-species-title"
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <div className="h-11 w-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={18} />
            </div>
            <h3 id="delete-species-title" className="text-base font-bold text-slate-900">
              Delete &ldquo;{pendingDelete.label}&rdquo;?
            </h3>
            <p className="text-sm text-slate-500 mt-1.5">
              It will be removed from the Seafood Index and from the home page immediately. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 mt-6">
              <button
                onClick={() => setPendingDeleteId(null)}
                disabled={busy}
                className="h-10 px-4 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={busy}
                autoFocus
                className="h-10 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {busy ? 'Deleting…' : 'Delete species'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">European Seafood Index</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage price benchmarks and monthly trend data for the live home page graph.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefaults}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={13} />
            Reset defaults
          </button>
          <button
            onClick={saveAndPublish}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#022B96] rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-60"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Save size={15} />
            )}
            Save & Publish Index
          </button>
        </div>
      </div>

      {/* Save Message */}
      {saveMsg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border ${
          saveMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-600 border-red-200'
        }`}>
          {saveMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {saveMsg.text}
        </div>
      )}

      {/* Species Tab Strip */}
      <div className="flex flex-wrap items-center gap-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveItemId(item.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
              activeItemId === item.id
                ? 'bg-[#022B96] text-white border-[#022B96] shadow'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </button>
        ))}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 border border-dashed border-blue-300 rounded-full hover:bg-blue-50 transition-colors"
          >
            <Plus size={12} /> Add Species
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addNewSpecies()}
              placeholder="Species name..."
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              autoFocus
            />
            <button onClick={addNewSpecies} disabled={busy} className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-60">{busy ? 'Adding…' : 'Add'}</button>
            <button onClick={() => setShowAddForm(false)} className="text-xs px-2 py-1.5 text-slate-500 hover:text-slate-700">✕</button>
          </div>
        )}
      </div>

      {activeItem && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* Left: Edit Controls */}
          <div className="xl:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Edit3 size={15} className="text-[#022B96]" />
                  {activeItem.label}
                </h3>
                {items.length > 1 && (
                  <button
                    onClick={() => setPendingDeleteId(activeItem.id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                    title="Remove species"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Color picker */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Chart Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {SPECIES_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => updateActiveItem({ color: c })}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        activeItem.color === c ? 'border-slate-700 scale-125' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={activeItem.color}
                    onChange={e => updateActiveItem({ color: e.target.value })}
                    className="w-7 h-7 rounded-full cursor-pointer border border-slate-200"
                    title="Custom color"
                  />
                </div>
              </div>

              {/* Spot Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Spot Price (€/kg)</label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={activeItem.latestPrice}
                    onChange={e => updateActiveItem({ latestPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm font-bold border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Monthly Change %</label>
                  <input
                    type="number"
                    step={0.1}
                    value={activeItem.monthlyChangePct}
                    onChange={e => updateActiveItem({ monthlyChangePct: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm font-bold border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* High / Low */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Monthly High (€)</label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={activeItem.monthHigh}
                    onChange={e => updateActiveItem({ monthHigh: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Monthly Low (€)</label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={activeItem.monthLow}
                    onChange={e => updateActiveItem({ monthLow: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Source & Offers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Active Offers</label>
                  <input
                    type="number"
                    min={0}
                    value={activeItem.activeOffersCount}
                    onChange={e => updateActiveItem({ activeOffersCount: parseInt(e.target.value) || 0 })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Source Label</label>
                  <input
                    type="text"
                    value={activeItem.source}
                    onChange={e => updateActiveItem({ source: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Jan-Dec Monthly Data Points */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-500">Jan–Dec Price Points</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={autoCalculateCurve}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2"
                    >
                      Auto-calculate curve
                    </button>
                    <button
                      onClick={() => setExpandedMonths(v => !v)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {expandedMonths ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>
                {expandedMonths && (
                  <div className="grid grid-cols-6 gap-2">
                    {activeItem.data.map((pt, i) => (
                      <div key={pt.week}>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-1">{pt.week}</label>
                        <input
                          type="number"
                          step={0.01}
                          value={pt.price}
                          onChange={e => updateWeekPoint(i, parseFloat(e.target.value) || 0)}
                          className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {!expandedMonths && (
                  <div className="flex gap-1.5 flex-wrap">
                    {activeItem.data.map(pt => (
                      <span key={pt.week} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {pt.week}: €{pt.price.toFixed(2)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Chart Preview */}
          <div className="xl:col-span-3 space-y-4">
            {/* Stats Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Current Index Price (All Europe)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">
                      € {(activeItem.latestPrice ?? 0).toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ kg</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {isUp ? '+' : ''}{activeItem.monthlyChangePct}% this month
                  </span>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-xs text-slate-400">Monthly High</p>
                    <p className="text-sm font-bold text-slate-700">€ {(activeItem.monthHigh ?? activeItem.latestPrice ?? 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Monthly Low</p>
                    <p className="text-sm font-bold text-slate-700">€ {(activeItem.monthLow ?? activeItem.latestPrice ?? 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ height: 220 }}>
                {isMounted && activeItem.data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeItem.data} margin={{ top: 6, right: 4, left: -14, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`admin-grad-${activeItem.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeItem.color} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={activeItem.color} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis
                        domain={['dataMin - 0.3', 'dataMax + 0.3']}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `€${v.toFixed(1)}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={activeItem.color}
                        strokeWidth={2.5}
                        fill={`url(#admin-grad-${activeItem.id})`}
                        dot={{ r: 4, fill: activeItem.color, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: activeItem.color, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">
                    Loading chart...
                  </div>
                )}
              </div>
            </div>

            {/* All Species Summary Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">All Species Overview</p>
              </div>
              <div className="divide-y divide-slate-100">
                {items.map(item => {
                  const up = item.monthlyChangePct >= 0
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveItemId(item.id)}
                      className={`w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50 transition-colors ${
                        activeItemId === item.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-slate-500">
                        <span className="font-bold text-slate-800">€ {(item.latestPrice ?? 0).toFixed(2)}</span>
                        <span className={`font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                          {up ? '+' : ''}{item.monthlyChangePct}%
                        </span>
                        <span className="hidden sm:block">{item.activeOffersCount} offers</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





'use client'

import React, { useState, useEffect } from 'react'
import { Edit3, X, Loader2, DollarSign, Plus, Trash2 } from 'lucide-react'
import {
  AdminMarketIndex,
  ProductOption,
  fetchMarketIndexes,
  updateMarketIndex,
  createMarketIndex,
  deleteMarketIndex,
} from '@/lib/data/market-indexes-data'

// Derive a short country/region label from the index name
function getRegionLabel(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('norway') || lower.includes('norwegian')) return 'Norway'
  if (lower.includes('spain') || lower.includes('spanish')) return 'Spain'
  if (lower.includes('greece') || lower.includes('greek')) return 'Greece'
  if (lower.includes('iceland')) return 'Iceland'
  if (lower.includes('north atlantic')) return 'North Atlantic'
  if (lower.includes('northeast atlantic')) return 'NE Atlantic'
  if (lower.includes('european') || lower.includes('europe')) return 'Europe'
  if (lower.includes('global')) return 'Global'
  if (lower.includes('mediterranean')) return 'Mediterranean'
  return 'EU Hub'
}

export function MarketIndexesManager() {
  const [indexes, setIndexes] = useState<AdminMarketIndex[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)

  // Edit modal
  const [editingIndex, setEditingIndex] = useState<AdminMarketIndex | null>(null)
  const [editName, setEditName] = useState('')
  const [editAvgPrice, setEditAvgPrice] = useState('')
  const [editLowPrice, setEditLowPrice] = useState('')
  const [editHighPrice, setEditHighPrice] = useState('')
  const [editCurrency, setEditCurrency] = useState('EUR')
  const [editChangePct, setEditChangePct] = useState('0')
  const [editPeriod, setEditPeriod] = useState('weekly')
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newProductId, setNewProductId] = useState('')
  const [newAvgPrice, setNewAvgPrice] = useState('')
  const [newLowPrice, setNewLowPrice] = useState('')
  const [newHighPrice, setNewHighPrice] = useState('')
  const [newCurrency, setNewCurrency] = useState('EUR')
  const [newChangePct, setNewChangePct] = useState('0')
  const [newPeriod, setNewPeriod] = useState('weekly')
  const [addSubmitting, setAddSubmitting] = useState(false)

  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchMarketIndexes()
      .then((res) => {
        setIndexes(res.indexes)
        setProducts(res.products)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openEdit = (idx: AdminMarketIndex) => {
    setEditingIndex(idx)
    setEditName(idx.name)
    setEditAvgPrice(String(idx.avg_price))
    setEditLowPrice(String(idx.low_price ?? ''))
    setEditHighPrice(String(idx.high_price ?? ''))
    setEditCurrency(idx.currency || 'EUR')
    setEditChangePct(String(idx.change_pct ?? '0'))
    setEditPeriod(idx.period || 'weekly')
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    await deleteMarketIndex(id)
    setIndexes((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Same header as before */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Market Benchmarks</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Weekly price index benchmarks across EU hubs
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true)
            if (products.length > 0 && !newProductId) {
              setNewProductId(products[0].id)
              setNewName(`European ${products[0].name} Index`)
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Index
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="p-0.5 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Same 3-column card grid as the original design */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading benchmarks…
        </div>
      ) : indexes.length === 0 ? (
        <p className="text-sm text-slate-400 py-8">
          No market benchmarks found. Click "Add Index" to create one.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {indexes.map((idx) => {
            const region = getRegionLabel(idx.name)
            const productName = idx.product?.name || idx.name
            const currSymbol =
              idx.currency === 'USD' ? '$' : idx.currency === 'GBP' ? '£' : '€'
            const price = `${currSymbol}${Number(idx.avg_price).toFixed(2)}/kg`

            return (
              <div
                key={idx.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs group relative"
              >
                {/* Exact same card design as original */}
                <p className="text-[10px] font-extrabold uppercase text-[#022B96] mb-1">
                  {region}
                </p>
                <h3 className="font-bold text-slate-900 text-sm">{productName}</h3>
                <p className="text-xl font-black text-slate-900 mt-2">{price}</p>

                {/* Edit / Delete buttons — appear on hover */}
                <div className="absolute top-3 right-3 hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={() => openEdit(idx)}
                    className="p-1.5 bg-slate-100 hover:bg-[#022B96] hover:text-white text-slate-600 rounded-lg transition cursor-pointer"
                    title="Edit benchmark"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(idx.id, idx.name)}
                    className="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 rounded-lg transition cursor-pointer"
                    title="Delete benchmark"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editingIndex && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">Update Benchmark Price</h3>
              <button
                onClick={() => setEditingIndex(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const numAvg = parseFloat(editAvgPrice)
                if (isNaN(numAvg) || numAvg < 0) return
                setEditSubmitting(true)
                try {
                  const updated = await updateMarketIndex(editingIndex.id, {
                    name: editName.trim() || editingIndex.name,
                    avg_price: numAvg,
                    low_price: editLowPrice ? parseFloat(editLowPrice) : parseFloat((numAvg * 0.94).toFixed(2)),
                    high_price: editHighPrice ? parseFloat(editHighPrice) : parseFloat((numAvg * 1.06).toFixed(2)),
                    currency: editCurrency,
                    change_pct: editChangePct ? parseFloat(editChangePct) : 0,
                    period: editPeriod,
                  })
                  setIndexes((prev) => prev.map((i) => i.id === editingIndex.id ? { ...i, ...updated } : i))
                  setSuccessMsg(`"${editName}" updated to ${editCurrency} ${numAvg.toFixed(2)}/kg`)
                  setEditingIndex(null)
                  setTimeout(() => setSuccessMsg(null), 4000)
                } catch (err: any) {
                  alert(err?.message || 'Failed to update')
                } finally {
                  setEditSubmitting(false)
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Index Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#022B96] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Average Price / kg *</label>
                <div className="flex gap-2">
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#022B96] cursor-pointer"
                  >
                    <option value="EUR">€ EUR</option>
                    <option value="USD">$ USD</option>
                    <option value="GBP">£ GBP</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={editAvgPrice}
                    onChange={(e) => setEditAvgPrice(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#022B96] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Low / kg</label>
                  <input
                    type="number" step="0.01" min="0" placeholder="Auto"
                    value={editLowPrice} onChange={(e) => setEditLowPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#022B96] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">High / kg</label>
                  <input
                    type="number" step="0.01" min="0" placeholder="Auto"
                    value={editHighPrice} onChange={(e) => setEditHighPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#022B96] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">7-Day Change %</label>
                  <input
                    type="number" step="0.1" placeholder="0.0"
                    value={editChangePct} onChange={(e) => setEditChangePct(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#022B96] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Period</label>
                  <select
                    value={editPeriod} onChange={(e) => setEditPeriod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#022B96] cursor-pointer"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setEditingIndex(null)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={editSubmitting}
                  className="flex-1 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {editSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">Add Market Benchmark</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!newName.trim() || !newProductId) return
                const numAvg = parseFloat(newAvgPrice)
                if (isNaN(numAvg) || numAvg <= 0) return
                setAddSubmitting(true)
                try {
                  const created = await createMarketIndex({
                    name: newName.trim(),
                    product_id: newProductId,
                    avg_price: numAvg,
                    low_price: newLowPrice ? parseFloat(newLowPrice) : parseFloat((numAvg * 0.94).toFixed(2)),
                    high_price: newHighPrice ? parseFloat(newHighPrice) : parseFloat((numAvg * 1.06).toFixed(2)),
                    currency: newCurrency,
                    unit: 'kg',
                    change_pct: newChangePct ? parseFloat(newChangePct) : 0,
                    period: newPeriod,
                  })
                  setIndexes((prev) => [created, ...prev])
                  setShowAddModal(false)
                  setSuccessMsg(`"${newName.trim()}" added!`)
                  setNewName(''); setNewAvgPrice(''); setNewLowPrice(''); setNewHighPrice('')
                  setTimeout(() => setSuccessMsg(null), 4000)
                } catch (err: any) {
                  alert(err?.message || 'Failed to create')
                } finally {
                  setAddSubmitting(false)
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Product *</label>
                <select
                  required value={newProductId}
                  onChange={(e) => {
                    setNewProductId(e.target.value)
                    const prod = products.find((p) => p.id === e.target.value)
                    if (prod) setNewName(`European ${prod.name} Index`)
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#022B96] cursor-pointer"
                >
                  <option value="">-- Choose a product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Index Name *</label>
                <input
                  type="text" required placeholder="e.g. European Salmon Index"
                  value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#022B96] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Avg Price / kg *</label>
                <div className="flex gap-2">
                  <select
                    value={newCurrency} onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#022B96] cursor-pointer"
                  >
                    <option value="EUR">€ EUR</option>
                    <option value="USD">$ USD</option>
                    <option value="GBP">£ GBP</option>
                  </select>
                  <input
                    type="number" step="0.01" min="0" required placeholder="e.g. 7.40"
                    value={newAvgPrice}
                    onChange={(e) => {
                      setNewAvgPrice(e.target.value)
                      const n = parseFloat(e.target.value)
                      if (!isNaN(n) && n > 0) {
                        setNewLowPrice((n * 0.94).toFixed(2))
                        setNewHighPrice((n * 1.06).toFixed(2))
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#022B96] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Low / kg</label>
                  <input type="number" step="0.01" min="0" placeholder="Auto" value={newLowPrice}
                    onChange={(e) => setNewLowPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#022B96] transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">High / kg</label>
                  <input type="number" step="0.01" min="0" placeholder="Auto" value={newHighPrice}
                    onChange={(e) => setNewHighPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#022B96] transition" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Change %</label>
                  <input type="number" step="0.1" placeholder="0.0" value={newChangePct}
                    onChange={(e) => setNewChangePct(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#022B96] transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Period</label>
                  <select value={newPeriod} onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#022B96] cursor-pointer">
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={addSubmitting}
                  className="flex-1 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white font-bold rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">
                  {addSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

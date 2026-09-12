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
import Link from 'next/link'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Scale, Fish, ArrowUpRight, Sparkles, CheckCircle2, Lock } from 'lucide-react'
import { getProductMarketTrend, SpeciesTrendPoint } from '@/lib/data/market-data'
import { useUser } from '@/hooks/use-user'
import { BlurGate } from '@/components/blur-gate'

interface ProductMarketGraphProps {
  productName: string
  supplierPrice?: number
  currency?: string
  compact?: boolean
}

export function ProductMarketGraph({
  productName,
  supplierPrice,
  currency = 'EUR',
  compact = false,
}: ProductMarketGraphProps) {
  const { user } = useUser()
  const [trendData, setTrendData] = useState<{
    currentAvg: number
    weekHigh: number
    weekLow: number
    changePct: number
    suppliersCount: number
    trendPoints: SpeciesTrendPoint[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    if (!productName || !productName.trim()) {
      setTrendData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    getProductMarketTrend(productName).then((res) => {
      if (isMounted) {
        setTrendData({
          currentAvg: res.currentAvg,
          weekHigh: res.weekHigh,
          weekLow: res.weekLow,
          changePct: res.changePct,
          suppliersCount: res.suppliersCount,
          trendPoints: res.trendPoints,
        })
        setLoading(false)
      }
    }).catch(() => {
      if (isMounted) setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [productName])

  if (!productName || !productName.trim()) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 animate-pulse text-center text-xs text-slate-400">
        Loading live market graph for {productName}...
      </div>
    )
  }

  if (!trendData) return null

  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'

  // Comparison analysis if supplier entered a price
  let priceComparison = null
  if (supplierPrice && supplierPrice > 0 && trendData.currentAvg > 0) {
    const diff = supplierPrice - trendData.currentAvg
    const diffPct = ((diff / trendData.currentAvg) * 100).toFixed(1)
    const isBelow = diff < 0
    priceComparison = {
      diff: Math.abs(diff).toFixed(2),
      diffPct: Math.abs(Number(diffPct)),
      isBelow,
      text: isBelow
        ? `${symbol}${Math.abs(diff).toFixed(2)} (${Math.abs(Number(diffPct))}%) below European benchmark`
        : `${symbol}${Math.abs(diff).toFixed(2)} (${Math.abs(Number(diffPct))}%) above European benchmark`,
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#022B96] dark:text-blue-400 flex items-center justify-center shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {productName} — Market Benchmark Graph
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Weekly verified spot market transaction data across European seafood exchanges
            </p>
          </div>
        </div>

        {/* Live Avg Price */}
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl px-4 py-2 text-right self-start sm:self-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Benchmark Avg</span>
          <div className="flex items-baseline justify-end gap-1 mt-0.5">
            <BlurGate>
              <span className="text-base font-black text-[#022B96] dark:text-blue-400">
                {symbol}{trendData.currentAvg.toFixed(2)}
              </span>
            </BlurGate>
            <span className="text-xs font-semibold text-slate-400">/ kg</span>
          </div>
        </div>
      </div>

      {/* Metrics Row - Simple & Clean */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Avg Price</span>
          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
            <BlurGate>
              <span>{symbol}{trendData.currentAvg.toFixed(2)} / kg</span>
            </BlurGate>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Verified Suppliers</span>
          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
            <BlurGate>
              <span>{trendData.suppliersCount} {trendData.suppliersCount === 1 ? 'Supplier' : 'Suppliers'}</span>
            </BlurGate>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Benchmark Currency</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
            {currency} (EUR Spot)
          </span>
        </div>
      </div>

      {/* Recharts 8-Week Trend Graph */}
      <div className="relative w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-700 shadow-xs overflow-hidden" style={{ height: compact ? 180 : 220 }}>
        {!user && (
          <div className="absolute inset-0 z-20 backdrop-blur-xs bg-white/45 dark:bg-slate-900/50 flex flex-col items-center justify-center p-4 text-center">
            <div className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#022B96] dark:text-blue-400 flex items-center justify-center shadow-xs mb-2">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Live European Benchmark Graph
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-0.5 mb-3">
              Sign in or create an account to view real-time market trends.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition shadow-xs"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 text-xs font-semibold px-4 py-1.5 rounded-xl transition shadow-2xs"
              >
                Register Free
              </Link>
            </div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData.trendPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${productName}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#022B96" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#022B96" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${symbol}${v.toFixed(1)}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-slate-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-slate-800">
                    <p className="text-slate-400 text-[10px]">{label} Benchmark</p>
                    <p className="font-extrabold text-sm text-blue-300">
                      {symbol}{Number(payload[0].value).toFixed(2)} / kg
                    </p>
                  </div>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#022B96"
              strokeWidth={2.5}
              fill={`url(#grad-${productName})`}
              dot={{ r: 3, fill: '#022B96', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#022B96', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Real-time Supplier Price Position Indicator */}
      {priceComparison && (
        <div className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
          priceComparison.isBelow
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/80 border-amber-200 text-amber-900'
        }`}>
          <div className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 ${
            priceComparison.isBelow ? 'bg-emerald-200/80 text-emerald-800' : 'bg-amber-200/80 text-amber-800'
          }`}>
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold">Your Offer Price ({symbol}{supplierPrice?.toFixed(2)}/kg): </span>
            <span>{priceComparison.text}</span>
            {priceComparison.isBelow && (
              <span className="ml-1 font-bold text-emerald-700">· Competitive pricing advantage!</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { Building2, Globe2, Fish, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

interface StatsBarProps {
  supplierCount?: number
  marketCount?: number
  productCount?: number
}

export function StatsBar({ supplierCount, marketCount, productCount }: StatsBarProps) {
  const { t } = useLanguage()

  const stats = [
    {
      icon: Building2,
      value: supplierCount !== undefined ? String(supplierCount) : '0',
      labelKey: 'stats_suppliers',
    },
    {
      icon: Globe2,
      value: marketCount !== undefined ? String(marketCount) : '0',
      labelKey: 'stats_markets',
    },
    {
      icon: Fish,
      value: productCount !== undefined ? String(productCount) : '0',
      labelKey: 'stats_products',
    },
    { icon: RefreshCw, value: t('stats_daily'), labelKey: 'stats_updates' },
  ]

  return (
    <div className="py-8 px-8 border border-border bg-background text-foreground rounded-2xl shadow-sm">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.labelKey} className="flex items-center gap-4 group">
              {/* Simple Icon Container */}
              <div className="h-10 w-10 rounded-xl bg-muted text-foreground flex items-center justify-center border border-border shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {item.value}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                  {t(item.labelKey)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

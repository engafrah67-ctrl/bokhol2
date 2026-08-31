import Link from 'next/link'
import { Product } from '@/types/database'
import { ArrowUpRight, Fish } from 'lucide-react'
import { BlurGate } from '@/components/blur-gate'
import { TopMarketProduct } from '@/lib/data/market-data'

interface TopProductsProps {
  products?: Product[]
  topProducts?: TopMarketProduct[]
}

const COUNTRY_FLAGS: Record<string, string> = {
  Belgium: 'https://flagcdn.com/w40/be.png',
  Netherlands: 'https://flagcdn.com/w40/nl.png',
  Germany: 'https://flagcdn.com/w40/de.png',
  Norway: 'https://flagcdn.com/w40/no.png',
  Spain: 'https://flagcdn.com/w40/es.png',
}

export function TopProducts({ topProducts }: TopProductsProps) {
  const productsList = (topProducts && topProducts.length > 0)
    ? topProducts.slice(0, 6)
    : []

  return (
    <div className="py-8 px-8 bg-background text-foreground transition-all border border-border rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">Top Seafood Products</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Most active species across European spot markets with verified live supplier offers.</p>
        </div>
        <Link href="/products" className="text-xs font-bold text-foreground hover:text-foreground/80 transition-colors inline-flex items-center gap-1 bg-muted px-3 py-1.5 rounded-lg border border-border">
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-medium">
              <th className="py-4 px-4 w-32">Fish</th>
              <th className="py-4 px-4">Name</th>
              <th className="py-4 px-4">Top Origin</th>
              <th className="py-4 px-4">Avg. Market Price</th>
              <th className="py-4 px-4 text-right">Active Suppliers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {productsList.map((p) => (
              <tr key={p.slug} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer">
                {/* 1. Image */}
                <td className="py-4 px-4">
                  <div className="h-16 w-20 flex items-center justify-center shrink-0">
                    {p.imageUrl ? (
                      <img 
                        src={p.imageUrl} 
                        alt={p.name} 
                        className="h-full w-full object-contain mix-blend-multiply dark:invert dark:mix-blend-screen hover:scale-110 transition-transform duration-300" 
                        style={{ filter: 'brightness(1.05) contrast(1.1)' }}
                      />
                    ) : (
                      <Fish className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                </td>

                {/* 2. Name */}
                <td className="py-4 px-4 font-bold text-slate-900 dark:text-white group-hover:text-[#022B96] dark:group-hover:text-blue-400 text-base transition-colors">
                  <Link href={`/products/${p.slug}`} className="hover:underline">
                    {p.name}
                  </Link>
                </td>

                {/* 3. Country with flag image */}
                <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    {COUNTRY_FLAGS[p.origin] ? (
                      <img
                        src={COUNTRY_FLAGS[p.origin]}
                        alt={p.origin}
                        className="h-3.5 w-5 object-cover rounded-xs shadow-xs"
                      />
                    ) : (
                      <span className="text-xs">🌍</span>
                    )}
                    <span>{p.origin}</span>
                  </div>
                </td>

                {/* 4. Avg Price */}
                <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                  <BlurGate>
                    <span>{p.avgPrice} / kg</span>
                  </BlurGate>
                </td>

                {/* 5. Suppliers */}
                <td className="py-4 px-4 text-right">
                  <span className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                    <BlurGate>
                      <span>{p.suppliersCount}</span>
                    </BlurGate>
                    <span className="ml-1">Offer{p.suppliersCount > 1 ? 's' : ''}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

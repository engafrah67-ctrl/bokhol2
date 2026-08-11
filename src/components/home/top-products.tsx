import Link from 'next/link'
import { Product } from '@/types/database'
import { ArrowUpRight, Fish } from 'lucide-react'
import { BlurGate } from '@/components/blur-gate'

interface TopProductsProps {
  products: Product[]
}

const COUNTRY_FLAGS: Record<string, string> = {
  Belgium: 'https://flagcdn.com/w40/be.png',
  Netherlands: 'https://flagcdn.com/w40/nl.png',
  Germany: 'https://flagcdn.com/w40/de.png',
}

const DEFAULT_PRODUCTS = [
  {
    name: 'Mackerel',
    origin: 'Belgium',
    avgPrice: '€5.31',
    suppliersCount: 20,
    slug: 'mackerel',
    imageUrl: '/mackerel.png',
  },
  {
    name: 'Tuna',
    origin: 'Netherlands',
    avgPrice: '€6.11',
    suppliersCount: 18,
    slug: 'tuna',
    imageUrl: '/tuna.png',
  },
  {
    name: 'Atlantic Cod',
    origin: 'Germany',
    avgPrice: '€6.91',
    suppliersCount: 16,
    slug: 'atlantic-cod',
    imageUrl: '/cod.png',
  },
  {
    name: 'Atlantic Salmon',
    origin: 'Belgium',
    avgPrice: '€7.71',
    suppliersCount: 14,
    slug: 'atlantic-salmon',
    imageUrl: '/salmon.png',
  },
  {
    name: 'Shrimp',
    origin: 'Netherlands',
    avgPrice: '€8.51',
    suppliersCount: 12,
    slug: 'shrimp',
    imageUrl: '/shrimp.png',
  },
]

export function TopProducts({ products }: TopProductsProps) {
  const THREE_COUNTRIES = ['Belgium', 'Netherlands', 'Germany']

  const productsList = products.length > 0
    ? products.slice(0, 5).map((p, i) => {
        const fallback = DEFAULT_PRODUCTS[i % DEFAULT_PRODUCTS.length]
        const assignedCountry = THREE_COUNTRIES[i % THREE_COUNTRIES.length]
        return {
          name: p.name,
          origin: assignedCountry,
          avgPrice: `€${(5.31 + (i * 0.8) % 4).toFixed(2)}`,
          suppliersCount: 20 - i * 2,
          slug: p.slug,
          imageUrl: p.image_url || fallback.imageUrl,
        }
      })
    : DEFAULT_PRODUCTS

  return (
    <div className="py-8 px-8 bg-background text-foreground transition-all border border-border rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">Top Seafood Products</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Most demanded species across Belgium, Netherlands, and Germany spot markets.</p>
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
              <th className="py-4 px-4">Country</th>
              <th className="py-4 px-4">Avg. Price</th>
              <th className="py-4 px-4 text-right">Suppliers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {productsList.map((p) => (
              <tr key={p.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer">
                {/* 1. Image */}
                <td className="py-4 px-4">
                  <div className="h-20 w-24 flex items-center justify-center shrink-0">
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
                  <Link href={`/products/${p.slug}`}>
                    {p.name}
                  </Link>
                </td>

                {/* 3. Country with flag image */}
                <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3">
                    {COUNTRY_FLAGS[p.origin] ? (
                      <img
                        src={COUNTRY_FLAGS[p.origin]}
                        alt={p.origin}
                        className="h-4 w-6 object-cover rounded-sm shadow-sm"
                      />
                    ) : (
                      <span className="text-sm">🌐</span>
                    )}
                    <span>{p.origin}</span>
                  </div>
                </td>

                {/* 4. Avg Price */}
                <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                  <BlurGate>
                    <span>{p.avgPrice}</span>
                  </BlurGate>
                </td>

                {/* 5. Suppliers */}
                <td className="py-4 px-4 text-right">
                  <span className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                    <BlurGate>
                      <span>{p.suppliersCount}</span>
                    </BlurGate>
                    <span className="ml-1">Suppliers</span>
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

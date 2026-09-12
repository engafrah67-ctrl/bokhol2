import Link from 'next/link'
import { Product } from '@/types/database'
import { ArrowUpRight, Fish } from 'lucide-react'
import { BlurGate } from '@/components/blur-gate'
import { TopMarketProduct } from '@/lib/data/market-data'

interface TopProductsProps {
  products?: Product[]
  topProducts?: TopMarketProduct[]
}

// ISO 3166-1 alpha-2 codes for all common seafood origin countries
const COUNTRY_ISO: Record<string, string> = {
  Belgium: 'be', Netherlands: 'nl', Germany: 'de', Norway: 'no', Spain: 'es',
  France: 'fr', Portugal: 'pt', Italy: 'it', Greece: 'gr', Ireland: 'ie',
  Denmark: 'dk', Sweden: 'se', Finland: 'fi', Iceland: 'is', Poland: 'pl',
  Chile: 'cl', Vietnam: 'vn', China: 'cn', Japan: 'jp', India: 'in',
  Indonesia: 'id', Thailand: 'th', Philippines: 'ph', Taiwan: 'tw', 'South Korea': 'kr',
  Ecuador: 'ec', Peru: 'pe', Argentina: 'ar', Brazil: 'br', Mexico: 'mx',
  Morocco: 'ma', Senegal: 'sn', Egypt: 'eg', 'South Africa': 'za', Ghana: 'gh',
  'United States': 'us', Canada: 'ca', Australia: 'au', 'New Zealand': 'nz',
  Russia: 'ru', Turkey: 'tr', Ukraine: 'ua', Myanmar: 'mm', Bangladesh: 'bd',
  Malaysia: 'my', 'Sri Lanka': 'lk', Pakistan: 'pk', 'Saudi Arabia': 'sa',
}

function getFlagUrl(country: string): string | null {
  if (!country) return null
  const clean = country.toLowerCase()
  if (clean.includes('netherlands') || clean.includes('holland')) return 'https://flagcdn.com/w40/nl.png'
  if (clean.includes('germany')) return 'https://flagcdn.com/w40/de.png'
  if (clean.includes('chile')) return 'https://flagcdn.com/w40/cl.png'
  if (clean.includes('vietnam')) return 'https://flagcdn.com/w40/vn.png'
  if (clean.includes('norway')) return 'https://flagcdn.com/w40/no.png'
  if (clean.includes('spain')) return 'https://flagcdn.com/w40/es.png'
  if (clean.includes('belgium')) return 'https://flagcdn.com/w40/be.png'

  const direct = COUNTRY_ISO[country]
  if (direct) return `https://flagcdn.com/w40/${direct}.png`
  for (const [name, iso] of Object.entries(COUNTRY_ISO)) {
    if (clean.includes(name.toLowerCase())) {
      return `https://flagcdn.com/w40/${iso}.png`
    }
  }
  return null
}

const DEFAULT_PRODUCTS: TopMarketProduct[] = [
  {
    name: 'Yellowfin Tuna',
    origin: 'Holland (Netherlands)',
    avgPrice: '€8.62',
    avgPriceNum: 8.62,
    suppliersCount: 3,
    slug: 'yellowfin-tuna',
    imageUrl: '/fish-tuna.png',
    category: 'Pelagic',
  },
  {
    name: 'Atlantic Salmon',
    origin: 'Holland (Netherlands)',
    avgPrice: '€500.00',
    avgPriceNum: 500.00,
    suppliersCount: 1,
    slug: 'atlantic-salmon',
    imageUrl: '/fish-salmon.png',
    category: 'Salmonids',
  },
  {
    name: 'Bigeye Tuna',
    origin: 'Chile',
    avgPrice: '€2.16',
    avgPriceNum: 2.16,
    suppliersCount: 1,
    slug: 'bigeye-tuna',
    imageUrl: '/fish-tuna.png',
    category: 'Finfish',
  },
  {
    name: 'Bluefin Tuna',
    origin: 'Germany',
    avgPrice: '€45.00',
    avgPriceNum: 45.00,
    suppliersCount: 1,
    slug: 'bluefin-tuna',
    imageUrl: '/fish-tuna.png',
    category: 'Finfish',
  },
  {
    name: 'Haddock',
    origin: 'Holland (Netherlands)',
    avgPrice: '€4.00',
    avgPriceNum: 4.00,
    suppliersCount: 1,
    slug: 'haddock',
    imageUrl: '/fish-haddock.jpg',
    category: 'Whitefish',
  },
  {
    name: 'Halibut',
    origin: 'Vietnam',
    avgPrice: '€66.89',
    avgPriceNum: 66.89,
    suppliersCount: 1,
    slug: 'halibut',
    imageUrl: '/fish-turbot.jpg',
    category: 'Whitefish',
  },
]

export function TopProducts({ topProducts }: TopProductsProps) {
  const productsList = (topProducts && topProducts.length > 0)
    ? topProducts.slice(0, 6)
    : DEFAULT_PRODUCTS

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
                {/* 1. Fish Image */}
                <td className="py-4 px-4">
                  <div className="h-16 w-20 flex items-center justify-center shrink-0">
                    {p.imageUrl ? (
                      <img 
                        src={p.imageUrl} 
                        alt={p.name} 
                        className="h-full w-full object-contain hover:scale-110 transition-transform duration-300" 
                        style={{ filter: 'brightness(1.05) contrast(1.05)' }}
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
                    {getFlagUrl(p.origin) ? (
                      <img
                        src={getFlagUrl(p.origin)!}
                        alt={p.origin}
                        className="h-3.5 w-5 object-cover rounded-xs shadow-xs"
                      />
                    ) : (
                      <span className="text-xs">🌍</span>
                    )}
                    <span>{p.origin}</span>
                  </div>
                </td>

                {/* 4. Avg Market Price */}
                <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                  <BlurGate>
                    <span>{p.avgPrice.includes('/ kg') ? p.avgPrice : `${p.avgPrice} / kg`}</span>
                  </BlurGate>
                </td>

                {/* 5. Active Suppliers */}
                <td className="py-4 px-4 text-right">
                  <span className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                    <BlurGate>
                      <span>{p.suppliersCount}</span>
                    </BlurGate>
                    <span className="ml-1">{p.suppliersCount === 1 ? 'Supplier' : 'Suppliers'}</span>
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

'use client'

import Link from 'next/link'
import { Product } from '@/types/database'
import { ArrowUpRight, Fish } from 'lucide-react'
import { BlurGate } from '@/components/blur-gate'
import { TopMarketProduct } from '@/lib/data/market-data'
import { useLanguage } from '@/contexts/language-context'

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
  Morocco: 'ma', Senegal: 'sn', Mauritania: 'mr', Egypt: 'eg', 'South Africa': 'za', Ghana: 'gh',
  'United States': 'us', Canada: 'ca', Australia: 'au', 'New Zealand': 'nz',
  Russia: 'ru', Turkey: 'tr', Ukraine: 'ua', Myanmar: 'mm', Bangladesh: 'bd',
  Malaysia: 'my', 'Sri Lanka': 'lk', Pakistan: 'pk', 'Saudi Arabia': 'sa',
  Namibia: 'na', Oman: 'om', Maldives: 'mv', Faroe: 'fo', 'Faroe Islands': 'fo',
  // Middle East & Africa
  Yemen: 'ye', Jordan: 'jo', Iraq: 'iq', Iran: 'ir', Lebanon: 'lb',
  Kuwait: 'kw', Qatar: 'qa', 'United Arab Emirates': 'ae', UAE: 'ae', Bahrain: 'bh',
  Libya: 'ly', Tunisia: 'tn', Algeria: 'dz', Sudan: 'sd', Somalia: 'so',
  Ethiopia: 'et', Kenya: 'ke', Tanzania: 'tz', Mozambique: 'mz', Madagascar: 'mg',
  Nigeria: 'ng', Cameroon: 'cm', Angola: 'ao', Côte: 'ci', "Côte d'Ivoire": 'ci',
  // Asia
  Cambodia: 'kh', Laos: 'la', 'Hong Kong': 'hk', Singapore: 'sg', Nepal: 'np',
  // Europe extras
  Croatia: 'hr', Romania: 'ro', Bulgaria: 'bg', Hungary: 'hu', Austria: 'at',
  Switzerland: 'ch', Luxembourg: 'lu', Serbia: 'rs', Albania: 'al',
  // Americas
  Colombia: 'co', Venezuela: 've', Cuba: 'cu', Guatemala: 'gt', Honduras: 'hn',
  'Costa Rica': 'cr', Panama: 'pa', Bolivia: 'bo', Uruguay: 'uy', Paraguay: 'py',
}

function getFlagUrl(country: string): string | null {
  if (!country) return null
  const clean = country.trim().toLowerCase()

  // Direct match first
  const direct = COUNTRY_ISO[country.trim()]
  if (direct) return `https://flagcdn.com/w40/${direct}.png`

  // Partial match
  for (const [name, iso] of Object.entries(COUNTRY_ISO)) {
    if (clean.includes(name.toLowerCase()) || name.toLowerCase().includes(clean)) {
      return `https://flagcdn.com/w40/${iso}.png`
    }
  }

  // Special aliases
  if (clean.includes('holland')) return 'https://flagcdn.com/w40/nl.png'
  if (clean.includes('uae') || clean.includes('emirates')) return 'https://flagcdn.com/w40/ae.png'
  if (clean.includes('usa') || clean.includes('united states')) return 'https://flagcdn.com/w40/us.png'
  if (clean.includes('uk') || clean.includes('united kingdom') || clean.includes('britain')) return 'https://flagcdn.com/w40/gb.png'

  return null
}

export function TopProducts({ topProducts }: TopProductsProps) {
  const { t } = useLanguage()
  const productsList = (topProducts && topProducts.length > 0)
    ? topProducts.slice(0, 6)
    : []

  if (productsList.length === 0) {
    return (
      <div className="py-8 px-8 bg-background text-foreground transition-all border border-border rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-foreground tracking-tight">{t('top_products_title', 'Top Seafood Products')}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{t('top_products_subtitle', 'Most active species across European spot markets with verified live supplier offers.')}</p>
          </div>
          <Link href="/products" className="text-xs font-bold text-foreground hover:text-foreground/80 transition-colors inline-flex items-center gap-1 bg-muted px-3 py-1.5 rounded-lg border border-border">
            {t('top_products_view_all', 'View all')}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="py-12 px-4 text-center border border-dashed border-border rounded-xl">
          <Fish className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <h4 className="text-sm font-bold text-foreground">{t('top_products_empty_title', 'No seafood products listed yet')}</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            {t('top_products_empty_desc', "Suppliers haven't posted any products yet. When verified exporters list active products and offers, market prices and species will appear here.")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-8 bg-background text-foreground transition-all border border-border rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">{t('top_products_title', 'Top Seafood Products')}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{t('top_products_subtitle', 'Most active species across European spot markets with verified live supplier offers.')}</p>
        </div>
        <Link href="/products" className="text-xs font-bold text-foreground hover:text-foreground/80 transition-colors inline-flex items-center gap-1 bg-muted px-3 py-1.5 rounded-lg border border-border">
          {t('top_products_view_all', 'View all')}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-medium">
              <th className="py-4 px-4 w-32">{t('top_products_col_fish', 'Fish')}</th>
              <th className="py-4 px-4">{t('top_products_col_name', 'Name')}</th>
              <th className="py-4 px-4">{t('top_products_col_origin', 'Top Origin')}</th>
              <th className="py-4 px-4">{t('top_products_col_avg_price', 'Avg. Market Price')}</th>
              <th className="py-4 px-4 text-right">{t('top_products_col_suppliers', 'Active Suppliers')}</th>
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

                {/* 3. Country with flag image — max 2 shown, rest collapsed */}
                <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {(() => {
                    const allOrigins = (p.origins && p.origins.length > 0)
                      ? p.origins
                      : (p.origin ? p.origin.split(',').map((s: string) => s.trim()) : ['Europe'])
                    const shown = allOrigins.slice(0, 1)
                    const extra = allOrigins.length - 1
                    return (
                      <div className="flex items-center gap-2 flex-wrap">
                        {shown.map((orig: string) => (
                          <div key={orig} className="flex items-center gap-1.5 shrink-0">
                            {getFlagUrl(orig) ? (
                              <img
                                src={getFlagUrl(orig)!}
                                alt={orig}
                                className="h-3.5 w-5 object-cover rounded-xs shadow-xs"
                              />
                            ) : (
                              <span className="text-sm leading-none">🏳️</span>
                            )}
                            <span className="text-xs">{orig}</span>
                          </div>
                        ))}
                        {extra > 0 && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full shrink-0">
                            +{extra} more
                          </span>
                        )}
                      </div>
                    )
                  })()}
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
                    <span className="ml-1">{p.suppliersCount === 1 ? t('role_supplier', 'Supplier') : t('top_products_suppliers', 'Suppliers')}</span>
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

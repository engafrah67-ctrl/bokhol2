import Link from 'next/link'
import { Country } from '@/types/database'
import { TrendingUp, ArrowUpRight } from 'lucide-react'

interface TopMarketsProps {
  countries: Country[]
}

// Default fallback data matching reference design if database is empty
const DEFAULT_MARKETS = [
  { flag: '🇳🇴', name: 'Norway', change: '+2.1%', trend: 'up', slug: 'norway' },
  { flag: '🇮🇸', name: 'Iceland', change: '+1.9%', trend: 'up', slug: 'iceland' },
  { flag: '🇪🇸', name: 'Spain', change: '+1.2%', trend: 'up', slug: 'spain' },
  { flag: '🇩🇰', name: 'Denmark', change: '+0.9%', trend: 'up', slug: 'denmark' },
  { flag: '🇲🇦', name: 'Morocco', change: '+0.7%', trend: 'up', slug: 'morocco' },
]

export function TopMarkets({ countries }: TopMarketsProps) {
  const marketsList = countries.length > 0
    ? countries.slice(0, 5).map((c, i) => ({
        flag: c.flag_emoji || '🌐',
        name: c.name,
        change: `+${(2.1 - i * 0.35).toFixed(1)}%`,
        trend: 'up',
        slug: c.slug,
      }))
    : DEFAULT_MARKETS

  return (
    <div className="py-6 bg-background text-foreground flex flex-col justify-between transition-all">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-foreground tracking-tight">Top Trading Markets</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Most active seafood export nations.</p>
          </div>
          <Link href="/countries" className="text-xs font-bold text-foreground hover:text-foreground/80 transition-colors inline-flex items-center gap-1 bg-muted px-3 py-1.5 rounded-sm border border-border">
            View all
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-border">
          {marketsList.map((m, idx) => (
            <Link
              key={m.name}
              href={`/countries/${m.slug}`}
              className="flex items-center justify-between py-3 hover:bg-muted/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                {/* Flag Bubble */}
                <div className="h-9 w-9 rounded-sm bg-muted flex items-center justify-center border border-border text-lg font-normal">
                  {m.flag}
                </div>
                <div>
                  <span className="font-extrabold text-foreground group-hover:underline transition-colors text-sm">
                    {m.name}
                  </span>
                  <div className="text-[10px] text-muted-foreground font-semibold">Rank #{idx + 1}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Visual mini-sparkline */}
                <div className="hidden sm:block">
                  <svg className="w-12 h-6 text-foreground" viewBox="0 0 50 20" fill="none">
                    <path 
                      d={idx % 2 === 0 ? "M0 15 Q 12 5, 25 10 T 50 2" : "M0 18 Q 15 12, 30 5 T 50 8"} 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                </div>

                {/* Trend Badge */}
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground bg-muted border border-border px-2.5 py-0.5 rounded-sm">
                  <TrendingUp className="h-3 w-3" />
                  {m.change}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

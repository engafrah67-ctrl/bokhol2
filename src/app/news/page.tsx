import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react'

const NEWS_ARTICLES = [
  {
    slug: 'global-salmon-prices-q3-2026',
    category: 'Market Update',
    categoryColor: 'bg-blue-50 text-[#022B96]',
    title: 'Global Salmon Prices Rise 12% in Q3 2026 Amid Supply Constraints',
    excerpt: 'Atlantic salmon prices have surged to their highest level in three years, driven by reduced harvests in Norway and Scotland following environmental regulations.',
    author: 'FishMarketCap Research',
    date: 'July 25, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  },
  {
    slug: 'vietnam-shrimp-exports-record',
    category: 'Trade',
    categoryColor: 'bg-emerald-50 text-emerald-700',
    title: 'Vietnam Sets New Shrimp Export Record, Surpassing $4.2B in H1 2026',
    excerpt: "Southeast Asia's largest shrimp producer has posted record first-half revenues, fuelled by growing demand from European and North American buyers.",
    author: 'FishMarketCap Research',
    date: 'July 23, 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80',
  },
  {
    slug: 'eu-seafood-labelling-2026',
    category: 'Regulation',
    categoryColor: 'bg-orange-50 text-orange-700',
    title: 'EU Introduces Stricter Seafood Labelling Rules Starting January 2027',
    excerpt: 'The European Commission has published new traceability requirements for all seafood sold in the EU, giving suppliers 18 months to comply.',
    author: 'FishMarketCap Research',
    date: 'July 21, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  },
  {
    slug: 'tuna-msc-certification',
    category: 'Sustainability',
    categoryColor: 'bg-teal-50 text-teal-700',
    title: 'Three Major Tuna Fisheries Receive MSC Certification in Pacific Waters',
    excerpt: 'The Marine Stewardship Council has granted certified sustainable status to key Pacific tuna fisheries, unlocking new premium market access.',
    author: 'FishMarketCap Research',
    date: 'July 18, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=80',
  },
  {
    slug: 'cod-north-sea-quotas',
    category: 'Market Update',
    categoryColor: 'bg-blue-50 text-[#022B96]',
    title: 'North Sea Cod Quotas Reduced by 20% for 2027 Season',
    excerpt: 'Fisheries management bodies across the UK, Norway, and Iceland have agreed to cut cod harvest quotas significantly to allow stock recovery.',
    author: 'FishMarketCap Research',
    date: 'July 15, 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=800&q=80',
  },
  {
    slug: 'aquaculture-tech-investment',
    category: 'Industry',
    categoryColor: 'bg-purple-50 text-purple-700',
    title: 'Aquaculture Tech Startups Attract $800M in Investment in First Half of 2026',
    excerpt: 'Venture capital is flooding into sustainable fish farming technology, from AI-powered feeding systems to land-based RAS facilities.',
    author: 'FishMarketCap Research',
    date: 'July 12, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80',
  },
]

const CATEGORIES = ['All', 'Market Update', 'Trade', 'Regulation', 'Sustainability', 'Industry']

export default function NewsPage() {
  const [featured, ...rest] = NEWS_ARTICLES

  return (
    <main className="min-h-screen bg-white pb-16">
      {/* Page Header */}
      <div className="border-b border-slate-100 bg-slate-50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Seafood Market News</h1>
          <p className="mt-2 text-slate-500 text-sm">Latest insights, price movements, and regulatory updates from global fish markets.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* Featured Article */}
        <Link href={`/news/${featured.slug}`} className="group block mb-12">
          <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300">
            {/* Image */}
            <div className="h-56 md:h-auto overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Content */}
            <div className="p-8 flex flex-col justify-between bg-white">
              <div>
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#022B96] transition-colors leading-snug mb-3">
                  {featured.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">{featured.excerpt}</p>
              </div>
              <div className="flex items-center gap-4 mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{featured.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featured.readTime}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Article Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article) => (
            <Link href={`/news/${article.slug}`} key={article.slug} className="group block">
              <div className="border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300 h-full flex flex-col bg-white">
                {/* Thumbnail */}
                <div className="h-44 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#022B96] transition-colors leading-snug mb-2 flex-1">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-3 border-t border-slate-100 mt-auto">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{article.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}

export interface NewsArticle {
  id: string
  slug: string
  category: 'Market Update' | 'Trade' | 'Regulation' | 'Sustainability'
  categoryColor?: string
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  image: string
  isSupplierNews?: boolean
  companyName?: string
  created_at?: string
}

export const DEFAULT_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
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
    id: 'news-2',
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
    id: 'news-3',
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
    id: 'news-4',
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
    id: 'news-5',
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
]

export function getStoredNewsArticles(): NewsArticle[] {
  if (typeof window === 'undefined') return DEFAULT_NEWS_ARTICLES
  try {
    const stored = JSON.parse(localStorage.getItem('admin_news_articles') || '[]')
    if (Array.isArray(stored) && stored.length > 0) {
      return [...stored, ...DEFAULT_NEWS_ARTICLES]
    }
  } catch (_) {}
  return DEFAULT_NEWS_ARTICLES
}

export function addNewsArticle(article: Omit<NewsArticle, 'id'>): NewsArticle {
  const newArticle: NewsArticle = {
    ...article,
    id: 'news-admin-' + Date.now(),
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem('admin_news_articles') || '[]')
      const updated = [newArticle, ...stored]
      localStorage.setItem('admin_news_articles', JSON.stringify(updated))
    } catch (_) {}
  }

  return newArticle
}

export function deleteNewsArticle(id: string): void {
  if (typeof window !== 'undefined') {
    try {
      const stored: NewsArticle[] = JSON.parse(localStorage.getItem('admin_news_articles') || '[]')
      const updated = stored.filter(a => a.id !== id)
      localStorage.setItem('admin_news_articles', JSON.stringify(updated))
    } catch (_) {}
  }
}

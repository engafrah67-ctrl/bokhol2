import { createClient } from '@/lib/supabase/client'

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

// No fake default articles — only real DB data
export const DEFAULT_NEWS_ARTICLES: NewsArticle[] = []

const STORAGE_KEY = 'admin_news_articles'

export function getStoredNewsArticles(): NewsArticle[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (Array.isArray(stored) && stored.length > 0) return stored
  } catch (_) {}
  return []
}

const SEED_SLUGS = new Set([
  'european-salmon-prices-rise-2024',
  'vietnam-seafood-exports-surge-q3',
  'king-crab-quotas-cut-2024',
  'asc-group-certification-small-farms',
  'global-salmon-prices-q3-2026',
  'vietnam-shrimp-exports-record',
  'eu-seafood-labelling-2026',
  'tuna-msc-certification',
  'cod-north-sea-quotas',
])

export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (!error && data && data.length > 0) {
      const categoryColors: Record<string, string> = {
        'Market Update': 'bg-blue-50 text-[#022B96]',
        'Market Analysis': 'bg-blue-50 text-[#022B96]',
        'Trade': 'bg-emerald-50 text-emerald-700',
        'Trade News': 'bg-emerald-50 text-emerald-700',
        'Regulation': 'bg-orange-50 text-orange-700',
        'Regulations': 'bg-orange-50 text-orange-700',
        'Sustainability': 'bg-teal-50 text-teal-700',
      }

      const dbArticles: NewsArticle[] = data
        .filter((item: any) => !SEED_SLUGS.has(item.slug))
        .map((item: any) => ({
          id: item.id,
          slug: item.slug || item.id,
          category: (item.category as any) || 'Market Update',
          categoryColor: categoryColors[item.category] || 'bg-blue-50 text-[#022B96]',
          title: item.title,
          excerpt: item.summary || item.content || '',
          author: item.author || 'Bokhol Research',
          date: item.published_at
            ? new Date(item.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : 'Recent',
          readTime: '3 min read',
          image: item.cover_image_url || '',
          created_at: item.created_at,
        }))

      // Merge with admin-added local articles (by slug to avoid duplicates)
      const local = getStoredNewsArticles().filter((a) => !SEED_SLUGS.has(a.slug))
      const seen = new Set(dbArticles.map((a) => a.slug))
      const extraLocal = local.filter((a) => !seen.has(a.slug))
      return [...dbArticles, ...extraLocal]
    }
  } catch (_) {}

  // Fallback: only local admin-added articles
  return getStoredNewsArticles().filter((a) => !SEED_SLUGS.has(a.slug))
}

export function addNewsArticle(article: Omit<NewsArticle, 'id'>): NewsArticle {
  const newArticle: NewsArticle = {
    ...article,
    id: 'news-admin-' + Date.now(),
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const updated = [newArticle, ...stored]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('news-articles-updated'))
    } catch (_) {}

    // Asynchronously insert to Supabase database
    try {
      const supabase = createClient()
      supabase
        .from('news')
        .insert({
          title: article.title,
          slug: article.slug,
          summary: article.excerpt,
          content: article.excerpt,
          category: article.category,
          cover_image_url: article.image,
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase news insert warning:', error.message)
        })
        .catch(() => {})
    } catch (_) {}
  }

  return newArticle
}

export function deleteNewsArticle(id: string): void {
  if (typeof window !== 'undefined') {
    try {
      const stored: NewsArticle[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const updated = stored.filter((a) => a.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('news-articles-updated'))
    } catch (_) {}

    try {
      const supabase = createClient()
      supabase
        .from('news')
        .delete()
        .or(`id.eq.${id},slug.eq.${id}`)
        .then(() => {})
        .catch(() => {})
    } catch (_) {}
  }
}

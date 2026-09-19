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

      // Persist latest database state into localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dbArticles))
        } catch (_) {}
      }

      return dbArticles
    }
  } catch (err) {
    console.warn('fetchNewsArticles error:', err)
  }

  // Fallback: cached admin articles
  return getStoredNewsArticles().filter((a) => !SEED_SLUGS.has(a.slug))
}

export async function addNewsArticle(article: Omit<NewsArticle, 'id'>): Promise<NewsArticle> {
  let createdArticle: NewsArticle = {
    ...article,
    id: 'news-admin-' + Date.now(),
  }

  // 1. Insert into Supabase
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('news')
      .insert({
        title: article.title,
        slug: article.slug,
        summary: article.excerpt,
        content: article.excerpt,
        category: article.category,
        author: article.author || 'Bokhol Research',
        cover_image_url: article.image,
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (!error && data) {
      createdArticle = {
        ...article,
        id: data.id,
        created_at: data.created_at,
      }
    } else if (error) {
      console.warn('Supabase news insert warning:', error.message)
    }
  } catch (err) {
    console.error('Error inserting news article:', err)
  }

  // 2. Keep local cache up to date
  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const filtered = stored.filter((a: any) => a.slug !== article.slug && a.id !== createdArticle.id)
      const updated = [createdArticle, ...filtered]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('news-articles-updated'))
    } catch (_) {}
  }

  return createdArticle
}

export async function deleteNewsArticle(id: string): Promise<void> {
  // 1. Delete from Supabase
  try {
    const supabase = createClient()
    await supabase
      .from('news')
      .delete()
      .or(`id.eq.${id},slug.eq.${id}`)
  } catch (err) {
    console.error('Error deleting news article from Supabase:', err)
  }

  // 2. Remove from local cache
  if (typeof window !== 'undefined') {
    try {
      const stored: NewsArticle[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const updated = stored.filter((a) => a.id !== id && a.slug !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('news-articles-updated'))
    } catch (_) {}
  }
}


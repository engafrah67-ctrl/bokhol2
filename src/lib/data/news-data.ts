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

const CATEGORY_COLORS: Record<string, string> = {
  'Market Update':  'bg-blue-50 text-[#022B96]',
  'Market Analysis':'bg-blue-50 text-[#022B96]',
  'Trade':          'bg-emerald-50 text-emerald-700',
  'Trade News':     'bg-emerald-50 text-emerald-700',
  'Regulation':     'bg-orange-50 text-orange-700',
  'Regulations':    'bg-orange-50 text-orange-700',
  'Sustainability': 'bg-teal-50 text-teal-700',
}

function mapRow(item: any): NewsArticle {
  // Author may be stored in content JSON metadata or as a separate field
  let authorName = 'Bokhol Research'
  try {
    const parsed = JSON.parse(item.content || '{}')
    if (parsed?.authorName) authorName = parsed.authorName
  } catch (_) {}

  return {
    id: item.id,
    slug: item.slug || item.id,
    category: (item.category as any) || 'Market Update',
    categoryColor: CATEGORY_COLORS[item.category] || 'bg-blue-50 text-[#022B96]',
    title: item.title,
    excerpt: item.summary || '',
    author: authorName,
    date: item.published_at
      ? new Date(item.published_at).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Recent',
    readTime: '3 min read',
    image: item.cover_image_url || '',
    created_at: item.created_at,
  }
}

export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (error) throw error
    return (data ?? []).map(mapRow)
  } catch (err) {
    console.warn('fetchNewsArticles error:', err)
    return []
  }
}

export async function addNewsArticle(
  article: Omit<NewsArticle, 'id'>
): Promise<NewsArticle> {
  const supabase = createClient()

  // Store author name inside content JSON since the DB has no `author` text column
  const contentJson = JSON.stringify({
    authorName: article.author || 'Bokhol Research',
    excerpt: article.excerpt,
  })

  const { data, error } = await supabase
    .from('news')
    .insert({
      title: article.title,
      slug: article.slug,
      summary: article.excerpt,
      content: contentJson,
      category: article.category,
      cover_image_url: article.image || null,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapRow(data)
}

export async function deleteNewsArticle(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('news')
    .delete()
    .or(`id.eq.${id},slug.eq.${id}`)

  if (error) throw new Error(error.message)
}

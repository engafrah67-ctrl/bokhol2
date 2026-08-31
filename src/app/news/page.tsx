import { createPublicServerClient } from '@/lib/supabase/server'
import { NewsArticle } from '@/lib/data/news-data'
import { NewsClient, SupplierPostFeed } from '@/components/news/news-client'

export const revalidate = 60 // Cache statically and revalidate every 60 seconds

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

const CATEGORY_COLORS: Record<string, string> = {
  'Market Update': 'bg-blue-50 text-[#022B96]',
  'Market Analysis': 'bg-blue-50 text-[#022B96]',
  'Trade': 'bg-emerald-50 text-emerald-700',
  'Trade News': 'bg-emerald-50 text-emerald-700',
  'Regulation': 'bg-orange-50 text-orange-700',
  'Regulations': 'bg-orange-50 text-orange-700',
  'Sustainability': 'bg-teal-50 text-teal-700',
}

export default async function NewsPage() {
  const supabase = createPublicServerClient()

  // Fetch news articles and supplier posts in parallel on the server
  const [newsRes, postsRes] = await Promise.allSettled([
    supabase
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false }),
    supabase
      .from('supplier_posts')
      .select(`
        id, title, content, created_at,
        companies(id, name, slug, logo_url, city)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  let articles: NewsArticle[] = []
  if (newsRes.status === 'fulfilled' && newsRes.value.data) {
    articles = newsRes.value.data
      .filter((item: any) => !SEED_SLUGS.has(item.slug))
      .map((item: any) => ({
        id: item.id,
        slug: item.slug || item.id,
        category: (item.category as any) || 'Market Update',
        categoryColor: CATEGORY_COLORS[item.category] || 'bg-blue-50 text-[#022B96]',
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
  }

  let supplierPosts: SupplierPostFeed[] = []
  if (postsRes.status === 'fulfilled' && postsRes.value.data) {
    supplierPosts = postsRes.value.data.map((post: any) => {
      let details: any = {}
      try { details = JSON.parse(post.content || '{}') } catch (_) {}

      const company = Array.isArray(post.companies) ? post.companies[0] : post.companies
      const price = details.pricePerKg
      const currency = details.currency || 'EUR'

      return {
        id: post.id,
        supplierName: company?.name || 'Verified Supplier',
        companySlug: company?.slug || '',
        logoUrl: company?.logo_url || null,
        title: `${details.productName || post.title?.split(' —')[0] || 'Seafood'} — Available for Dispatch`,
        productName: details.productName || post.title?.split(' —')[0] || 'Seafood',
        pricePerKg: price ? `${currency} ${Number(price).toFixed(2)} / kg` : 'Contact Supplier',
        freshFrozen: details.freshFrozen || 'Frozen',
        location: details.location || (company?.city ? company.city : 'EU Port'),
        availability: details.availability || 'In Stock — Ready to Ship',
        supplierInfoExtra: details.supplierInfoExtra || '',
        date: new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      }
    })
  }

  return (
    <NewsClient
      initialArticles={articles}
      initialSupplierPosts={supplierPosts}
    />
  )
}

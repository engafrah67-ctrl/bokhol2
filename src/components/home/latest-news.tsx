'use client'

import Link from 'next/link'
import { ArrowRight, Newspaper } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

interface NewsRow {
  id: string
  slug?: string | null
  title: string
  summary?: string | null
  category?: string | null
  cover_image_url?: string | null
  published_at?: string | null
  created_at?: string | null
}

interface LatestNewsProps {
  news: NewsRow[]
}

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Home page section: the latest news articles published by the admin. */
export function LatestNews({ news }: LatestNewsProps) {
  const { t } = useLanguage()
  const items = news.slice(0, 3)

  if (items.length === 0) return null

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          {t('feed_latest_news', 'Latest News')}
        </h2>
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('news_view_all', 'View all')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/news/${item.slug || item.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white dark:bg-slate-900 transition-shadow hover:shadow-md"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
              {item.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.cover_image_url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                  <Newspaper className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                {item.category && (
                  <span className="font-semibold text-[#022B96] dark:text-blue-300">{item.category}</span>
                )}
                {item.category && (item.published_at || item.created_at) && <span>·</span>}
                <span>{formatDate(item.published_at || item.created_at)}</span>
              </div>

              <h3 className="text-base font-bold leading-snug text-foreground line-clamp-2 group-hover:underline">
                {item.title}
              </h3>

              {item.summary && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">{item.summary}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

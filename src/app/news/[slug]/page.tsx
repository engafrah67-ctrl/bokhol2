'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User, Share2, Tag, ChevronRight, Newspaper, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getStoredNewsArticles } from '@/lib/data/news-data'

interface ArticleDetail {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string
  cover_image_url: string | null
  category: string | null
  tags: string[] | null
  author: string
  published_at: string | null
  created_at: string
}

export default function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadArticle() {
      const supabase = createClient()
      try {
        // 1. Try fetching from Supabase news table
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .maybeSingle()

        if (!error && data) {
          setArticle({
            id: data.id,
            title: data.title,
            slug: data.slug,
            summary: data.summary,
            content: data.content || data.summary || '',
            cover_image_url: data.cover_image_url,
            category: data.category || 'Market Update',
            tags: data.tags || [],
            author: 'Bokhol Market Research',
            published_at: data.published_at,
            created_at: data.created_at,
          })
          setLoading(false)
          return
        }

        // 2. Fallback to localStorage articles (admin created)
        const local = getStoredNewsArticles()
        const found = local.find((a) => a.slug === slug || a.id === slug)
        if (found) {
          setArticle({
            id: found.id,
            title: found.title,
            slug: found.slug,
            summary: found.excerpt,
            content: found.excerpt,
            cover_image_url: found.image,
            category: found.category,
            tags: [],
            author: found.author || 'Bokhol Research',
            published_at: found.date,
            created_at: found.created_at || new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error('Failed to load article:', err)
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [slug])

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-[#022B96]" />
        <span className="text-sm font-medium">Loading article...</span>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-transparent py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Newspaper className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Article Not Found</h1>
          <p className="text-sm text-slate-500 mb-6">
            The news article you are looking for may have been moved or removed.
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-sm font-bold rounded-xl shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to News Feed
          </Link>
        </div>
      </main>
    )
  }

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent'

  return (
    <main className="min-h-screen bg-transparent pb-24">
      {/* Top Breadcrumbs & Back Nav */}
      <div className="border-b border-white/50 bg-transparent py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#022B96] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to News & Feed
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>News</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-700 font-semibold">{article.category || 'Article'}</span>
            </div>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Category & Title */}
        <div className="space-y-4 mb-8">
          {article.category && (
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-[#022B96] bg-blue-50 px-3 py-1 rounded-lg border border-blue-100/60">
              {article.category}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Meta bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                3 min read
              </span>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Link Copied!' : 'Share'}
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {article.cover_image_url && (
          <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden mb-10 border border-slate-200 shadow-sm">
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}



        {/* Article Body */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
            {article.content}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>


      </article>
    </main>
  )
}

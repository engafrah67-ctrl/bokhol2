'use client'

import { useState } from 'react'
import { ChevronDown, Fish } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

export function FAQSection() {
  const { t } = useLanguage()

  const FAQS = [
    {
      q: t('faq_q1'),
      a: t('faq_a1'),
    },
    {
      q: t('faq_q2'),
      a: t('faq_a2'),
      list: [
        'Seafood Suppliers', 'Importers', 'Wholesalers', 'Processors',
        'Restaurants', 'Hotels', 'Fish Shops', 'Catering Companies',
        'Foodservice Buyers',
      ],
    },
    {
      q: t('faq_q3'),
      a: t('faq_a3'),
    },
    {
      q: t('faq_q4'),
      a: t('faq_a4'),
    },
    {
      q: t('faq_q5'),
      a: t('faq_a5'),
    },
    {
      q: t('faq_q6'),
      a: t('faq_a6'),
    },
    {
      q: t('faq_q7'),
      a: t('faq_a7'),
    },
    {
      q: t('faq_q8'),
      a: t('faq_a8'),
    },
    {
      q: t('faq_q9'),
      a: t('faq_a9'),
    },
    {
      q: t('faq_q10'),
      a: t('faq_a10'),
      example: 'Need 500 KG Atlantic Salmon · Location: Amsterdam · Delivery: Next Week',
    },
    {
      q: t('faq_q11'),
      a: t('faq_a11'),
    },
    {
      q: t('faq_q12'),
      a: t('faq_a12'),
    },
    {
      q: t('faq_q13'),
      a: t('faq_a13'),
    },
    {
      q: t('faq_q14'),
      a: t('faq_a14'),
    },
    {
      q: t('faq_q15'),
      a: t('faq_a15'),
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-slate-50 dark:bg-slate-900/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {t('faq_title')}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t('faq_subtitle')}
        </p>
      </div>

      {/* FAQ Grid */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {FAQS.map((faq, idx) => (
          <FAQItem key={idx} q={faq.q} a={faq.a} list={faq.list} example={faq.example} />
        ))}
      </div>

      {/* Promise Banner */}
      <div className="mx-6 sm:mx-8 mb-8 rounded-xl bg-gradient-to-r from-[#022B96] to-[#1a4fd6] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Fish className="h-8 w-8 text-white/80 shrink-0" />
        <div>
          <p className="text-white font-bold text-sm">{t('faq_promise_title')}</p>
          <p className="text-white/90 text-xs leading-relaxed mt-0.5">
            {t('faq_promise_body')}
          </p>
        </div>
      </div>
    </div>
  )
}

function FAQItem({ q, a, list, example }: { q: string; a: string | null; list?: string[]; example?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`border border-border rounded-xl overflow-hidden transition-all duration-200 ${open ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-white dark:bg-slate-800/80 hover:border-[#022B96]/30'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-foreground leading-snug">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-[#022B96]' : ''}`}
        />
      </button>

      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-border pt-4">
            {a && (
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            )}
            {list && (
              <ul className="flex flex-wrap gap-2 mt-1">
                {list.map((item) => (
                  <li key={item} className="text-xs font-semibold text-foreground bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-border">
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {example && (
              <div className="mt-3 bg-slate-50 dark:bg-slate-900 border border-border rounded-lg px-4 py-3 text-xs text-muted-foreground font-medium italic">
                {example}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

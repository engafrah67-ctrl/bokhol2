import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SOLUTIONS } from '@/lib/data/solutions-data'
import { SolutionIcon } from '@/components/solutions/solution-icon'

export const metadata: Metadata = {
  title: 'Solutions',
  description: 'How seafood buyers use Bokhol to verify prices, find suppliers, source with requests and time their orders.',
}

export default function SolutionsPage() {
  return (
    <main className="pb-20">
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#022B96]">Solutions</p>
        <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Smarter seafood buying, step by step
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Four ways buyers use Bokhol to check prices, find suppliers and buy at the right time.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 gap-5">
        {SOLUTIONS.map((s) => (
          <Link
            key={s.slug}
            href={`/solutions/${s.slug}`}
            className="group flex gap-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition hover:shadow-md hover:border-[#022B96]/40"
          >
            <div className="h-12 w-12 shrink-0 rounded-xl bg-[#022B96]/10 text-[#022B96] dark:text-blue-300 flex items-center justify-center">
              <SolutionIcon name={s.icon} className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#022B96]">{s.name}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.summary}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#022B96] dark:text-blue-300">
                Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}

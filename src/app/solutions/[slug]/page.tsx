import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, X, ChevronDown } from 'lucide-react'
import { SOLUTIONS, getSolution } from '@/lib/data/solutions-data'
import { SolutionIcon } from '@/components/solutions/solution-icon'

type Params = Promise<{ slug: string }>

// Only the use cases defined in solutions-data exist; anything else is a 404
export const dynamicParams = false

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const solution = getSolution((await params).slug)
  if (!solution) return {}
  return {
    title: solution.name,
    description: solution.hero.subtitle,
  }
}

const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#022B96] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#011a5e]'
const secondaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 transition hover:bg-slate-50 dark:hover:bg-slate-800'

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-[#022B96] dark:text-blue-300">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h2>
    </div>
  )
}

export default async function SolutionPage({ params }: { params: Params }) {
  const solution = getSolution((await params).slug)
  if (!solution) notFound()

  const related = SOLUTIONS.filter((s) => s.slug !== solution.slug)

  return (
    <main className="pb-20">
      {/* 1. Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#022B96]/20 bg-[#022B96]/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#022B96] dark:text-blue-300">
          <SolutionIcon name={solution.icon} className="h-3.5 w-3.5" />
          {solution.hero.eyebrow}
        </span>
        <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
          {solution.hero.title}
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {solution.hero.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className={primaryBtn}>
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={solution.steps[0].cta.href} className={secondaryBtn}>
            {solution.steps[0].cta.label}
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-24">
        {/* 2. Before / after */}
        <section>
          <SectionHeading title={solution.problem.title} />
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-7">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Without Bokhol</h3>
              <ul className="mt-5 space-y-4">
                {solution.problem.before.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center">
                      <X className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#022B96]/20 bg-white dark:bg-slate-900 p-7 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#022B96] dark:text-blue-300">With Bokhol</h3>
              <ul className="mt-5 space-y-4">
                {solution.problem.after.map((item) => (
                  <li key={item} className="flex gap-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Steps */}
        <section>
          <SectionHeading eyebrow="How it works" title="Four simple steps" />
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {solution.steps.map((step, i) => (
              <li
                key={step.title}
                className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
              >
                <span className="h-9 w-9 rounded-full bg-[#022B96] text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.text}</p>
                <Link
                  href={step.cta.href}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#022B96] dark:text-blue-300 hover:underline"
                >
                  {step.cta.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* 4. Tools */}
        <section>
          <SectionHeading eyebrow="Tools" title="Everything you need in one place" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {solution.tools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition hover:shadow-md hover:border-[#022B96]/40"
              >
                <div className="h-11 w-11 rounded-xl bg-[#022B96]/10 text-[#022B96] dark:text-blue-300 flex items-center justify-center">
                  <SolutionIcon name={tool.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900 dark:text-white group-hover:text-[#022B96]">{tool.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{tool.text}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. Related use cases */}
        <section>
          <SectionHeading eyebrow="More solutions" title="Explore other use cases" />
          <div className="grid md:grid-cols-3 gap-5">
            {related.map((s) => (
              <Link
                key={s.slug}
                href={`/solutions/${s.slug}`}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition hover:shadow-md hover:border-[#022B96]/40"
              >
                <SolutionIcon name={s.icon} className="h-6 w-6 text-[#022B96] dark:text-blue-300" />
                <h3 className="mt-4 font-bold text-slate-900 dark:text-white group-hover:text-[#022B96]">{s.name}</h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{s.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#022B96] dark:text-blue-300">
                  Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="max-w-3xl mx-auto">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
          <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {solution.faq.map((item) => (
              <details key={item.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white">
                  {item.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 7. Final CTA */}
        <section className="rounded-3xl bg-gradient-to-br from-[#022B96] via-[#0a3fbf] to-[#0891b2] px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">Make smarter seafood decisions</h2>
          <p className="mt-3 text-blue-100/90 max-w-xl mx-auto">
            Register free to see live prices, supplier offers and the Seafood Index.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#022B96] transition hover:bg-blue-50"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

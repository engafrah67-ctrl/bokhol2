'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Globe2,
  TrendingUp,
  ShieldCheck,
  Users,
  ArrowRight,
  Handshake,
  Lightbulb,
  Network,
  Eye,
  Target,
  Fish,
  Building2,
  Store,
  ChefHat,
  Truck,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

// ─── Intersection Observer Hook ───────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const VALUES = [
  {
    icon: Eye,
    title: 'Transparency',
    color: 'from-blue-500 to-cyan-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    description:
      'We believe businesses should have access to clear and accessible market information. No hidden data, no opaque processes.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust',
    color: 'from-emerald-500 to-teal-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    description:
      'Strong business relationships are built on credibility and trust. We verify every participant on our platform.',
  },
  {
    icon: Network,
    title: 'Connectivity',
    color: 'from-violet-500 to-purple-400',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-800',
    description:
      'The seafood industry grows when businesses can easily find and connect with each other — across borders and time zones.',
  },
  {
    icon: Lightbulb,
    title: 'Growth',
    color: 'from-amber-500 to-orange-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    description:
      'We help companies increase their visibility and discover new opportunities in markets they have not reached yet.',
  },
]

const WHAT_WE_DO = [
  {
    icon: Fish,
    text: 'Discover seafood suppliers',
    bgClass: 'bg-blue-600 dark:bg-blue-500 text-white',
    hoverBorder: 'hover:border-blue-500/50 hover:shadow-blue-500/5',
  },
  {
    icon: Package,
    text: 'Promote products and company offers',
    bgClass: 'bg-emerald-600 dark:bg-emerald-500 text-white',
    hoverBorder: 'hover:border-emerald-500/50 hover:shadow-emerald-500/5',
  },
  {
    icon: Handshake,
    text: 'Connect buyers and sellers',
    bgClass: 'bg-violet-600 dark:bg-violet-500 text-white',
    hoverBorder: 'hover:border-violet-500/50 hover:shadow-violet-500/5',
  },
  {
    icon: Globe2,
    text: 'Increase business visibility',
    bgClass: 'bg-amber-600 dark:bg-amber-500 text-white',
    hoverBorder: 'hover:border-amber-500/50 hover:shadow-amber-500/5',
  },
  {
    icon: TrendingUp,
    text: 'Explore new market opportunities',
    bgClass: 'bg-rose-600 dark:bg-rose-500 text-white',
    hoverBorder: 'hover:border-rose-500/50 hover:shadow-rose-500/5',
  },
  {
    icon: ShieldCheck,
    text: 'Stay informed about industry activity',
    bgClass: 'bg-indigo-600 dark:bg-indigo-500 text-white',
    hoverBorder: 'hover:border-indigo-500/50 hover:shadow-indigo-500/5',
  },
  {
    icon: Network,
    text: 'Build professional seafood networks',
    bgClass: 'bg-teal-600 dark:bg-teal-500 text-white',
    hoverBorder: 'hover:border-teal-500/50 hover:shadow-teal-500/5',
  },
]

const WHO_WE_SERVE = [
  {
    icon: Truck,
    label: 'Wholesalers',
    desc: 'Find new customers & expand reach',
    bgClass: 'bg-blue-600 dark:bg-blue-500 text-white',
    hoverBorder: 'hover:border-blue-500/50 hover:shadow-blue-500/5',
  },
  {
    icon: Building2,
    label: 'Importers',
    desc: 'Gain EU market exposure',
    bgClass: 'bg-emerald-600 dark:bg-emerald-500 text-white',
    hoverBorder: 'hover:border-emerald-500/50 hover:shadow-emerald-500/5',
  },
  {
    icon: Fish,
    label: 'Suppliers',
    desc: 'Showcase your products globally',
    bgClass: 'bg-violet-600 dark:bg-violet-500 text-white',
    hoverBorder: 'hover:border-violet-500/50 hover:shadow-violet-500/5',
  },
  {
    icon: ChefHat,
    label: 'Restaurants',
    desc: 'Source trusted, verified suppliers',
    bgClass: 'bg-amber-600 dark:bg-amber-500 text-white',
    hoverBorder: 'hover:border-amber-500/50 hover:shadow-amber-500/5',
  },
  {
    icon: Store,
    label: 'Fish Shops',
    desc: 'Discover fresh product lines',
    bgClass: 'bg-rose-600 dark:bg-rose-500 text-white',
    hoverBorder: 'hover:border-rose-500/50 hover:shadow-rose-500/5',
  },
  {
    icon: Users,
    label: 'Processors',
    desc: 'Connect with raw material sources',
    bgClass: 'bg-indigo-600 dark:bg-indigo-500 text-white',
    hoverBorder: 'hover:border-indigo-500/50 hover:shadow-indigo-500/5',
  },
]

const WHY_ITEMS = [
  'Calling multiple suppliers',
  'Comparing offers manually',
  'Searching for trusted companies',
  'Looking for new sourcing opportunities',
]

const supplierLogos = [
  { id: '1', name: 'DAYSEADAY', logo: '/partners/dayseaday.png' },
  { id: '2', name: 'AM fish', logo: '/partners/am-fish.png' },
  { id: '3', name: 'ATL SEAFOOD', logo: '/partners/atl-seafood.png' },
  { id: '4', name: 'ANT SEAFOOD', logo: '/partners/ant-seafood.png' },
  { id: '5', name: 'amacore', logo: '/partners/amacore.png' },
  { id: '6', name: 'BLUE WORLD SEAFOOD', logo: '/partners/blue-world-seafood.png' },
]


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const { t } = useLanguage()
  const { ref: valuesRef, inView: valuesInView } = useInView(0.1)
  const { ref: missionRef, inView: missionInView } = useInView(0.2)

  return (
    <main className="min-h-screen bg-transparent text-foreground pb-20 overflow-x-hidden">

      {/* ── 1. HERO BANNER ────────────────────────────────────────────── */}
      <section className="relative w-full flex flex-col items-center justify-center min-h-[280px] md:min-h-[360px] overflow-hidden mb-12">
        {/* No image — global gradient shows through */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 flex flex-col items-center text-center py-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
            {t('about_title')}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
            {t('about_desc')}
          </p>
        </div>
      </section>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">



        {/* ── 4. WHAT WE DO ─────────────────────────────────────────────── */}
        <section className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Everything Your Seafood Business Needs
            </h2>
            <p className="text-muted-foreground text-base">
              Bokhol FishMarketCap brings suppliers and buyers together in one digital environment,
              helping businesses save time, expand their network, and make better purchasing decisions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHAT_WE_DO.map((item, i) => (
              <div
                key={i}
                className={`group flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${item.hoverBorder}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${item.bgClass}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-foreground leading-snug">{item.text}</span>
              </div>
            ))}
            {/* Extra — "and more" pill */}
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-dashed border-border bg-muted/30">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">…and much more</span>
            </div>
          </div>
        </section>

        {/* ── 5. MISSION & VISION ───────────────────────────────────────── */}
        <section ref={missionRef} className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Mission &amp; Vision
            </h2>
            <p className="text-muted-foreground text-sm">
              The two pillars that drive everything we build at Bokhol FishMarketCap.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Mission Card */}
            <div
              className={`relative overflow-hidden rounded-3xl p-8 md:p-10 transition-all duration-700 ${
                missionInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
              style={{
                background: 'linear-gradient(135deg, #022B96 0%, #0a3fbf 50%, #1e6fd9 100%)',
              }}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 opacity-10"
                style={{
                  background: 'radial-gradient(circle, white 0%, transparent 70%)',
                  borderRadius: '50%',
                  transform: 'translate(30%, -30%)',
                }}
              />
              <div className="relative z-10 space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white mb-4 leading-tight">
                    Making Seafood Sourcing Easier
                  </h3>
                  <p className="text-blue-100/85 text-sm leading-relaxed">
                    To make seafood sourcing and supplier discovery easier by creating a transparent
                    platform where businesses can connect, promote their products, and understand
                    the market before making purchasing decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* Vision Card */}
            <div
              className={`relative overflow-hidden rounded-3xl p-8 md:p-10 transition-all duration-700 delay-150 ${
                missionInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
              style={{
                background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #06b6d4 100%)',
              }}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 opacity-10"
                style={{
                  background: 'radial-gradient(circle, white 0%, transparent 70%)',
                  borderRadius: '50%',
                  transform: 'translate(30%, -30%)',
                }}
              />
              <div className="relative z-10 space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Globe2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white mb-4 leading-tight">
                    The Leading Seafood Network
                  </h3>
                  <p className="text-cyan-50/85 text-sm leading-relaxed">
                    To become the leading digital seafood business network where suppliers,
                    wholesalers, importers, and buyers can connect, discover opportunities,
                    and build long-term business relationships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. WHY BOKHOL ─────────────────────────────────────────────── */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Pain points */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              The Industry Problem{' '}
              <span className="text-[#022B96]">We Solve</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Today, many seafood buyers spend valuable time on tasks that should not take this long:
            </p>
            <ul className="space-y-3">
              {WHY_ITEMS.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 text-xs font-bold">✕</span>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Who we serve grid */}
          <div className="grid grid-cols-2 gap-4">
            {WHO_WE_SERVE.map((item, i) => (
              <div
                key={i}
                className={`group p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default ${item.hoverBorder}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105 ${item.bgClass}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. VALUES ─────────────────────────────────────────────────── */}
        <section ref={valuesRef} className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#022B96] px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Our Values
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              What We Stand For
            </h2>
            <p className="text-muted-foreground text-base">
              Four principles that guide every decision we make.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className={`group p-6 rounded-2xl border ${v.border} ${v.bg} hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${
                  valuesInView
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: valuesInView ? `${i * 100}ms` : '0ms' }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-4 shadow-md`}>
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-extrabold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 8. OUR GOAL ───────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
          style={{
            background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f4ff 50%, #f0faff 100%)',
          }}
        >
          <div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #022B96 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #0e7490 0%, transparent 70%)' }}
          />

          <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#022B96] px-3 py-1.5 rounded-full bg-[#022B96]/10 border border-[#022B96]/20">
                <Target className="w-3.5 h-3.5" />
                Our Goal
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                The Place Where Seafood Businesses Come Together
              </h2>
              <p className="text-slate-700 text-base leading-relaxed">
                Our goal is to become the place where seafood companies, wholesalers, importers,
                restaurants, hotels, fish shops, and foodservice buyers come together to discover
                products, build relationships, and understand the market before placing their next order.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Seafood Companies', icon: Building2 },
                { label: 'Wholesalers', icon: Truck },
                { label: 'Importers & Exporters', icon: Globe2 },
                { label: 'Restaurants & Hotels', icon: ChefHat },
                { label: 'Fish Shops', icon: Store },
                { label: 'Foodservice Buyers', icon: Users },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 border border-[#022B96]/10 shadow-sm">
                  <item.icon className="w-4 h-4 text-[#022B96] flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. TRUSTED PARTNERS ───────────────────────────────────────── */}
        <section className="space-y-8 text-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#022B96] px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
              <Handshake className="w-3.5 h-3.5" />
              Network
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Trusted by Producers, Buyers &amp; Industry Leaders
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              A growing community of verified seafood companies already on our platform.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {supplierLogos.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-2xl p-5 flex items-center justify-center h-24 hover:shadow-md hover:border-[#022B96]/40 transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer"
              >
                <Image
                  src={item.logo}
                  alt={`${item.name} logo`}
                  width={140}
                  height={50}
                  unoptimized
                  className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── 10. CALL TO ACTION ────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden rounded-3xl text-center mb-4"
          style={{
            background: 'linear-gradient(135deg, #022B96 0%, #0a3fbf 40%, #0891b2 100%)',
          }}
        >
          <div
            className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative z-10 px-8 sm:px-12 py-12 sm:py-16 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Explore the EU Seafood Market?
            </h2>
            <p className="text-blue-100/85 text-base max-w-xl mx-auto leading-relaxed">
              Whether you are a supplier looking for new customers, an importer seeking market exposure,
              or a buyer searching for trusted suppliers — Bokhol FishMarketCap is your place.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/suppliers">
                <Button
                  size="lg"
                  className="bg-white text-[#022B96] hover:bg-blue-50 font-bold rounded-xl gap-2 shadow-xl cursor-pointer"
                >
                  Browse Suppliers
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/countries">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 font-semibold rounded-xl cursor-pointer bg-transparent"
                >
                  Explore Our Network
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}

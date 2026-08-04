'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Globe2,
  TrendingUp,
  ShieldCheck,
  Building2,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

// Partner tabs data
const PARTNER_TABS = [
  { id: 'suppliers', label: 'Exporters & Suppliers' },
  { id: 'certifications', label: 'Certifications & Honors' },
  { id: 'partners', label: 'Trade Partners' },
  { id: 'hubs', label: 'European Market Hubs' },
]

const PARTNER_ITEMS: {
  id: string
  name: string
  logo?: string
  subtitle?: string
  category: string
}[] = [
  // Exporters & Suppliers
  { id: '1', name: 'DAYSEADAY', logo: '/partners/dayseaday.png', category: 'suppliers' },
  { id: '2', name: 'AM fish', logo: '/partners/am-fish.png', category: 'suppliers' },
  { id: '3', name: 'ATL SEAFOOD', logo: '/partners/atl-seafood.png', category: 'suppliers' },
  { id: '4', name: 'ANT SEAFOOD', logo: '/partners/ant-seafood.png', category: 'suppliers' },
  { id: '5', name: 'amacore', logo: '/partners/amacore.png', category: 'suppliers' },
  { id: '6', name: 'BLUE WORLD SEAFOOD', logo: '/partners/blue-world-seafood.png', category: 'suppliers' },
  // Certifications
  { id: 'c1', name: 'MSC Certified', subtitle: 'Sustainable Fishing', category: 'certifications' },
  { id: 'c2', name: 'ASC Seafood', subtitle: 'Responsible Farming', category: 'certifications' },
  { id: 'c3', name: 'HACCP Compliant', subtitle: 'Food Safety Standard', category: 'certifications' },
  { id: 'c4', name: 'IFS Food', subtitle: 'Quality Standard', category: 'certifications' },
  { id: 'c5', name: 'GlobalG.A.P.', subtitle: 'Aquaculture Certified', category: 'certifications' },
  // Trade Partners
  { id: 'p1', name: 'DAYSEADAY', logo: '/partners/dayseaday.png', category: 'partners' },
  { id: 'p2', name: 'BLUE WORLD', logo: '/partners/blue-world-seafood.png', category: 'partners' },
  { id: 'p3', name: 'AMACORE', logo: '/partners/amacore.png', category: 'partners' },
  { id: 'p4', name: 'ATL SEAFOOD', logo: '/partners/atl-seafood.png', category: 'partners' },
  { id: 'p5', name: 'ANT SEAFOOD', logo: '/partners/ant-seafood.png', category: 'partners' },
  // Market Hubs
  { id: 'h1', name: 'Urk Seafood Hub', subtitle: 'Netherlands', category: 'hubs' },
  { id: 'h2', name: 'Bergen Marine Port', subtitle: 'Norway', category: 'hubs' },
  { id: 'h3', name: 'Vigo Fish Market', subtitle: 'Spain', category: 'hubs' },
  { id: 'h4', name: 'Skagen Trading Centre', subtitle: 'Denmark', category: 'hubs' },
  { id: 'h5', name: 'Boulogne-sur-Mer', subtitle: 'France', category: 'hubs' },
]

const PILLARS = [
  {
    icon: BarChart3,
    title: 'European Price Indexes',
    description:
      'Weekly benchmark pricing for Atlantic Salmon, Cod, Tuna, and Shrimp sourced directly from primary European spot markets and auction houses.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Supplier Directory',
    description:
      'Rigorous verification process for exporters and aquaculture facilities, ensuring ASC, MSC, and HACCP compliance standards.',
  },
  {
    icon: Users,
    title: 'Direct B2B Matchmaking',
    description:
      'Enabling international buyers and sellers to negotiate buying tenders, issue RFQs, and settle trade agreements transparently.',
  },
  {
    icon: Globe2,
    title: 'Global Trade Intelligence',
    description:
      'In-depth market reports, trade flows, regulatory updates, and species analytics to inform smarter commercial decisions.',
  },
]

const VALUES = [
  {
    title: 'Transparency',
    description: 'Democratizing seafood pricing data to level the playing field for all market participants.',
  },
  {
    title: 'Traceability & Sustainability',
    description: 'Championing eco-certified suppliers and responsible fishing practices worldwide.',
  },
  {
    title: 'Trade Efficiency',
    description: 'Eliminating friction in B2B seafood procurement through real-time communication tools.',
  },
]

export default function AboutPage() {
  const { t } = useLanguage()

  const supplierLogos = [
    { id: '1', name: 'DAYSEADAY', logo: '/partners/dayseaday.png' },
    { id: '2', name: 'AM fish', logo: '/partners/am-fish.png' },
    { id: '3', name: 'ATL SEAFOOD', logo: '/partners/atl-seafood.png' },
    { id: '4', name: 'ANT SEAFOOD', logo: '/partners/ant-seafood.png' },
    { id: '5', name: 'amacore', logo: '/partners/amacore.png' },
    { id: '6', name: 'BLUE WORLD SEAFOOD', logo: '/partners/blue-world-seafood.png' },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground pb-16">
      {/* 1. Hero Banner */}
      <section className="relative w-full flex flex-col items-center justify-center min-h-[340px] md:min-h-[420px] overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <Image
            src="/map-bg.jpg"
            alt="Global Seafood Map"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-slate-950/40" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 flex flex-col items-center text-center py-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
            {t('about_title')}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-200/90 max-w-2xl leading-relaxed">
            {t('about_desc')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* 2. Partners — Clean Logo Grid, no tabs */}
        <div className="space-y-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Trusted by producers, buyers<br className="hidden sm:block" /> and industry leaders
          </h2>

          {/* Logo Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {supplierLogos.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-center h-24 hover:shadow-md hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all duration-200 group cursor-pointer"
              >
                <Image
                  src={item.logo}
                  alt={`${item.name} logo`}
                  width={140}
                  height={50}
                  className="h-9 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Mission & Vision — Venn Diagram Style */}
        <div className="space-y-6 text-center py-4">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Our Mission &amp; Vision
            </h2>
            <p className="text-sm text-muted-foreground">
              The two pillars that drive everything we build at Bokhol FishMarketCap.
            </p>
          </div>

          {/* Venn Diagram — flex row with negative margin overlap */}
          <div className="relative flex items-center justify-center py-10 select-none overflow-visible">
            <div className="relative flex items-center" style={{ width: 'fit-content' }}>

              {/* LEFT Circle — Mission (coral/salmon) */}
              <div
                style={{
                  width: '420px',
                  height: '420px',
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #f87171 0%, #ef4444 55%, #dc2626 100%)',
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingLeft: '52px',
                  paddingRight: '140px',
                  paddingTop: '52px',
                  paddingBottom: '52px',
                  flexShrink: 0,
                  filter: 'drop-shadow(0 0 32px rgba(239,68,68,0.45))',
                  opacity: 0.92,
                }}
              >
                <TrendingUp style={{ width: '32px', height: '32px', color: 'rgba(255,255,255,0.85)', marginBottom: '14px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '12px', lineHeight: 1.2 }}>Mission</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, maxWidth: '185px', textAlign: 'left' }}>
                  To democratize global seafood trade by providing real-time price intelligence, verified supplier networks, and direct B2B tools for buyers and exporters worldwide.
                </p>
              </div>

              {/* RIGHT Circle — Vision (amber/peach) — overlaps via negative marginLeft */}
              <div
                style={{
                  width: '420px',
                  height: '420px',
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #fbbf24 0%, #f59e0b 55%, #d97706 100%)',
                  marginLeft: '-150px',
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingRight: '52px',
                  paddingLeft: '140px',
                  paddingTop: '52px',
                  paddingBottom: '52px',
                  flexShrink: 0,
                  filter: 'drop-shadow(0 0 32px rgba(245,158,11,0.45))',
                  opacity: 0.92,
                }}
              >
                <Globe2 style={{ width: '32px', height: '32px', color: 'rgba(255,255,255,0.85)', marginBottom: '14px', alignSelf: 'flex-end' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '12px', lineHeight: 1.2, textAlign: 'right' }}>Vision</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, maxWidth: '185px', textAlign: 'right' }}>
                  To become the world's most trusted digital marketplace for marine commerce — connecting every fishing port, supplier, and buyer on one transparent platform.
                </p>
              </div>



            </div>
          </div>
        </div>

        {/* 5. Call to Action */}
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Ready to Explore Global Seafood Markets?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Check weekly price indexes, browse verified suppliers by country, or register a buyer account to request quotes directly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/#indexes">
              <Button size="lg" className="bg-[#022B96] hover:bg-[#011a5e] text-white font-semibold rounded-xl gap-2 cursor-pointer">
                View Market Indexes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/countries">
              <Button size="lg" variant="outline" className="font-semibold rounded-xl cursor-pointer">
                Explore Our Network
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}

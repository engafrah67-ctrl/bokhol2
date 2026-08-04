'use client'

import React from 'react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'

export interface Partner {
  name: string
  logo: string
}

const PARTNERS: Partner[] = [
  { name: 'DAYSEADAY', logo: '/partners/dayseaday.png' },
  { name: 'AM fish', logo: '/partners/am-fish.png' },
  { name: 'ATL SEAFOOD', logo: '/partners/atl-seafood.png' },
  { name: 'ANT SEAFOOD', logo: '/partners/ant-seafood.png' },
  { name: 'amacore', logo: '/partners/amacore.png' },
  { name: 'BLUE WORLD SEAFOOD', logo: '/partners/blue-world-seafood.png' },
]

export function PartnersSection() {
  const { t } = useLanguage()
  const marqueePartners = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS]

  return (
    <section className="relative w-full py-10 bg-slate-50/50 dark:bg-slate-950/50 border-y border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
      
      {/* Centered Minimal Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('partners_title')}
        </p>
      </div>

      {/* Frameless Floating Ticker */}
      <div className="relative z-10 w-full overflow-hidden">
        
        {/* Soft Fading Edges */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-36 z-20 pointer-events-none bg-gradient-to-r from-slate-50/90 dark:from-slate-950/90 via-slate-50/50 dark:via-slate-950/50 to-transparent" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-36 z-20 pointer-events-none bg-gradient-to-l from-slate-50/90 dark:from-slate-950/90 via-slate-50/50 dark:via-slate-950/50 to-transparent" />

        {/* Scrolling Track */}
        <div className="flex w-max animate-marquee space-x-10 sm:space-x-16 items-center py-2 px-6">
          {marqueePartners.map((partner, idx) => (
            <div
              key={`${partner.name}-${idx}`}
              className="flex-none flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <Image
                src={partner.logo}
                alt={`${partner.name} logo`}
                width={180}
                height={60}
                className="h-10 sm:h-12 w-auto object-contain rounded-md"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

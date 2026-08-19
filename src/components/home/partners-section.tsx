'use client'

import React from 'react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'

export interface Partner {
  name: string
  logo: string
}

const BUYER_PARTNERS: Partner[] = [
  { name: 'Van der Valk', logo: '/partners/buyers/van-der-valk.png' },
  { name: 'Tasty Food', logo: '/partners/buyers/tasty-food.png' },
  { name: 'Horeca Club Antwerpen', logo: '/partners/buyers/horeca-club.png' },
  { name: 'CPH Hotels', logo: '/partners/buyers/cph-hotels.png' },
  { name: 'Klüt Hotel Hameln', logo: '/partners/buyers/klut-hotel.png' },
  { name: 'NH Hotels', logo: '/partners/buyers/nh-hotels.png' },
  { name: 'Alexander Hotel', logo: '/partners/buyers/alexander-hotel.png' },
  { name: 'Hokkai', logo: '/partners/buyers/hokkai.png' },
  { name: 'NLG Restaurant', logo: '/partners/buyers/nlg-restaurant.png' },
]

export function PartnersSection() {
  const { t } = useLanguage()
  const marqueePartners = [
    ...BUYER_PARTNERS,
    ...BUYER_PARTNERS,
    ...BUYER_PARTNERS,
  ]

  return (
    <section className="relative w-full py-10 bg-slate-50/50 dark:bg-slate-950/50 border-y border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
      
      {/* Centered Title */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-sm sm:text-base font-extrabold text-foreground tracking-tight uppercase">
          {t('partners_title')}
        </p>
      </div>

      {/* Floating Ticker */}
      <div className="relative z-10 w-full overflow-hidden">
        
        {/* Fading Edges */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-36 z-20 pointer-events-none bg-gradient-to-r from-slate-50/90 dark:from-slate-950/90 via-slate-50/50 dark:via-slate-950/50 to-transparent" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-36 z-20 pointer-events-none bg-gradient-to-l from-slate-50/90 dark:from-slate-950/90 via-slate-50/50 dark:via-slate-950/50 to-transparent" />

        {/* Scrolling Track */}
        <div className="flex w-max animate-marquee space-x-12 sm:space-x-20 items-center py-2 px-6">
          {marqueePartners.map((partner, idx) => (
            <div
              key={`${partner.name}-${idx}`}
              className="flex-none flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <Image
                src={partner.logo}
                alt={`${partner.name} logo`}
                width={200}
                height={70}
                className="h-12 sm:h-16 w-auto object-contain rounded-md mix-blend-multiply dark:invert"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

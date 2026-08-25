'use client'

import React, { useState, useEffect } from 'react'
import { getStoredPartnerBuyers, PartnerBuyer } from '@/lib/data/partner-buyers-data'

export function PartnersSection() {
  const [partnerBuyers, setPartnerBuyers] = useState<PartnerBuyer[]>([])

  useEffect(() => {
    // Initial load
    setPartnerBuyers(getStoredPartnerBuyers())

    // Listen for live updates from Admin panel
    const handleUpdate = () => {
      setPartnerBuyers(getStoredPartnerBuyers())
    }

    window.addEventListener('partner-buyers-updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('partner-buyers-updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  if (partnerBuyers.length === 0) return null

  // Ensure there are enough items for a smooth continuous marquee animation
  const repeatCount = partnerBuyers.length < 6 ? 4 : partnerBuyers.length < 12 ? 3 : 2
  const marqueePartners = Array(repeatCount).fill(partnerBuyers).flat()

  return (
    <section className="relative w-full py-10 bg-slate-50/50 dark:bg-slate-950/50 border-y border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
      
      {/* Centered Title */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-sm sm:text-base font-extrabold text-foreground tracking-tight uppercase">
          Our EU Buyers Partners
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
              key={`${partner.id || partner.name}-${idx}`}
              className="flex-none flex items-center justify-center transition-all duration-300 hover:scale-105"
            >
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="h-12 sm:h-16 w-auto max-w-[180px] object-contain rounded-md mix-blend-multiply dark:invert"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


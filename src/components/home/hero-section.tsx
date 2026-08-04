'use client'

import Image from "next/image"
import { Search } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <div className="relative w-full flex items-center justify-center min-h-[70vh] md:min-h-[600px] overflow-hidden">
      
      {/* Network Globe Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/network-bg.jpg"
          alt="Global Seafood Network"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Clean dark tint overlay for crisp text readability */}
        <div className="absolute inset-0 bg-slate-950/40" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center pt-12 pb-20">
        
        {/* Centered Icon */}
        <div className="mb-8 flex items-center justify-center drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]">
          <Image 
            src="/icon.png" 
            alt="FishMarketCap Icon" 
            width={80} 
            height={80} 
            className="object-contain brightness-110"
          />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-medium text-white tracking-tight leading-[1.15] mb-4 drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
          {t('hero_line1')} <br className="hidden sm:block" />
          {t('hero_line2')}
        </h1>

        <p className="text-sm sm:text-base text-slate-200/90 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
          {t('hero_subtitle')}
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl relative flex items-center bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 focus-within:ring-4 focus-within:ring-blue-400/30 focus-within:border-blue-400/60 transition-all p-1.5">
          <div className="pl-4 pr-2 flex items-center pointer-events-none text-white/60">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder={t('hero_search_placeholder')}
            className="flex-1 min-w-0 py-3 px-2 bg-transparent outline-none text-white placeholder:text-white/50 text-lg"
          />
          <button className="flex-none px-6 py-3 bg-[#022B96] hover:bg-[#1a47c4] text-white font-medium rounded-xl transition-all shadow-md hover:shadow-blue-500/30 whitespace-nowrap">
            {t('hero_search_btn')}
          </button>
        </div>
        
      </div>
    </div>
  )
}
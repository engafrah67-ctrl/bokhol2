'use client'

import Image from "next/image"
import { Search } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <div className="relative w-full flex items-center justify-center min-h-[60vh] md:min-h-[540px] overflow-hidden">

      {/* No background image — global orb gradient shows through */}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center pt-16 pb-20">
        
        {/* Centered Icon */}
        <div className="mb-8 flex items-center justify-center">
          <Image 
            src="/logo-icon.png" 
            alt="Bokhol Logo Icon" 
            width={72} 
            height={72} 
            className="object-contain"
          />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold text-slate-900 tracking-tight leading-[1.15] mb-4">
          {t('hero_line1')} <br className="hidden sm:block" />
          {t('hero_line2')}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('hero_subtitle')}
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl relative flex items-center bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-white/80 focus-within:ring-4 focus-within:ring-blue-400/20 focus-within:border-blue-400/50 transition-all p-1.5">
          <div className="pl-4 pr-2 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder={t('hero_search_placeholder')}
            className="flex-1 min-w-0 py-3 px-2 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-base font-medium"
          />
          <button className="flex-none px-6 py-3 bg-[#022B96] hover:bg-[#1a47c4] text-white font-semibold rounded-xl transition-all shadow-sm whitespace-nowrap text-sm">
            {t('hero_search_btn')}
          </button>
        </div>
        
      </div>
    </div>
  )
}
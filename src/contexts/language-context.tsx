'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Locale, translations } from '@/lib/i18n/translations'

interface LanguageContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null
    if (saved && translations[saved]) setLocaleState(saved)
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('locale', l)
  }

  const t = (key: string): string => {
    return translations[locale][key] ?? translations['en'][key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X, User, LogOut, LayoutDashboard, Plus, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { useUser } from '@/hooks/use-user'
import { signOut } from '@/features/auth/actions'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { LOCALES, type Locale } from '@/lib/i18n/translations'
import ReactCountryFlag from 'react-country-flag'
import { createClient } from '@/lib/supabase/client'

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  buyer:    { label: 'Buyer',    color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20' },
  supplier: { label: 'Supplier', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' },
  admin:    { label: 'Admin',    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' },
}

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [requestsOpen, setRequestsOpen] = React.useState(false)
  const [langOpen, setLangOpen] = React.useState(false)
  const pathname = usePathname()
  const requestsRef = React.useRef<HTMLDivElement>(null)
  const langRef = React.useRef<HTMLDivElement>(null)

  const { t, locale, setLocale } = useLanguage()

  // Build nav items from translations
  const NAV_ITEMS = [
    { name: t('nav_market_indexes'), href: '/#indexes' },
    { name: t('nav_countries'),      href: '/countries' },
    { name: t('nav_products'),       href: '/products' },
    { name: t('nav_news'),           href: '/news' },
    { name: t('nav_about'),          href: '/about' },
    { name: t('nav_membership'),     href: '/membership' },
  ]

  const REQUEST_ITEMS = [
    { name: t('nav_supplier_request'), href: '/requests/supplier' },
    { name: t('nav_buyer_request'),    href: '/requests/buyer' },
  ]

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (requestsRef.current && !requestsRef.current.contains(event.target as Node)) {
        setRequestsOpen(false)
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { user, profile, role, isLoading } = useUser()
  const activeRole = role || (user?.email === 'admin@gmail.com' ? 'admin' : profile?.role)
  const badge = activeRole ? ROLE_BADGE[activeRole] : null
  const isHome = pathname === '/'
  const currentLocale = LOCALES.find(l => l.code === locale)!

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (_) {}
    window.location.href = '/'
  }

  return (
    <nav
      className="sticky top-0 z-50 w-full transition-all duration-300 glass-panel"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href !== '/#indexes' && pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href} 
                  href={item.href}
                  className={`relative text-sm font-semibold transition-all duration-300 py-1 
                    ${isActive ? 'text-[#022B96]' : 'text-foreground/75 hover:text-[#022B96]'}
                    after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] 
                    after:bg-[#022B96] after:transition-transform after:duration-300 after:origin-center
                    ${isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}
                  `}
                >
                  {item.name}
                </Link>
              )
            })}

            {/* Requests Dropdown */}
            <div className="relative" ref={requestsRef}>
              <button
                onClick={() => setRequestsOpen(!requestsOpen)}
                className={`flex items-center gap-1 text-sm font-semibold transition-all duration-300 py-1 cursor-pointer ${
                  pathname.startsWith('/requests') ? 'text-[#022B96]' : 'text-foreground/75 hover:text-[#022B96]'
                }`}
              >
                {t('nav_requests')}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${requestsOpen ? 'rotate-180' : ''}`} />
              </button>

              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden transition-all duration-200 origin-top ${
                  requestsOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none'
                }`}
              >
                {REQUEST_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setRequestsOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50 hover:text-[#022B96] border-b border-slate-100 last:border-0 ${
                      pathname === item.href ? 'text-[#022B96] bg-blue-50' : 'text-slate-700'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.href === '/requests/buyer' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                        <Lock className="w-2.5 h-2.5" /> Suppliers Only
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">

            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-sm font-semibold text-slate-700 cursor-pointer"
              >
                <ReactCountryFlag
                  countryCode={currentLocale.countryCode}
                  svg
                  style={{ width: '1.25em', height: '1.25em', borderRadius: '2px' }}
                  title={currentLocale.name}
                />
                <span>{currentLocale.label}</span>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Dropdown */}
              <div
                className={`absolute top-full right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden transition-all duration-200 origin-top-right ${
                  langOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                }`}
              >
                {LOCALES.map((loc) => (
                  <button
                    key={loc.code}
                    onClick={() => { setLocale(loc.code as Locale); setLangOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer ${
                      locale === loc.code ? 'text-[#022B96] bg-blue-50/60' : 'text-slate-700'
                    }`}
                  >
                    <ReactCountryFlag
                      countryCode={loc.countryCode}
                      svg
                      style={{ width: '1.4em', height: '1.4em', borderRadius: '2px' }}
                      title={loc.name}
                    />
                    <span>{loc.name}</span>
                    {locale === loc.code && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#022B96]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
            ) : user ? (
              /* Authenticated State */
              <div className="flex items-center gap-3">
                {badge && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
                    {badge.label}
                  </span>
                )}
                {activeRole === 'buyer' ? (
                  <Link href="/requests/buyer/new">
                    <Button size="sm" className="gap-2 cursor-pointer font-semibold rounded-lg bg-[#022B96] hover:bg-[#011a5e] text-white">
                      <Plus className="h-4 w-4" />
                      {t('nav_create_post')}
                    </Button>
                  </Link>
                ) : (
                  <Link href={activeRole === 'admin' ? '/dashboard/admin' : '/dashboard'}>
                    <Button variant="ghost" size="sm" className="gap-2 cursor-pointer font-semibold rounded-lg hover:bg-muted">
                      <LayoutDashboard className="h-4 w-4" />
                      {activeRole === 'admin' ? 'Admin Panel' : t('nav_dashboard')}
                    </Button>
                  </Link>
                )}
                <Button
                  type="button"
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer font-semibold rounded-lg hover:bg-muted/80 transition-all"
                >
                  {t('nav_sign_out')}
                </Button>
              </div>
            ) : (
              /* Guest State */
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="gap-2 cursor-pointer font-semibold rounded-lg hover:bg-muted">
                    <User className="h-4 w-4" />
                    {t('nav_sign_in')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-[#022B96] hover:bg-[#011a5e] text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                    {t('nav_register')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href !== '/#indexes' && pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2 text-base font-medium transition-colors ${
                    isActive ? 'text-[#022B96]' : 'text-foreground/80 hover:text-[#022B96]'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}

            {/* Mobile Requests Sub-links */}
            <div className="border-t border-slate-100 pt-2 mt-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 pb-1">{t('nav_requests')}</p>
              {REQUEST_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2 pl-3 text-base font-medium transition-colors border-l-2 mb-1 ${
                    pathname === item.href ? 'text-[#022B96] border-[#022B96]' : 'text-foreground/80 hover:text-[#022B96] border-transparent'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Language Switcher */}
            <div className="border-t border-slate-100 pt-3 mt-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 pb-2">Language</p>
              <div className="flex gap-2 flex-wrap">
                {LOCALES.map((loc) => (
                  <button
                    key={loc.code}
                    onClick={() => setLocale(loc.code as Locale)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                      locale === loc.code
                        ? 'border-[#022B96] bg-blue-50 text-[#022B96]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <ReactCountryFlag
                      countryCode={loc.countryCode}
                      svg
                      style={{ width: '1.2em', height: '1.2em', borderRadius: '2px' }}
                      title={loc.name}
                    />
                    <span>{loc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 flex flex-col gap-2">
            {user ? (
              <>
                {profile?.role === 'buyer' ? (
                  <Link href="/requests/buyer/new" onClick={() => setIsOpen(false)}>
                    <Button className="w-full gap-2 cursor-pointer bg-[#022B96] hover:bg-[#011a5e] text-white">
                      <Plus className="h-4 w-4" />
                      {t('nav_create_post')}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      {t('nav_dashboard')}
                    </Button>
                  </Link>
                )}
                <Button
                  type="button"
                  onClick={() => { setIsOpen(false); handleSignOut() }}
                  variant="ghost"
                  className="w-full cursor-pointer mt-2"
                >
                  {t('nav_sign_out')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    {t('nav_sign_in')}
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)} className="w-full">
                  <Button className="w-full bg-[#022B96] hover:bg-[#011a5e] text-white cursor-pointer">
                    {t('nav_register')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

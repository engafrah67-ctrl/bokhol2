'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { useLanguage } from '@/contexts/language-context'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="w-full border-t border-border bg-[#fafbfc] dark:bg-[#050911] text-muted-foreground/90 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-5">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <Logo size="sm" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {t('footer_desc')}
            </p>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1"></div>

          {/* Markets Links */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-widest">{t('footer_markets')}</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/#indexes" className="hover:text-primary transition-colors font-medium">
                  {t('footer_european_index')}
                </Link>
              </li>
              <li>
                <Link href="/countries" className="hover:text-primary transition-colors font-medium">
                  {t('footer_top_countries')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary transition-colors font-medium">
                  {t('footer_product_categories')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Directory Links */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-widest">{t('footer_directory')}</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/countries" className="hover:text-primary transition-colors font-medium">
                  {t('footer_supplier_search')}
                </Link>
              </li>
              <li>
                <Link href="/requests/buyer" className="hover:text-primary transition-colors font-medium">
                  {t('footer_buying_requests')}
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-primary transition-colors font-medium">
                  {t('footer_industry_news')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-widest">{t('footer_legal')}</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors font-medium">
                  {t('footer_privacy')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors font-medium">
                  {t('footer_terms')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors font-medium">
                  {t('footer_contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 border-t border-border/80 dark:border-border/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-muted-foreground font-medium text-center md:text-left">
            &copy; {new Date().getFullYear()} {t('footer_rights')}
          </p>
          <p className="text-[11px] text-muted-foreground/70 max-w-md text-center md:text-right leading-relaxed">
            {t('footer_disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  )
}

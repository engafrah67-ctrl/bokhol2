import Link from 'next/link'
import { Logo } from '@/components/logo'

export function Footer() {
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
              The leading seafood market intelligence, price indexing, and supplier discovery platform. Tracking global marine trade flows and commodity pricing benchmarks.
            </p>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1"></div>

          {/* Markets Links */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-widest">Markets</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/#indexes" className="hover:text-primary transition-colors font-medium">
                  European Seafood Index
                </Link>
              </li>
              <li>
                <Link href="/countries" className="hover:text-primary transition-colors font-medium">
                  Top Countries
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary transition-colors font-medium">
                  Product Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Directory Links */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-widest">Directory</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/suppliers" className="hover:text-primary transition-colors font-medium">
                  Supplier Search
                </Link>
              </li>
              <li>
                <Link href="/requests" className="hover:text-primary transition-colors font-medium">
                  Buying Requests
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-primary transition-colors font-medium">
                  Industry News
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-widest">Legal</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-primary transition-colors font-medium">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 border-t border-border/80 dark:border-border/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-muted-foreground font-medium text-center md:text-left">
            &copy; {new Date().getFullYear()} FishMarketCap. All rights reserved.
          </p>
          <p className="text-[11px] text-muted-foreground/70 max-w-md text-center md:text-right leading-relaxed">
            Disclaimer: FishMarketCap is an independent market intelligence portal. We do not process transactions or supply seafood products directly.
          </p>
        </div>
      </div>
    </footer>
  )
}

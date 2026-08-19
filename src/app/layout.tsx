import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { LanguageProvider } from '@/contexts/language-context'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'FishMarketCap | Seafood Market Intelligence & Supplier Directory',
  description:
    'Track global seafood price indexes, discover certified suppliers, post buying requests, and read market news. The CoinMarketCap for Seafood.',
  keywords: 'seafood market, seafood index, supplier discovery, marine trade, seafood pricing',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            disableTransitionOnChange
          >
            <Navbar />
            <main className="flex-1 w-full">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

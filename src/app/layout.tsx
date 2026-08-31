import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { LanguageProvider } from '@/contexts/language-context'

import { SupportWidget } from '@/components/support-widget'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: {
    default: 'Bokhol Fish Market',
    template: '%s | Bokhol Fish Market',
  },
  description:
    'Track global seafood price indexes, discover certified suppliers, post buying requests, and read market news.',
  keywords: 'bokhol fish market, seafood market, seafood index, supplier discovery, marine trade, seafood pricing',
  icons: {
    icon: '/app-icon.png?v=6',
    shortcut: '/app-icon.png?v=6',
    apple: '/app-icon.png?v=6',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/app-icon.png?v=6" type="image/png" />
        <link rel="shortcut icon" href="/app-icon.png?v=6" type="image/png" />
        <link rel="apple-touch-icon" href="/app-icon.png?v=6" />
      </head>
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
            <SupportWidget />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

import Link from 'next/link'
import { Logo } from '@/components/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <Logo size="md" />
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-sm p-8">
        {children}
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        By continuing, you agree to FishMarketCap&apos;s{' '}
        <Link href="/terms" className="underline hover:text-primary">Terms</Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
      </p>
    </div>
  )
}

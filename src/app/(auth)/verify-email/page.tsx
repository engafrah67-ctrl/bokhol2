import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <MailCheck className="h-8 w-8 text-primary" />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        We&apos;ve sent a verification link to your email address.
        Click the link to activate your account and get started.
      </p>

      <div className="rounded-xl border border-border bg-muted/40 px-6 py-4 text-sm text-muted-foreground mb-6">
        <strong className="text-foreground">Didn&apos;t receive it?</strong> Check your spam folder or{' '}
        <span className="text-primary cursor-pointer hover:underline">resend the email</span>.
      </div>

      <Link href="/login">
        <Button variant="outline" className="w-full cursor-pointer">
          Back to Sign In
        </Button>
      </Link>
    </div>
  )
}

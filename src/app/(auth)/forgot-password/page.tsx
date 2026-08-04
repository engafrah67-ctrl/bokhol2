'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { forgotPassword } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

const initialState = { error: undefined, success: undefined }

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState)

  return (
    <>
      <div className="mb-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Forgot your password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {state?.success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-green-600 mb-3" />
          <h2 className="font-semibold text-green-900 mb-1">Check your inbox</h2>
          <p className="text-sm text-green-700">{state.success}</p>
          <Link href="/login">
            <Button variant="outline" className="mt-4 cursor-pointer">Back to Sign In</Button>
          </Link>
        </div>
      ) : (
        <>
          {state?.error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 cursor-pointer"
            >
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        </>
      )}
    </>
  )
}

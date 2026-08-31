'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signIn } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

const initialState = { error: undefined, success: undefined }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, initialState)

  const errorMessage = typeof state?.error === 'string' && state.error.trim().length > 0 ? state.error : null
  const successMessage = typeof state?.success === 'string' && state.success.trim().length > 0 ? state.success : null

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your Bokhol Fish Market account
        </p>
      </div>

      {successMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Email */}
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
              autoComplete="email"
              required
              placeholder="you@company.com"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#022B96] hover:bg-[#011a5e] text-white font-semibold py-2.5 cursor-pointer"
        >
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Create account
        </Link>
      </p>
    </>
  )
}

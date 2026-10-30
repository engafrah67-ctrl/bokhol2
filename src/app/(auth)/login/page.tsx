'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const formData = new FormData(e.currentTarget)
    const email = ((formData.get('email') as string) || '').trim()
    const password = (formData.get('password') as string) || ''

    if (!email || !password) {
      setErrorMessage('Please enter both your email and your password.')
      setIsPending(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) {
        setErrorMessage(error?.message || 'Invalid login credentials')
        setIsPending(false)
        return
      }

      // Role comes from the database profile, never from editable user metadata
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()
      const role = profile?.role

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bokhol-auth-change'))
      }

      // Only follow same-site relative ?next= targets (prevents open redirects)
      let destination = new URLSearchParams(window.location.search).get('next')
      if (!destination || !destination.startsWith('/') || destination.startsWith('//') || destination.startsWith('/login')) {
        destination =
          role === 'admin' ? '/dashboard/admin'
          : role === 'supplier' ? '/dashboard/supplier'
          : role === 'buyer' ? '/dashboard/buyer'
          : '/dashboard'
      }

      // Hard redirect guarantees layouts mount with fresh auth cookies
      window.location.href = destination
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsPending(false)
    }
  }

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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email or Username */}
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

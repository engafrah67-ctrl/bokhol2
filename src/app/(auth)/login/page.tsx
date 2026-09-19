'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, User, Lock, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

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
    const identifier = ((formData.get('email') as string) || '').trim()
    const password = (formData.get('password') as string) || ''

    if (!identifier || !password) {
      setErrorMessage('Please enter both your email or username and your password.')
      setIsPending(false)
      return
    }

    // ── 1. Check Profile Claim Status ──
    try {
      const claimCheckRes = await fetch('/api/auth/claim-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const claimResult = await claimCheckRes.json()

      if (claimResult.isClaimUser) {
        // CASE A: Still Pending
        if (claimResult.status === 'pending') {
          setErrorMessage(
            claimResult.message ||
              `⏳ Your profile claim for "${claimResult.company_name}" is currently pending admin verification. Please wait for the admin to approve your request before logging in.`
          )
          setIsPending(false)
          return
        }

        // CASE B: Rejected
        if (claimResult.status === 'rejected') {
          setErrorMessage(
            claimResult.message ||
              `❌ Your profile claim for "${claimResult.company_name}" was not approved by the administrator.`
          )
          setIsPending(false)
          return
        }

        // CASE C: Approved, but invalid password
        if (claimResult.status === 'approved' && claimResult.valid === false) {
          setErrorMessage(claimResult.error || 'Incorrect password. Please verify your password and try again.')
          setIsPending(false)
          return
        }

        // CASE D: Approved & Valid Password!
        if (claimResult.status === 'approved' && claimResult.valid === true) {
          const claimEmail = claimResult.email
          let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: claimEmail,
            password: password,
          })

          if (authError) {
            // If user doesn't exist in Supabase auth yet, create and sign in
            await supabase.auth.signUp({
              email: claimEmail,
              password: password,
              options: {
                data: {
                  role: 'supplier',
                  company_id: claimResult.company_id,
                  company_name: claimResult.company_name,
                  full_name: claimResult.full_name,
                  username: claimResult.username,
                  claim_status: 'approved',
                },
              },
            })
            const retry = await supabase.auth.signInWithPassword({
              email: claimEmail,
              password: password,
            })
            authData = retry.data
          }

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('bokhol-auth-change'))
          }

          window.location.href = '/dashboard/supplier'
          return
        }
      }
    } catch (checkErr) {
      console.warn('Claim status check error:', checkErr)
    }

    // ── 2. Standard Login (Admin, Buyer, etc.) ──
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: identifier, password })
      if (error) {
        setErrorMessage(error.message || 'Invalid login credentials')
        setIsPending(false)
        return
      }

      const user = data?.user
      const isAdmin = user?.email?.toLowerCase() === 'superadminbkhol@gmail.com'
      const role = isAdmin ? 'admin' : ((user?.user_metadata?.role as string) || 'buyer')

      // Ensure DB role is synced for admin
      if (isAdmin && user?.id) {
        try {
          await supabase.from('users').upsert(
            {
              id: user.id,
              full_name: user.user_metadata?.full_name || 'Administrator',
              role: 'admin',
            },
            { onConflict: 'id' }
          )
        } catch (_) {}
      }

      // Dispatch auth change event to notify navbar and all active listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bokhol-auth-change'))
      }

      // Check for ?next= in current URL
      let destination: string | null = null
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search)
        destination = searchParams.get('next')
      }

      if (!destination || destination.startsWith('/login')) {
        destination = isAdmin
          ? '/dashboard/admin'
          : role === 'supplier'
          ? '/dashboard/supplier'
          : role === 'buyer'
          ? '/dashboard/buyer'
          : '/dashboard'
      }

      // Hard redirect to destination guarantees clean mounting of layouts with fresh cookies
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
            Email address or Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="username"
              required
              placeholder="username or you@company.com"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Suppliers can log in using their claim username or business email.
          </p>
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

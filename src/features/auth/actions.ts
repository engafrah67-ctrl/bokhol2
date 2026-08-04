'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// ── Types ─────────────────────────────────────────────────────
export type ActionResult = {
  error?: string
  success?: string
}

// Helper to check if error is Next.js redirect
function isNextRedirectError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    typeof (err as { digest?: string }).digest === 'string' &&
    (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  )
}

// ── Zod Schemas ───────────────────────────────────────────────
const signUpSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['buyer', 'supplier']),
})

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// ── Sign Up ───────────────────────────────────────────────────
export async function signUp(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const parsed = signUpSchema.safeParse({
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const { full_name, email, password, role } = parsed.data
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message || 'Sign up failed' }
    }

    if (data?.session) {
      revalidatePath('/', 'layout')
      redirect('/dashboard')
    }
  } catch (err: unknown) {
    if (isNextRedirectError(err)) throw err
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }

  redirect('/verify-email')
}

// ── Sign In ───────────────────────────────────────────────────
export async function signIn(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const parsed = signInSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const { email, password } = parsed.data
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { error: error.message || 'Invalid login credentials' }
    }

    revalidatePath('/', 'layout')
  } catch (err: unknown) {
    if (isNextRedirectError(err)) throw err
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }

  redirect('/dashboard')
}

// ── Sign Out ──────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

// ── Forgot Password ───────────────────────────────────────────
export async function forgotPassword(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const parsed = forgotPasswordSchema.safeParse({
      email: formData.get('email'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: 'Password reset email sent! Check your inbox.' }
  } catch (err: unknown) {
    if (isNextRedirectError(err)) throw err
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}

// ── Reset Password ────────────────────────────────────────────
export async function resetPassword(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const parsed = resetPasswordSchema.safeParse({
      password: formData.get('password'),
    })

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })

    if (error) {
      return { error: error.message }
    }
  } catch (err: unknown) {
    if (isNextRedirectError(err)) throw err
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }

  redirect('/login?message=Password updated successfully')
}

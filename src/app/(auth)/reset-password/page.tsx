'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, AlertCircle } from 'lucide-react'

const initialState = { error: undefined, success: undefined }

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your new password must be at least 8 characters.
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Min. 8 characters"
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
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating password...</>
          ) : (
            'Update Password'
          )}
        </Button>
      </form>
    </>
  )
}

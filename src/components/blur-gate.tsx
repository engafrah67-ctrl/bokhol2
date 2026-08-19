'use client'

import React from 'react'
import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

interface BlurGateProps {
  children: React.ReactNode
  /** Blur strength in pixels. Default: 5 */
  blurPx?: number
  /** If true, always blur regardless of auth state */
  forceBlur?: boolean
  /** Optional custom login prompt tooltip */
  tooltipText?: string
  /** Show subtle lock icon next to blurred content */
  showLockIcon?: boolean
}

/**
 * BlurGate — gates content so only authenticated users (logged in) can see it.
 * If user is logged out / guest, content is blurred and locked.
 * Clicking navigates to /login.
 */
export function BlurGate({
  children,
  blurPx = 5,
  forceBlur = false,
  tooltipText = 'Sign in to unlock market data',
  showLockIcon = true,
}: BlurGateProps) {
  const { user, isAuthenticated, isLoading } = useUser()
  const router = useRouter()

  if (isLoading) {
    return <span className="inline-block rounded bg-slate-100 dark:bg-slate-800 animate-pulse w-14 h-4" />
  }

  // Only allow viewing if user is actively authenticated
  const isAuthorized = (!!user || isAuthenticated) && !forceBlur

  if (isAuthorized) {
    return <>{children}</>
  }

  return (
    <span
      className="relative inline-flex items-center gap-1.5 group select-none cursor-pointer"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        router.push('/login')
      }}
      title="Sign in to view"
    >
      {showLockIcon && (
        <span className="w-4 h-4 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
          <Lock className="w-2.5 h-2.5" />
        </span>
      )}

      {/* Blurred text */}
      <span
        className="pointer-events-none select-none text-slate-700 dark:text-slate-300 filter blur-[4px] opacity-70 group-hover:opacity-90 transition-opacity"
        aria-hidden="true"
      >
        {children}
      </span>

      {/* Tooltip on hover */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 flex items-center gap-1">
        <Lock className="w-3 h-3 text-amber-400" />
        {tooltipText}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </span>
    </span>
  )
}

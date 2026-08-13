'use client'

import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'

interface BlurGateProps {
  children: React.ReactNode
  /** Blur strength in pixels. Default: 4 */
  blurPx?: number
  /** If true, always blur regardless of auth state */
  forceBlur?: boolean
}

/**
 * BlurGate — blurs content for unauthenticated users.
 * Clicking navigates to /signup.
 */
export function BlurGate({ children, blurPx = 4, forceBlur = false }: BlurGateProps) {
  const { user, isLoading } = useUser()
  const router = useRouter()

  if (isLoading) {
    return <span className="inline-block rounded bg-slate-100 animate-pulse w-14 h-3.5" />
  }

  // Check if user is logged in or has active session cookie/storage indicator
  const hasAuthCookie = typeof document !== 'undefined' && (
    document.cookie.includes('sb-') ||
    document.cookie.includes('auth') ||
    !!localStorage.getItem('sb-supplier') ||
    !!localStorage.getItem('supplier_posts')
  )

  if ((user || hasAuthCookie) && !forceBlur) {
    return <>{children}</>
  }

  return (
    <span
      className="relative inline-flex items-center group select-none cursor-pointer"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        router.push('/signup')
      }}
    >
      {/* Purely blurred text — no icons */}
      <span
        className="pointer-events-none"
        style={{ filter: `blur(${blurPx}px)`, userSelect: 'none' }}
        aria-hidden="true"
      >
        {children}
      </span>

      {/* Tooltip on hover */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-3 py-1.5 bg-slate-800 text-white text-[11px] font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        Sign up to see this data
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </span>
    </span>
  )
}

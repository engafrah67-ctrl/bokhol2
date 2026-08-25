import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut({ scope: 'global' })
  } catch (error) {
    console.error('Sign out error:', error)
  }

  const response = NextResponse.json({ success: true })
  
  // Explicitly clear all potential auth cookies
  const cookiesToClear = [
    'sb-access-token',
    'sb-refresh-token',
  ]
  
  cookiesToClear.forEach((name) => {
    response.cookies.set(name, '', { maxAge: 0, path: '/' })
  })

  return response
}

export async function GET() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut({ scope: 'global' })
  } catch (error) {
    console.error('Sign out error:', error)
  }

  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (_) {
    // Ignore sign out errors if already signed out
  }

  const response = NextResponse.json({ success: true })

  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    allCookies.forEach((c) => {
      response.cookies.set(c.name, '', { maxAge: 0, path: '/' })
    })
  } catch (_) {}

  return response
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (_) {}

  let origin = 'https://www.bokhol.nl'
  try {
    origin = new URL(request.url).origin
  } catch (_) {}

  const response = NextResponse.redirect(`${origin}/login`)

  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    allCookies.forEach((c) => {
      response.cookies.set(c.name, '', { maxAge: 0, path: '/' })
    })
  } catch (_) {}

  return response
}

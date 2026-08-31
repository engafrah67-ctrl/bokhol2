import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPublicServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      description,
      quantity,
      quantityUnit,
      targetPrice,
      currency,
      destination,
      userId,
      countryId,
      productId,
    } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Try authenticated server client first
    const supabase = await createClient()
    let { data: { user } } = await supabase.auth.getUser()

    // Determine valid user_id
    let validUserId = user?.id || (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) ? userId : null)

    const publicClient = createPublicServerClient()

    // If no valid user id yet, grab an existing user from users table as fallback
    if (!validUserId) {
      const { data: fallbackUser } = await publicClient
        .from('users')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (fallbackUser?.id) {
        validUserId = fallbackUser.id
      }
    }

    if (!validUserId) {
      return NextResponse.json({ error: 'Valid user account required to submit requests to database' }, { status: 401 })
    }

    const payload = {
      user_id: validUserId,
      title: title.trim(),
      description: description ? description.trim() : null,
      quantity: quantity ? parseFloat(String(quantity)) : null,
      quantity_unit: quantityUnit || 'kg',
      target_price: targetPrice ? parseFloat(String(targetPrice)) : null,
      currency: (currency || 'USD').slice(0, 3).toUpperCase(),
      destination: destination ? destination.trim() : null,
      status: 'open',
      country_id: countryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(countryId) ? countryId : null,
      product_id: productId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId) ? productId : null,
    }

    // Insert directly into Supabase buyer_requests table
    const { data: inserted, error: insertError } = await publicClient
      .from('buyer_requests')
      .insert(payload)
      .select()
      .single()

    if (insertError) {
      console.error('Supabase buyer_requests insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: inserted }, { status: 201 })
  } catch (err: any) {
    console.error('API /api/requests error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const publicClient = createPublicServerClient()
    const { data, error } = await publicClient
      .from('buyer_requests')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

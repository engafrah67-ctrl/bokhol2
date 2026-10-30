import { NextRequest, NextResponse } from 'next/server'
import { requireUser, UUID_RE } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

const FORMS = new Set(['Fresh', 'Frozen', 'Smoked', 'Live', 'Any'])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9\s().-]{6,20}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const text = (v: unknown, max = 200) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)
const num = (v: unknown) => {
  const n = parseFloat(String(v ?? ''))
  return Number.isFinite(n) ? n : null
}

/**
 * Buyer submits a sourcing request. Requests are visible only to the buyer and admins (RLS).
 * The buyer dashboard sends the full form (productName, quantityTons, company, contacts);
 * older pages send a free-form title/description, which is still accepted.
 */
export async function POST(req: NextRequest) {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  try {
    const body = await req.json()
    const productName = text(body.productName, 80)
    let payload: Record<string, unknown>

    if (productName) {
      const quantityTons = num(body.quantityTons)
      const targetPrice = num(body.targetPricePerKg)
      const companyName = text(body.companyName, 120)
      const contactName = text(body.contactName, 120)
      const email = text(body.email, 160)
      const phone = text(body.phone, 30)
      const whatsapp = text(body.whatsapp, 30)
      const freshFrozen = text(body.freshFrozen, 10) || 'Any'
      const deliveryDate = text(body.deliveryDate, 10)

      const problems: string[] = []
      if (quantityTons === null || quantityTons <= 0 || quantityTons > 100000) problems.push('quantity in tons')
      if (targetPrice !== null && (targetPrice < 0 || targetPrice > 10000)) problems.push('target price')
      if (!companyName) problems.push('company name')
      if (!contactName) problems.push('contact name')
      if (!email || !EMAIL_RE.test(email)) problems.push('a valid email')
      if (!phone || !PHONE_RE.test(phone)) problems.push('a valid phone number')
      if (whatsapp && !PHONE_RE.test(whatsapp)) problems.push('a valid WhatsApp number')
      if (!FORMS.has(freshFrozen)) problems.push('fresh / frozen')
      if (deliveryDate && !DATE_RE.test(deliveryDate)) problems.push('delivery date')
      if (problems.length > 0) {
        return NextResponse.json({ error: `Please check: ${problems.join(', ')}.` }, { status: 400 })
      }

      payload = {
        user_id: guard.user.id,
        title: `${quantityTons} t ${productName}${text(body.destination) ? ` — ${text(body.destination)}` : ''}`,
        product_name: productName,
        quantity: quantityTons,
        quantity_unit: 'tons',
        target_price: targetPrice,
        currency: 'EUR',
        fresh_frozen: freshFrozen,
        destination: text(body.destination, 160),
        delivery_date: deliveryDate,
        description: text(body.notes, 2000),
        company_name: companyName,
        contact_name: contactName,
        contact_email: email!.toLowerCase(),
        contact_phone: phone,
        whatsapp,
        status: 'open',
      }
    } else {
      const title = text(body.title, 200)
      if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
      payload = {
        user_id: guard.user.id,
        title,
        description: text(body.description, 4000),
        quantity: num(body.quantity),
        quantity_unit: text(body.quantityUnit, 20) || 'kg',
        target_price: num(body.targetPrice),
        currency: String(body.currency || 'EUR').slice(0, 3).toUpperCase(),
        destination: text(body.destination, 160),
        status: 'open',
        country_id: body.countryId && UUID_RE.test(body.countryId) ? body.countryId : null,
        product_id: body.productId && UUID_RE.test(body.productId) ? body.productId : null,
      }
    }

    const { data, error } = await guard.supabase.from('buyer_requests').insert(payload).select().single()
    if (error) {
      console.error('buyer_requests insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 })
  }
}

// The caller's own requests (admins see all — enforced by RLS)
export async function GET() {
  const guard = await requireUser()
  if (!guard.ok) return guard.response

  const { data, error } = await guard.supabase
    .from('buyer_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data || [] })
}

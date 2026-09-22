import { createClient } from '@/lib/supabase/client'

export interface PartnerBuyer {
  id: string
  name: string
  logo: string
  country?: string
  website?: string
  createdAt?: string
}

function mapRow(row: any): PartnerBuyer {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo_url,
    country: row.country ?? undefined,
    website: row.website ?? undefined,
    createdAt: row.created_at,
  }
}

export async function fetchPartnerBuyers(): Promise<PartnerBuyer[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('partner_buyers')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map(mapRow)
  } catch (err) {
    console.warn('fetchPartnerBuyers error:', err)
    return []
  }
}

export async function addPartnerBuyer(
  buyer: Omit<PartnerBuyer, 'id' | 'createdAt'>
): Promise<PartnerBuyer> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('partner_buyers')
    .insert({ name: buyer.name, logo_url: buyer.logo, country: buyer.country ?? null, website: buyer.website ?? null })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapRow(data)
}

export async function updatePartnerBuyer(
  id: string,
  updates: Partial<Omit<PartnerBuyer, 'id' | 'createdAt'>>
): Promise<PartnerBuyer> {
  const supabase = createClient()
  const payload: any = {}
  if (updates.name !== undefined)    payload.name    = updates.name
  if (updates.logo !== undefined)    payload.logo_url = updates.logo
  if (updates.country !== undefined) payload.country = updates.country
  if (updates.website !== undefined) payload.website = updates.website

  const { data, error } = await supabase
    .from('partner_buyers')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapRow(data)
}

export async function deletePartnerBuyer(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('partner_buyers').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

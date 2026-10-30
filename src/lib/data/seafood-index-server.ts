/**
 * SERVER-ONLY helpers for the admin-managed seafood index (table: seafood_index_items).
 * Do NOT import this file in Client Components.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { createPublicServerClient } from '@/lib/supabase/server'
import { ManagedIndexItem } from './seafood-index-data'

function rowToItem(row: any): ManagedIndexItem {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    currency: row.currency,
    unit: row.unit,
    latestPrice: Number(row.latest_price),
    monthlyChangePct: Number(row.monthly_change_pct),
    monthHigh: Number(row.month_high),
    monthLow: Number(row.month_low),
    source: row.source || '',
    activeOffersCount: row.active_offers_count,
    color: row.color || '#0284c7',
    data: Array.isArray(row.data) ? row.data : [],
  }
}

function itemToRow(item: ManagedIndexItem, sortOrder: number) {
  return {
    id: item.id,
    slug: item.slug,
    label: item.label,
    currency: String(item.currency || 'EUR').slice(0, 3).toUpperCase(),
    unit: item.unit || 'kg',
    latest_price: item.latestPrice,
    monthly_change_pct: item.monthlyChangePct,
    month_high: item.monthHigh,
    month_low: item.monthLow,
    source: item.source,
    active_offers_count: Math.max(0, Math.round(item.activeOffersCount || 0)),
    color: item.color,
    data: item.data.map((p) => ({ week: String(p.week), price: Number(p.price) })),
    sort_order: sortOrder,
  }
}

export async function getManagedIndexItems(): Promise<ManagedIndexItem[]> {
  const supabase = createPublicServerClient()
  const { data, error } = await supabase
    .from('seafood_index_items')
    .select('*')
    .order('sort_order', { ascending: true })
  // Throw rather than return [] so callers (and caches) never store a transient failure
  if (error) throw new Error(`getManagedIndexItems: ${error.message}`)
  return (data || []).map(rowToItem)
}

/** Adds or updates one species; new species are placed last. `supabase` must be an admin's client. */
export async function upsertManagedIndexItem(supabase: SupabaseClient, item: ManagedIndexItem): Promise<void> {
  const { data: existing } = await supabase
    .from('seafood_index_items')
    .select('sort_order')
    .eq('id', item.id)
    .maybeSingle()

  let sortOrder: number
  if (existing) {
    sortOrder = existing.sort_order
  } else {
    const { data: last } = await supabase
      .from('seafood_index_items')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()
    sortOrder = (last?.sort_order ?? -1) + 1
  }

  const { error } = await supabase.from('seafood_index_items').upsert(itemToRow(item, sortOrder), { onConflict: 'id' })
  if (error) throw new Error(error.message)
}

/** Deletes one species. Returns false if it did not exist (or RLS hid it). */
export async function deleteManagedIndexItem(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { data, error } = await supabase.from('seafood_index_items').delete().eq('id', id).select('id')
  if (error) throw new Error(error.message)
  return (data?.length ?? 0) > 0
}

/** Replaces the whole index with `items`. `supabase` must be an admin's authenticated client. */
export async function saveManagedIndexItems(supabase: SupabaseClient, items: ManagedIndexItem[]): Promise<void> {
  const rows = items.map(itemToRow)

  const { error: upsertError } = await supabase.from('seafood_index_items').upsert(rows, { onConflict: 'id' })
  if (upsertError) throw new Error(upsertError.message)

  const keepIds = rows.map((r) => r.id)
  const { error: deleteError } = await supabase
    .from('seafood_index_items')
    .delete()
    .not('id', 'in', `(${keepIds.map((id) => `"${id.replace(/"/g, '')}"`).join(',')})`)
  if (deleteError) throw new Error(deleteError.message)
}

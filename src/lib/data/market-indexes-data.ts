export interface AdminMarketIndex {
  id: string
  product_id: string
  country_id: string | null
  name: string
  avg_price: number
  low_price: number
  high_price: number
  currency: string
  unit: string
  change_pct: number | null
  period: string
  updated_at: string
  created_at: string
  product?: {
    id: string
    name: string
    slug: string
    category: string
  }
}

export interface ProductOption {
  id: string
  name: string
  slug: string
  category: string
}

export async function fetchMarketIndexes(): Promise<{
  indexes: AdminMarketIndex[]
  products: ProductOption[]
}> {
  try {
    const res = await fetch('/api/admin/market-indexes', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch market indexes')
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'Unknown error')
    return {
      indexes: json.indexes || [],
      products: json.products || [],
    }
  } catch (err) {
    console.error('fetchMarketIndexes error:', err)
    return { indexes: [], products: [] }
  }
}

export async function updateMarketIndex(
  id: string,
  data: Partial<AdminMarketIndex>
): Promise<AdminMarketIndex> {
  const res = await fetch('/api/admin/market-indexes', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to update market index')
  }
  return json.index
}

export async function createMarketIndex(
  data: Partial<AdminMarketIndex> & { name: string; product_id: string; avg_price: number }
): Promise<AdminMarketIndex> {
  const res = await fetch('/api/admin/market-indexes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to create market index')
  }
  return json.index
}

export async function deleteMarketIndex(id: string): Promise<void> {
  const res = await fetch(`/api/admin/market-indexes?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to delete market index')
  }
}

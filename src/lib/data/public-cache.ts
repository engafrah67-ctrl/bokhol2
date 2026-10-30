/**
 * SERVER-ONLY cached reads of public (visitor-safe) data.
 * These use the cookie-less anon client, so the cached result is identical for every
 * visitor and never contains prices or contact details (RLS + grants enforce that).
 * Admin mutations call revalidateTag(PUBLIC_DATA_TAG) so changes appear immediately.
 */
import { unstable_cache } from 'next/cache'
import { createPublicServerClient } from '@/lib/supabase/server'
import { getManagedIndexItems } from './seafood-index-server'

export const PUBLIC_DATA_TAG = 'public-data'

// Safety net in case a change happens outside the app (e.g. SQL editor)
const REVALIDATE_SECONDS = 300

const cacheOptions = { tags: [PUBLIC_DATA_TAG], revalidate: REVALIDATE_SECONDS }

export const getCachedProductListings = unstable_cache(
  async () => {
    const { data, error } = await createPublicServerClient().rpc('get_public_product_listings')
    if (error) throw new Error(error.message)
    return (data || []) as { product_name: string; origins: string[]; image: string | null; last_updated: string }[]
  },
  ['public-product-listings'],
  cacheOptions
)

export const getCachedLatestNews = unstable_cache(
  async () => {
    const { data, error } = await createPublicServerClient()
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3)
    if (error) throw new Error(error.message)
    return data || []
  },
  ['public-latest-news'],
  cacheOptions
)

export const getCachedActiveCompanyCount = unstable_cache(
  async () => {
    const { count, error } = await createPublicServerClient()
      .from('companies')
      .select('id', { count: 'exact', head: true })
    if (error) throw new Error(error.message)
    return count ?? 0
  },
  ['public-company-count'],
  cacheOptions
)

export const getCachedManagedIndex = unstable_cache(
  () => getManagedIndexItems(),
  ['public-managed-index'],
  cacheOptions
)

export const getCachedCatalogProducts = unstable_cache(
  async () => {
    const { data, error } = await createPublicServerClient()
      .from('products')
      .select('name, slug, category, image_url')
      .order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return data || []
  },
  ['public-catalog-products'],
  cacheOptions
)

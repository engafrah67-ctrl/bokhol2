
export interface ManagedIndexPoint {
  week: string   // reused field name, now holds month labels (Jan–Dec)
  price: number
}

export interface ManagedIndexItem {
  id: string
  slug: string
  label: string
  currency: string
  unit: string
  latestPrice: number
  monthlyChangePct: number
  monthHigh: number
  monthLow: number
  source: string
  activeOffersCount: number
  color: string
  data: ManagedIndexPoint[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const DEFAULT_MANAGED_INDEX_ITEMS: ManagedIndexItem[] = [
  {
    id: 'bluefin-tuna',
    slug: 'bluefin-tuna',
    label: 'Bluefin Tuna',
    currency: 'EUR',
    unit: 'kg',
    latestPrice: 24.00,
    monthlyChangePct: 2.1,
    monthHigh: 25.44,
    monthLow: 22.56,
    source: 'EU Spot Market Average',
    activeOffersCount: 3,
    color: '#1d4ed8',
    data: [
      { week: 'Jan', price: 20.50 },
      { week: 'Feb', price: 21.00 },
      { week: 'Mar', price: 21.80 },
      { week: 'Apr', price: 22.40 },
      { week: 'May', price: 22.10 },
      { week: 'Jun', price: 23.00 },
      { week: 'Jul', price: 23.50 },
      { week: 'Aug', price: 23.20 },
      { week: 'Sep', price: 23.80 },
      { week: 'Oct', price: 24.00 },
      { week: 'Nov', price: 24.50 },
      { week: 'Dec', price: 24.00 },
    ],
  },
  {
    id: 'cod',
    slug: 'cod',
    label: 'Cod',
    currency: 'EUR',
    unit: 'kg',
    latestPrice: 5.80,
    monthlyChangePct: -1.1,
    monthHigh: 6.40,
    monthLow: 5.40,
    source: 'EU Spot Market Average',
    activeOffersCount: 4,
    color: '#3b82f6',
    data: [
      { week: 'Jan', price: 6.40 },
      { week: 'Feb', price: 6.20 },
      { week: 'Mar', price: 6.10 },
      { week: 'Apr', price: 6.00 },
      { week: 'May', price: 5.90 },
      { week: 'Jun', price: 5.80 },
      { week: 'Jul', price: 5.70 },
      { week: 'Aug', price: 5.75 },
      { week: 'Sep', price: 5.65 },
      { week: 'Oct', price: 5.70 },
      { week: 'Nov', price: 5.75 },
      { week: 'Dec', price: 5.80 },
    ],
  },
  {
    id: 'atlantic-salmon',
    slug: 'atlantic-salmon',
    label: 'Atlantic Salmon',
    currency: 'EUR',
    unit: 'kg',
    latestPrice: 8.40,
    monthlyChangePct: 2.3,
    monthHigh: 8.90,
    monthLow: 7.50,
    source: 'EU Spot Market Average',
    activeOffersCount: 5,
    color: '#f97316',
    data: [
      { week: 'Jan', price: 7.50 },
      { week: 'Feb', price: 7.60 },
      { week: 'Mar', price: 7.75 },
      { week: 'Apr', price: 7.90 },
      { week: 'May', price: 8.00 },
      { week: 'Jun', price: 8.10 },
      { week: 'Jul', price: 8.20 },
      { week: 'Aug', price: 8.10 },
      { week: 'Sep', price: 8.30 },
      { week: 'Oct', price: 8.40 },
      { week: 'Nov', price: 8.60 },
      { week: 'Dec', price: 8.40 },
    ],
  },
  {
    id: 'fresh-fish',
    slug: 'fresh-fish',
    label: 'Fresh Fish',
    currency: 'EUR',
    unit: 'kg',
    latestPrice: 4.20,
    monthlyChangePct: 0.8,
    monthHigh: 4.60,
    monthLow: 3.80,
    source: 'EU Spot Market Average',
    activeOffersCount: 2,
    color: '#0d9488',
    data: [
      { week: 'Jan', price: 3.80 },
      { week: 'Feb', price: 3.90 },
      { week: 'Mar', price: 3.95 },
      { week: 'Apr', price: 4.00 },
      { week: 'May', price: 4.10 },
      { week: 'Jun', price: 4.15 },
      { week: 'Jul', price: 4.20 },
      { week: 'Aug', price: 4.10 },
      { week: 'Sep', price: 4.20 },
      { week: 'Oct', price: 4.25 },
      { week: 'Nov', price: 4.30 },
      { week: 'Dec', price: 4.20 },
    ],
  },
  {
    id: 'yellowfin-tuna',
    slug: 'yellowfin-tuna',
    label: 'Yellowfin Tuna',
    currency: 'EUR',
    unit: 'kg',
    latestPrice: 11.50,
    monthlyChangePct: 1.8,
    monthHigh: 12.20,
    monthLow: 10.50,
    source: 'EU Spot Market Average',
    activeOffersCount: 3,
    color: '#0284c7',
    data: [
      { week: 'Jan', price: 10.50 },
      { week: 'Feb', price: 10.70 },
      { week: 'Mar', price: 10.90 },
      { week: 'Apr', price: 11.00 },
      { week: 'May', price: 11.10 },
      { week: 'Jun', price: 11.20 },
      { week: 'Jul', price: 11.30 },
      { week: 'Aug', price: 11.20 },
      { week: 'Sep', price: 11.40 },
      { week: 'Oct', price: 11.50 },
      { week: 'Nov', price: 11.70 },
      { week: 'Dec', price: 11.50 },
    ],
  },
]


export interface PartnerBuyer {
  id: string
  name: string
  logo: string
  country?: string
  website?: string
  createdAt?: string
}

export const DEFAULT_PARTNER_BUYERS: PartnerBuyer[] = [
  { id: 'pb-1', name: 'Van der Valk', logo: '/partners/buyers/van-der-valk.png', country: 'Netherlands' },
  { id: 'pb-2', name: 'Tasty Food', logo: '/partners/buyers/tasty-food.png', country: 'Belgium' },
  { id: 'pb-3', name: 'Horeca Club Antwerpen', logo: '/partners/buyers/horeca-club.png', country: 'Belgium' },
  { id: 'pb-4', name: 'CPH Hotels', logo: '/partners/buyers/cph-hotels.png', country: 'Germany' },
  { id: 'pb-5', name: 'Klüt Hotel Hameln', logo: '/partners/buyers/klut-hotel.png', country: 'Germany' },
  { id: 'pb-6', name: 'NH Hotels', logo: '/partners/buyers/nh-hotels.png', country: 'Spain' },
  { id: 'pb-7', name: 'Alexander Hotel', logo: '/partners/buyers/alexander-hotel.png', country: 'Netherlands' },
  { id: 'pb-8', name: 'Hokkai', logo: '/partners/buyers/hokkai.png', country: 'Netherlands' },
  { id: 'pb-9', name: 'NLG Restaurant', logo: '/partners/buyers/nlg-restaurant.png', country: 'Germany' },
]

const STORAGE_KEY = 'bokhol_partner_buyers'

export function getStoredPartnerBuyers(): PartnerBuyer[] {
  if (typeof window === 'undefined') return DEFAULT_PARTNER_BUYERS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PARTNER_BUYERS))
      return DEFAULT_PARTNER_BUYERS
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    return DEFAULT_PARTNER_BUYERS
  } catch (_) {
    return DEFAULT_PARTNER_BUYERS
  }
}

export function addPartnerBuyer(buyer: Omit<PartnerBuyer, 'id'>): PartnerBuyer {
  const newBuyer: PartnerBuyer = {
    ...buyer,
    id: 'pb-' + Date.now(),
    createdAt: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    try {
      const current = getStoredPartnerBuyers()
      const updated = [newBuyer, ...current]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('partner-buyers-updated'))
    } catch (_) {}
  }

  return newBuyer
}

export function updatePartnerBuyer(id: string, updates: Partial<PartnerBuyer>): PartnerBuyer | null {
  if (typeof window === 'undefined') return null
  try {
    const current = getStoredPartnerBuyers()
    let updatedBuyer: PartnerBuyer | null = null
    const updated = current.map((item) => {
      if (item.id === id) {
        updatedBuyer = { ...item, ...updates }
        return updatedBuyer
      }
      return item
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('partner-buyers-updated'))
    return updatedBuyer
  } catch (_) {
    return null
  }
}

export function deletePartnerBuyer(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const current = getStoredPartnerBuyers()
    const updated = current.filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('partner-buyers-updated'))
  } catch (_) {}
}

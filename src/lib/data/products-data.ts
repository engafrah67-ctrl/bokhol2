export interface SupplierPost {
  id: string
  user_id?: string
  company_id?: string
  company_name?: string
  company_logo?: string
  company_country?: string
  product_name: string
  price_per_kg: number
  max_price_per_kg?: number
  currency: string
  country_of_origin: string
  fresh_frozen: string
  size_weight: string
  packaging: string
  availability: string
  location: string
  supplier_info_extra?: string
  custom_image?: string
  created_at: string
  updated_at?: string
  status?: string
}

export interface MarketProductCard {
  slug: string
  name: string
  category: string
  scientificName: string
  imageUrl: string
  suppliersCount: number
  avgPrice: string
  topOrigin: string
  origins?: string[]
  lastUpdated: string
}

export const COUNTRY_ISO: Record<string, string> = {
  Belgium: 'be', Netherlands: 'nl', Germany: 'de', Norway: 'no', Spain: 'es',
  France: 'fr', Portugal: 'pt', Italy: 'it', Greece: 'gr', Ireland: 'ie',
  Denmark: 'dk', Sweden: 'se', Finland: 'fi', Iceland: 'is', Poland: 'pl',
  Chile: 'cl', Vietnam: 'vn', China: 'cn', Japan: 'jp', India: 'in',
  Indonesia: 'id', Thailand: 'th', Philippines: 'ph', Taiwan: 'tw', 'South Korea': 'kr',
  Ecuador: 'ec', Peru: 'pe', Argentina: 'ar', Brazil: 'br', Mexico: 'mx',
  Morocco: 'ma', Senegal: 'sn', Mauritania: 'mr', Egypt: 'eg', 'South Africa': 'za', Ghana: 'gh',
  'United States': 'us', Canada: 'ca', Australia: 'au', 'New Zealand': 'nz',
  Russia: 'ru', Turkey: 'tr', Ukraine: 'ua', Myanmar: 'mm', Bangladesh: 'bd',
  Malaysia: 'my', 'Sri Lanka': 'lk', Pakistan: 'pk', 'Saudi Arabia': 'sa',
  Namibia: 'na', Oman: 'om', Maldives: 'mv', Faroe: 'fo', 'Faroe Islands': 'fo',
  Somalia: 'so', Ethiopia: 'et', Kenya: 'ke', Tanzania: 'tz', Madagascar: 'mg',
  Nigeria: 'ng', Cameroon: 'cm', Angola: 'ao', "Côte d'Ivoire": 'ci',
  Cambodia: 'kh', Laos: 'la', Singapore: 'sg',
  Croatia: 'hr', Romania: 'ro', Bulgaria: 'bg', Austria: 'at', Switzerland: 'ch',
  Colombia: 'co', Greenland: 'gl',
}

export function getFlagUrl(country: string): string | null {
  if (!country) return null
  const clean = country.trim().toLowerCase()

  const direct = COUNTRY_ISO[country.trim()]
  if (direct) return `https://flagcdn.com/w40/${direct.toLowerCase()}.png`

  for (const [name, iso] of Object.entries(COUNTRY_ISO)) {
    if (clean === name.toLowerCase()) {
      return `https://flagcdn.com/w40/${iso.toLowerCase()}.png`
    }
  }

  for (const [name, iso] of Object.entries(COUNTRY_ISO)) {
    if (clean.includes(name.toLowerCase()) || name.toLowerCase().includes(clean)) {
      return `https://flagcdn.com/w40/${iso.toLowerCase()}.png`
    }
  }

  if (clean.includes('holland')) return 'https://flagcdn.com/w40/nl.png'
  if (clean.includes('uae') || clean.includes('emirates')) return 'https://flagcdn.com/w40/ae.png'
  if (clean.includes('usa') || clean.includes('united states')) return 'https://flagcdn.com/w40/us.png'
  if (clean.includes('uk') || clean.includes('united kingdom') || clean.includes('britain')) return 'https://flagcdn.com/w40/gb.png'
  if (clean.includes('vietnam') || clean.includes('viet nam')) return 'https://flagcdn.com/w40/vn.png'
  if (clean.includes('india')) return 'https://flagcdn.com/w40/in.png'

  return null
}

// Fish image mapping — 100% consistent across entire platform
const FISH_IMAGE_MAP: Record<string, string> = {
  'Mackerel': '/fish-mackerel.png',
  'Herring': '/fish-mackerel.png',
  'Sardine': '/fish-mackerel.png',
  'Anchovy': '/fish-mackerel.png',
  'Tuna': '/fish-tuna.png',
  'Yellowfin Tuna': '/fish-tuna.png',
  'Bluefin Tuna': '/fish-tuna.png',
  'Bigeye Tuna': '/fish-tuna.png',
  'Albacore Tuna': '/fish-tuna.png',
  'Skipjack Tuna': '/fish-tuna.png',
  'Tuna Loin': '/fish-tuna.png',
  'Atlantic Cod': '/fish-cod.png',
  'Cod': '/fish-cod.png',
  'Pacific Cod': '/fish-cod.png',
  'Haddock': '/fish-haddock.jpg',
  'Pollock': '/fish-cod.png',
  'Alaska Pollock': '/fish-cod.png',
  'Hake': '/fish-cod.png',
  'Whiting': '/fish-cod.png',
  'Atlantic Salmon': '/fish-salmon.png',
  'Salmon': '/fish-salmon.png',
  'Pacific Salmon': '/fish-salmon.png',
  'Salmon Fillet': '/fish-salmon.png',
  'Salmon Portions': '/fish-salmon.png',
  'Trout': '/fish-trout.jpg',
  'Rainbow Trout': '/fish-trout.jpg',
  'Sea Bass': '/fish-seabass.png',
  'European Sea Bass': '/fish-seabass.png',
  'Sea Bream': '/fish-seabream.jpg',
  'Gilthead Sea Bream': '/fish-seabream.jpg',
  'Dorade': '/fish-seabream.jpg',
  'Turbot': '/fish-turbot.jpg',
  'Plaice': '/fish-turbot.jpg',
  'Sole': '/fish-turbot.jpg',
  'Lemon Sole': '/fish-turbot.jpg',
  'Brill': '/fish-turbot.jpg',
  'Halibut': '/fish-turbot.jpg',
  'Shrimp': '/shrimp.png',
  'Prawn': '/shrimp.png',
  'King Crab': '/fish-crab.jpg',
  'Crab': '/fish-crab.jpg',
  'Lobster': '/fish-lobster.jpg',
  'Mussels': '/shrimp.png',
  'Clams': '/shrimp.png',
  'Oysters': '/shrimp.png',
  'Octopus': '/shrimp.png',
  'Squid': '/shrimp.png',
}

export function getFishImageForProduct(name: string, customImage?: string): string {
  if (customImage && customImage.trim() !== '') {
    if (customImage === '/salmon.png') return '/fish-salmon.png'
    if (customImage === '/tuna.png') return '/fish-tuna.png'
    if (customImage === '/cod.png') return '/fish-cod.png'
    if (customImage === '/mackerel.png') return '/fish-mackerel.png'
    return customImage
  }

  const strName = name || ''
  if (FISH_IMAGE_MAP[strName]) return FISH_IMAGE_MAP[strName]

  const lower = strName.toLowerCase()
  if (lower.includes('trout')) return '/fish-trout.jpg'
  if (lower.includes('salmon')) return '/fish-salmon.png'
  if (lower.includes('tuna')) return '/fish-tuna.png'
  if (lower.includes('haddock')) return '/fish-haddock.jpg'
  if (lower.includes('bream') || lower.includes('dorade')) return '/fish-seabream.jpg'
  if (lower.includes('bass')) return '/fish-seabass.png'
  if (lower.includes('turbot') || lower.includes('plaice') || lower.includes('sole') || lower.includes('brill') || lower.includes('halibut') || lower.includes('flatfish')) return '/fish-turbot.jpg'
  if (lower.includes('lobster')) return '/fish-lobster.jpg'
  if (lower.includes('crab')) return '/fish-crab.jpg'
  if (lower.includes('cod') || lower.includes('pollock') || lower.includes('hake') || lower.includes('whiting')) return '/fish-cod.png'
  if (lower.includes('mackerel') || lower.includes('herring') || lower.includes('sardine') || lower.includes('anchovy')) return '/fish-mackerel.png'
  if (lower.includes('shrimp') || lower.includes('prawn') || lower.includes('squid') || lower.includes('octopus') || lower.includes('mussel') || lower.includes('clam') || lower.includes('oyster')) return '/shrimp.png'

  return '/fish-salmon.png'
}

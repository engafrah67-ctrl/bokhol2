// ============================================================
// FishMarketCap — Database TypeScript Types
// Matches the Supabase PostgreSQL schema exactly
// ============================================================

export type UserRole = 'guest' | 'buyer' | 'supplier' | 'admin'
export type CompanyStatus = 'pending' | 'active' | 'suspended'
export type PostCategory =
  | 'product_availability'
  | 'new_stock'
  | 'shipment'
  | 'certification'
  | 'company_update'
  | 'trade_event'
export type RequestStatus = 'open' | 'closed' | 'fulfilled'
export type CertificateType =
  | 'ASC'
  | 'MSC'
  | 'HACCP'
  | 'ISO_22000'
  | 'BRC'
  | 'GlobalGAP'
  | 'other'

// ── users ─────────────────────────────────────────────────────
export interface User {
  id: string
  role: UserRole
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  company_id: string | null
  created_at: string
  updated_at: string
}

// ── countries ─────────────────────────────────────────────────
export interface Country {
  id: string
  name: string
  slug: string
  flag_emoji: string | null
  region: string | null
  iso_code: string | null
  description: string | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

// ── products ──────────────────────────────────────────────────
export interface Product {
  id: string
  name: string
  slug: string
  category: string | null
  description: string | null
  image_url: string | null
  unit: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

// ── companies ─────────────────────────────────────────────────
export interface Company {
  id: string
  owner_id: string
  name: string
  slug: string
  country_id: string | null
  description: string | null
  website: string | null
  logo_url: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  year_founded: number | null
  employee_count: string | null
  export_markets: string[] | null
  status: CompanyStatus
  is_verified: boolean
  activity_score: number
  trust_score: number
  created_at: string
  updated_at: string
}

// With joined relations
export interface CompanyWithRelations extends Company {
  country?: Country
  products?: Product[]
  certificates?: Certificate[]
}

// ── company_products ──────────────────────────────────────────
export interface CompanyProduct {
  id: string
  company_id: string
  product_id: string
  created_at: string
}

// ── certificates ──────────────────────────────────────────────
export interface Certificate {
  id: string
  company_id: string
  type: CertificateType
  issuer: string | null
  certificate_no: string | null
  issued_at: string | null
  expires_at: string | null
  document_url: string | null
  created_at: string
  updated_at: string
}

// ── supplier_posts ────────────────────────────────────────────
export interface SupplierPost {
  id: string
  company_id: string
  category: PostCategory
  title: string
  content: string | null
  image_urls: string[] | null
  product_id: string | null
  country_id: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface SupplierPostWithRelations extends SupplierPost {
  company?: Company
  product?: Product
  country?: Country
}

// ── buyer_requests ────────────────────────────────────────────
export interface BuyerRequest {
  id: string
  user_id: string
  product_id: string | null
  country_id: string | null
  title: string
  description: string | null
  quantity: number | null
  quantity_unit: string
  target_price: number | null
  currency: string
  destination: string | null
  status: RequestStatus
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface BuyerRequestDetails {
  productNeeded: string
  quantity: string // e.g. "100 KG"
  freshFrozen: string // "Fresh" | "Frozen" | "Fresh / Frozen"
  location: string // e.g. "Amsterdam"
  packagingProcessing: string // e.g. "packing/pure", "fillet"
  deliveryDate: string // e.g. "Friday" or target date
  additionalNotes?: string
}

export interface SupplierReply {
  id: string
  requestId: string
  supplierId?: string
  supplierName: string
  pricePerKg: number
  deliveryItem: string
  message: string
  createdAt: string
}

export interface SupplierProductListing {
  id?: string
  productName: string
  pricePerKg: number | string
  currency?: string
  countryOfOrigin: string
  freshFrozen: string
  sizeWeight: string
  packagingFillet: string
  availability: string
  location: string
  supplierInfoExtra: string
}

export interface BuyerRequestWithRelations extends BuyerRequest {
  product?: Product
  country?: Country
  user?: User
  replies?: SupplierReply[]
}

// ── market_indexes ────────────────────────────────────────────
export interface MarketIndex {
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
}

export interface MarketIndexWithRelations extends MarketIndex {
  product?: Product
  country?: Country
  history?: MarketHistory[]
}

// ── market_history ────────────────────────────────────────────
export interface MarketHistory {
  id: string
  index_id: string
  avg_price: number
  low_price: number
  high_price: number
  recorded_at: string
  created_at: string
}

// ── news ──────────────────────────────────────────────────────
export interface NewsArticle {
  id: string
  author_id: string | null
  title: string
  slug: string
  summary: string | null
  content: string
  cover_image_url: string | null
  category: string | null
  tags: string[] | null
  is_featured: boolean
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

// ── saved_suppliers ───────────────────────────────────────────
export interface SavedSupplier {
  id: string
  buyer_id: string
  company_id: string
  created_at: string
}

export interface SavedSupplierWithRelations extends SavedSupplier {
  company?: CompanyWithRelations
}

// ── Supabase Database type map ────────────────────────────────
export type Database = {
  public: {
    Tables: {
      users:            { Row: User;          Insert: Partial<User>;          Update: Partial<User> }
      countries:        { Row: Country;       Insert: Partial<Country>;       Update: Partial<Country> }
      products:         { Row: Product;       Insert: Partial<Product>;       Update: Partial<Product> }
      companies:        { Row: Company;       Insert: Partial<Company>;       Update: Partial<Company> }
      company_products: { Row: CompanyProduct;Insert: Partial<CompanyProduct>;Update: Partial<CompanyProduct> }
      certificates:     { Row: Certificate;   Insert: Partial<Certificate>;   Update: Partial<Certificate> }
      supplier_posts:   { Row: SupplierPost;  Insert: Partial<SupplierPost>;  Update: Partial<SupplierPost> }
      buyer_requests:   { Row: BuyerRequest;  Insert: Partial<BuyerRequest>;  Update: Partial<BuyerRequest> }
      market_indexes:   { Row: MarketIndex;   Insert: Partial<MarketIndex>;   Update: Partial<MarketIndex> }
      market_history:   { Row: MarketHistory; Insert: Partial<MarketHistory>; Update: Partial<MarketHistory> }
      news:             { Row: NewsArticle;   Insert: Partial<NewsArticle>;   Update: Partial<NewsArticle> }
      saved_suppliers:  { Row: SavedSupplier; Insert: Partial<SavedSupplier>; Update: Partial<SavedSupplier> }
    }
  }
}

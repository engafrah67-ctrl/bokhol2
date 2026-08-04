export type Locale = 'en' | 'nl' | 'de' | 'es'

export const LOCALES: { code: Locale; label: string; countryCode: string; name: string }[] = [
  { code: 'en', label: 'EN', countryCode: 'GB', name: 'English' },
  { code: 'nl', label: 'NL', countryCode: 'NL', name: 'Nederlands' },
  { code: 'de', label: 'DE', countryCode: 'DE', name: 'Deutsch' },
  { code: 'es', label: 'ES', countryCode: 'ES', name: 'Español' },
]

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navbar
    nav_market_indexes: 'Market Indexes',
    nav_countries: 'Our Network',
    nav_products: 'Products',
    nav_news: 'News',
    nav_about: 'About Us',
    nav_requests: 'Requests',
    nav_supplier_request: 'Supplier Request',
    nav_buyer_request: 'Buyer Request',
    nav_sign_in: 'Sign In',
    nav_register: 'Register',
    nav_dashboard: 'Dashboard',
    nav_create_post: 'Create Post',
    nav_sign_out: 'Sign Out',

    // Hero
    hero_line1: 'Navigate the',
    hero_line2: 'Global Fish Market',
    hero_subtitle: 'Bokhol gives you the opportunity to discover seafood suppliers, compare market offers, and make informed purchasing decisions before placing your next order.',
    hero_search_placeholder: 'Search suppliers, products, markets...',
    hero_search_btn: 'Search',

    // About Page
    about_title: 'About Us',
    about_desc: 'Bokhol gives you the opportunity to discover seafood suppliers, compare market offers, and make informed purchasing decisions before placing your next order.',

    // Partners
    partners_title: 'Our Global Partners',

    // Seafood Index
    index_title: 'European Seafood Index',
    index_subtitle: 'Weekly benchmark prices · Updated every Monday',
    index_current_price: 'Current index price',
    index_weekly_high: 'Weekly high',
    index_weekly_low: 'Weekly low',
    index_source: 'Source',
    index_components: 'Components',
    index_this_week: 'this week',

    // Market Feed
    feed_title: 'Market Feed',
    feed_supplier_updates: 'Supplier Updates',
    feed_latest_news: 'Latest News',
    feed_buyer_tenders: 'Buyer Tenders',
    feed_details: 'Details',
    feed_read: 'Read',
    feed_submit_quote: 'Submit Quote',

    // Stats Bar
    stats_suppliers: 'Active Suppliers',
    stats_markets: 'European Markets',
    stats_products: 'Seafood Products',
    stats_updates: 'Market Updates',
    stats_daily: 'Daily',
  },

  nl: {
    // Navbar
    nav_market_indexes: 'Marktindexen',
    nav_countries: 'Ons Netwerk',
    nav_products: 'Producten',
    nav_news: 'Nieuws',
    nav_about: 'Over Ons',
    nav_requests: 'Aanvragen',
    nav_supplier_request: 'Leveranciersaanvraag',
    nav_buyer_request: 'Kopersaanvraag',
    nav_sign_in: 'Inloggen',
    nav_register: 'Registreren',
    nav_dashboard: 'Dashboard',
    nav_create_post: 'Bericht maken',
    nav_sign_out: 'Uitloggen',

    // Hero
    hero_line1: 'Navigeer door de',
    hero_line2: 'Wereldwijde Vismarkt',
    hero_subtitle: 'Bokhol geeft u de mogelijkheid om leveranciers van zeevruchten te ontdekken, marktaanbiedingen te vergelijken en weloverwogen aankoopbeslissingen te nemen.',
    hero_search_placeholder: 'Zoek leveranciers, producten, markten...',
    hero_search_btn: 'Zoeken',

    // About Page
    about_title: 'Over Ons',
    about_desc: 'Bokhol geeft u de mogelijkheid om leveranciers van zeevruchten te ontdekken, marktaanbiedingen te vergelijken en weloverwogen aankoopbeslissingen te nemen voordat u uw volgende bestelling plaatst.',

    // Partners
    partners_title: 'Onze Wereldwijde Partners',

    // Seafood Index
    index_title: 'Europese Zeevruchtenindex',
    index_subtitle: 'Wekelijkse benchmarkprijzen · Elke maandag bijgewerkt',
    index_current_price: 'Huidige indexprijs',
    index_weekly_high: 'Weekhoogtepunt',
    index_weekly_low: 'Weeklaagtepunt',
    index_source: 'Bron',
    index_components: 'Componenten',
    index_this_week: 'deze week',

    // Market Feed
    feed_title: 'Marktfeed',
    feed_supplier_updates: 'Leveranciersupdates',
    feed_latest_news: 'Laatste Nieuws',
    feed_buyer_tenders: 'Kopersaanbiedingen',
    feed_details: 'Details',
    feed_read: 'Lees meer',
    feed_submit_quote: 'Offerte indienen',

    // Stats Bar
    stats_suppliers: 'Actieve Leveranciers',
    stats_markets: 'Europese Markten',
    stats_products: 'Zeevruchtenproducten',
    stats_updates: 'Marktupdates',
    stats_daily: 'Dagelijks',
  },

  de: {
    // Navbar
    nav_market_indexes: 'Marktindizes',
    nav_countries: 'Unser Netzwerk',
    nav_products: 'Produkte',
    nav_news: 'Nachrichten',
    nav_about: 'Über Uns',
    nav_requests: 'Anfragen',
    nav_supplier_request: 'Lieferantenanfrage',
    nav_buyer_request: 'Käuferanfrage',
    nav_sign_in: 'Anmelden',
    nav_register: 'Registrieren',
    nav_dashboard: 'Dashboard',
    nav_create_post: 'Beitrag erstellen',
    nav_sign_out: 'Abmelden',

    // Hero
    hero_line1: 'Navigieren Sie durch den',
    hero_line2: 'Globalen Fischmarkt',
    hero_subtitle: 'Bokhol bietet Ihnen die Möglichkeit, Lieferanten für Meeresfrüchte zu entdecken, Marktangebote zu vergleichen und fundierte Kaufentscheidungen zu treffen.',
    hero_search_placeholder: 'Lieferanten, Produkte, Märkte suchen...',
    hero_search_btn: 'Suchen',

    // About Page
    about_title: 'Über Uns',
    about_desc: 'Bokhol bietet Ihnen die Möglichkeit, Lieferanten für Meeresfrüchte zu entdecken, Marktangebote zu vergleichen und fundierte Kaufentscheidungen zu treffen, bevor Sie Ihre nächste Bestellung aufgeben.',

    // Partners
    partners_title: 'Unsere Globalen Partner',

    // Seafood Index
    index_title: 'Europäischer Meeresfrüchte-Index',
    index_subtitle: 'Wöchentliche Referenzpreise · Jeden Montag aktualisiert',
    index_current_price: 'Aktueller Indexpreis',
    index_weekly_high: 'Wochenhoch',
    index_weekly_low: 'Wochentief',
    index_source: 'Quelle',
    index_components: 'Komponenten',
    index_this_week: 'diese Woche',

    // Market Feed
    feed_title: 'Markt-Feed',
    feed_supplier_updates: 'Lieferanten-Updates',
    feed_latest_news: 'Aktuelle Nachrichten',
    feed_buyer_tenders: 'Käufer-Ausschreibungen',
    feed_details: 'Details',
    feed_read: 'Lesen',
    feed_submit_quote: 'Angebot einreichen',

    // Stats Bar
    stats_suppliers: 'Aktive Lieferanten',
    stats_markets: 'Europäische Märkte',
    stats_products: 'Meeresfrüchte',
    stats_updates: 'Markt-Updates',
    stats_daily: 'Täglich',
  },

  es: {
    // Navbar
    nav_market_indexes: 'Índices de Mercado',
    nav_countries: 'Nuestra Red',
    nav_products: 'Productos',
    nav_news: 'Noticias',
    nav_about: 'Sobre Nosotros',
    nav_requests: 'Solicitudes',
    nav_supplier_request: 'Solicitud de Proveedor',
    nav_buyer_request: 'Solicitud de Comprador',
    nav_sign_in: 'Iniciar Sesión',
    nav_register: 'Registrarse',
    nav_dashboard: 'Panel',
    nav_create_post: 'Crear Publicación',
    nav_sign_out: 'Cerrar Sesión',

    // Hero
    hero_line1: 'Navega por el',
    hero_line2: 'Mercado Global de Pescado',
    hero_subtitle: 'Bokhol le brinda la oportunidad de descubrir proveedores de mariscos, comparar ofertas de mercado y tomar decisiones de compra informadas antes de realizar su próximo pedido.',
    hero_search_placeholder: 'Buscar proveedores, productos, mercados...',
    hero_search_btn: 'Buscar',

    // About Page
    about_title: 'Sobre Nosotros',
    about_desc: 'Bokhol le brinda la oportunidad de descubrir proveedores de mariscos, comparar ofertas de mercado y tomar decisiones de compra informadas antes de realizar su próximo pedido.',

    // Partners
    partners_title: 'Nuestros Socios Globales',

    // Seafood Index
    index_title: 'Índice Europeo de Mariscos',
    index_subtitle: 'Precios de referencia semanales · Actualizado cada lunes',
    index_current_price: 'Precio del índice actual',
    index_weekly_high: 'Máximo semanal',
    index_weekly_low: 'Mínimo semanal',
    index_source: 'Fuente',
    index_components: 'Componentes',
    index_this_week: 'esta semana',

    // Market Feed
    feed_title: 'Feed del Mercado',
    feed_supplier_updates: 'Actualizaciones de Proveedores',
    feed_latest_news: 'Últimas Noticias',
    feed_buyer_tenders: 'Licitaciones de Compradores',
    feed_details: 'Detalles',
    feed_read: 'Leer',
    feed_submit_quote: 'Enviar Cotización',

    // Stats Bar
    stats_suppliers: 'Proveedores Activos',
    stats_markets: 'Mercados Europeos',
    stats_products: 'Productos del Mar',
    stats_updates: 'Actualizaciones del Mercado',
    stats_daily: 'Diario',
  },
}

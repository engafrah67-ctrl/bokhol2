/**
 * Content for the Solutions (use case) pages.
 * Every feature and link here points to something that exists on the platform —
 * keep it that way: no invented stats, logos or testimonials.
 */

export type SolutionIcon =
  | 'scale' | 'search' | 'clipboard' | 'calendar'
  | 'chart' | 'list' | 'shield' | 'newspaper' | 'message' | 'users'

export interface Solution {
  slug: string
  /** Short name used in the menu and cards */
  name: string
  /** One line for the menu and cards */
  summary: string
  icon: SolutionIcon
  hero: { eyebrow: string; title: string; subtitle: string }
  problem: { title: string; before: string[]; after: string[] }
  steps: { title: string; text: string; cta: { label: string; href: string } }[]
  tools: { icon: SolutionIcon; title: string; text: string; href: string }[]
  faq: { q: string; a: string }[]
}

export const SOLUTIONS: Solution[] = [
  {
    slug: 'verify-prices',
    name: 'Verify Any Price',
    summary: 'Check whether a supplier quote is fair before you buy.',
    icon: 'scale',
    hero: {
      eyebrow: 'Price verification',
      title: 'Know a fair seafood price before you negotiate',
      subtitle:
        'Compare any supplier quote against the Bokhol Seafood Index and live offers from verified European suppliers — in one place.',
    },
    problem: {
      title: 'Buying without a benchmark is buying blind',
      before: [
        'Calling several suppliers to get a feel for the price',
        'No way to tell if a quote is above the market',
        'Prices scattered across emails, calls and spreadsheets',
      ],
      after: [
        'One Seafood Index with monthly prices per species',
        'Live supplier offers for the same product side by side',
        'A clear reference point for every negotiation',
      ],
    },
    steps: [
      {
        title: 'Compare',
        text: 'Open the species in the Seafood Index and see the current price per kg, the monthly high and low, and the 12-month trend.',
        cta: { label: 'Open the Seafood Index', href: '/dashboard/buyer' },
      },
      {
        title: 'Check live offers',
        text: 'Go to the product page to see every live offer — price, origin, fresh or frozen, packaging and availability.',
        cta: { label: 'Browse products', href: '/products' },
      },
      {
        title: 'Decide',
        text: 'Hold the quote you received against the index and the offers. If it is out of line, you know before you sign.',
        cta: { label: 'Post a buyer request', href: '/requests/buyer/new' },
      },
      {
        title: 'Repeat',
        text: 'Prices move every month. Come back before each order — the index and offers update as suppliers post.',
        cta: { label: 'Read market news', href: '/news' },
      },
    ],
    tools: [
      { icon: 'chart', title: 'Seafood Index', text: 'Monthly reference prices per species, with high, low and trend.', href: '/dashboard/buyer' },
      { icon: 'list', title: 'Live supplier offers', text: 'Every published offer for a product, sortable by price.', href: '/products' },
      { icon: 'shield', title: 'Verified suppliers', text: 'Offers come from supplier companies with a profile on the platform.', href: '/products' },
      { icon: 'newspaper', title: 'Market news', text: 'Updates on regulation, trade and prices that move the market.', href: '/news' },
    ],
    faq: [
      { q: 'How do I check if a quote is fair?', a: 'Find the species in the Seafood Index, then compare your quote with the current index price and with the live offers on the product page.' },
      { q: 'Where do the prices come from?', a: 'The Seafood Index is managed by the Bokhol team. Product pages show the actual prices suppliers have published on the platform.' },
      { q: 'Do I need an account to see prices?', a: 'Yes. Prices and supplier details are visible to registered members. Registering is free.' },
      { q: 'What if my species is not in the index?', a: 'Post a buyer request with the product and quantity — suppliers can respond with a quote you can compare.' },
    ],
  },
  {
    slug: 'find-suppliers',
    name: 'Find Verified Suppliers',
    summary: 'Discover trusted seafood suppliers across Europe.',
    icon: 'search',
    hero: {
      eyebrow: 'Supplier discovery',
      title: 'Find the right seafood supplier, faster',
      subtitle:
        'Browse verified supplier companies and their live product offers, then contact them directly — no cold calling.',
    },
    problem: {
      title: 'Finding a trusted supplier should not take weeks',
      before: [
        'Searching the web and trade lists for suppliers',
        'Unsure whether a company is real and reliable',
        'Little information on products, origins or packaging',
      ],
      after: [
        'Supplier companies with a profile on the platform',
        'Live offers showing product, origin, condition and packaging',
        'Direct contact with the supplier from the offer',
      ],
    },
    steps: [
      {
        title: 'Search',
        text: 'Search by species or filter by category — finfish, shellfish or cephalopods.',
        cta: { label: 'Browse products', href: '/products' },
      },
      {
        title: 'Compare suppliers',
        text: 'Open a product to see every supplier offering it, with origin, price and availability.',
        cta: { label: 'Browse products', href: '/products' },
      },
      {
        title: 'Check the profile',
        text: 'Open the supplier profile to see the company and everything else they offer.',
        cta: { label: 'Learn about Bokhol', href: '/about' },
      },
      {
        title: 'Contact',
        text: 'Reach the supplier directly from the offer and start the conversation.',
        cta: { label: 'Register free', href: '/signup' },
      },
    ],
    tools: [
      { icon: 'search', title: 'Product search', text: 'Find species and see how many live offers each has.', href: '/products' },
      { icon: 'shield', title: 'Supplier profiles', text: 'Company details and all published offers in one place.', href: '/products' },
      { icon: 'list', title: 'Offer details', text: 'Origin, fresh or frozen, packaging, size and availability.', href: '/products' },
      { icon: 'message', title: 'Direct contact', text: 'Contact suppliers straight from their offer.', href: '/products' },
    ],
    faq: [
      { q: 'Are suppliers verified?', a: 'Suppliers on Bokhol are companies with a profile on the platform. Their offers are published through the platform rather than anonymous listings.' },
      { q: 'Which countries do suppliers come from?', a: 'Each offer shows its origin and the supplier location. Use the country filter on a product page to narrow results.' },
      { q: 'Can I see supplier contact details?', a: 'Contact details and prices are available to registered members. Registering is free.' },
      { q: 'I am a supplier — can I list my products?', a: 'Yes. See the membership page or contact the Bokhol team to get your company listed.' },
    ],
  },
  {
    slug: 'source-with-requests',
    name: 'Source With Buyer Requests',
    summary: 'Tell suppliers what you need and let them come to you.',
    icon: 'clipboard',
    hero: {
      eyebrow: 'Buyer requests',
      title: 'Post what you need. Let suppliers quote.',
      subtitle:
        'Describe the product, quantity and destination once. Suppliers on Bokhol see your request and respond with offers.',
    },
    problem: {
      title: 'Stop chasing suppliers one by one',
      before: [
        'Sending the same enquiry to many suppliers',
        'Waiting on replies that never come',
        'Comparing answers in different formats',
      ],
      after: [
        'One request, visible to suppliers on the platform',
        'Quotes come to you',
        'All your requests tracked in your buyer dashboard',
      ],
    },
    steps: [
      {
        title: 'Describe',
        text: 'Enter the product, quantity, destination and any requirements such as fresh or frozen.',
        cta: { label: 'Post a request', href: '/requests/buyer/new' },
      },
      {
        title: 'Publish',
        text: 'Your request is shown to suppliers on Bokhol who can supply that product.',
        cta: { label: 'See open requests', href: '/requests/buyer' },
      },
      {
        title: 'Receive quotes',
        text: 'Suppliers respond with their offers. Check each one against the Seafood Index.',
        cta: { label: 'Verify a price', href: '/solutions/verify-prices' },
      },
      {
        title: 'Track',
        text: 'Follow every request and its status from your buyer dashboard.',
        cta: { label: 'Open dashboard', href: '/dashboard/buyer' },
      },
    ],
    tools: [
      { icon: 'clipboard', title: 'Buyer request form', text: 'Product, quantity, destination and requirements in one form.', href: '/requests/buyer/new' },
      { icon: 'users', title: 'Supplier reach', text: 'Requests are visible to suppliers on the platform.', href: '/requests/buyer' },
      { icon: 'list', title: 'Request tracking', text: 'All your requests and their status in your dashboard.', href: '/dashboard/buyer' },
      { icon: 'chart', title: 'Price check', text: 'Compare each quote with the Seafood Index.', href: '/dashboard/buyer' },
    ],
    faq: [
      { q: 'Who sees my request?', a: 'Requests are shown to suppliers on the Bokhol platform.' },
      { q: 'Does it cost anything to post a request?', a: 'Posting a request requires a free account. See the membership page for plan details.' },
      { q: 'Can I edit or close a request?', a: 'You can follow your requests from your buyer dashboard.' },
      { q: 'How do I know a quote is good?', a: 'Compare it with the Seafood Index and the live offers for the same product.' },
    ],
  },
  {
    slug: 'know-when-to-buy',
    name: 'Know When to Buy',
    summary: 'Follow price trends and news to time your orders.',
    icon: 'calendar',
    hero: {
      eyebrow: 'Market timing',
      title: 'Buy at the right moment',
      subtitle:
        'Follow 12-month price trends per species and the latest market news, so you can plan orders instead of reacting to them.',
    },
    problem: {
      title: 'Timing matters as much as price',
      before: [
        'Ordering when stock runs out, whatever the price',
        'No view of how prices moved in recent months',
        'Missing news that will move the market',
      ],
      after: [
        '12-month price trend for every species in the index',
        'Monthly high, low and change at a glance',
        'Market news published on the platform',
      ],
    },
    steps: [
      {
        title: 'Watch the trend',
        text: 'See how each species has moved over the last 12 months in the Seafood Index.',
        cta: { label: 'Open the Seafood Index', href: '/dashboard/buyer' },
      },
      {
        title: 'Read the news',
        text: 'Follow regulation, trade and market updates that can move prices.',
        cta: { label: 'Read market news', href: '/news' },
      },
      {
        title: 'Plan',
        text: 'Use the trend to decide whether to buy now or wait, and plan volumes ahead.',
        cta: { label: 'Browse products', href: '/products' },
      },
      {
        title: 'Act',
        text: 'When the timing is right, contact a supplier or post a buyer request.',
        cta: { label: 'Post a request', href: '/requests/buyer/new' },
      },
    ],
    tools: [
      { icon: 'chart', title: '12-month trends', text: 'Monthly price history per species.', href: '/dashboard/buyer' },
      { icon: 'scale', title: 'High / low / change', text: 'Monthly range and change at a glance.', href: '/dashboard/buyer' },
      { icon: 'newspaper', title: 'Market news', text: 'News and reports published by the Bokhol team.', href: '/news' },
      { icon: 'list', title: 'Live offers', text: 'Act on the moment with current supplier offers.', href: '/products' },
    ],
    faq: [
      { q: 'How often is the index updated?', a: 'The index shows monthly prices and is updated by the Bokhol team. Live offers update whenever suppliers post.' },
      { q: 'Can I see past prices?', a: 'Yes. Each species shows the last 12 months of prices.' },
      { q: 'Does Bokhol forecast prices?', a: 'No. Bokhol shows historical and current prices and news — the buying decision is yours.' },
      { q: 'Where do I find the news?', a: 'On the News page, and the latest articles also appear on the home page.' },
    ],
  },
]

export function getSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug)
}

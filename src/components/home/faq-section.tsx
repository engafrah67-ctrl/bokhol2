'use client'

import { useState } from 'react'
import { ChevronDown, Fish } from 'lucide-react'

const FAQS = [
  {
    q: 'What is Bokhol FishMarketCap?',
    a: 'Bokhol FishMarketCap is a B2B seafood platform that connects seafood suppliers, importers, wholesalers, and processors with professional buyers across Europe.',
  },
  {
    q: 'Who is Bokhol FishMarketCap for?',
    a: null,
    list: [
      'Seafood Suppliers', 'Importers', 'Wholesalers', 'Processors',
      'Restaurants', 'Hotels', 'Fish Shops', 'Catering Companies',
      'Foodservice Buyers',
    ],
  },
  {
    q: 'How does Bokhol FishMarketCap work?',
    a: 'Suppliers can showcase their company, products, and offers, while buyers can discover suppliers, explore opportunities, and submit sourcing requests through the platform.',
  },
  {
    q: 'What is FishMarketCap Checked?',
    a: 'FishMarketCap Checked indicates that a company\'s basic business information has been reviewed by our team. This verification does not guarantee product quality, delivery performance, or transaction outcomes.',
  },
  {
    q: 'Is Bokhol FishMarketCap a seafood supplier?',
    a: 'No. Bokhol FishMarketCap does not buy or sell seafood products. We provide a platform where suppliers and buyers can connect and do business directly.',
  },
  {
    q: 'What is the FishMarketCap Index?',
    a: 'The FishMarketCap Index is designed to provide market visibility based on supplier participation, product activity, and network data collected through the Bokhol FishMarketCap ecosystem. Our goal is to help buyers better understand market conditions before placing orders.',
  },
  {
    q: 'Where does the market data come from?',
    a: 'Our market insights and index methodology are intended to be based on participation and activity from suppliers and partners within the Bokhol FishMarketCap network.',
  },
  {
    q: 'Can suppliers create a company profile?',
    a: 'Yes. Seafood businesses can claim or manage their company profile and showcase products, offers, certifications, and company information.',
  },
  {
    q: 'How do I claim my company profile?',
    a: 'If your company already appears on Bokhol FishMarketCap, simply click "Claim This Profile". Our team will review the request and verify ownership before granting access.',
  },
  {
    q: 'Can buyers submit requests?',
    a: 'Yes. Professional buyers can post sourcing requests and receive responses from suppliers.',
    example: 'Need 500 KG Atlantic Salmon · Location: Amsterdam · Delivery: Next Week',
  },
  {
    q: 'Is Bokhol FishMarketCap free to use?',
    a: 'Many features are available free of charge during our growth phase. Additional premium features and promotional options may be introduced in the future.',
  },
  {
    q: 'Can suppliers promote their products?',
    a: 'Yes. Suppliers can increase visibility through product offers, company updates, and featured promotional opportunities.',
  },
  {
    q: 'What makes Bokhol FishMarketCap different?',
    a: 'Bokhol FishMarketCap combines Supplier Profiles, Product Offers, Buyer Requests, Business Networking, Market Visibility, and Industry Insights — all in one professional seafood platform.',
  },
  {
    q: 'Why should I use Bokhol FishMarketCap?',
    a: 'Because finding the right supplier, comparing opportunities, and understanding the market should not require dozens of phone calls and emails. Bokhol FishMarketCap helps businesses discover opportunities and make informed decisions before placing their next order.',
  },
  {
    q: 'What is the mission of Bokhol FishMarketCap?',
    a: 'Our mission is to connect the seafood industry, improve market visibility, and help businesses make smarter purchasing decisions through a trusted business network.',
  },
]

function FAQItem({ q, a, list, example }: { q: string; a: string | null; list?: string[]; example?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`border border-border rounded-xl overflow-hidden transition-all duration-200 ${open ? 'bg-white shadow-sm' : 'bg-white hover:border-[#022B96]/30'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-foreground leading-snug">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-[#022B96]' : ''}`}
        />
      </button>

      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-border pt-4">
            {a && (
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            )}
            {list && (
              <ul className="flex flex-wrap gap-2 mt-1">
                {list.map((item) => (
                  <li key={item} className="text-xs font-semibold text-foreground bg-slate-100 px-3 py-1.5 rounded-lg border border-border">
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {example && (
              <div className="mt-3 bg-slate-50 border border-border rounded-lg px-4 py-3 text-xs text-muted-foreground font-medium italic">
                {example}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  return (
    <div className="rounded-2xl border border-border bg-slate-50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border bg-white">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Everything you need to know about Bokhol FishMarketCap.
        </p>
      </div>

      {/* FAQ Grid */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {FAQS.map((faq) => (
          <FAQItem key={faq.q} q={faq.q} a={faq.a} list={faq.list} example={faq.example} />
        ))}
      </div>

      {/* Promise Banner */}
      <div className="mx-6 sm:mx-8 mb-8 rounded-xl bg-gradient-to-r from-[#022B96] to-[#1a4fd6] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Fish className="h-8 w-8 text-white/80 shrink-0" />
        <div>
          <p className="text-white font-bold text-sm">Our Promise</p>
          <p className="text-white/80 text-xs leading-relaxed mt-0.5">
            Real businesses. Real supplier participation. Real market visibility.
            <br />
            <strong className="text-white">🐟 Know the EU market before you place your order.</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

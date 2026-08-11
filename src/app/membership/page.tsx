import { SubscriptionSection } from '@/components/home/subscription-section'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Membership — Bokhol FishMarketCap',
  description:
    'Join the Bokhol FishMarketCap seafood network. Free membership for buyers and suppliers across the Netherlands, Belgium and Germany.',
}

export default function MembershipPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SubscriptionSection />
    </div>
  )
}

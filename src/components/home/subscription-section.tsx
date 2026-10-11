'use client'

import { CheckSquare, Sparkles } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

function FeatureItem({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckSquare
        className={`h-4 w-4 mt-0.5 shrink-0 ${dark ? 'text-blue-300' : 'text-[#022B96]'}`}
      />
      <span className={`text-sm font-medium ${dark ? 'text-white/80' : 'text-slate-700'}`}>
        {text}
      </span>
    </li>
  )
}

export function SubscriptionSection() {
  const { t } = useLanguage()

  const buyerFeatures = [
    t('membership_buyer_feat_1', 'Discover verified seafood suppliers'),
    t('membership_buyer_feat_2', 'Access detailed supplier profiles & certifications'),
    t('membership_buyer_feat_3', 'Submit direct wholesale sourcing requests'),
    t('membership_buyer_feat_4', 'Receive weekly market pricing updates'),
    t('membership_buyer_feat_5', 'Access European market benchmark insights'),
    t('membership_buyer_feat_6', 'Direct support from our Market Research Team'),
  ]

  const supplierFeatures = [
    t('membership_supplier_feat_1', 'Claim and manage verified company profile'),
    t('membership_supplier_feat_2', 'Publish live spot offers and stock availability'),
    t('membership_supplier_feat_3', 'Increase visibility to European commercial buyers'),
    t('membership_supplier_feat_4', 'Connect directly with buyer tender inquiries'),
    t('membership_supplier_feat_5', 'Receive market updates and trade alerts'),
    t('membership_supplier_feat_6', 'Join the premier European seafood network'),
  ]

  return (
    <div className="py-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-[#022B96] text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2">
          <Sparkles className="h-3 w-3" />
          {t('membership_badge', 'Currently Free During Growth Phase')}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {t('membership_title', 'Simple, Transparent Membership')}
        </h1>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          {t('membership_subtitle', 'Join the European seafood business network. No credit card required.')}
        </p>
      </div>

      {/* Narrow Side-by-side cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">

        {/* ── Buyers Card (Blue highlighted) ── */}
        <div className="rounded-xl overflow-hidden shadow-md flex flex-col border border-[#022B96]/20 bg-white">
          {/* Card top */}
          <div className="bg-[#022B96] px-4 py-5 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mb-1.5">
              {t('membership_buyers_badge', 'Buyers')}
            </p>
            <p className="text-[10px] text-white/70 leading-tight mb-3 min-h-[28px]">
              {t('membership_buyers_title', 'For Seafood Buyers')}
            </p>
            {/* Crossed price + badge */}
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <span className="text-xs font-bold line-through text-white/40">€149</span>
              <span className="text-[9px] font-black bg-emerald-400 text-emerald-950 px-1.5 py-0.5 rounded-full">
                {t('membership_free', 'FREE')}
              </span>
            </div>
            {/* Price */}
            <div className="flex items-end justify-center gap-0.5">
              <span className="text-3xl font-black text-white tracking-tight">€0</span>
              <span className="text-[10px] font-semibold text-white/60 mb-1">/mo</span>
            </div>
            <p className="text-[9px] text-white/50 font-medium mt-0.5">{t('membership_free_forever', 'Free membership · No credit card')}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100" />

          {/* Features */}
          <div className="bg-white px-4 py-4 flex-1 flex flex-col">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">
              {t('nav_products', 'Features')}
            </p>
            <ul className="space-y-2 flex-1">
              {buyerFeatures.map((f) => (
                <FeatureItem key={f} text={f} />
              ))}
            </ul>
          </div>
        </div>

        {/* ── Suppliers Card (Dark navy) ── */}
        <div className="rounded-xl overflow-hidden shadow-md flex flex-col border border-slate-800/20 bg-[#111c40]">
          {/* Card top */}
          <div className="bg-[#0d1b4b] px-4 py-5 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mb-1.5">
              {t('membership_suppliers_badge', 'Suppliers')}
            </p>
            <p className="text-[10px] text-white/70 leading-tight mb-3 min-h-[28px]">
              {t('membership_suppliers_title', 'For Seafood Suppliers')}
            </p>
            {/* Price */}
            <div className="flex items-end justify-center gap-0.5 mt-4">
              <span className="text-3xl font-black text-white tracking-tight">{t('membership_free', 'Free')}</span>
            </div>
            <p className="text-[9px] text-white/50 font-medium mt-0.5">
              {t('membership_free_forever', 'Free membership · No credit card')}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-800" />

          {/* Features */}
          <div className="bg-[#111c40] px-4 py-4 flex-1 flex flex-col">
            <p className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-2.5">
              {t('nav_products', 'Features')}
            </p>
            <ul className="space-y-2 flex-1">
              {supplierFeatures.map((f) => (
                <FeatureItem key={f} text={f} dark />
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { X, MapPin, Globe, Mail, Phone, ShieldCheck, CheckCircle2, Clock, ExternalLink, Building2 } from 'lucide-react'
import { CompanyProfile } from '@/lib/data/companies-data'

interface CompanyDetailModalProps {
  company: CompanyProfile | null
  isOpen: boolean
  onClose: () => void
  onOpenClaimModal: (company: CompanyProfile) => void
}

export function CompanyDetailModal({ company, isOpen, onClose, onOpenClaimModal }: CompanyDetailModalProps) {
  if (!isOpen || !company) return null

  const isClaimed = company.status === 'claimed'
  const isPending = company.status === 'claim_requested'
  const isUnclaimed = !isClaimed && !isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-6 transition-all animate-in fade-in zoom-in-95 duration-200">

        {/* Clean Header */}
        <div className="p-6 pb-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* Logo Container - explicit dimensions and clear presentation */}
            <div className="w-24 h-16 rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-xs">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-slate-100 text-slate-700 font-black text-xl flex items-center justify-center">
                  {company.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Title & Metadata */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                  {company.name}
                </h2>
                {isClaimed && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Supplier
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Review
                  </span>
                )}
                {isUnclaimed && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Unclaimed Profile
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{company.category}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {company.address || company.country}
                </span>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0 mt-0.5"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Notice for Unclaimed Profile */}
          {isUnclaimed && (
            <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#022B96] flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800">Do you represent {company.name}?</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Claim this official profile to update company details, manage seafood listings, and receive verified buyer inquiries.
                </p>
              </div>
            </div>
          )}

          {isPending && (
            <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-3.5 flex items-center gap-3 text-xs text-amber-800">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <p>A verification claim for this profile is currently under review by the administration team.</p>
            </div>
          )}

          {/* About */}
          {company.description && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                About
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {company.description}
              </p>
            </div>
          )}

          {/* Species / Seafood Portfolio */}
          {company.species && company.species.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Seafood Portfolio
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {company.species.map((sp) => (
                  <span
                    key={sp}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70"
                  >
                    {sp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Details Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Website */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Website</span>
              {company.website ? (
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#022B96] hover:underline flex items-center gap-1 truncate"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">Not listed</span>
              )}
            </div>

            {/* Email */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</span>
              {company.email ? (
                <a
                  href={`mailto:${company.email}`}
                  className="text-xs font-semibold text-slate-700 hover:text-[#022B96] flex items-center gap-1 truncate transition"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{company.email}</span>
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">Not listed</span>
              )}
            </div>

            {/* Phone */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</span>
              {company.phone ? (
                <a
                  href={`tel:${company.phone}`}
                  className="text-[11px] font-semibold text-slate-700 hover:text-[#022B96] flex items-center gap-1 transition"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{company.phone}</span>
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">Not listed</span>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 shadow-xs transition cursor-pointer"
          >
            Close
          </button>

          {isUnclaimed ? (
            <button
              type="button"
              onClick={() => { onClose(); onOpenClaimModal(company) }}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#022B96] hover:bg-[#011E6B] px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Claim Profile
            </button>
          ) : isClaimed ? (
            <a
              href={`mailto:${company.email}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              Contact Supplier
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}

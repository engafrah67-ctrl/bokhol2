'use client'

import React from 'react'
import { X, Building2, MapPin, Globe, Mail, Phone, ShieldAlert, ShieldCheck, CheckCircle2, ArrowRight, Package, Tag, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CompanyProfile } from '@/lib/data/companies-data'

interface CompanyDetailModalProps {
  company: CompanyProfile | null
  isOpen: boolean
  onClose: () => void
  onOpenClaimModal: (company: CompanyProfile) => void
}

export function CompanyDetailModal({ company, isOpen, onClose, onOpenClaimModal }: CompanyDetailModalProps) {
  if (!isOpen || !company) return null

  const isUnclaimed = company.status === 'unclaimed'
  const isPending = company.status === 'claim_requested'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Banner Header */}
        <div
          className="relative p-6 text-white overflow-hidden"
          style={{
            background: company.bannerColor
              ? `linear-gradient(135deg, ${company.bannerColor}, #022B96)`
              : 'linear-gradient(135deg, #022B96, #1e3a8a)',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/30">
              {company.category}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/20">
              {company.country}
            </span>
            
            {isUnclaimed ? (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full shadow-sm">
                Unclaimed Profile
              </span>
            ) : isPending ? (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-400 text-sky-950 px-2.5 py-1 rounded-full shadow-sm">
                Claim Pending
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-400 text-emerald-950 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3 h-3" /> Claimed & Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-[#022B96] font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white shrink-0">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight leading-tight">{company.name}</h2>
              <p className="text-xs text-white/80 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {company.address}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* PUBLIC DISCLAIMER BOX FOR UNCLAIMED PROFILES */}
          {isUnclaimed && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-0.5">Public Information Disclaimer</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    This profile was created using publicly available company information. Are you part of this company?
                    Claim this profile to manage and update your company information.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  onClose()
                  onOpenClaimModal(company)
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl px-4 py-2 shrink-0 shadow"
              >
                Claim This Profile
              </Button>
            </div>
          )}

          {isPending && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
              <p className="text-xs text-sky-900">
                A ownership claim request has been submitted for this company and is currently under <strong>Admin Verification</strong>.
              </p>
            </div>
          )}

          {/* Overview & Description */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              About {company.name}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-4">
              {company.description}
            </p>
          </div>

          {/* Species & Product Offering */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-slate-500" />
              Seafood Portfolio & Species
            </h3>
            <div className="flex flex-wrap gap-2">
              {company.species.map((sp) => (
                <span
                  key={sp}
                  className="bg-blue-50 text-[#022B96] border border-blue-100 font-semibold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#022B96]"></span>
                  {sp}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Website</span>
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#022B96] hover:underline flex items-center gap-1 mt-0.5 truncate"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                {company.website.replace('https://', '')}
              </a>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Email</span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                {company.email}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Phone</span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                {company.phone}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-100 flex items-center justify-between">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs">
            Close
          </Button>

          {isUnclaimed ? (
            <Button
              onClick={() => {
                onClose()
                onOpenClaimModal(company)
              }}
              className="bg-[#022B96] hover:bg-[#022B96]/90 text-white rounded-xl text-xs font-bold px-5 shadow"
            >
              Claim Profile
            </Button>
          ) : (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-5">
              Contact Verified Supplier
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}

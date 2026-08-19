'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Mail,
  User,
  Briefcase,
  AlertTriangle,
  Building2,
  ShieldAlert,
  XCircle,
  LogOut,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CompanyProfile, requestProfileClaim } from '@/lib/data/companies-data'
import { submitSupplierClaim } from '@/features/claims/actions'
import { createClient } from '@/lib/supabase/client'

interface ClaimProfileModalProps {
  company: CompanyProfile | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ClaimProfileModal({ company, isOpen, onClose, onSuccess }: ClaimProfileModalProps) {
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // User auth & role restriction state
  const [checkingRole, setCheckingRole] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    async function checkCurrentUserRole() {
      setCheckingRole(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user

        if (user) {
          setUserEmail(user.email || null)
          let role = user.user_metadata?.role || null

          try {
            const { data: profile } = await supabase
              .from('users')
              .select('role, full_name')
              .eq('id', user.id)
              .maybeSingle()

            if (profile?.role) role = profile.role
            if (profile?.full_name && !fullName) {
              setFullName(profile.full_name)
            }
          } catch (_) {}

          setUserRole(role)

          if (user.email && !businessEmail) {
            const domain = user.email.split('@')[1]?.toLowerCase() || ''
            const free = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']
            if (!free.includes(domain)) {
              setBusinessEmail(user.email)
            }
          }
        } else {
          setUserRole(null)
          setUserEmail(null)
        }
      } catch (err) {
        console.error('Error checking user role for claim:', err)
        setUserRole(null)
      } finally {
        setCheckingRole(false)
      }
    }

    checkCurrentUserRole()
  }, [isOpen, supabase])

  if (!isOpen || !company) return null

  // Extract expected domain e.g. amacore.nl
  const expectedDomain = company.domain || company.email?.split('@')[1] || ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!company) return
    setError(null)

    // Role check safeguard
    if (userRole === 'admin') {
      setError('Admin accounts cannot claim supplier profiles.')
      return
    }
    if (userRole === 'buyer') {
      setError('Buyer accounts cannot claim supplier profiles. Please sign in with a Supplier account.')
      return
    }

    if (!fullName.trim() || !businessEmail.trim() || !jobTitle.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    // Email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(businessEmail.trim())) {
      setError('Please enter a valid business email address.')
      return
    }

    // Free domain check
    const emailDomain = businessEmail.split('@')[1]?.toLowerCase() || ''
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com']
    if (freeDomains.includes(emailDomain)) {
      setError(`Please use your official company business email (e.g. name@${expectedDomain || 'company.com'}). Personal email providers (@${emailDomain}) are not accepted for verification.`)
      return
    }

    setLoading(true)

    try {
      // 1. Submit to database server action
      const serverRes = await submitSupplierClaim({
        companyId: company.id,
        supplierName: company.name,
        supplierSlug: company.slug,
        fullName: fullName.trim(),
        businessEmail: businessEmail.trim(),
        jobTitle: jobTitle.trim(),
      })

      if (!serverRes.success) {
        setLoading(false)
        setError(serverRes.error || 'Claim could not be processed.')
        return
      }

      // 2. Synchronize local state
      const res = requestProfileClaim(company.id, {
        fullName: fullName.trim(),
        businessEmail: businessEmail.trim(),
        jobTitle: jobTitle.trim(),
      })

      setLoading(false)

      if (res.success) {
        setSubmitted(true)
        setTimeout(() => {
          onSuccess()
          onClose()
          setSubmitted(false)
        }, 2200)
      } else {
        setError(res.error || 'Failed to submit claim request. Please try again.')
      }
    } catch (err: any) {
      setLoading(false)
      setError(err?.message || 'An unexpected error occurred while submitting your claim.')
    }
  }

  const handleSignOutAndSwitch = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Company Logo */}
        <div className="bg-gradient-to-r from-[#022B96] to-blue-800 text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3.5 mb-2">
            {company.logoUrl ? (
              <div className="w-12 h-12 rounded-2xl bg-white border border-white/40 shadow-sm p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white/15 text-white font-black text-base flex items-center justify-center border border-white/20 shrink-0">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <span className="inline-block text-[11px] font-bold text-blue-100 bg-white/15 px-2.5 py-0.5 rounded-full mb-1">
                Claim Profile Ownership
              </span>
              <h2 className="text-xl font-extrabold leading-tight text-white">{company.name}</h2>
            </div>
          </div>
          
          <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
            Submit your business verification details to claim ownership of this supplier profile.
          </p>
        </div>

        {/* LOADING STATE */}
        {checkingRole ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-7 h-7 animate-spin text-[#022B96]" />
            <p className="text-xs font-semibold">Checking account permissions...</p>
          </div>
        ) : userRole === 'admin' ? (
          /* ── RULE 1: ADMIN CANNOT CLAIM PROFILE ── */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                Admin Account Restriction
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">Administrators Cannot Claim Profiles</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-sm mx-auto">
                You are currently signed in as an <strong>Administrator</strong> (<code>{userEmail}</code>).
                Company profile claims must be submitted by authorized seafood suppliers or company representatives.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-[11px] text-slate-600 text-left space-y-1">
              <p className="font-bold text-slate-800">Why this rule exists:</p>
              <p className="text-slate-500 leading-normal">
                Administrators manage and approve claims via the <strong>Admin → Verification</strong> console, but cannot claim supplier ownership directly.
              </p>
            </div>

            <div className="flex gap-2 pt-2 justify-center">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-xs font-semibold cursor-pointer px-5"
              >
                Close
              </Button>
              <Button
                onClick={handleSignOutAndSwitch}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold px-5 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out to Claim
              </Button>
            </div>
          </div>
        ) : userRole === 'buyer' ? (
          /* ── RULE 2: BUYER CANNOT CLAIM PROFILE ── */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <XCircle className="w-9 h-9" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full">
                Buyer Account Restriction
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">Buyer Accounts Cannot Claim Profiles</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-sm mx-auto">
                You are currently signed in as a <strong>Buyer</strong> (<code>{userEmail}</code>).
                Only verified seafood <strong>Suppliers</strong> and authorized company representatives are permitted to claim supplier listings.
              </p>
            </div>

            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5 text-[11px] text-rose-900 text-left space-y-1">
              <p className="font-bold text-rose-900 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Need to represent this company?
              </p>
              <p className="text-rose-800 leading-normal">
                Please sign out of your Buyer account and log in or submit verification with your official supplier business email.
              </p>
            </div>

            <div className="flex gap-2 pt-2 justify-center">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-xs font-semibold cursor-pointer px-5"
              >
                Close
              </Button>
              <Button
                onClick={handleSignOutAndSwitch}
                className="bg-[#022B96] hover:bg-[#011a5e] text-white rounded-xl text-xs font-bold px-5 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5" /> Switch to Supplier Account
              </Button>
            </div>
          </div>
        ) : submitted ? (
          /* ── SUBMITTED SUCCESS STATE ── */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Claim Submitted For Verification</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Your claim request for <strong>{company.name}</strong> has been securely submitted. Our administrators will review your business credentials (<code>{businessEmail}</code>) and issue your login credentials upon approval.
            </p>
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs font-semibold inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Status: <strong>Pending Admin Verification</strong></span>
            </div>
          </div>
        ) : (
          /* ── 3-FIELD CLAIM FORM (SUPPLIER / GUEST REPRESENTATIVE) ── */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {error && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 text-[11px] text-blue-900 leading-relaxed">
              <p className="font-semibold flex items-center gap-1.5 text-[#022B96] mb-0.5">
                <ShieldCheck className="w-4 h-4" /> Supplier Representative Verification
              </p>
              Please provide your professional contact details. An administrator will verify your claim and issue your supplier portal login credentials upon verification.
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmed Ali"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Business Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Business Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder={`e.g. contact@${expectedDomain || 'company.com'}`}
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50/50 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Must be an official corporate email (e.g. @{expectedDomain || 'company.com'}).
              </p>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Managing Director, Sales Manager, CEO"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition bg-slate-50/50 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Your role or authorization within {company.name}.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold cursor-pointer">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#022B96] hover:bg-[#011a5e] text-white rounded-xl text-xs font-bold px-6 py-2.5 shadow-sm cursor-pointer flex items-center gap-2"
              >
                {loading ? 'Submitting Claim...' : 'Submit Claim for Verification'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

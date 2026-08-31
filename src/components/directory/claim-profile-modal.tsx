'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, ShieldCheck, Mail, User, Briefcase, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CompanyProfile, requestProfileClaim } from '@/lib/data/companies-data'
import { createClient } from '@/lib/supabase/client'

interface ClaimProfileModalProps {
  company: CompanyProfile | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ClaimProfileModal({ company, isOpen, onClose, onSuccess }: ClaimProfileModalProps) {
  const [fullName, setFullName] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen || !company) return null

  // Extract expected domain e.g. amacore.nl
  const expectedDomain = company.domain || company.email.split('@')[1] || ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!company) return
    setError(null)

    if (!fullName.trim() || !businessEmail.trim() || !jobTitle.trim() || !password) {
      setError('Please fill in all required fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    const companyId = company.id

    try {
      // 1. Immediately record pending claim in local/state database
      const res = requestProfileClaim(companyId, {
        fullName: fullName.trim(),
        businessEmail: businessEmail.trim(),
        jobTitle: jobTitle.trim(),
        phone: '',
      })

      if (!res.success) {
        setLoading(false)
        setError(res.error || 'Failed to submit claim request. Please try again.')
        return
      }

      // 2. Attempt Supabase Auth account creation with safety timeout (max 1.5s so it never hangs)
      try {
        const supabase = createClient()
        const authAction = async () => {
          const { data: authData } = await supabase.auth.signUp({
            email: businessEmail.trim(),
            password: password,
            options: {
              data: {
                role: 'supplier',
                full_name: fullName.trim(),
                company_id: companyId,
                company_name: company.name,
                job_title: jobTitle.trim(),
                claim_status: 'pending',
              },
            },
          })

          if (authData?.user) {
            try {
              await supabase.from('users').upsert({
                id: authData.user.id,
                role: 'supplier',
                full_name: fullName.trim(),
                company_id: companyId,
              })
            } catch (_) {}
          }
        }

        const timeout = new Promise((resolve) => setTimeout(resolve, 1500))
        await Promise.race([authAction(), timeout])
      } catch (authErr) {
        console.warn('Auth registration notice:', authErr)
      }

      setLoading(false)
      setSubmitted(true)
      setTimeout(() => {
        onSuccess()
        onClose()
        setSubmitted(false)
      }, 3000)
    } catch (err: any) {
      setLoading(false)
      setError(err?.message || 'Failed to submit claim request. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with REAL Company Logo */}
        <div className="bg-gradient-to-r from-[#022B96] to-blue-800 text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3.5 mb-2">
            {company.logoUrl ? (
              <div className="w-12 h-12 rounded-xl bg-white border border-white/40 shadow-sm p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/15 text-white font-black text-base flex items-center justify-center border border-white/20 shrink-0">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <span className="inline-block text-[11px] font-semibold text-blue-100 bg-white/15 px-2.5 py-0.5 rounded-full mb-1">
                Claim Profile Ownership
              </span>
              <h2 className="text-xl font-extrabold leading-tight text-white">{company.name}</h2>
            </div>
          </div>
          
          <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
            Claim this profile to manage company details, upload products, post market offers, and connect directly with verified buyers.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Claim Submitted Successfully</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your claim for <strong>{company.name}</strong> is now pending admin review.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left space-y-1.5">
              <p className="font-bold text-slate-800">Your Login Credentials:</p>
              <p className="text-slate-600">Email: <strong className="text-[#022B96]">{businessEmail}</strong></p>
              <p className="text-slate-600">Password: <strong className="text-slate-800">••••••••</strong></p>
              <p className="text-[11px] text-emerald-700 font-semibold pt-1">
                Once the admin clicks Approve in the Admin Panel, you can sign in at <strong>/login</strong> using this email and password.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {error && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John De Jong"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales Manager / CEO"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Login Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Login Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder={`e.g. name@${expectedDomain || 'company.com'}`}
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                You will use this email address to log in to your Supplier Dashboard.
              </p>
            </div>

            {/* Password with View Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#022B96]/20 focus:border-[#022B96] outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Minimum 6 characters. You will use this password to sign in.</p>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs font-semibold">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#022B96] hover:bg-[#022B96]/90 text-white rounded-xl text-xs font-bold px-6 py-2 shadow"
              >
                {loading ? 'Submitting Claim...' : 'Claim This Profile'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

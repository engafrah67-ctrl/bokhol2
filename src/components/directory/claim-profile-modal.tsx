'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { CompanyProfile, requestProfileClaim } from '@/lib/data/companies-data'
import { createClient } from '@/lib/supabase/client'

interface ClaimProfileModalProps {
  company: CompanyProfile | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ClaimProfileModal({ company, isOpen, onClose, onSuccess }: ClaimProfileModalProps) {
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen || !company) return null

  const expectedDomain = company.domain || (company.email ? company.email.split('@')[1] : '')

  const handleUsernameChange = (val: string) => {
    setUsername(val.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!company) return
    setError(null)

    const cleanUsername = username.trim().toLowerCase()
    const cleanFullName = fullName.trim()
    const cleanTitle = jobTitle.trim()
    const cleanEmail = businessEmail.trim().toLowerCase()

    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (!cleanFullName) {
      setError('Please enter your full name.')
      return
    }
    if (!cleanTitle) {
      setError('Please enter your job title.')
      return
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid business email.')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const companyId = company.id

    try {
      const res = requestProfileClaim(companyId, {
        username: cleanUsername,
        fullName: cleanFullName,
        businessEmail: cleanEmail,
        jobTitle: cleanTitle,
      })

      if (!res.success) {
        setLoading(false)
        setError(res.error || 'Failed to submit. Please try again.')
        return
      }

      // Persist claim to backend server API
      try {
        await fetch('/api/profile-claims', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: companyId,
            company_name: company.name,
            username: cleanUsername,
            full_name: cleanFullName,
            job_title: cleanTitle,
            business_email: cleanEmail,
            password: password,
          }),
        })
      } catch (apiErr) {
        console.warn('Backend claims API call fallback:', apiErr)
      }

      // Also try Supabase table directly if available
      try {
        const supabase = createClient()
        await supabase.from('profile_claims').insert({
          company_id: companyId,
          company_name: company.name,
          username: cleanUsername,
          full_name: cleanFullName,
          job_title: cleanTitle,
          business_email: cleanEmail,
          status: 'pending',
        })
      } catch (_) {}

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bokhol-claims-change'))
        window.dispatchEvent(new Event('storage'))
      }

      setLoading(false)
      setSubmitted(true)
      setTimeout(() => {
        onSuccess()
        onClose()
        setSubmitted(false)
      }, 3000)
    } catch (err: unknown) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.')
    }
  }

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-[#022B96] focus:ring-1 focus:ring-[#022B96]/20 transition'
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 bg-gray-50">
                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#022B96]/10 flex items-center justify-center shrink-0">
                <span className="text-[#022B96] font-bold text-sm">{company.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 font-medium">Claim Profile</p>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">{company.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg hover:bg-gray-100 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          /* Success */
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">Request Submitted</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your claim for <strong className="text-gray-800">{company.name}</strong> is under review.
              The admin will approve or reject your request.
            </p>
            <div className="text-left bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1 border border-gray-100">
              <p><span className="text-gray-400">Username:</span> <strong>@{username}</strong></p>
              <p><span className="text-gray-400">Name:</span> <strong>{fullName}</strong></p>
              <p><span className="text-gray-400">Email:</span> <strong>{businessEmail}</strong></p>
            </div>
          </div>
        ) : (
          /* Form — autocomplete="off" prevents browser from filling admin credentials */
          <form onSubmit={handleSubmit} autoComplete="off" noValidate className="p-5 space-y-4">

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label className={labelClass}>Username <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="claim-username"
                autoComplete="off"
                placeholder="e.g. john_supplier"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Full Name */}
            <div>
              <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="claim-fullname"
                autoComplete="off"
                placeholder="e.g. John De Jong"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Job Title */}
            <div>
              <label className={labelClass}>Job Title <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="claim-title"
                autoComplete="off"
                placeholder="e.g. Sales Manager, CEO"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Business Email */}
            <div>
              <label className={labelClass}>Business Email <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="claim-email"
                autoComplete="off"
                placeholder={expectedDomain ? `name@${expectedDomain}` : 'you@company.com'}
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>
                Password <span className="text-red-400">*</span>
                <span className="text-gray-300 ml-1 font-normal">— min. 6 characters</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="claim-new-password"
                  autoComplete="new-password"
                  placeholder="Create a password for your account"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Notice */}
            <p className="text-xs text-gray-400 leading-relaxed">
              After submitting, the admin will review and approve your request. You can then sign in with your email and password.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#022B96] rounded-lg hover:bg-[#011a5e] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Claim Profile'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

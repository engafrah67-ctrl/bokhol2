'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { signUp } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Lock, User, Building2, AlertCircle, Check } from 'lucide-react'

const initialState = { error: undefined, success: undefined }

const SUPPLIER_COUNTRIES = [
  {
    id: 'belgium',
    name: 'Belgium',
    code: 'BE',
    flag: '🇧🇪',
    flagUrl: 'https://flagcdn.com/w40/be.png',
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    subname: 'Holland',
    code: 'NL',
    flag: '🇳🇱',
    flagUrl: 'https://flagcdn.com/w40/nl.png',
  },
  {
    id: 'germany',
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    flagUrl: 'https://flagcdn.com/w40/de.png',
  },
]

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signUp, initialState)
  const [role, setRole] = useState<'buyer' | 'supplier'>('buyer')
  const [selectedCountry, setSelectedCountry] = useState('Belgium')
  const [selectedCountryCode, setSelectedCountryCode] = useState('BE')

  const errorMessage = typeof state?.error === 'string' && state.error.trim().length > 0 ? state.error : null

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join FishMarketCap — the seafood trade intelligence platform
        </p>
      </div>

      {/* Role Selector */}
      <div className="mb-6 flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          id="role-buyer"
          onClick={() => setRole('buyer')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition cursor-pointer ${
            role === 'buyer'
              ? 'bg-[#022B96] text-white'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          <User className="h-4 w-4" />
          I&apos;m a Buyer
        </button>
        <button
          type="button"
          id="role-supplier"
          onClick={() => setRole('supplier')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition cursor-pointer ${
            role === 'supplier'
              ? 'bg-[#022B96] text-white'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          <Building2 className="h-4 w-4" />
          I&apos;m a Supplier
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Hidden role input */}
        <input type="hidden" name="role" value={role} />

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              placeholder="Ahmed Al-Rashidi"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Min. 8 characters"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
        </div>

        {/* Supplier Country Selector */}
        {role === 'supplier' && (
          <div className="space-y-2 pt-1 pb-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">
                Supplier Country <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-muted-foreground">Select your country</span>
            </div>

            {/* Hidden inputs to pass selected country to server action */}
            <input type="hidden" name="country" value={selectedCountry} />
            <input type="hidden" name="country_code" value={selectedCountryCode} />

            <div className="grid grid-cols-3 gap-2.5">
              {SUPPLIER_COUNTRIES.map((c) => {
                const isSelected = selectedCountryCode === c.code
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(c.name)
                      setSelectedCountryCode(c.code)
                    }}
                    className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#022B96] bg-blue-50/50 shadow-xs ring-2 ring-[#022B96]/20'
                        : 'border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/30'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#022B96] text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                    <div className="mb-2 flex items-center justify-center h-7 w-9 rounded overflow-hidden border border-black/10 shadow-2xs bg-white">
                      <img
                        src={c.flagUrl}
                        alt={c.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className={`text-xs font-semibold leading-tight ${isSelected ? 'text-[#022B96]' : 'text-foreground'}`}>
                      {c.name}
                    </span>
                    {c.subname && (
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        ({c.subname})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#022B96] hover:bg-[#011a5e] text-white font-semibold py-2.5 cursor-pointer"
        >
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
          ) : (
            `Create ${role === 'buyer' ? 'Buyer' : 'Supplier'} Account`
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}

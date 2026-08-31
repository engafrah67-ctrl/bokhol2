'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Phone,
  Mail,
  MessageSquare,
  HelpCircle,
  X,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  const email = 'h.bokhol@outlook.com'
  const phone = '+31 6 84033593'
  const waNumber = '31684033593'
  const waMessage = encodeURIComponent(
    'Hello Hassan, I have a question about Bokhol and seafood market opportunities.'
  )
  const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`

  // Close widget when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(email)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(phone)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── Popup Card ── */}
      {isOpen && (
        <div
          id="bokhol-support-popup"
          className="mb-4 w-[360px] sm:w-[390px] max-w-[calc(100vw-2rem)] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6"
        >
          {/* Header Banner */}
          <div className="relative bg-[#022B96] text-white p-5 pb-6">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                {/* Avatar with online badge */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white/30 bg-slate-800 shadow-md">
                    <img
                      src="/hassan.png"
                      alt="Hassan Abdulkadir"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-base leading-tight">
                      Hassan Abdulkadir
                    </h3>
                  </div>
                  <p className="text-blue-200 text-xs font-medium">
                    Customer Success & Market Specialist
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Close contact dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Intro text */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-white/90 text-xs font-normal leading-relaxed">
                Choose a channel that works best for you. We respond quickly during business days.
              </p>
            </div>
          </div>

          {/* Contact Channels List */}
          <div className="p-4 space-y-2.5 bg-slate-50/70 dark:bg-slate-900/80 max-h-[60vh] overflow-y-auto">
            {/* Channel 1: Phone / WhatsApp */}
            <div className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-3.5 transition-all duration-200 hover:border-emerald-500/50 hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground">Phone & WhatsApp</h4>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                      Direct line
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Call or chat directly with our specialist
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#022B96] dark:text-blue-400 hover:underline"
                    >
                      {phone}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      onClick={handleCopyPhone}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded transition-colors"
                      title="Copy phone number"
                    >
                      {copiedPhone ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel 2: Email */}
            <div className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-3.5 transition-all duration-200 hover:border-blue-500/50 hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#022B96] dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground">E-mail</h4>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
                      Quick reply
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Reply within a few hours on business days
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={`mailto:${email}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#022B96] dark:text-blue-400 hover:underline truncate"
                    >
                      {email}
                    </a>
                    <button
                      onClick={handleCopyEmail}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded transition-colors shrink-0"
                      title="Copy email address"
                    >
                      {copiedEmail ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel 3: Contactformulier / Request */}
            <Link
              href="/requests/buyer/new"
              onClick={() => setIsOpen(false)}
              className="group relative flex items-start gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-3.5 transition-all duration-200 hover:border-indigo-500/50 hover:shadow-md block"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Contact Form / Sourcing Request</h4>
                  <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Send a specific inquiry, request a quote, or find suppliers.
                </p>
              </div>
            </Link>

            {/* Channel 4: Helpcenter / Market Updates */}
            <Link
              href="/news"
              onClick={() => setIsOpen(false)}
              className="group relative flex items-start gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-3.5 transition-all duration-200 hover:border-amber-500/50 hover:shadow-md block"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Helpcenter & Market News</h4>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-bold group-hover:underline flex items-center gap-1">
                    Knowledge base
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Seafood indexes, verified directory guides & FAQs
                </p>
              </div>
            </Link>
          </div>

          {/* Footer inside widget */}
          <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 relative">
                <img src="/app-icon.png" alt="Bokhol Icon" className="w-full h-full object-contain" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Bokhol Network
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              Market Intelligence
            </span>
          </div>
        </div>
      )}

      {/* ── Floating Launcher Button ── */}
      <div className="flex items-center gap-3">
        {/* Tooltip on hover (when closed) */}
        {!isOpen && (
          <div
            className={`
              hidden sm:flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl border border-slate-800
              whitespace-nowrap transition-all duration-300 pointer-events-none
              ${showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'}
            `}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Questions? Chat or Contact Us</span>
          </div>
        )}

        {/* The Button using Bokhol 'b' Logo Mark */}
        <button
          id="bokhol-support-widget-trigger"
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label="Open support and contact options"
          className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white dark:bg-slate-900 border-2 border-border shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-[#022B96]/20"
        >
          {/* Subtle pulse ring around the button */}
          <span className="absolute inset-0 rounded-full bg-[#022B96]/10 animate-ping pointer-events-none" />

          {/* Active / Online Dot */}
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-white" />
          </span>

          {/* Icon state */}
          {isOpen ? (
            <X className="h-6 w-6 text-slate-800 dark:text-white transition-transform duration-200 rotate-0 hover:rotate-90" />
          ) : (
            <div className="h-9 w-9 sm:h-10 sm:w-10 relative flex items-center justify-center p-0.5 transition-transform duration-200 group-hover:scale-110">
              {/* Bokhol Logo Mark (Same as hero icon) */}
              <img
                src="/app-icon.png"
                alt="Bokhol Icon"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

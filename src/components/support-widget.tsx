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
  Sparkles,
} from 'lucide-react'

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false)
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

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── Popup Card ── */}
      {isOpen && (
        <div
          id="bokhol-support-popup"
          className="mb-4 w-[340px] sm:w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          {/* Header */}
          <div className="bg-[#022B96] text-white p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-white/20 bg-slate-800 shadow-sm">
                  <img
                    src="/hassan.png"
                    alt="Hassan Abdulkadir"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#022B96]" />
              </div>

              <div>
                <h3 className="font-bold text-white text-sm leading-tight">
                  Hassan Abdulkadir
                </h3>
                <p className="text-blue-200 text-xs font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Support Specialist • Online
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Contact Channels List */}
          <div className="p-3 space-y-2 bg-slate-50/50 dark:bg-slate-900/60">
            {/* Channel 1: WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 hover:border-emerald-500/50 hover:shadow-xs transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">WhatsApp / Call</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">{phone}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                Chat
              </span>
            </a>

            {/* Channel 2: Email */}
            <a
              href={`mailto:${email}`}
              className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 hover:border-blue-500/50 hover:shadow-xs transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#022B96] dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Email Support</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">{email}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#022B96] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-200/60 dark:border-blue-800/60 shrink-0 group-hover:bg-[#022B96] group-hover:text-white transition">
                Email
              </span>
            </a>

            {/* Channel 3: Contact Form */}
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Contact Form</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">Send a message to our team</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#022B96] group-hover:translate-x-0.5 transition shrink-0" />
            </Link>

            {/* Channel 4: Help Center / News */}
            <Link
              href="/news"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Market Knowledge</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">Indexes &amp; seafood news</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition shrink-0" />
            </Link>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Bokhol Network</span>
            <span>Fast Response • Mon–Fri</span>
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
                src="/app-icon.png?v=3"
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

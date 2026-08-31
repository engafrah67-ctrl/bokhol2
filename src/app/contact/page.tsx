'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  Building2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContactPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [subject, setSubject] = useState('General Inquiry')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Simulate sending message or fallback mailto
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmitting(false)
    setSubmitted(true)
  }

  const resetForm = () => {
    setFullName('')
    setEmail('')
    setPhone('')
    setCompany('')
    setSubject('General Inquiry')
    setMessage('')
    setSubmitted(false)
  }

  const directEmail = 'h.bokhol@outlook.com'
  const directPhone = '+31 6 84033593'
  const waUrl = 'https://wa.me/31684033593?text=Hello%20Hassan%2C%20I%20have%20an%20inquiry%20regarding%20Bokhol.'

  return (
    <main className="min-h-screen pb-20 bg-transparent">
      {/* ── 1. Clean Header ── */}
      <section className="max-w-4xl mx-auto px-4 pt-12 pb-8 text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#022B96] dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-900">
          <MessageSquare className="h-3.5 w-3.5" /> Direct Support &amp; Inquiries
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Get in Touch with Our Team
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          Have questions about the platform, supplier listings, or seafood sourcing? Reach out to us directly or fill out the form below.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT: Quick Contact Cards (4 Cols) ── */}
          <div className="lg:col-span-5 space-y-4">
            {/* Specialist Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800 bg-slate-100 shadow-sm">
                    <img
                      src="/hassan.png"
                      alt="Hassan Abdulkadir"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Hassan Abdulkadir</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Customer Success &amp; Market Specialist</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {/* WhatsApp */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold">WhatsApp / Direct Call</p>
                      <p className="text-[11px] opacity-80">{directPhone}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* Email */}
                <a
                  href={`mailto:${directEmail}?subject=${encodeURIComponent('Inquiry for Bokhol Support')}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 text-blue-900 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-[#022B96] text-white flex items-center justify-center">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold">Direct Email</p>
                      <p className="text-[11px] opacity-80">{directEmail}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#022B96] group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {/* Office / Hours */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Response Time: <strong>Within 2–4 hours</strong> (Mon–Fri)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Verified EU &amp; Global Seafood Network</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Clean Modern Contact Form (7 Cols) ── */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message Sent Successfully!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{fullName || 'there'}</strong>. We have received your inquiry and our team will get back to you at <strong>{email}</strong> shortly.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={resetForm}
                      className="px-6 py-2.5 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Send Us a Message</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Fill in your details and we will get back to you promptly.
                    </p>
                  </div>

                  {/* Name & Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Your Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#022B96] focus:bg-white dark:focus:bg-slate-900 transition font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#022B96] focus:bg-white dark:focus:bg-slate-900 transition font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone & Company */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Phone / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="+31 6 12345678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#022B96] focus:bg-white dark:focus:bg-slate-900 transition font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Company Name (Optional)
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Nordic Seafood AS"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#022B96] focus:bg-white dark:focus:bg-slate-900 transition font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subject Selection */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Subject / Topic
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-[#022B96] transition font-medium"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Supplier Registration">Supplier Verification &amp; Listing</option>
                      <option value="Buyer Sourcing Support">Buyer Sourcing &amp; Procurement</option>
                      <option value="Partnership & Sponsorship">Partnership &amp; Brand Partnership</option>
                      <option value="Technical Support">Technical Support &amp; Feedback</option>
                    </select>
                  </div>

                  {/* Message Body */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="How can we help you?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 outline-none focus:border-[#022B96] focus:bg-white dark:focus:bg-slate-900 transition font-medium resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-400">
                      We never share your contact details.
                    </p>
                    <button
                      type="submit"
                      disabled={submitting || !fullName || !email || !message}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#022B96] hover:bg-[#011a5e] text-white text-xs font-bold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </div>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

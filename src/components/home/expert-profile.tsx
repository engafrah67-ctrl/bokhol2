'use client'

import { MapPin, CheckCircle2, Mail } from 'lucide-react'

const AREAS = [
  'Supplier Discovery',
  'Market Insights',
  'Product Availability',
  'Weekly Market Updates',
  'Buyer & Supplier Connections',
  'Market Intelligence',
]

export function ExpertProfile() {
  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">

      <div className="p-8 sm:p-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* ── Left: Photo + quick actions ── */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            {/* Avatar */}
            <div className="relative">
              <div className="w-36 h-36 rounded-2xl overflow-hidden ring-4 ring-[#022B96]/10 shadow-xl">
                <img
                  src="/hassan.png"
                  alt="Hassan Abdulkadir"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              {/* Online badge */}
              <span className="absolute -bottom-1.5 -right-1.5 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Available
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-col gap-2 w-full min-w-[148px]">
              <a
                id="expert-contact-btn"
                href="https://wa.me/31684033593?text=Hello%20Hassan%2C%20I%20found%20you%20on%20Bokhol%20and%20would%20like%20to%20discuss%20the%20seafood%20market."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bc5a] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                {/* WhatsApp icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contact Hassan
              </a>

              <a
                id="expert-email-btn"
                href="mailto:h.bokhol@outlook.com"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-foreground border border-border text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98]"
              >
                <Mail className="h-3.5 w-3.5 text-[#022B96] shrink-0" />
                Send Email
              </a>
            </div>
          </div>

          {/* ── Right: Info ── */}
          <div className="flex-1 min-w-0">
            {/* Name + role */}
            <div className="mb-5">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  Hassan Abdulkadir
                </h2>
                {/* Verified badge */}
                <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-[#022B96] dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Expert
                </span>
              </div>

              <p className="text-sm font-semibold text-muted-foreground">
                Market Research Specialist
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>Netherlands · Belgium · Germany</span>
                </div>
                <a
                  href="mailto:h.bokhol@outlook.com"
                  className="flex items-center gap-1.5 text-foreground/80 hover:text-[#022B96] transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-[#022B96]" />
                  <span>h.bokhol@outlook.com</span>
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border mb-5" />

            {/* Bio */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xl">
              Helping EU seafood buyers discover suppliers, compare market
              opportunities, and stay informed about seafood market developments.
              Helping businesses understand the market before they place their next order.
            </p>

            {/* Areas of Support */}
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Areas of Support
            </p>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-muted border border-border px-3 py-1.5 rounded-lg"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {area}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

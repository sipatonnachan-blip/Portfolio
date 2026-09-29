import { useState } from 'react'
import Icon from '../components/Icon'
import { CONTACT_OPTIONS, PROFILE } from '../data/contact'
import LocationMap from '../components/LocationMap'

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PROFILE.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full space-y-8 py-4 sm:py-6">
      {/* Header */}
      <div className="max-w-2xl motion-safe:animate-rise">
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-mid sm:text-base">
          Fastest by email. Everything else below works too.
        </p>
      </div>

      {/* Map on the left, ways to reach me on the right */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="motion-safe:animate-rise" style={{ animationDelay: '100ms' }}>
          <LocationMap />
        </div>

        <div className="space-y-4">
          {/* Primary email */}
          <section
            className="rounded-2xl border border-border bg-bg-card p-5 shadow-sm motion-safe:animate-rise sm:p-6"
            style={{ animationDelay: '180ms' }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                <Icon name="mail-outline" className="text-base" />
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand">
                Primary Email Channel
              </span>
            </div>
            <a
              href={`mailto:${PROFILE.email}`}
              className="mt-4 block break-all font-mono text-base font-bold text-text transition-colors hover:text-brand sm:text-lg"
            >
              {PROFILE.email}
            </a>
            <button
              onClick={handleCopyEmail}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-sans text-xs font-semibold text-bg-card shadow-md transition-all hover:opacity-90 active:scale-95"
            >
              <Icon name={copied ? 'checkmark-outline' : 'copy-outline'} className="text-sm" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Email'}</span>
            </button>
          </section>

          {/* Direct channels */}
          <section
            className="rounded-2xl border border-border bg-bg-card p-2 shadow-sm motion-safe:animate-rise"
            style={{ animationDelay: '260ms' }}
          >
            <h2 className="px-3 pb-1 pt-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-text-light">
              Direct Communication Channels
            </h2>
            <ul className="divide-y divide-border">
              {CONTACT_OPTIONS.map((option) => (
                <li key={option.label}>
                  <a
                    href={option.href}
                    target={option.external ? '_blank' : undefined}
                    rel={option.external ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors hover:bg-bg-alt"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <Icon name={option.icon} className="text-base" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-text-light">
                        {option.label}
                      </span>
                      <span className="block truncate text-sm font-semibold text-text">{option.value}</span>
                    </span>
                    <span className="text-xs text-text-light transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-text">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

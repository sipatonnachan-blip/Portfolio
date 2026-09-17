import { useState } from 'react'
import Icon from '../components/Icon'
import { CONTACT_OPTIONS, PROFILE } from '../data/contact'

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PROFILE.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full space-y-12 py-4 sm:py-8">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-alt px-3 py-1 font-mono text-xs text-text-light">
          <span>📬</span>
          <span>Reach Out</span>
        </div>
        <h1 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-mid">
          Have a web project in mind, an opportunity, or want to collaborate on full-stack development? Feel free to reach out directly.
        </p>
      </div>

      {/* Copy Email Quick Box */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-border bg-bg-card p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <span className="font-mono text-xs font-semibold text-text-light uppercase tracking-wider">
            Primary Email Channel
          </span>
          <p className="mt-1 font-mono text-base font-bold text-text sm:text-lg">
            {PROFILE.email}
          </p>
        </div>

        <button
          onClick={handleCopyEmail}
          className="inline-flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 font-mono text-xs font-semibold text-secondary transition-all hover:opacity-90 active:scale-95"
        >
          <Icon name={copied ? 'checkmark-outline' : 'copy-outline'} className="text-sm" />
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Email'}</span>
        </button>
      </div>

      {/* Direct Channels Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-text" />
          <h2 className="font-sans text-xl font-bold text-text sm:text-2xl">
            Direct Communication Channels
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CONTACT_OPTIONS.map((option) => (
            <a
              key={option.label}
              href={option.href}
              target={option.external ? '_blank' : undefined}
              rel={option.external ? 'noopener noreferrer' : undefined}
              className="group flex items-center justify-between rounded-2xl border border-border bg-bg-card p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-text-mid/70 hover:shadow-xl"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-bg-alt text-lg text-text transition-colors group-hover:border-text-mid group-hover:bg-text group-hover:text-secondary">
                  <Icon name={option.icon} />
                </div>
                <div>
                  <h3 className="font-mono text-[11px] font-bold text-text-light uppercase tracking-wider">
                    {option.label}
                  </h3>
                  <p className="font-mono text-sm font-semibold text-text group-hover:text-primary transition-colors truncate max-w-[220px]">
                    {option.value}
                  </p>
                </div>
              </div>

              <span className="font-mono text-xs text-text-light/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-text">
                ↗
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

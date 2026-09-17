import Icon from '../components/Icon'
import { ABOUT_PARAGRAPHS, SERVICES } from '../data/about'

const FAST_FACTS = [
  { label: 'Current Role', value: "Full-Stack Developer @ DSG Son's Group, Inc." },
  { label: 'Location', value: 'Davao City, Philippines' },
  { label: 'Experience', value: '2+ Years Building & Shipping Production Web Apps' },
  { label: 'Core Specialty', value: 'Laravel & PHP Backends • React & Tailwind Frontends' },
  { label: 'Deployment', value: 'Nginx, Linux Server Administration, Render & Cloud' },
]

export default function About() {
  return (
    <div className="w-full space-y-16 py-4 sm:py-8">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-alt px-3 py-1 font-mono text-xs text-text-light">
          <span>👨‍💻</span>
          <span>Background &amp; Philosophy</span>
        </div>
        <h1 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
          About Christian Delapos
        </h1>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-text-mid">
          {ABOUT_PARAGRAPHS.map((paragraph, i) => (
            <p key={i} className={i === 0 ? 'text-text font-medium' : 'text-text-mid'}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* What I Build Best */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-text" />
          <h2 className="font-sans text-xl font-bold text-text sm:text-2xl">
            Development Focus &amp; Services
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="group rounded-3xl border border-border bg-bg-card p-6 transition-all duration-300 hover:border-text-mid/70 hover:shadow-xl"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-bg-alt text-lg text-text transition-colors group-hover:border-text-mid group-hover:bg-text group-hover:text-secondary">
                  <Icon name={service.icon} />
                </div>
                <h3 className="font-sans text-base font-bold text-text transition-colors group-hover:text-primary">
                  {service.title}
                </h3>
              </div>
              <p className="mt-3.5 text-xs leading-relaxed text-text-mid sm:text-sm">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Profile Fast Facts */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-text" />
          <h2 className="font-sans text-xl font-bold text-text sm:text-2xl">
            Quick Facts &amp; Overview
          </h2>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-bg-card">
          <div className="divide-y divide-border/60">
            {FAST_FACTS.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col gap-1 px-6 py-4 transition-colors hover:bg-bg-alt/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-mono text-xs font-semibold text-text-light uppercase tracking-wider">
                  {fact.label}
                </span>
                <span className="font-sans text-sm font-medium text-text sm:text-right">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

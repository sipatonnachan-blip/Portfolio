import Icon from '../components/Icon'
import { ABOUT_PARAGRAPHS, SERVICES } from '../data/about'
import { PROFILE } from '../data/contact'

// Specialty and deployment facts live on the Tech Stack page; repeating them
// here just made the list longer without saying anything new.
const FAST_FACTS = [
  { icon: 'briefcase-outline', label: 'Current Role', value: "Full-Stack Developer @ DSG Son's Group, Inc." },
  { icon: 'sparkles-outline', label: 'Focus', value: 'Full-Stack Development · AI Engineering' },
  { icon: 'location-outline', label: 'Location', value: PROFILE.location },
  { icon: 'time-outline', label: 'Experience', value: '2+ Years Building & Deploying Production Web Apps' },
]

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-2 w-2 rounded-full bg-brand" />
      <h2 className="font-sans text-lg font-bold tracking-tight text-text sm:text-xl">{children}</h2>
    </div>
  )
}

export default function About() {
  return (
    <div className="w-full space-y-10 py-4 sm:py-6">
      {/* Intro + quick facts side by side */}
      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="motion-safe:animate-rise">
         
          <h1 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            About {PROFILE.name}
          </h1>
          <div className="mt-4 max-w-2xl space-y-3 text-sm leading-relaxed text-text-mid sm:text-base">
            {ABOUT_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <aside
          className="rounded-2xl border border-border bg-bg-card p-5 shadow-sm motion-safe:animate-rise"
          style={{ animationDelay: '100ms' }}
        >
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand">
            Quick Facts
          </h2>
          <dl className="mt-3 divide-y divide-border">
            {FAST_FACTS.map((fact) => (
              <div key={fact.label} className="flex items-start gap-3 py-3 first:pt-1 last:pb-0">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon name={fact.icon} className="text-sm" />
                </span>
                <div className="min-w-0">
                  <dt className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-light">
                    {fact.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium leading-snug text-text">{fact.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      {/* Services */}
      <section className="space-y-4">
        <SectionHeading>Development Focus &amp; Services</SectionHeading>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SERVICES.map((service, idx) => (
            <article
              key={service.title}
              className="group flex flex-col rounded-2xl border border-border bg-bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-text-light hover:shadow-md motion-safe:animate-rise"
              style={{ animationDelay: `${180 + idx * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                  <Icon name={service.icon} className="text-lg" />
                </span>
                <span className="font-mono text-xs text-text-light">{String(idx + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-4 font-sans text-base font-bold text-text">{service.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-text-mid">{service.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

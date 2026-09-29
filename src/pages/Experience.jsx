import { EXPERIENCE, EDUCATION } from '../data/experience'
import Icon from '../components/Icon'

// Summary strip above the roles. Static here rather than clickable as it was
// on Home: one of these used to link to this very page.
const METRICS = [
  { value: '6+', label: 'Production Projects', icon: 'folder-outline' },
  { value: '1+ Yrs', label: 'Experience', icon: 'time-outline' },
  { value: '5+', label: 'Core Stacks', icon: 'code-slash-outline' },
  { value: '99%', label: 'Reliability & Dedication', icon: 'shield-checkmark-outline' },
]

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-2 w-2 rounded-full bg-brand" />
      <h2 className="font-sans text-lg font-bold tracking-tight text-text sm:text-xl">{children}</h2>
    </div>
  )
}

export default function Experience() {
  return (
    <div className="w-full space-y-10 py-4 sm:py-6">
      {/* Header */}
      <div className="max-w-2xl motion-safe:animate-rise">
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Work Experience &amp; Roles
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-mid sm:text-base">
          Professional positions, system development milestones, and academic background.
        </p>
      </div>

      {/* At a glance */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {METRICS.map((item, idx) => (
          <div
            key={item.label}
            className="flex items-center gap-3.5 rounded-2xl border border-border bg-bg-card p-4 shadow-sm motion-safe:animate-rise"
            style={{ animationDelay: `${80 + idx * 60}ms` }}
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
              <Icon name={item.icon} className="text-base" />
            </span>
            <div className="min-w-0">
              <span className="block font-mono text-xl font-bold leading-tight tracking-tight text-text">
                {item.value}
              </span>
              <span className="block truncate text-[11px] font-medium text-text-light">{item.label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Roles timeline + education side by side */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <SectionHeading>Professional Roles</SectionHeading>

          <ol className="relative space-y-4 border-l border-border pl-6 sm:pl-8">
            {EXPERIENCE.map((item, idx) => (
              <li
                key={item.title}
                className="relative motion-safe:animate-rise"
                style={{ animationDelay: `${300 + idx * 90}ms` }}
              >
                {/* Timeline dot */}
                <span className="absolute -left-[31px] top-6 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-bg bg-brand sm:-left-[39px]" />

                <article className="rounded-2xl border border-border bg-bg-card p-5 shadow-sm transition-all duration-200 hover:border-text-light hover:shadow-md sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-sans text-base font-bold text-text sm:text-lg">{item.title}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-text-mid">
                        <Icon name="business-outline" className="flex-shrink-0 text-sm text-brand" />
                        <span>{item.company}</span>
                      </div>
                    </div>
                    <span className="inline-flex flex-shrink-0 self-start rounded-full bg-brand-soft px-3 py-1 font-mono text-[11px] font-semibold text-brand">
                      {item.date}
                    </span>
                  </div>

                  {item.highlights && (
                    <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-border pt-4 xl:grid-cols-2">
                      {item.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-text-mid">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </li>
            ))}
          </ol>
        </section>

        {/* Education */}
        <section className="space-y-4 lg:sticky lg:top-8">
          <SectionHeading>Education</SectionHeading>

          <article
            className="rounded-2xl border border-border bg-bg-card p-5 shadow-sm motion-safe:animate-rise sm:p-6"
            style={{ animationDelay: '360ms' }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
              <Icon name="school-outline" className="text-lg" />
            </span>
            <h3 className="mt-4 font-sans text-base font-bold text-text sm:text-lg">{EDUCATION.title}</h3>
            <p className="mt-1 text-xs text-text-mid">{EDUCATION.company}</p>
            <span className="mt-3 inline-flex rounded-full bg-brand-soft px-3 py-1 font-mono text-[11px] font-semibold text-brand">
              {EDUCATION.date}
            </span>
            <p className="mt-4 border-t border-border pt-4 text-[13px] leading-relaxed text-text-mid">
              {EDUCATION.description}
            </p>
          </article>
        </section>
      </div>
    </div>
  )
}

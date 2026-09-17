import { EXPERIENCE, EDUCATION } from '../data/experience'
import Icon from '../components/Icon'

export default function Experience() {
  return (
    <div className="w-full space-y-16 py-4 sm:py-8">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-alt px-3 py-1 font-mono text-xs text-text-light">
          <span>💼</span>
          <span>Career &amp; Credentials</span>
        </div>
        <h1 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
          Work Experience &amp; Roles
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-mid">
          Professional positions, system development milestones, and academic background.
        </p>
      </div>

      {/* Career Roles */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-text" />
          <h2 className="font-sans text-xl font-bold text-text sm:text-2xl">
            Professional Roles
          </h2>
        </div>

        <div className="space-y-6">
          {EXPERIENCE.map((item) => (
            <div
              key={item.title}
              className="group rounded-3xl border border-border bg-bg-card p-6 sm:p-8 transition-all duration-300 hover:border-text-mid/70 hover:shadow-xl"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-sans text-lg font-bold text-text transition-colors group-hover:text-primary sm:text-xl">
                    {item.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 font-mono text-xs text-text-mid">
                    <Icon name="business-outline" className="text-sm" />
                    <span>{item.company}</span>
                  </div>
                </div>

                <span className="inline-flex self-start rounded-full border border-border bg-bg-alt px-3 py-1 font-mono text-xs font-semibold text-text sm:self-auto">
                  {item.date}
                </span>
              </div>

              {item.highlights && (
                <ul className="mt-6 space-y-2.5 border-t border-border/60 pt-5">
                  {item.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-text-mid sm:text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-text-light/60" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-text" />
          <h2 className="font-sans text-xl font-bold text-text sm:text-2xl">
            Education
          </h2>
        </div>

        <div className="group rounded-3xl border border-border bg-bg-card p-6 sm:p-8 transition-all duration-300 hover:border-text-mid/70 hover:shadow-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-sans text-lg font-bold text-text transition-colors group-hover:text-primary sm:text-xl">
                {EDUCATION.title}
              </h3>
              <div className="mt-1 flex items-center gap-2 font-mono text-xs text-text-mid">
                <Icon name="school-outline" className="text-sm" />
                <span>{EDUCATION.company}</span>
              </div>
            </div>

            <span className="inline-flex self-start rounded-full border border-border bg-bg-alt px-3 py-1 font-mono text-xs font-semibold text-text sm:self-auto">
              {EDUCATION.date}
            </span>
          </div>

          <p className="mt-5 border-t border-border/60 pt-5 text-xs leading-relaxed text-text-mid sm:text-sm">
            {EDUCATION.description}
          </p>
        </div>
      </section>
    </div>
  )
}

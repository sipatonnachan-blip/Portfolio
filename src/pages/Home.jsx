import { Mascot } from 'page-mascot'
import { PROFILE, SOCIALS } from '../data/contact'
import { TECH_STACK_CATEGORIES } from '../data/techStack'
import Icon from '../components/Icon'
import ProjectShowcaseDeck from '../components/ProjectShowcaseDeck'

export default function Home({ onNavigate, onOpenSecurityDemo }) {
  return (
    <div className="space-y-20 py-4 sm:py-8">
      {/* ── 1. Hero Section with Interactive Mascot Pedestal ── */}
      <section className="relative flex flex-col-reverse items-center justify-between gap-10 lg:flex-row lg:items-center">
        {/* Left: Bio & Actions */}
        <div className="flex-1 text-center lg:text-left">
          {/* Availability Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Available for Full-Stack Roles &amp; Projects</span>
          </div>

          <h1 className="mt-5 font-sans text-3xl font-extrabold tracking-tight text-text sm:text-4xl lg:text-5xl">
            Hi, I'm{' '}
            <span className="bg-gradient-to-r from-text via-text-mid to-text-light bg-clip-text text-transparent">
              {PROFILE.name}
            </span>
            .
          </h1>

          <p className="mt-4 text-base leading-relaxed text-text-mid sm:text-lg">
            A full-stack web developer crafting robust backend architectures with{' '}
            <span className="font-semibold text-text">Laravel</span> &amp;{' '}
            <span className="font-semibold text-text">Node.js</span>, and fluid, responsive frontends with{' '}
            <span className="font-semibold text-text">React</span> &amp;{' '}
            <span className="font-semibold text-text">Tailwind CSS</span>.
          </p>

          {/* Action Row with Clean & Visible Red Slashing Hover Animation */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start">
            <button
              onClick={() => onNavigate('projects')}
              className="btn-katana-primary group inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 font-mono text-xs font-bold active:scale-[0.98]"
            >
              <span className="relative z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                Explore Selected Work
              </span>
              <span className="relative z-10 text-white transition-transform duration-300 group-hover:translate-y-1">
                ↓
              </span>
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className="btn-katana-secondary group inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-6 py-3.5 font-mono text-xs font-semibold text-text active:scale-[0.98]"
            >
              <span className="relative z-10 font-bold transition-colors duration-200">
                Get in Touch
              </span>
              <span className="relative z-10 font-bold transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </button>

            <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

            {/* Quick Socials */}
            <div className="flex items-center gap-1.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.name}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-card text-text transition-all duration-200 hover:scale-110 hover:border-text-mid hover:text-primary"
                >
                  <Icon name={s.icon} className="text-base" />
                </a>
              ))}
            </div>
          </div>          
        </div>

        {/* Right: Interactive Real Photo Mascot Pedestal */}
        <div className="flex flex-shrink-0 flex-col items-center">
          <div className="group relative flex h-[280px] w-[260px] items-center justify-center rounded-3xl border border-border bg-gradient-to-b from-bg-card to-bg-alt/70 p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-text-mid/60 hover:shadow-2xl sm:h-[320px] sm:w-[290px]">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/10 via-transparent to-indigo-500/10 opacity-50 blur-xl transition-opacity duration-300 group-hover:opacity-80" />

            <div className="relative z-10 flex flex-col items-center">
              <Mascot
                directions="/mascots/christian-directions.webp"
                reactions="/mascots/christian-reactions.webp"
                size={230}
                label={PROFILE.name}
              />
            </div>
          </div>

          {/* Interactive micro-badge */}
        </div>
      </section>

      {/* ── 3. Featured Work Deck ── */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider text-text-light uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-text" />
              <span>Featured Systems</span>
            </div>
            <h2 className="mt-1 font-sans text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Production Work &amp; Case Studies
            </h2>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="group flex items-center gap-1 font-mono text-xs font-semibold text-text transition-colors hover:underline"
          >
            <span>View All Projects</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        <ProjectShowcaseDeck onNavigate={onNavigate} />
      </section>

      {/* ── 4. Tech Stack Sneak Peek ── */}
      <section className="rounded-3xl border border-border bg-bg-card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-xs font-semibold tracking-wider text-text-light uppercase">
              Core Technologies
            </span>
            <h2 className="mt-1 font-sans text-2xl font-bold tracking-tight text-text">
              Tools &amp; Frameworks I Build With
            </h2>
          </div>
          <button
            onClick={() => onNavigate('tech stack')}
            className="group flex items-center gap-1 font-mono text-xs font-semibold text-text transition-colors hover:underline"
          >
            <span>Explore Full Stack</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_STACK_CATEGORIES.map((cat) => (
            <div
              key={cat.category}
              className="rounded-2xl border border-border/80 bg-bg-alt/50 p-4"
            >
              <h4 className="font-mono text-[11px] font-bold tracking-wider text-text-light uppercase">
                {cat.category}
              </h4>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cat.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-border bg-bg-card px-2 py-0.5 font-mono text-[11px] text-text"
                  >
                    {skill}
                  </span>
                ))}
                {cat.skills.length > 4 && (
                  <span className="rounded-md border border-border/60 bg-bg-card/50 px-1.5 py-0.5 font-mono text-[10px] text-text-light">
                    +{cat.skills.length - 4}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Direct Connect Banner ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-bg-card via-bg-alt/60 to-bg-card p-8 sm:p-12 text-center">
        <div className="mx-auto max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-alt px-3 py-1 font-mono text-[11px] text-text-mid">
            <span>🤝</span>
            <span>Let's collaborate</span>
          </span>
          <h2 className="mt-4 font-sans text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Interested in building together?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-mid">
            I'm always open to discussing new web development opportunities, full-stack projects, and software solutions.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${PROFILE.email}`}
              className="inline-flex items-center gap-2 rounded-xl bg-text px-5 py-3 font-mono text-xs font-semibold text-secondary shadow-md transition-all hover:opacity-90"
            >
              <span>{PROFILE.email}</span>
              <span>↗</span>
            </a>
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-5 py-3 font-mono text-xs font-semibold text-text transition-colors hover:border-text-mid"
            >
              <span>View All Contact Channels</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

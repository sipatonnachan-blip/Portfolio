import { Mascot } from 'page-mascot'
import { PROFILE, SOCIALS } from '../data/contact'
import { FEATURED_PROJECTS } from '../data/projects'
import { TECH_STACK_CATEGORIES } from '../data/techStack'
import Icon from '../components/Icon'

const METRICS = [
  {
    value: '15+',
    label: 'Production Projects',
    subtext: 'Web apps & enterprise systems',
    icon: 'folder-outline',
    target: 'projects',
  },
  {
    value: '2+ Yrs',
    label: 'Shipping Experience',
    subtext: 'Production web development',
    icon: 'time-outline',
    target: 'experience',
  },
  {
    value: '5+',
    label: 'Core Stacks',
    subtext: 'Laravel, React, Node, MySQL, Cloud',
    icon: 'code-slash-outline',
    target: 'tech stack',
  },
  {
    value: '100%',
    label: 'Reliability & Dedication',
    subtext: 'Clean architecture & tested code',
    icon: 'shield-checkmark-outline',
    target: 'contact',
  },
]

export default function Home({ onNavigate }) {
  const flagship = FEATURED_PROJECTS[0]
  const secondaryProjects = FEATURED_PROJECTS.slice(1, 3)

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

          <p className="mt-2 text-sm leading-relaxed text-text-light">
            I love turning complex data problems into clean, reliable applications that people actually enjoy using.
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

      {/* ── 2. Bento Metrics Grid ── */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((item) => (
            <div
              key={item.label}
              onClick={() => onNavigate(item.target)}
              className="group cursor-pointer rounded-2xl border border-border bg-bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-text-mid/70 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-alt text-text transition-colors group-hover:border-text-mid group-hover:bg-text group-hover:text-secondary">
                  <Icon name={item.icon} className="text-base" />
                </div>
                <span className="font-mono text-xs text-text-light/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-text">
                  ↗
                </span>
              </div>
              <div className="mt-4">
                <span className="font-mono text-2xl font-bold tracking-tight text-text transition-colors group-hover:text-primary">
                  {item.value}
                </span>
                <h3 className="font-sans text-xs font-semibold text-text mt-0.5">
                  {item.label}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-text-light">
                  {item.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Featured Work Spotlight (Replaces Fanned Deck) ── */}
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

        {/* Bento Showcase: Hero Flagship + Dual Cards */}
        <div className="space-y-6">
          {/* Flagship Card */}
          {flagship && (
            <div className="group overflow-hidden rounded-3xl border border-border bg-bg-card transition-all duration-300 hover:border-text-mid/70 hover:shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Visual Thumbnail Preview */}
                <div className="relative min-h-[260px] overflow-hidden border-b border-border bg-bg-alt lg:col-span-7 lg:border-b-0 lg:border-r">
                  <img
                    src={flagship.image}
                    alt={flagship.title}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                {/* Content & Details */}
                <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-border bg-bg-alt px-2.5 py-0.5 font-mono text-[10px] font-semibold text-text">
                        FLAGSHIP
                      </span>
                      <span className="font-mono text-[11px] text-text-light">
                        Personal Finance App
                      </span>
                    </div>

                    <h3 className="mt-3 font-sans text-xl font-bold text-text transition-colors group-hover:text-primary sm:text-2xl">
                      {flagship.title}
                    </h3>

                    <p className="mt-3 text-xs leading-relaxed text-text-mid sm:text-sm">
                      {flagship.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[11px]">
                      {flagship.tech.split('•').map((t) => (
                        <span
                          key={t}
                          className="rounded-lg border border-border bg-bg-alt px-2.5 py-1 text-text-mid"
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/60">
                    {flagship.link && (
                      <a
                        href={flagship.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-text px-4 py-2 font-mono text-xs font-semibold text-secondary transition-all hover:opacity-90"
                      >
                        <span>Live Demo</span>
                        <span>↗</span>
                      </a>
                    )}
                    <button
                      onClick={() => onNavigate('projects')}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-alt px-4 py-2 font-mono text-xs font-medium text-text transition-colors hover:border-text-mid"
                    >
                      <span>Case Details</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Dual Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {secondaryProjects.map((project) => (
              <div
                key={project.title}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-text-mid/70 hover:shadow-xl"
              >
                <div>
                  <div className="relative h-[200px] w-full overflow-hidden border-b border-border bg-bg-alt">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 sm:p-6">
                    <span className="font-mono text-[10px] text-text-light uppercase tracking-wider">
                      PRODUCTION APPLICATION
                    </span>
                    <h3 className="mt-1 font-sans text-lg font-bold text-text transition-colors group-hover:text-primary">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-text-mid">
                      {project.description}
                    </p>
                    <p className="mt-3 font-mono text-[11px] text-text-light truncate">
                      {project.tech}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 px-6 py-3 font-mono text-xs">
                  <span className="text-text-light">Laravel &amp; React</span>
                  <button
                    onClick={() => onNavigate('projects')}
                    className="inline-flex items-center gap-1 font-semibold text-text hover:underline"
                  >
                    <span>View Project</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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

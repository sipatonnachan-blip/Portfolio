import { Mascot } from 'page-mascot'
import { PROFILE, GITHUB_URL } from '../data/contact'
import { TECH_LOGOS, LOGO_SKILLS } from '../data/techLogos'
import { FEATURED_PROJECTS, ALL_PROJECTS, GITHUB_REPOS } from '../data/projects'
import { ABOUT_PARAGRAPHS, SERVICES } from '../data/about'
import { EXPERIENCE, EDUCATION } from '../data/experience'
import Icon from '../components/Icon'

const TOOLS = LOGO_SKILLS

const half = Math.ceil(GITHUB_REPOS.length / 2)
const BUILD_ROWS = [GITHUB_REPOS.slice(0, half), GITHUB_REPOS.slice(half)]

// `aside` sits in its own column beside the header (sm+), so wide cards never
// overlap their description; `children` flow below the header.
function BentoCard({ icon, title, description, onClick, className = '', delay = 0, aside, footer, children }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{ animationDelay: `${delay}ms` }}
      aria-label={`${title} — ${description}`}
      className={`group relative flex min-w-0 cursor-pointer motion-safe:animate-rise overflow-hidden rounded-2xl border border-border bg-bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-text-light hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${className}`}
    >
      <div className={`flex min-w-0 flex-1 gap-4 ${aside ? 'flex-col sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]' : 'flex-col'}`}>
        <div className={`flex min-w-0 flex-col ${aside ? '' : 'flex-1'}`}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
          <Icon name={icon} className="text-sm" />
        </span>
        <h3 className="font-sans text-[15px] font-semibold tracking-tight text-text">{title}</h3>
        <span className="ml-auto text-xs text-text-light opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
          ↗
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-text-light">{description}</p>
          {children}
          {footer && <div className="mt-auto hidden pt-4 sm:block">{footer}</div>}
        </div>
        {aside && <div className="flex min-w-0 flex-col">{aside}</div>}
      </div>
    </article>
  )
}

export default function Home({ onNavigate }) {
  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-5 lg:min-h-[calc(100vh-4rem)]">
      {/* ── 1. Headline ── */}
      <header className="motion-safe:animate-rise flex flex-col-reverse items-start justify-between gap-4 sm:flex-row">
        <div className="min-w-0">
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-ink sm:text-5xl xl:text-6xl">
            Hi, I&apos;m {PROFILE.name}.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-mid sm:text-[15px]">
            A full-stack web developer crafting robust backend architectures with{' '}
            <span className="font-semibold text-text">Laravel</span> &amp;{' '}
            <span className="font-semibold text-text">Node.js</span>, and fluid, responsive frontends with{' '}
            <span className="font-semibold text-text">React</span> &amp;{' '}
            <span className="font-semibold text-text">Tailwind CSS</span>.
          </p>
        </div>

        <button
          onClick={() => onNavigate('contact')}
          className="inline-flex flex-shrink-0 items-center gap-2 self-end rounded-full bg-ink px-4 py-2 font-sans text-xs font-semibold text-bg-card shadow-md transition-all duration-200 hover:scale-[1.03] hover:opacity-90 active:scale-[0.98] sm:self-start"
        >
          <span>Get in touch</span>
          <span>↗</span>
        </button>
      </header>

      {/* ── 2. Tools strip ── */}
      <section className="rounded-2xl bg-gradient-to-r from-bg-card to-glow p-1.5 shadow-sm motion-safe:animate-rise" style={{ animationDelay: '100ms' }}>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg-card p-3 sm:flex-row sm:items-center">
          <button
            onClick={() => onNavigate('tech stack')}
            className="flex-shrink-0 px-2 text-left sm:border-r sm:border-border sm:pr-5"
          >
            <span className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">
              Core Technologies
            </span>
            <span className="block text-sm font-semibold text-text">Tools I work with</span>
          </button>

          <div className="marquee marquee-mask min-w-0 flex-1 overflow-hidden rounded-xl border border-border py-2.5">
            <ul className="marquee-track">
              {[...TOOLS, ...TOOLS].map((tool, idx) => {
                const [Logo, color] = TECH_LOGOS[tool]
                return (
                  <li
                    key={`${tool}-${idx}`}
                    aria-hidden={idx >= TOOLS.length}
                    className="flex flex-shrink-0 items-center gap-2 px-5 text-xs font-medium text-text"
                  >
                    <Logo className="text-base" style={color ? { color } : undefined} aria-hidden="true" />
                    <span>{tool}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3. Bento grid ── */}
      <section style={{ animationDelay: '180ms' }} className="motion-safe:animate-rise flex flex-1 rounded-[28px] bg-gradient-to-br from-bg-card via-bg-card to-glow p-2.5 shadow-md sm:p-3.5">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {/* Projects */}
          <BentoCard
            delay={260}
            icon="folder-outline"
            title="Projects"
            description="Production apps I've designed, built and deployed end to end."
            onClick={() => onNavigate('projects')}
            className="min-h-[260px] sm:col-span-2"
            footer={
              <span className="text-[11px] font-medium text-text-light transition-colors group-hover:text-text">
                {FEATURED_PROJECTS.length} featured · {ALL_PROJECTS.length} more →
              </span>
            }
            aside={
              <div className="grid flex-1 grid-rows-2 gap-2">
                {FEATURED_PROJECTS.slice(0, 2).map((project) => (
                  <div
                    key={project.title}
                    className="relative min-h-[100px] overflow-hidden rounded-xl border border-border bg-bg-alt shadow-sm"
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
                      {project.title}
                    </span>
                  </div>
                ))}
              </div>
            }
          />

          {/* About */}
          <BentoCard
            delay={340}
            icon="person-outline"
            title="About"
            description={ABOUT_PARAGRAPHS[0]}
            onClick={() => onNavigate('about')}
            className="min-h-[260px] [&_p]:line-clamp-2"
          >
            <div className="flex flex-1 items-center justify-center pt-4">
              <div className="relative h-36 w-32">
                <img
                  src={PROFILE.avatarNight}
                  alt=""
                  className="absolute inset-0 h-full w-full -translate-x-5 -rotate-[14deg] rounded-xl border-4 border-bg-card object-cover shadow-md"
                />
                <img
                  src={PROFILE.avatarHover}
                  alt=""
                  className="absolute inset-0 h-full w-full -translate-x-2.5 -rotate-[7deg] rounded-xl border-4 border-bg-card object-cover shadow-md"
                />
                {/* Poking the mascot should not navigate away */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl border-4 border-bg-card bg-bg-alt shadow-lg transition-transform duration-300 group-hover:rotate-2"
                >
                  <Mascot
                    directions="/mascots/christian-directions.webp"
                    reactions="/mascots/christian-reactions.webp"
                    size={120}
                    label={PROFILE.name}
                  />
                </div>
              </div>
            </div>
          </BentoCard>

          {/* More builds */}
          <BentoCard
            delay={420}
            icon="rocket-outline"
            title="More Builds"
            description={`${GITHUB_REPOS.length} public repos on GitHub — finance, scheduling, evaluation tools and more.`}
            onClick={() => window.open(GITHUB_URL, '_blank', 'noopener,noreferrer')}
            className="min-h-[260px]"
          >
            <div className="-mx-4 flex flex-1 flex-col justify-center gap-2 pt-4">
              {BUILD_ROWS.map((row, rowIdx) => (
                <div key={rowIdx} className="marquee marquee-mask overflow-hidden">
                  <ul className={`marquee-track ${rowIdx === 1 ? 'reverse' : ''}`}>
                    {[...row, ...row].map((repo, idx) => {
                      const isCopy = idx >= row.length
                      return (
                        <li key={`${repo.repo}-${idx}`} aria-hidden={isCopy} className="mx-1 flex-shrink-0">
                          <a
                            href={repo.homepage ?? `https://github.com/Xtian-Xtian/${repo.repo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={isCopy ? -1 : undefined}
                            title={repo.homepage ? `${repo.title} — live site` : `${repo.title} on GitHub`}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-bg-card px-2.5 py-1 text-[10px] font-medium text-text shadow-sm transition-colors hover:border-text-light"
                          >
                            <Icon name={repo.homepage ? 'globe-outline' : 'logo-github'} className="text-[11px] text-brand" />
                            <span>{repo.title}</span>
                            {repo.language && <span className="text-text-light">· {repo.language}</span>}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Education */}
          <BentoCard
            delay={500}
            icon="school-outline"
            title="Education"
            description={`${EDUCATION.company} · ${EDUCATION.date}`}
            onClick={() => onNavigate('experience')}
            className="min-h-[260px]"
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-3 pt-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-bg-alt bg-bg-card shadow-lg ring-1 ring-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-alt">
                  <Icon name="ribbon-outline" className="text-3xl text-text-mid" />
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[10px] font-semibold text-bg-card shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {EDUCATION.title}
              </span>
            </div>
          </BentoCard>

          {/* Services */}
          <BentoCard
            delay={580}
            icon="layers-outline"
            title="Services"
            description="What I offer, from schema to production server."
            onClick={() => onNavigate('about')}
            className="min-h-[260px]"
          >
            <ul className="mt-3 divide-y divide-border">
              {SERVICES.map((service, idx) => (
                <li key={service.title} className="flex items-center gap-2.5 py-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
                    <Icon name={service.icon} className="text-[11px]" />
                  </span>
                  <span className="truncate text-[11px] font-medium text-text">{service.title}</span>
                  <span className="ml-auto font-mono text-[10px] text-text-light">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </li>
              ))}
            </ul>
          </BentoCard>

          {/* Experience */}
          <BentoCard
            delay={660}
            icon="briefcase-outline"
            title="Experience"
            description="Where I've built, deployed and supported real systems."
            onClick={() => onNavigate('experience')}
            className="min-h-[260px] sm:col-span-2"
            aside={
              <ul className="flex flex-1 flex-col justify-between gap-2">
                {EXPERIENCE.map((job) => (
                  <li
                    key={`${job.company}-${job.title}`}
                    className="rounded-xl border border-border bg-bg-card px-3 py-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="business-outline" className="flex-shrink-0 text-xs text-brand" />
                      <span className="truncate text-[11px] font-semibold text-text">{job.company}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-text-light">{job.title}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-brand">{job.date}</p>
                  </li>
                ))}
              </ul>
            }
          />
        </div>
      </section>
    </div>
  )
}

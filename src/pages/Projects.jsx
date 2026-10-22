import Icon from '../components/Icon'
import { FEATURED_PROJECTS, ALL_PROJECTS } from '../data/projects'
import { full, thumb } from '../utils/images'

function SectionHeading({ children, count }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-2 w-2 rounded-full bg-brand" />
      <h2 className="font-sans text-lg font-bold tracking-tight text-text sm:text-xl">{children}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[10px] font-semibold text-brand">
          {count}
        </span>
      )}
    </div>
  )
}

function PhotoBoothHero() {
  return (
    <div className="pb-hero absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="pb-gradient absolute inset-0" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: 'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Floating photo strip decorations */}
      <div className="pb-float-slow absolute -right-4 top-8 rotate-12 opacity-60">
        <div className="flex w-16 flex-col gap-1 rounded-md bg-white p-1.5 shadow-lg">
          <div className="h-10 rounded-sm bg-gradient-to-br from-orange-300 to-rose-400" />
          <div className="h-10 rounded-sm bg-gradient-to-br from-violet-300 to-blue-400" />
          <div className="h-10 rounded-sm bg-gradient-to-br from-emerald-300 to-teal-400" />
        </div>
      </div>

      <div className="pb-float-medium absolute -left-2 bottom-12 -rotate-6 opacity-50">
        <div className="flex w-14 flex-col gap-1 rounded-md bg-white p-1 shadow-lg">
          <div className="h-8 rounded-sm bg-gradient-to-br from-sky-300 to-indigo-400" />
          <div className="h-8 rounded-sm bg-gradient-to-br from-pink-300 to-rose-400" />
        </div>
      </div>

      {/* Center camera illustration */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Pulsing ring behind camera */}
        <div className="absolute -inset-6 rounded-full motion-safe:animate-[pb-ring-pulse_3s_ease-in-out_infinite]" />
        <div className="absolute -inset-10 rounded-full motion-safe:animate-[pb-ring-pulse_3s_ease-in-out_0.6s_infinite]" />

        {/* Camera body */}
        <div className="pb-camera group/cam relative flex h-24 w-28 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/10 shadow-[0_8px_32px_rgba(249,115,22,0.25)] backdrop-blur-sm transition-transform duration-500 hover:scale-110">
          {/* Lens */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/40 bg-gradient-to-br from-gray-800 to-gray-900 shadow-inner">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 via-rose-500 to-purple-600 shadow-[0_0_20px_rgba(249,115,22,0.5)]" />
            <div className="absolute h-3 w-3 rounded-full bg-white/40 blur-[1px]" style={{ top: '30%', left: '28%' }} />
          </div>
          {/* Flash */}
          <div className="pb-flash-blink absolute -top-1 right-3 h-2.5 w-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
          {/* Viewfinder */}
          <div className="absolute -top-1.5 left-4 h-3 w-6 rounded-md border border-white/30 bg-white/10" />
        </div>

        {/* CTA badge */}
        <div className="pb-badge flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
          </span>
          <span className="font-sans text-xs font-bold text-white">Try it live</span>
        </div>
      </div>

      {/* Sparkle decorations */}
      <div className="pb-sparkle absolute left-[15%] top-[20%]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="white" fillOpacity="0.6"/></svg>
      </div>
      <div className="pb-sparkle-delay absolute bottom-[25%] right-[18%]">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="white" fillOpacity="0.4"/></svg>
      </div>
      <div className="pb-sparkle-slow absolute left-[60%] top-[15%]">
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="white" fillOpacity="0.5"/></svg>
      </div>
    </div>
  )
}

// The first featured project is the large lead card; the rest stack beside it.
function FeaturedCard({ project, lead, delay, onOpenImage, onOpenPhotoBooth }) {
  const tags = project.tech.split('•').map((t) => t.trim())
  const isInteractive = project.interactive

  const handleClick = () => {
    if (isInteractive && onOpenPhotoBooth) {
      onOpenPhotoBooth()
    } else if (project.image) {
      onOpenImage(full(project.image), project.title)
    }
  }

  return (
    <article
      className={`group flex overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 motion-safe:animate-rise ${
        isInteractive
          ? 'flex-col border-orange-500/30 bg-bg-card hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-[0_20px_60px_-12px_rgba(249,115,22,0.3)] lg:flex-row'
          : 'flex-col border-border bg-bg-card hover:-translate-y-0.5 hover:border-text-light hover:shadow-md'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={isInteractive ? `Launch ${project.title}` : `Preview ${project.title}`}
        className={`relative flex-shrink-0 overflow-hidden ${
          isInteractive
            ? 'h-[280px] w-full border-b border-border bg-transparent sm:h-[340px] lg:h-auto lg:min-h-[360px] lg:w-[55%] lg:border-b-0 lg:border-r'
            : `w-full border-b border-border bg-bg-alt ${lead ? 'h-[220px] sm:h-[300px] lg:h-auto lg:flex-1' : 'h-[170px]'}`
        }`}
      >
        {project.image ? (
          <img
            src={lead ? full(project.image) : thumb(project.image)}
            alt={project.title}
            loading={lead ? 'eager' : 'lazy'}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PhotoBoothHero />
        )}
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold text-white ${
          isInteractive ? 'bg-gradient-to-r from-orange-500 to-rose-500 shadow-sm' : 'bg-black/70'
        }`}>
          {project.badge}
        </span>
        {!isInteractive && (
          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Icon name="expand-outline" />
          </span>
        )}
      </button>

      {isInteractive ? (
        <div className="flex flex-1 flex-col justify-center p-6 lg:p-8">
          <span className="mb-3 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Interactive
          </span>

          <h3 className="font-sans text-2xl font-extrabold tracking-tight text-text sm:text-3xl">{project.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-mid sm:text-base">{project.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: 'camera-outline', text: 'Webcam Capture' },
              { icon: 'color-palette-outline', text: '8 Filters' },
              { icon: 'image-outline', text: 'Photo Templates' },
              { icon: 'download-outline', text: 'Download PNG' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-2 rounded-lg border border-border bg-bg-alt px-2.5 py-2">
                <Icon name={f.icon} className="flex-shrink-0 text-sm text-brand" />
                <span className="font-mono text-[10px] font-medium text-text-mid">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleClick}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-2.5 font-sans text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-[0_6px_20px_-4px_rgba(249,115,22,0.6)] hover:brightness-110 active:scale-95"
            >
              <Icon name="rocket-outline" className="text-base" />
              Launch App
            </button>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-md border border-border px-2 py-0.5 font-mono text-[9px] font-medium text-text-light">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-sans text-base font-bold text-text">{project.title}</h3>
            <span className="flex flex-shrink-0 items-center gap-1.5 font-mono text-[10px] font-semibold text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              PRODUCTION
            </span>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-text-mid">{project.description}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="rounded-md border border-border bg-bg-alt px-2 py-0.5 font-mono text-[10px] font-medium text-text-mid">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
            {project.link && project.link !== '#' && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 font-sans text-xs font-semibold text-bg-card shadow-sm transition-opacity hover:opacity-90"
              >
                <Icon name="globe-outline" className="text-sm" />
                <span>Live Demo</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => onOpenImage(full(project.image), project.title)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 font-sans text-xs font-semibold text-text transition-colors hover:border-text-light hover:bg-bg-alt"
            >
              <Icon name="expand-outline" className="text-sm" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

export default function Projects({ onOpenImage, onOpenPhotoBooth }) {
  return (
    <div className="w-full space-y-10 py-4 sm:py-6">
      {/* Header */}
      <div className="max-w-2xl motion-safe:animate-rise">
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Projects &amp; Web Applications
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-mid sm:text-base">
          A showcase of production web applications, system dashboards, geospatial platforms, and client case studies I&apos;ve designed and built.
        </p>
      </div>

      {/* Featured: one lead card with the others stacked beside it */}
      <section className="space-y-4">
        <SectionHeading count={FEATURED_PROJECTS.length}>Featured Applications</SectionHeading>

        <div className="flex flex-col gap-4">
          {/* Photo Booth: full-width hero card */}
          {FEATURED_PROJECTS.filter((p) => p.interactive).map((project) => (
            <FeaturedCard
              key={project.title}
              project={project}
              lead
              delay={100}
              onOpenImage={onOpenImage}
              onOpenPhotoBooth={onOpenPhotoBooth}
            />
          ))}

          {/* Other featured projects in a row below */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_PROJECTS.filter((p) => !p.interactive).map((project, idx) => (
              <FeaturedCard
                key={project.title}
                project={project}
                lead={false}
                delay={190 + idx * 90}
                onOpenImage={onOpenImage}
                onOpenPhotoBooth={onOpenPhotoBooth}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="space-y-4">
        <SectionHeading count={ALL_PROJECTS.length}>All Projects &amp; Case Studies</SectionHeading>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {ALL_PROJECTS.map((project, idx) => (
            <button
              key={project.title}
              type="button"
              onClick={() => onOpenImage(full(project.image), project.title)}
              className="group overflow-hidden rounded-2xl border border-border bg-bg-card text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-text-light hover:shadow-md motion-safe:animate-rise"
              style={{ animationDelay: `${380 + idx * 40}ms` }}
            >
              <div className="relative h-[130px] w-full overflow-hidden border-b border-border bg-bg-alt">
                <img
                  src={thumb(project.image)}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                  <Icon
                    name="expand-outline"
                    className="scale-75 text-xl text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 p-3.5">
                <h3 className="truncate font-sans text-xs font-bold text-text">{project.title}</h3>
                <span className="flex-shrink-0 rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[9px] font-semibold text-brand">
                  {project.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

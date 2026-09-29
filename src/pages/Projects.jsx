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

// The first featured project is the large lead card; the rest stack beside it.
function FeaturedCard({ project, lead, delay, onOpenImage }) {
  const tags = project.tech.split('•').map((t) => t.trim())

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-text-light hover:shadow-md motion-safe:animate-rise ${
        lead ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        type="button"
        onClick={() => onOpenImage(full(project.image), project.title)}
        aria-label={`Preview ${project.title}`}
        className={`relative w-full flex-shrink-0 overflow-hidden border-b border-border bg-bg-alt ${
          lead ? 'h-[220px] sm:h-[300px] lg:h-auto lg:flex-1' : 'h-[170px]'
        }`}
      >
        <img
          src={lead ? full(project.image) : thumb(project.image)}
          alt={project.title}
          loading={lead ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[10px] font-bold text-white">
          {project.badge}
        </span>
        <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Icon name="expand-outline" />
        </span>
      </button>

      <div className="flex flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-sans font-bold text-text ${lead ? 'text-xl' : 'text-base'}`}>{project.title}</h3>
          <span className="flex flex-shrink-0 items-center gap-1.5 font-mono text-[10px] font-semibold text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            PRODUCTION
          </span>
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-mid">{project.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border bg-bg-alt px-2 py-0.5 font-mono text-[10px] font-medium text-text-mid"
            >
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
    </article>
  )
}

export default function Projects({ onOpenImage }) {
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {FEATURED_PROJECTS.map((project, idx) => (
            <FeaturedCard
              key={project.title}
              project={project}
              lead={idx === 0}
              delay={100 + idx * 90}
              onOpenImage={onOpenImage}
            />
          ))}
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

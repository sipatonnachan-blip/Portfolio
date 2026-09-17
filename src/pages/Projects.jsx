import Icon from '../components/Icon'
import { FEATURED_PROJECTS, ALL_PROJECTS } from '../data/projects'

export default function Projects({ onOpenImage }) {
  return (
    <div className="w-full space-y-16 py-4 sm:py-8">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-alt px-3 py-1 font-mono text-xs text-text-light">
          <span>📂</span>
          <span>Portfolio Showcase</span>
        </div>
        <h1 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
          Projects &amp; Web Applications
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-mid">
          A showcase of production web applications, system dashboards, geospatial platforms, and client case studies I've designed and built.
        </p>
      </div>

      {/* Featured Projects */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-text" />
          <h2 className="font-sans text-xl font-bold text-text sm:text-2xl">
            Featured Applications
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURED_PROJECTS.map((project) => (
            <div
              key={project.title}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-text-mid hover:shadow-xl"
            >
              <div>
                {/* Image Preview with Hover Zoom */}
                <div
                  onClick={() => onOpenImage(project.image, project.title)}
                  className="relative h-[190px] w-full cursor-pointer overflow-hidden border-b border-border bg-bg-alt"
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-card/90 via-transparent to-transparent opacity-60" />
                  <div className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-black/50 text-xs text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                    <Icon name="expand-outline" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6">
                  <div className="mb-3 flex items-center justify-between font-mono text-[10px] text-text-light">
                    <span className="rounded-md border border-border bg-bg-alt px-2 py-0.5 font-medium">
                      {project.tech.split('•')[0].trim()}
                    </span>
                    <span className="font-medium text-emerald-500">PRODUCTION</span>
                  </div>

                  <h3 className="mb-2 font-sans text-lg font-bold text-text transition-colors group-hover:text-primary">
                    {project.title}
                  </h3>

                  <p className="mb-4 text-xs leading-relaxed text-text-mid">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Bottom Action Links */}
              <div className="flex items-center justify-between border-t border-border/60 px-5 py-3.5 font-mono text-xs sm:px-6">
                <span className="max-w-[140px] truncate text-[11px] text-text-light">
                  {project.tech}
                </span>

                {project.link && project.link !== '#' ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-text hover:underline"
                  >
                    <span>Live Demo</span>
                    <span>↗</span>
                  </a>
                ) : (
                  <button
                    onClick={() => onOpenImage(project.image, project.title)}
                    className="inline-flex items-center gap-1 text-text-light hover:text-text font-medium"
                  >
                    <span>Preview</span>
                    <span>↗</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Projects & Case Studies */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-text" />
          <h2 className="font-sans text-xl font-bold text-text sm:text-2xl">
            All Projects &amp; Case Studies
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {ALL_PROJECTS.map((project) => (
            <button
              key={project.title}
              type="button"
              onClick={() => onOpenImage(project.image, project.title)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-bg-card text-left transition-all duration-200 hover:-translate-y-1 hover:border-text-mid/70 hover:shadow-lg"
            >
              <div className="relative h-[120px] w-full overflow-hidden border-b border-border bg-bg-alt">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                  <Icon
                    name="expand-outline"
                    className="scale-75 text-xl text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
                  />
                </div>
              </div>

              <div className="p-3.5">
                <h4 className="truncate font-sans text-xs font-bold text-text transition-colors group-hover:text-primary">
                  {project.title}
                </h4>
                <p className="mt-0.5 font-mono text-[10px] text-text-light">
                  {project.category}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

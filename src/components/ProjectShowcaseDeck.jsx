import { useState } from 'react'
import Icon from './Icon'
import { FEATURED_PROJECTS } from '../data/projects'

// Fanned card deck: the active project sits square in front, the other two
// angle out behind it. Click a back card to bring it forward. Below md the
// fan collapses to a plain stack, since there is no room to angle anything.

const POSITIONS = [
  // front
  'z-20 translate-x-0 scale-100 rotate-0 opacity-100 shadow-2xl hover:-translate-y-2 hover:border-text-mid/70',
  // right
  'z-10 translate-x-[42%] translate-y-4 scale-90 rotate-[8deg] opacity-50 cursor-pointer shadow-lg hover:rotate-2 hover:scale-95 hover:-translate-y-1 hover:opacity-90 max-md:hidden',
  // left
  'z-10 -translate-x-[42%] translate-y-4 scale-90 -rotate-[8deg] opacity-50 cursor-pointer shadow-lg hover:-rotate-2 hover:scale-95 hover:-translate-y-1 hover:opacity-90 max-md:hidden',
]

export default function ProjectShowcaseDeck({ onNavigate }) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="relative mx-auto flex min-h-[380px] w-full max-w-[820px] items-center justify-center py-6">
      {FEATURED_PROJECTS.map((project, idx) => {
        const position =
          (idx - activeIndex + FEATURED_PROJECTS.length) % FEATURED_PROJECTS.length
        const isFront = position === 0
        const tags = project.tech.split('•').map((t) => t.trim()).slice(0, 2)

        return (
          <div
            key={project.title}
            onClick={() => !isFront && setActiveIndex(idx)}
            className={`group absolute w-full max-w-[390px] select-none rounded-2xl border border-border bg-bg-card p-6 text-left transition-all duration-300 ease-out ${POSITIONS[position]}`}
          >
            {/* Badges */}
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-text px-3 py-0.5 font-mono text-[10px] font-bold text-secondary transition-transform duration-200 group-hover:scale-105">
                <span>❮</span>
                <span>{project.badge}</span>
                <span>❯</span>
              </span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-bg-alt px-2 py-0.5 font-mono text-[9px] uppercase text-text-light transition-colors group-hover:border-text-mid/50"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Thumbnail + title */}
            <div className="mb-3.5 flex items-center gap-3.5">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-bg-alt shadow-md transition-all duration-300 group-hover:scale-105 group-hover:border-text-mid">
                <img
                  src={project.image}
                  alt=""
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="font-mono text-base font-semibold tracking-tight text-text transition-colors group-hover:text-primary">
                {project.title}
              </h3>
            </div>

            <p className="mb-6 text-[13px] leading-relaxed text-text-mid">
              {project.description}
            </p>

            {/* Only the front card is reachable; the others are decoration */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={isFront ? 0 : -1}
                  aria-hidden={!isFront}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-alt px-3 py-1.5 font-mono text-xs font-medium text-text transition-all duration-200 hover:scale-[1.03] hover:border-text-mid active:scale-[0.98]"
                >
                  <Icon name="globe-outline" className="text-sm" />
                  <span>Live Demo</span>
                </a>
              )}
              <button
                type="button"
                tabIndex={isFront ? 0 : -1}
                aria-hidden={!isFront}
                onClick={(e) => {
                  e.stopPropagation()
                  onNavigate('projects')
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-alt px-3 py-1.5 font-mono text-xs font-medium text-text transition-all duration-200 hover:scale-[1.03] hover:border-text-mid active:scale-[0.98]"
              >
                <Icon name="layers-outline" className="text-sm" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        )
      })}

      {/* Which card is in front */}
      <div className="absolute -bottom-2 flex items-center gap-2">
        {FEATURED_PROJECTS.map((project, idx) => (
          <button
            key={project.title}
            type="button"
            onClick={() => setActiveIndex(idx)}
            aria-label={`Show ${project.title}`}
            aria-current={idx === activeIndex}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIndex ? 'w-6 bg-text' : 'w-1.5 bg-border hover:bg-text-light'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

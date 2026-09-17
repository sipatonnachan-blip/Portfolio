import { useState } from 'react'
import Icon from './Icon'

const SHOWCASE_PROJECTS = [
  {
    id: 'monthly-tracker',
    badge: '#1 FINANCE APP',
    tags: ['APP STORE HIDDEN GEMS', 'LARAVEL & MYSQL'],
    title: 'Monthly Tracker — Budget & Expense',
    description: 'An offline-ready budget & expense tracker powered by Laravel, MySQL, and responsive Tailwind analytics.',
    image: '/images/case 1.png',
    liveUrl: 'https://monthly-tracker-mdjt.onrender.com/',
  },
  {
    id: 'schedulink',
    badge: '#1 SCHEDULING SUITE',
    tags: ['TEAM MANAGEMENT', 'REACT & LARAVEL'],
    title: 'ScheduLink — Event Suite',
    description: 'Advanced scheduling and event coordination platform built for seamless organizational workflow.',
    image: '/images/dashboard-schedulink.png',
    liveUrl: null,
  },
  {
    id: 'weevil-suite',
    badge: '#1 GEOSPATIAL HUB',
    tags: ['MAPPING ENGINE', 'ANALYTICS SYSTEM'],
    title: 'Weevil Suite — Geospatial Platform',
    description: 'Multi-page geospatial data platform with interactive mapping, dataset repository, and taxonomic key.',
    image: '/images/pro (1).png',
    liveUrl: null,
  },
]

export default function ProjectShowcaseDeck({ onNavigate }) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="relative mx-auto my-8 flex min-h-[400px] w-full max-w-[820px] items-center justify-center overflow-visible py-6">
      {SHOWCASE_PROJECTS.map((project, idx) => {
        // Position relative to active: 0 is center, 1 is right, 2 is left
        const position = (idx - activeIndex + SHOWCASE_PROJECTS.length) % SHOWCASE_PROJECTS.length

        let transformClasses = ''
        let zIndexClass = ''
        let opacityClass = ''

        if (position === 0) {
          // Center card
          transformClasses = 'translate-x-0 translate-y-0 scale-100 rotate-0 shadow-2xl ring-1 ring-border/80 hover:-translate-y-2 hover:border-text-mid/70 shadow-zinc-950/10 dark:shadow-[0_25px_50px_rgba(0,0,0,0.9)]'
          zIndexClass = 'z-20'
          opacityClass = 'opacity-100 pointer-events-auto'
        } else if (position === 1) {
          // Right card
          transformClasses = 'translate-x-[42%] translate-y-4 scale-90 rotate-[8deg] shadow-lg hover:rotate-2 hover:scale-95 hover:-translate-y-1 hover:opacity-90 max-md:hidden'
          zIndexClass = 'z-10'
          opacityClass = 'opacity-50 cursor-pointer'
        } else {
          // Left card
          transformClasses = '-translate-x-[42%] translate-y-4 scale-90 -rotate-[8deg] shadow-lg hover:-rotate-2 hover:scale-95 hover:-translate-y-1 hover:opacity-90 max-md:hidden'
          zIndexClass = 'z-10'
          opacityClass = 'opacity-50 cursor-pointer'
        }

        return (
          <div
            key={project.id}
            onClick={() => setActiveIndex(idx)}
            className={`group absolute w-full max-w-[390px] rounded-2xl border border-border bg-bg-card p-6 text-left transition-all duration-300 ease-out select-none ${transformClasses} ${zIndexClass} ${opacityClass}`}
          >
            {/* Top Badges */}
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-text px-3 py-0.5 font-mono text-[10px] font-bold text-secondary transition-transform duration-200 group-hover:scale-105">
                <span>❮</span>
                <span>{project.badge}</span>
                <span>❯</span>
              </span>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-bg-alt px-2 py-0.5 font-mono text-[9px] text-text-light transition-colors group-hover:border-text-mid/50"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* App Photo Thumbnail + Title */}
            <div className="mb-3.5 flex items-center gap-3.5">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-bg-alt shadow-md transition-all duration-300 group-hover:scale-105 group-hover:border-text-mid group-hover:shadow-lg">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-115"
                />
              </div>
              <h3 className="font-mono text-base font-semibold tracking-tight text-text transition-colors group-hover:text-primary">
                {project.title}
              </h3>
            </div>

            {/* Description */}
            <p className="mb-6 text-[13px] leading-relaxed text-text-mid transition-colors group-hover:text-text/90">
              {project.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-alt px-3 py-1.5 font-mono text-xs font-medium text-text transition-all duration-200 hover:scale-[1.03] hover:border-text-mid hover:bg-border active:scale-[0.98]"
                >
                  <Icon name="globe-outline" className="text-sm" />
                  <span>Live Demo</span>
                </a>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onNavigate('projects')
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-alt px-3 py-1.5 font-mono text-xs font-medium text-text transition-all duration-200 hover:scale-[1.03] hover:border-text-mid hover:bg-border active:scale-[0.98]"
              >
                <Icon name="layers-outline" className="text-sm" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

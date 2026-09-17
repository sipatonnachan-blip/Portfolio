import { TECH_STACK_CATEGORIES } from '../data/techStack'
import Icon from '../components/Icon'

const CATEGORY_ICONS = {
  'FRONTEND & UI': 'layers-outline',
  'BACKEND ARCHITECTURE': 'server-outline',
  'DATABASE & STORAGE': 'file-tray-full-outline',
  'DEVOPS & CLOUD': 'cloud-outline',
  'TOOLS & WORKFLOW': 'construct-outline',
}

export default function TechStack() {
  return (
    <div className="w-full space-y-12 py-4 sm:py-8">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-alt px-3 py-1 font-mono text-xs text-text-light">
          <span>⚡</span>
          <span>Technical Capabilities</span>
        </div>
        <h1 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
          Tech Stack &amp; Tooling
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-mid">
          The production languages, frameworks, database engines, and infrastructure platforms I leverage to ship fast, reliable web applications.
        </p>
      </div>

      {/* Categories Bento Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {TECH_STACK_CATEGORIES.map((section) => {
          const icon = CATEGORY_ICONS[section.category] || 'code-slash-outline'
          return (
            <div
              key={section.category}
              className="group rounded-3xl border border-border bg-bg-card p-6 transition-all duration-300 hover:border-text-mid/70 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-alt text-text transition-colors group-hover:border-text-mid group-hover:bg-text group-hover:text-secondary">
                  <Icon name={icon} className="text-lg" />
                </div>
                <div>
                  <h2 className="font-sans text-base font-bold text-text transition-colors group-hover:text-primary">
                    {section.category}
                  </h2>
                  <span className="font-mono text-[11px] text-text-light">
                    {section.skills.length} core technologies
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {section.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-alt/60 px-3 py-1.5 font-mono text-xs font-medium text-text transition-all duration-150 hover:scale-105 hover:border-text-mid hover:bg-bg-card"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-text-light/60" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

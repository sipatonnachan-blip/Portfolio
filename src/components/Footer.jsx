import Icon from './Icon'
import { PROFILE, SOCIALS } from '../data/contact'

export default function Footer({ onNavigate }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="mt-20 border-t border-border/80 bg-bg-card/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        {/* Left: Brand info & Status */}
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <span className="font-mono text-sm font-bold text-text">
              {PROFILE.name}
            </span>
            <span className="text-xs text-text-light">•</span>
            <span className="text-xs text-text-light">
              Full-Stack Web Developer
            </span>
          </div>
          <p className="mt-1 text-xs text-text-light">
            Building reliable web solutions with Laravel, React & modern cloud architecture.
          </p>
        </div>

        {/* Right: Social Links & Back to Top */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.name}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-bg-alt/70 text-text transition-all duration-200 hover:scale-110 hover:border-text-mid hover:text-primary"
              >
                <Icon name={s.icon} className="text-sm" />
              </a>
            ))}
          </div>

          <div className="h-4 w-px bg-border" />

          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="group flex items-center gap-1.5 rounded-lg border border-border bg-bg-alt/50 px-2.5 py-1.5 font-mono text-xs text-text-light transition-all duration-200 hover:border-text-mid hover:text-text"
          >
            <span>Top</span>
            <span className="transition-transform group-hover:-translate-y-0.5">↑</span>
          </button>
        </div>
      </div>
    </footer>
  )
}

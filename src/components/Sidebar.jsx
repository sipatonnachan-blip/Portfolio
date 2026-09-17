import { useEffect, useState } from 'react'
import Icon from './Icon'
import { NAV_ITEMS } from '../data/navigation'
import { PROFILE } from '../data/contact'

export default function Sidebar({ activePage, onNavigate, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [viewerCount, setViewerCount] = useState(1)

  const handleNavClick = (id) => {
    onNavigate(id)
    setMenuOpen(false)
  }

  // Active visitor presence tracking across browser sessions/tabs
  useEffect(() => {
    const tabId = Math.random().toString(36).substring(2, 9)
    const storageKey = 'portfolio_active_tabs'

    const syncPresence = () => {
      try {
        const now = Date.now()
        const raw = localStorage.getItem(storageKey)
        const tabs = raw ? JSON.parse(raw) : {}

        // Prune stale tabs inactive for > 6 seconds
        const active = {}
        for (const [id, timestamp] of Object.entries(tabs)) {
          if (now - timestamp < 6000) {
            active[id] = timestamp
          }
        }

        // Register current tab
        active[tabId] = now
        localStorage.setItem(storageKey, JSON.stringify(active))

        const count = Object.keys(active).length
        setViewerCount(Math.max(1, count))
      } catch {
        setViewerCount(1)
      }
    }

    syncPresence()
    const interval = setInterval(syncPresence, 2500)

    const handleStorageChange = (e) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const tabs = JSON.parse(e.newValue)
          setViewerCount(Math.max(1, Object.keys(tabs).length))
        } catch {}
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
      try {
        const raw = localStorage.getItem(storageKey)
        if (raw) {
          const tabs = JSON.parse(raw)
          delete tabs[tabId]
          localStorage.setItem(storageKey, JSON.stringify(tabs))
        }
      } catch {}
    }
  }, [])

  const collapsible = menuOpen ? '' : 'max-[900px]:hidden'

  return (
    <aside className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-y-auto border-r border-border bg-bg px-6 py-8 font-sans transition-colors duration-250 max-[900px]:static max-[900px]:h-auto max-[900px]:border-b max-[900px]:border-r-0 max-[900px]:p-5">
      {/* Top Brand & Mobile Toggle */}
      <div>
        <div className="flex items-center justify-between pb-6">
          <button
            onClick={() => handleNavClick('home')}
            className="text-left font-mono text-sm font-semibold tracking-wider text-text transition-opacity hover:opacity-80"
          >
            {PROFILE.name}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="hidden p-1 text-text-light hover:text-text max-[900px]:block"
          >
            <Icon name={menuOpen ? 'close-outline' : 'menu-outline'} className="text-xl" />
          </button>
        </div>

        {/* Collapsible content */}
        <div className={`${collapsible} ${menuOpen ? 'max-[900px]:animate-menu-open' : ''}`}>
          {/* Main navigation list */}
          <nav className="mb-6 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`group flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                    isActive
                      ? 'font-medium text-text bg-bg-alt'
                      : 'text-text-light hover:text-text hover:bg-bg-alt/60'
                  }`}
                >
                  <Icon
                    name={item.icon}
                    className={`text-sm transition-colors ${
                      isActive ? 'text-text' : 'text-text-light group-hover:text-text'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Live Visitor status */}
          <div className="mb-6 border-t border-border/70 pt-5 space-y-2 text-xs font-mono text-text-light">
            <div className="flex items-center gap-2 px-2.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] text-text-mid transition-all">
                {viewerCount} {viewerCount === 1 ? 'person' : 'people'} viewing now
              </span>
            </div>
            <a
              href={`mailto:${PROFILE.email}?subject=Project%20Inquiry`}
              className="flex items-center gap-2 px-2.5 py-1 text-[11px] transition-colors hover:text-text"
            >
              <Icon name="chatbubble-ellipses-outline" className="text-sm" />
              <span>community chat</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom info & theme switcher */}
      <div className={`${collapsible} border-t border-border/70 pt-5 text-xs text-text-light`}>
        {/* Theme mode icon buttons */}
        <div className="mb-4 flex items-center gap-2 px-2.5">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle light/dark mode"
            title="Toggle theme"
            className="flex h-7 w-7 items-center justify-center rounded border border-border bg-bg-alt text-text transition-colors hover:border-text-mid hover:text-text"
          >
            <Icon name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} className="text-xs" />
          </button>
          <span className="font-mono text-[10px] text-text-light">
            {theme === 'dark' ? 'dark' : 'light'}
          </span>
        </div>

        {/* Reach out info */}
        <div className="px-2.5 font-mono text-[11px] leading-relaxed">
          <p className="text-text-light mb-1">For work, collabs & everything else, reach me at</p>
          <a
            href={`mailto:${PROFILE.email}`}
            className="block text-text underline decoration-border hover:decoration-text transition-colors truncate"
            title={PROFILE.email}
          >
            {PROFILE.email}
          </a>
        </div>
      </div>
    </aside>
  )
}

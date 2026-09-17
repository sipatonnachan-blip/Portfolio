import { useEffect, useState } from 'react'
import Icon from './Icon'
import { NAV_ITEMS } from '../data/navigation'
import { PROFILE } from '../data/contact'

export default function Navbar({ activePage, onNavigate, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [viewerCount, setViewerCount] = useState(1)

  // Scroll detection for enhanced frosted glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Live multi-tab visitor counter
  useEffect(() => {
    const tabId = Math.random().toString(36).substring(2, 9)
    const storageKey = 'portfolio_active_tabs'

    const syncPresence = () => {
      try {
        const now = Date.now()
        const raw = localStorage.getItem(storageKey)
        const tabs = raw ? JSON.parse(raw) : {}

        const active = {}
        for (const [id, timestamp] of Object.entries(tabs)) {
          if (now - timestamp < 6000) {
            active[id] = timestamp
          }
        }

        active[tabId] = now
        localStorage.setItem(storageKey, JSON.stringify(active))
        setViewerCount(Math.max(1, Object.keys(active).length))
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

  const handleNav = (id) => {
    onNavigate(id)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 pb-2 transition-all duration-300">
      <div className="mx-auto max-w-5xl">
        <nav
          className={`flex items-center justify-between rounded-2xl border border-border/80 px-4 py-2.5 backdrop-blur-xl transition-all duration-300 ${
            scrolled
              ? 'bg-bg-card/90 shadow-lg shadow-black/5 dark:shadow-black/40'
              : 'bg-bg-card/75 shadow-sm'
          }`}
        >
          {/* Brand Monogram & Name */}
          <button
            onClick={() => handleNav('home')}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-alt font-mono text-sm font-bold text-text transition-all duration-200 group-hover:scale-105 group-hover:border-text-mid group-hover:bg-text group-hover:text-secondary">
              CD
            </div>
            <div className="hidden sm:block">
              <span className="block font-mono text-sm font-semibold tracking-tight text-text transition-colors group-hover:text-primary">
                {PROFILE.name}
              </span>
              <span className="block text-[11px] text-text-light">
                Full-Stack Web Developer
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1 rounded-xl border border-border/60 bg-bg-alt/40 p-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative rounded-lg px-3 py-1.5 font-sans text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-bg-card text-text shadow-sm'
                      : 'text-text-mid hover:text-text hover:bg-bg-card/50'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Action Tools: Visitor Badge & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live visitor badge */}
            <div
              className="hidden lg:flex items-center gap-1.5 rounded-full border border-border/70 bg-bg-alt/60 px-2.5 py-1 font-mono text-[11px] text-text-mid"
              title="Real-time multi-tab session presence"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>{viewerCount} Viewer/s</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="group flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-alt/80 text-text transition-all duration-300 hover:scale-105 hover:border-text-mid active:scale-90"
            >
              <span className="inline-flex transition-transform duration-500 ease-out group-hover:rotate-45 group-active:rotate-180">
                <Icon name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} className="text-sm" />
              </span>
            </button>

            {/* Quick Contact CTA */}
            <button
              onClick={() => handleNav('contact')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-text/10 bg-text px-3.5 py-1.5 font-mono text-xs font-semibold text-secondary transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get in touch</span>
              <span>↗</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-alt text-text md:hidden"
            >
              <Icon name={menuOpen ? 'close-outline' : 'menu-outline'} className="text-lg" />
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="mt-2 rounded-2xl border border-border bg-bg-card/95 p-3 shadow-xl backdrop-blur-xl md:hidden animate-fade-in-up">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-bg-alt text-text font-semibold'
                        : 'text-text-mid hover:bg-bg-alt/60 hover:text-text'
                    }`}
                  >
                    <Icon name={item.icon} className="text-base" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 px-1">
              <div className="flex items-center gap-2 font-mono text-xs text-text-light">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>{viewerCount} Viewer/s</span>
              </div>
              <button
                onClick={() => handleNav('contact')}
                className="font-mono text-xs font-semibold text-text underline"
              >
                Contact ↗
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

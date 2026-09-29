import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { NAV_ITEMS } from '../data/navigation'
import { PROFILE, SOCIALS } from '../data/contact'
import { usePresence } from '../hooks/usePresence'

const YEAR = new Date().getFullYear()

// Profile photo that turns shy: crossfades to the shy shot on hover, and on
// click/tap shows it for a moment (touch screens have no hover).
function ShyAvatar({ onClick, className, ring }) {
  const [shy, setShy] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const handleClick = () => {
    setShy(true)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setShy(false), 1400)
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Go to home"
      className={`group relative flex-shrink-0 overflow-hidden rounded-full bg-bg-alt ${ring} ${className}`}
    >
      <img
        src={PROFILE.avatar}
        alt={PROFILE.name}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0 ${
          shy ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <img
        src={PROFILE.avatarHover}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 ${
          shy ? 'scale-105 opacity-100' : 'opacity-0'
        }`}
      />
    </button>
  )
}

// Fixed left rail on desktop (profile, socials, nav, footer); collapses to a
// sticky top bar with a dropdown menu below lg.
export default function Sidebar({ activePage, onNavigate, theme, onToggleTheme, onOpenSecurityDemo }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showViewersPopup, setShowViewersPopup] = useState(false)
  const popupRef = useRef(null)
  const { viewerCount, viewersList } = usePresence(activePage)

  // Close audience popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowViewersPopup(false)
      }
    }
    if (showViewersPopup) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showViewersPopup])

  const handleNav = (id) => {
    onNavigate(id)
    setMenuOpen(false)
  }

  const themeButton = (
    <button
      onClick={onToggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-card text-text shadow-sm transition-all duration-200 hover:scale-110 hover:border-text-mid active:scale-90"
    >
      <Icon name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} className="text-sm" />
    </button>
  )

  const navList = (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive = activePage === item.id
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
              isActive
                ? 'bg-bg-alt font-semibold text-text shadow-sm'
                : 'font-medium text-text-mid hover:bg-bg-alt hover:text-text'
            }`}
          >
            <Icon
              name={item.icon}
              className={`text-[15px] transition-colors ${
                isActive ? 'text-brand' : 'text-text-light group-hover:text-text'
              }`}
            />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* ── Desktop rail ── */}
      <aside className="motion-safe:animate-slide-in-left fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto border-r border-border bg-bg-card px-5 py-8 lg:flex">
        {/* Profile */}
        <div className="flex flex-col items-center text-center">
          <ShyAvatar
            onClick={() => handleNav('home')}
            ring="ring-4 ring-bg-card"
            className="h-28 w-28 shadow-[0_18px_40px_-12px_rgba(249,115,22,0.35)] transition-transform duration-300 hover:scale-105"
          />

          <div className="mt-5 flex items-center gap-1.5">
            <h2 className="font-sans text-base font-bold tracking-tight text-text">{PROFILE.name}</h2>
            <Icon name="checkmark-circle" className="text-base text-blue-500" />
          </div>
          <p className="mt-0.5 text-xs text-text-light">{PROFILE.title}</p>

          <div className="mt-5 flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.name}
                aria-label={s.name}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-card text-text shadow-sm transition-all duration-200 hover:scale-110 hover:border-text-mid"
              >
                <Icon name={s.icon} className="text-sm" />
              </a>
            ))}
            {themeButton}
          </div>
        </div>

        <div className="my-6 h-px w-full bg-border" />

        {navList}

        {/* Footer */}
        <div className="mt-auto pt-8">
          {/* Live real-time viewer badge with audience popover */}
          <div className="relative mb-4" ref={popupRef}>
            <button
              type="button"
              onClick={() => setShowViewersPopup((prev) => !prev)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-[11px] text-text-mid transition-colors hover:bg-bg-alt hover:text-text"
              title="Click to view real-time audience breakdown"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-semibold">{viewerCount} Viewer/s</span>
              <span className="text-[9px] text-text-light">▴</span>
            </button>

            {showViewersPopup && (
              <div className="absolute bottom-full left-0 z-50 mb-2 w-60 animate-fade-in-up rounded-2xl border border-border bg-bg-card p-3 shadow-2xl">
                <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
                  <span className="font-mono text-xs font-bold text-text">Live Audience</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-500">
                    {viewerCount} Active
                  </span>
                </div>
                <div className="max-h-48 space-y-1.5 overflow-y-auto">
                  {viewersList.map((v, idx) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-bg-alt px-2.5 py-1.5 font-mono text-[11px]"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span className={`truncate ${v.isSelf ? 'font-bold text-text' : 'text-text-mid'}`}>
                          {v.isSelf ? 'You (Current Tab)' : `Viewer ${idx + 1}`}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-md border border-border bg-bg-card px-2 py-0.5 text-[10px] font-medium capitalize text-text-light">
                        {v.page || 'Home'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-5">
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenSecurityDemo}
                aria-label="See what this page already knows about you (Alt+K)"
                title="What we know about you (Alt+K)"
                className="group relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-rose-600 text-white shadow-[0_6px_18px_-4px_rgba(249,115,22,0.7)] ring-1 ring-white/20 transition-transform duration-200 hover:scale-110 active:scale-95"
              >
                {/* Slow radar ping: hints there's something to discover */}
                <span className="absolute inset-0 rounded-full bg-orange-500/40 motion-safe:animate-[ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite]" />
                <Icon
                  name="robot"
                  className="relative text-xl transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                />
              </button>
              <p className="text-[10px] leading-snug text-text-light">
                © {YEAR}
                <br />
                {PROFILE.name}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="motion-safe:animate-fade-in sticky top-0 z-40 border-b border-border bg-bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => handleNav('home')} className="flex min-w-0 items-center gap-2.5 text-left">
            <img
              src={PROFILE.avatar}
              alt=""
              className="h-9 w-9 flex-shrink-0 rounded-full object-cover ring-2 ring-border"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-sm font-bold text-text">
                <span className="truncate">{PROFILE.name}</span>
                <Icon name="checkmark-circle" className="flex-shrink-0 text-sm text-blue-500" />
              </span>
              <span className="block truncate text-[11px] text-text-light">{PROFILE.title}</span>
            </span>
          </button>

          <div className="flex flex-shrink-0 items-center gap-2">
            {themeButton}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-card text-text shadow-sm"
            >
              <Icon name={menuOpen ? 'close-outline' : 'menu-outline'} className="text-base" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="animate-menu-open pt-3">
            {navList}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text"
                  >
                    <Icon name={s.icon} className="text-sm" />
                  </a>
                ))}
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onOpenSecurityDemo()
                  }}
                  aria-label="See what this page already knows about you"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-rose-600 text-white shadow-md ring-1 ring-white/20"
                >
                  <Icon name="robot" className="text-base" />
                </button>
              </div>
              <span className="flex items-center gap-2 font-mono text-[11px] text-text-light">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {viewerCount} Viewer/s
              </span>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

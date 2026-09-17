import { useEffect, useRef, useState } from 'react'
import { connect } from 'itty-sockets'
import Icon from './Icon'
import { NAV_ITEMS } from '../data/navigation'
import { PROFILE } from '../data/contact'

export default function Navbar({ activePage, onNavigate, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [viewerCount, setViewerCount] = useState(1)
  const [viewersList, setViewersList] = useState([])
  const [showViewersPopup, setShowViewersPopup] = useState(false)
  const popupRef = useRef(null)
  const tabIdRef = useRef('tab_' + Math.random().toString(36).substring(2, 9))
  const channelRef = useRef(null)

  // Scroll detection for enhanced frosted glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Multi-Device Global Real-Time Presence (WebSocket via itty-sockets + BroadcastChannel)
  useEffect(() => {
    const tabId = tabIdRef.current
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    const deviceType = isMobile ? 'Mobile' : 'Desktop'

    const activeMap = new Map()

    // Self record
    activeMap.set(tabId, {
      id: tabId,
      label: `You (${deviceType})`,
      device: deviceType,
      page: activePage,
      isSelf: true,
      lastSeen: Date.now()
    })

    const refreshViewers = () => {
      const list = Array.from(activeMap.values())
      setViewersList(list)
      setViewerCount(Math.max(1, list.length))
    }

    // Process incoming presence message from any device/tab
    const handlePresenceMessage = (data) => {
      if (!data || typeof data !== 'object') return
      const { type, id, page, device } = data
      if (!id || id === tabId) return

      const now = Date.now()
      const dType = device || 'Device'

      if (type === 'JOIN') {
        const isNew = !activeMap.has(id)
        activeMap.set(id, {
          id,
          label: `Viewer (${dType})`,
          device: dType,
          page: page || 'home',
          isSelf: false,
          lastSeen: now
        })
        refreshViewers()
        // Reply back so the newly joined device discovers existing viewers immediately
        if (isNew) {
          sendPresence({
            type: 'ACK',
            id: tabId,
            device: deviceType,
            page: activePage
          })
        }
      } else if (type === 'ACK' || type === 'HEARTBEAT') {
        activeMap.set(id, {
          id,
          label: `Viewer (${dType})`,
          device: dType,
          page: page || 'home',
          isSelf: false,
          lastSeen: now
        })
        refreshViewers()
      } else if (type === 'PAGE_CHANGE') {
        if (activeMap.has(id)) {
          const v = activeMap.get(id)
          v.page = page || 'home'
          v.lastSeen = now
          refreshViewers()
        }
      } else if (type === 'LEAVE') {
        activeMap.delete(id)
        refreshViewers()
      }
    }

    // 1. Connect to global cloud WebSocket relay (cross-device across the internet)
    let socketChannel = null
    try {
      socketChannel = connect('christian-delapos-portfolio-kbpo-presence')
      channelRef.current = socketChannel

      socketChannel.on('message', ({ message }) => {
        try {
          const parsed = typeof message === 'string' ? JSON.parse(message) : message
          handlePresenceMessage(parsed)
        } catch {
          handlePresenceMessage(message)
        }
      })
    } catch {}

    // 2. Connect to local BroadcastChannel (instant zero-latency cross-tab sync)
    let localChannel = null
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        localChannel = new BroadcastChannel('christian_portfolio_local_presence')
        localChannel.onmessage = (event) => {
          handlePresenceMessage(event.data)
        }
      }
    } catch {}

    const sendPresence = (payload) => {
      try {
        socketChannel?.send(payload)
      } catch {}
      try {
        localChannel?.postMessage(payload)
      } catch {}
    }

    // Announce JOIN to all connected devices worldwide
    sendPresence({
      type: 'JOIN',
      id: tabId,
      device: deviceType,
      page: activePage
    })

    // Periodic heartbeat every 3.5s and purge stale devices (> 10s of no heartbeat)
    const interval = setInterval(() => {
      const now = Date.now()
      let changed = false

      for (const [id, viewer] of activeMap.entries()) {
        if (id !== tabId && now - viewer.lastSeen > 9500) {
          activeMap.delete(id)
          changed = true
        }
      }

      sendPresence({
        type: 'HEARTBEAT',
        id: tabId,
        device: deviceType,
        page: activePage
      })

      if (changed) refreshViewers()
    }, 3500)

    const handleExit = () => {
      sendPresence({ type: 'LEAVE', id: tabId })
      try {
        localChannel?.close()
      } catch {}
    }

    window.addEventListener('beforeunload', handleExit)
    window.addEventListener('pagehide', handleExit)

    refreshViewers()

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleExit)
      window.removeEventListener('pagehide', handleExit)
      handleExit()
    }
  }, [])

  // Instantly broadcast active section navigation across tabs
  useEffect(() => {
    try {
      if (channelRef.current && tabIdRef.current) {
        channelRef.current.postMessage({
          type: 'PAGE_CHANGE',
          id: tabIdRef.current,
          page: activePage
        })
      }
    } catch {}
  }, [activePage])

  // Close audience dropdown when clicking outside
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
            {/* Live real-time viewer badge with interactive audience popover */}
            <div className="relative" ref={popupRef}>
              <button
                type="button"
                onClick={() => setShowViewersPopup((prev) => !prev)}
                className="hidden lg:flex items-center gap-1.5 rounded-full border border-border/70 bg-bg-alt/60 px-3 py-1 font-mono text-[11px] text-text-mid transition-all duration-200 hover:border-emerald-500/50 hover:bg-bg-alt hover:text-text cursor-pointer active:scale-95"
                title="Click to view real-time audience breakdown"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-semibold">{viewerCount} Viewer/s</span>
                <span className="text-[9px] text-text-light">▾</span>
              </button>

              {/* Interactive Live Viewers Popover */}
              {showViewersPopup && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-bg-card/95 p-3.5 shadow-2xl backdrop-blur-xl animate-fade-in-up z-50">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span className="font-mono text-xs font-bold text-text">Live Audience</span>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-500">
                      {viewerCount} Active
                    </span>
                  </div>

                  {/* List of active viewers */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {viewersList.map((v, idx) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-xl bg-bg-alt/80 px-2.5 py-1.5 font-mono text-xs border border-border/40"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className={`truncate ${v.isSelf ? 'font-bold text-text' : 'text-text-mid'}`}>
                            {v.isSelf ? 'You (Current Tab)' : `Viewer ${idx + 1}`}
                          </span>
                        </div>
                        <span className="text-[10px] capitalize text-text-light font-medium bg-bg-card px-2 py-0.5 rounded-md border border-border/50 shrink-0">
                          {v.page || 'Home'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2.5 border-t border-border/50 pt-2 flex items-center justify-between font-mono text-[10px] text-text-light">
                    <span>⚡ Instant sync (No reload)</span>
                    <span className="text-emerald-500 font-semibold">● Connected</span>
                  </div>
                </div>
              )}
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

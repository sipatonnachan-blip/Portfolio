import { useEffect, useRef, useState } from 'react'
import { connect } from 'itty-sockets'

// Multi-device real-time presence: a global WebSocket relay (itty-sockets)
// for cross-device viewers plus a BroadcastChannel for instant cross-tab sync.
export function usePresence(activePage) {
  const [viewerCount, setViewerCount] = useState(1)
  const [viewersList, setViewersList] = useState([])
  const tabIdRef = useRef('tab_' + Math.random().toString(36).substring(2, 9))
  const channelRef = useRef(null)

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

  return { viewerCount, viewersList }
}

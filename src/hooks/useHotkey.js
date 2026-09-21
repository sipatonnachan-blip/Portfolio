import { useEffect } from 'react'

// Global Alt+<key> shortcut. Matches on e.code so it still fires on keyboard
// layouts where Alt produces a different character, and stays quiet while the
// visitor is typing in a field.
export function useAltHotkey(code, handler) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!e.altKey || e.ctrlKey || e.metaKey) return
      if (e.code !== code && e.key?.toLowerCase() !== code.replace('Key', '').toLowerCase())
        return

      const el = e.target
      const typing =
        el?.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(el?.tagName)
      if (typing) return

      e.preventDefault()
      handler(e)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [code, handler])
}

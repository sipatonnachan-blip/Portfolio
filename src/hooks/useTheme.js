import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'portfolio-theme'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? stored : 'dark'
  })

  // Synchronize data-theme on initial mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  const toggleTheme = useCallback((event) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'

    // Enable smooth background/border/color CSS transition during switch
    document.documentElement.classList.add('theme-transitioning')
    window.clearTimeout(window.__themeTransitionTimer)
    window.__themeTransitionTimer = window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 650)

    const applyTheme = () => {
      if (nextTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
      localStorage.setItem(STORAGE_KEY, nextTheme)
      setTheme(nextTheme)
    }

    // Check if View Transition API is supported and user doesn't prefer reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    if (!document.startViewTransition || prefersReducedMotion) {
      applyTheme()
      return
    }

    // Origin coordinates of the circular ripple (centered on toggle button if available)
    const x = event?.clientX ?? window.innerWidth - 60
    const y = event?.clientY ?? 40
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      applyTheme()
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ]
      document.documentElement.animate(
        {
          clipPath: clipPath
        },
        {
          duration: 500,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      )
    })
  }, [theme])

  return { theme, toggleTheme }
}


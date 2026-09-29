import { useCallback, useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import FireflyCompanion from './components/FireflyCompanion'
import ImageModal from './components/ImageModal'
import SecurityDemoChat from './components/SecurityDemoChat'
import { useTheme } from './hooks/useTheme'
import { useAltHotkey } from './hooks/useHotkey'
import Home from './pages/Home'
import TechStack from './pages/TechStack'
import Projects from './pages/Projects'
import About from './pages/About'
import Experience from './pages/Experience'
import Contact from './pages/Contact'

// How long the old page takes to fade out before the new one fades in
const PAGE_LEAVE_MS = 220

const PAGES = {
  home: Home,
  'tech stack': TechStack,
  projects: Projects,
  about: About,
  experience: Experience,
  contact: Contact,
}

export default function App() {
  // `activePage` is where the visitor is going (nav highlight, firefly);
  // `shownPage` is what's rendered, which swaps once the old page has faded out.
  const [activePage, setActivePage] = useState('home')
  const [shownPage, setShownPage] = useState('home')
  const [leaving, setLeaving] = useState(false)
  const leaveTimer = useRef(null)
  // First-load intro (skipped for reduced motion): the page is laid out but
  // hidden under a cover while the firefly says hello, then revealed.
  const [introPlaying, setIntroPlaying] = useState(
    () => !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  )
  const [coverVisible, setCoverVisible] = useState(introPlaying)
  const [skipIntro, setSkipIntro] = useState(false)
  // Bumped on reveal so the page remounts and plays its entrance animations
  const [revealKey, setRevealKey] = useState(0)
  const [modalImage, setModalImage] = useState(null)
  const [modalAlt, setModalAlt] = useState('')
  const [securityDemoOpen, setSecurityDemoOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  // Alt+K opens the security awareness demo.
  useAltHotkey('KeyK', useCallback(() => setSecurityDemoOpen((open) => !open), []))

  // Cross-fade between pages: fade the current one out, then swap in the new
  // one, which fades and rises in. No hard cut.
  const handleNavigate = (pageId) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (pageId === activePage) return
    setActivePage(pageId)
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    window.clearTimeout(leaveTimer.current)
    if (reduceMotion) {
      setShownPage(pageId)
      return
    }
    setLeaving(true)
    leaveTimer.current = window.setTimeout(() => {
      setShownPage(pageId)
      setLeaving(false)
    }, PAGE_LEAVE_MS)
  }

  useEffect(() => () => window.clearTimeout(leaveTimer.current), [])

  const handleIntroReveal = useCallback(() => {
    setIntroPlaying(false)
    setRevealKey((key) => key + 1)
    window.setTimeout(() => setCoverVisible(false), 800)
  }, [])

  // Esc skips the intro; the page doesn't scroll behind the cover
  useEffect(() => {
    if (!introPlaying) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setSkipIntro(true)
    }
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [introPlaying])

  const openImage = (src, alt) => {
    setModalImage(src)
    setModalAlt(alt)
  }

  const closeImage = () => setModalImage(null)

  const ActivePageComponent = PAGES[shownPage] ?? Home

  return (
    <>
      <ImageModal image={modalImage} alt={modalAlt} onClose={closeImage} />

      <SecurityDemoChat
        open={securityDemoOpen}
        onClose={() => setSecurityDemoOpen(false)}
      />

      {/* Site-wide firefly: perches on each page's heading, visits the lamp */}
      <FireflyCompanion
        activePage={activePage}
        theme={theme}
        intro={introPlaying}
        skipIntro={skipIntro}
        onIntroReveal={handleIntroReveal}
      />

      {/* Intro cover: fades away as the firefly heads for its perch */}
      {coverVisible && (
        <div
          onClick={() => setSkipIntro(true)}
          className={`fixed inset-0 z-[55] bg-bg transition-opacity duration-700 ${
            introPlaying ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_52%,rgba(251,146,60,0.10),transparent_60%)]" />
          <button
            type="button"
            onClick={() => setSkipIntro(true)}
            className="absolute bottom-6 right-6 rounded-full border border-border px-4 py-2 font-sans text-xs font-semibold text-text-light transition-colors hover:border-text-light hover:text-text"
          >
            Skip intro ›
          </button>
        </div>
      )}

      <div className="min-h-screen bg-bg text-text antialiased transition-colors duration-250">
        <div className={introPlaying ? 'opacity-0' : 'intro-fade-in'}>
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSecurityDemo={() => setSecurityDemoOpen(true)}
        />
        </div>

        <main id="main-content" className="min-w-0 px-4 py-6 sm:px-6 md:px-8 lg:ml-64 lg:px-10 lg:py-8">
          <div
            key={`${shownPage}-${revealKey}`}
            className={`w-full ${introPlaying ? 'opacity-0' : leaving ? 'page-leave' : 'page-enter'}`}
          >
            {shownPage === 'projects' ? (
              <ActivePageComponent onOpenImage={openImage} />
            ) : shownPage === 'home' ? (
              <ActivePageComponent onNavigate={handleNavigate} />
            ) : (
              <ActivePageComponent />
            )}
          </div>
        </main>
      </div>
    </>
  )
}

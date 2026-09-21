import { useCallback, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
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

const PAGES = {
  home: Home,
  'tech stack': TechStack,
  projects: Projects,
  about: About,
  experience: Experience,
  contact: Contact,
}

export default function App() {
  const [activePage, setActivePage] = useState('home')
  const [modalImage, setModalImage] = useState(null)
  const [modalAlt, setModalAlt] = useState('')
  const [securityDemoOpen, setSecurityDemoOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  // Alt+K opens the security awareness demo.
  useAltHotkey('KeyK', useCallback(() => setSecurityDemoOpen((open) => !open), []))

  const handleNavigate = (pageId) => {
    setActivePage(pageId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openImage = (src, alt) => {
    setModalImage(src)
    setModalAlt(alt)
  }

  const closeImage = () => setModalImage(null)

  const ActivePageComponent = PAGES[activePage] ?? Home

  return (
    <>
      <ImageModal image={modalImage} alt={modalAlt} onClose={closeImage} />

      <SecurityDemoChat
        open={securityDemoOpen}
        onClose={() => setSecurityDemoOpen(false)}
      />

      <div className="flex min-h-screen flex-col bg-bg text-text antialiased transition-colors duration-250">
        <Navbar
          activePage={activePage}
          onNavigate={handleNavigate}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 md:px-8">
          <div key={activePage} className="w-full animate-fade-in">
            {activePage === 'projects' ? (
              <ActivePageComponent onOpenImage={openImage} />
            ) : activePage === 'home' ? (
              <ActivePageComponent onNavigate={handleNavigate} theme={theme} />
            ) : (
              <ActivePageComponent />
            )}
          </div>
        </main>

        <Footer onOpenSecurityDemo={() => setSecurityDemoOpen(true)} />
      </div>
    </>
  )
}

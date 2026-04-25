import { useState, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import Sidebar             from './components/Sidebar'
import InstallPrompt       from './components/InstallPrompt'
import OfflineBanner       from './components/OfflineBanner'
import AnimatedOutlet      from './components/AnimatedOutlet'
import SplashScreen        from './components/SplashScreen'
import { useAuth }         from './contexts/AuthContext'
import { useNotificationScheduler } from './hooks/useNotifications'

const SPLASH_KEY = 'taskflow-splash-shown'

function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

export default function App() {
  const { isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Show splash once per browser session (sessionStorage resets on tab close)
  const [splashDone, setSplashDone] = useState(
    () => !!sessionStorage.getItem(SPLASH_KEY)
  )
  const handleSplashDone = useCallback(() => {
    sessionStorage.setItem(SPLASH_KEY, '1')
    setSplashDone(true)
  }, [])

  useNotificationScheduler()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Splash shown on first authenticated load each session
  if (!splashDone) return <SplashScreen onDone={handleSplashDone} />

  return (
    <div className="app-shell">
      {/* ── PWA: offline indicator (top of viewport) */}
      <OfflineBanner />

      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="main-content">
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
            <IconMenu />
          </button>
          <span className="mobile-topbar-title">TaskFlow</span>
        </div>
        <AnimatedOutlet />
      </div>

      {/* ── PWA: install banner (bottom of viewport) */}
      <InstallPrompt />

    </div>
  )
}

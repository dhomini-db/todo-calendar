import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar        from './components/Sidebar'
import InstallPrompt  from './components/InstallPrompt'
import OfflineBanner  from './components/OfflineBanner'
import { useAuth }    from './contexts/AuthContext'
import { useNotificationScheduler } from './hooks/useNotifications'

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
  useNotificationScheduler()

  if (!isAuthenticated) return <Navigate to="/login" replace />

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
        <Outlet />
      </div>

      {/* ── PWA: install banner (bottom of viewport) */}
      <InstallPrompt />
    </div>
  )
}

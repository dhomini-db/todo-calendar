import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { useAuth } from './contexts/AuthContext'
import { useMobile } from './hooks/useMobile'

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      {open ? (
        <>
          <line x1="18" y1="6"  x2="6"  y2="18" />
          <line x1="6"  y1="6"  x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3"  y1="6"  x2="21" y2="6"  />
          <line x1="3"  y1="12" x2="21" y2="12" />
          <line x1="3"  y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  )
}

export default function App() {
  const { isAuthenticated } = useAuth()
  const isMobile = useMobile()                          // JS-driven: adiciona classe .mobile
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className={`app-shell${isMobile ? ' mobile' : ''}`}>

      {/* ── Header mobile — só aparece quando isMobile=true ── */}
      {isMobile && (
        <header className="mobile-header">
          <button
            className="mobile-hamburger"
            onClick={() => setMobileNavOpen(o => !o)}
            aria-label={mobileNavOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileNavOpen}
          >
            <HamburgerIcon open={mobileNavOpen} />
          </button>
          <img src="/logo-icon.svg" alt="TaskFlow" className="mobile-logo-img" />
          <span className="mobile-logo-text">TaskFlow</span>
        </header>
      )}

      {/* ── Overlay que fecha o drawer ao tocar fora ─────── */}
      {isMobile && mobileNavOpen && (
        <div
          className="sidebar-overlay visible"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        isMobile={isMobile}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  )
}

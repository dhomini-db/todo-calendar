import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const SIDEBAR_MIN     = 200
const SIDEBAR_MAX     = 400
const SIDEBAR_DEFAULT = 260
const STORAGE_KEY     = 'sidebar-width'

/* ── SVG Icons ──────────────────────────────────────────────── */
function IconCalendar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function IconGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3"  y="3"  width="7" height="7" rx="1.5"/>
      <rect x="14" y="3"  width="7" height="7" rx="1.5"/>
      <rect x="3"  y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )
}
function IconUser() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function IconPalette() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      <circle cx="8"  cy="9.5"  r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="7"    r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="9.5"  r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}
function IconPeople() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}
function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}
function IconChevronUp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  )
}

/* ── NavItem ──────────────────────────────────────────────────── */
interface NavItemProps { to: string; icon: React.ReactNode; label: string; end?: boolean; onClick?: () => void }

function NavItem({ to, icon, label, end, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
    >
      <span className="sidebar-item-icon">{icon}</span>
      {label}
    </NavLink>
  )
}

/* ── User Menu Popup ──────────────────────────────────────────── */
interface UserMenuProps {
  onClose: () => void
  onNavigate: (path: string) => void
  onLogout: () => void
  t: (key: string) => string
}

function UserMenu({ onClose, onNavigate, onLogout, t }: UserMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div className="sidebar-user-menu" ref={ref}>
      <button className="sidebar-user-menu-item" onClick={() => { onNavigate('/personalizar'); onClose() }}>
        <IconPalette />
        {t('sidebar.menu.appearance')}
      </button>
      <button className="sidebar-user-menu-item" onClick={() => { onNavigate('/configuracoes'); onClose() }}>
        <IconSettings />
        {t('sidebar.menu.settings')}
      </button>
      <div className="sidebar-user-menu-divider" />
      <button className="sidebar-user-menu-item sidebar-user-menu-item--danger" onClick={() => { onLogout(); onClose() }}>
        <IconLogout />
        {t('sidebar.menu.logout')}
      </button>
    </div>
  )
}

/* ── Sidebar ──────────────────────────────────────────────────── */
interface SidebarProps { mobileOpen?: boolean; onMobileClose?: () => void }

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  /* ── Resize logic ─────────────────────────────────────────── */
  const [width, setWidth] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const n = parseInt(saved, 10)
      if (!isNaN(n)) return Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, n))
    }
    return SIDEBAR_DEFAULT
  })

  const dragging   = useRef(false)
  const startX     = useRef(0)
  const startW     = useRef(0)
  const currentW   = useRef(width)
  const handleRef  = useRef<HTMLDivElement>(null)

  useEffect(() => { currentW.current = width }, [width])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return
      const next = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, startW.current + e.clientX - startX.current))
      currentW.current = next
      setWidth(next)
    }
    function onUp() {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      handleRef.current?.classList.remove('dragging')
      localStorage.setItem(STORAGE_KEY, String(currentW.current))
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [])

  function startResize(e: React.MouseEvent) {
    e.preventDefault()
    dragging.current = true
    startX.current   = e.clientX
    startW.current   = width
    document.body.style.cursor     = 'col-resize'
    document.body.style.userSelect = 'none'
    handleRef.current?.classList.add('dragging')
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onMobileClose} aria-hidden="true" />
      )}

      <aside
        className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}
        style={{ width }}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/logo-icon.svg" alt="TaskFlow" className="sidebar-logo-img" />
          <span className="sidebar-logo-text">TaskFlow</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-label">{t('nav.workspace')}</p>
          <NavItem to="/"          icon={<IconCalendar />} label={t('nav.calendar')}   end onClick={onMobileClose} />
          <NavItem to="/dashboard" icon={<IconGrid />}     label={t('nav.dashboard')}      onClick={onMobileClose} />
          <NavItem to="/graficos"  icon={<IconChart />}    label={t('nav.charts')}         onClick={onMobileClose} />
          <NavItem to="/social"    icon={<IconPeople />}   label={t('nav.social')}         onClick={onMobileClose} />

          <p className="sidebar-section-label" style={{ marginTop: 12 }}>{t('nav.account')}</p>
          <NavItem to="/conta" icon={<IconUser />} label={t('nav.profile')} onClick={onMobileClose} />
        </nav>

        {/* Footer — clicável abre o menu */}
        <div className="sidebar-footer" style={{ position: 'relative' }}>
          {/* User menu popup */}
          {menuOpen && (
            <UserMenu
              onClose={() => setMenuOpen(false)}
              onNavigate={path => { navigate(path); onMobileClose?.() }}
              onLogout={handleLogout}
              t={t}
            />
          )}

          {user && (
            <button
              className={`sidebar-user-info sidebar-user-info--btn${menuOpen ? ' sidebar-user-info--active' : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu do usuário"
              aria-expanded={menuOpen}
            >
              <div className="sidebar-user-avatar">
                {user?.profileImageUrl
                  ? <img src={user.profileImageUrl} alt={user.name} className="sidebar-user-avatar-img" />
                  : initials
                }
              </div>
              <div className="sidebar-user-text">
                <p className="sidebar-user-name">{user.name}</p>
                <p className="sidebar-user-email">{user.email}</p>
              </div>
              <span className={`sidebar-user-chevron${menuOpen ? ' sidebar-user-chevron--open' : ''}`}>
                <IconChevronUp />
              </span>
            </button>
          )}
        </div>

        {/* Drag handle */}
        <div
          ref={handleRef}
          className="sidebar-resize-handle"
          onMouseDown={startResize}
          aria-hidden="true"
        />
      </aside>
    </>
  )
}

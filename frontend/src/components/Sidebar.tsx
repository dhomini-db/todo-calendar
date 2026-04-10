import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">◈</span>
        <span className="sidebar-logo-text">TodoCalendar</span>
      </div>

      <nav className="sidebar-nav">
        <button className="sidebar-item active">
          <span className="sidebar-item-icon">▦</span>
          Calendário
        </button>
      </nav>

      <div className="sidebar-footer">
        {user && (
          <>
            <p className="sidebar-user-name">{user.name}</p>
            <p className="sidebar-user-email">{user.email}</p>
          </>
        )}
        <button className="sidebar-logout" onClick={handleLogout}>
          <span style={{ fontSize: 14 }}>⎋</span>
          Sair
        </button>
      </div>
    </aside>
  )
}

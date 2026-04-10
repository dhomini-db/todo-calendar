import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { useAuth } from './contexts/AuthContext'

export default function App() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  )
}

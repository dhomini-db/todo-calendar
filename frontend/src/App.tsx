import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Calendar  from './components/Calendar'
import Sidebar   from './components/Sidebar'
import TaskPanel from './components/TaskPanel'
import { useAuth } from './contexts/AuthContext'

export default function App() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const today = new Date()
  const [selectedDate,  setSelectedDate]  = useState(today)
  const [currentMonth,  setCurrentMonth]  = useState(today)

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="calendar-area">
          <h1 className="page-title">Calendário</h1>
          <p className="page-sub">Clique em um dia para gerenciar suas tarefas</p>
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            currentMonth={currentMonth}
            onChangeMonth={setCurrentMonth}
          />
        </div>
        <div className="panel-area">
          <TaskPanel selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  )
}

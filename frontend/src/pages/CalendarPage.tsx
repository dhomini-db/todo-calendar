import { useState } from 'react'
import Calendar     from '../components/Calendar'
import TaskPanel    from '../components/TaskPanel'
import StreakBadge  from '../components/StreakBadge'

export default function CalendarPage() {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [currentMonth, setCurrentMonth] = useState(today)

  return (
    <>
      <div className="calendar-area">
        <h1 className="page-title">Calendário</h1>
        <p className="page-sub">Clique em um dia para gerenciar suas tarefas</p>
        <StreakBadge />
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
    </>
  )
}

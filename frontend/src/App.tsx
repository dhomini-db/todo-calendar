import { useState } from 'react'
import Calendar from './components/Calendar'
import Sidebar from './components/Sidebar'
import TaskPanel from './components/TaskPanel'

export default function App() {
  const [selectedDate, setSelectedDate]   = useState(new Date())
  const [currentMonth, setCurrentMonth]   = useState(new Date())

  return (
    <div className="flex min-h-screen bg-[#191919]">
      {/* Sidebar */}
      <Sidebar currentView="calendar" />

      {/* Conteúdo principal */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-auto">
        <h1 className="text-2xl font-bold text-white tracking-tight">Calendário</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Calendário — ocupa mais espaço */}
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={date => {
              setSelectedDate(date)
              setCurrentMonth(date)
            }}
            currentMonth={currentMonth}
            onChangeMonth={setCurrentMonth}
          />

          {/* Painel de tarefas do dia selecionado */}
          <TaskPanel selectedDate={selectedDate} />
        </div>
      </main>
    </div>
  )
}

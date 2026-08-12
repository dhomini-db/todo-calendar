import { useEffect, useState } from 'react'
import Calendar    from '../components/Calendar'
import TaskPanel   from '../components/TaskPanel'
import StreakBadge from '../components/StreakBadge'
import { useLanguage } from '../contexts/LanguageContext'
import { useTasksByDate } from '../hooks/useTasks'
import { format } from 'date-fns'

export default function CalendarPage() {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [currentMonth, setCurrentMonth] = useState(today)
  const { t } = useLanguage()
  const [knownDayScores, setKnownDayScores] = useState<Record<string, { percentage: number; total: number }>>(() => {
    try { return JSON.parse(localStorage.getItem('taskflow-calendar-scores') ?? '{}') }
    catch { return {} }
  })
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')
  const { data: selectedTasks = [] } = useTasksByDate(selectedDateKey)
  const positiveTasks = selectedTasks.filter(task => task.type === 'POSITIVE')
  const checkedNegatives = selectedTasks.filter(task => task.type === 'NEGATIVE' && task.interacted && task.completed)
  const scoreBase = positiveTasks.length + checkedNegatives.length
  const selectedPercentage = scoreBase > 0
    ? Math.round((positiveTasks.filter(task => task.interacted && task.completed).length / scoreBase) * 100)
    : null

  useEffect(() => {
    if (selectedPercentage == null || selectedTasks.length === 0) return
    setKnownDayScores(current => {
      const next = { ...current, [selectedDateKey]: { percentage: selectedPercentage, total: selectedTasks.length } }
      localStorage.setItem('taskflow-calendar-scores', JSON.stringify(next))
      return next
    })
  }, [selectedDateKey, selectedPercentage, selectedTasks.length])

  return (
    <>
      <div className="calendar-area">
        <h1 className="page-title">{t('cal.title')}</h1>
        <p className="page-sub">{t('cal.sub')}</p>
        <StreakBadge />
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          currentMonth={currentMonth}
          onChangeMonth={setCurrentMonth}
          selectedDayScore={selectedPercentage}
          selectedDayTotal={selectedTasks.length}
          knownDayScores={knownDayScores}
        />
      </div>
      <div className="panel-area">
        <TaskPanel selectedDate={selectedDate} />
      </div>
    </>
  )
}

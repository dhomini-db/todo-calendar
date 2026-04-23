import { useState } from 'react'
import Calendar    from '../components/Calendar'
import TaskPanel   from '../components/TaskPanel'
import StreakBadge from '../components/StreakBadge'
import { useLanguage } from '../contexts/LanguageContext'

export default function CalendarPage() {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [currentMonth, setCurrentMonth] = useState(today)
  const { t } = useLanguage()

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
        />
      </div>
      <div className="panel-area">
        <TaskPanel selectedDate={selectedDate} />
      </div>
    </>
  )
}

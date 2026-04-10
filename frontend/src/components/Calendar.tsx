import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useMonthSummary } from '../hooks/useTasks'
import type { DaySummary } from '../types'

interface CalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  currentMonth: Date
  onChangeMonth: (date: Date) => void
}

function colorClass(summary: DaySummary | undefined): string {
  if (!summary || summary.total === 0) return ''
  switch (summary.color) {
    case 'GREEN':       return 'day-green'
    case 'LIGHT_GREEN': return 'day-lightgreen'
    case 'YELLOW':      return 'day-yellow'
    case 'RED':         return 'day-red'
    default:            return ''
  }
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function Calendar({ selectedDate, onSelectDate, currentMonth, onChangeMonth }: CalendarProps) {
  const year  = currentMonth.getFullYear()
  const month = currentMonth.getMonth() + 1

  const { data: summary = {} } = useMonthSummary(year, month)

  const firstDay    = startOfMonth(currentMonth)
  const lastDay     = endOfMonth(currentMonth)
  const days        = eachDayOfInterval({ start: firstDay, end: lastDay })
  const startOffset = getDay(firstDay)
  const monthLabel  = format(currentMonth, 'MMMM yyyy', { locale: ptBR })

  return (
    <div className="calendar-wrap">
      <div className="calendar-header">
        <button className="cal-nav" onClick={() => onChangeMonth(subMonths(currentMonth, 1))} aria-label="Mês anterior">‹</button>
        <h2 className="calendar-month">{monthLabel}</h2>
        <button className="cal-nav" onClick={() => onChangeMonth(addMonths(currentMonth, 1))} aria-label="Próximo mês">›</button>
      </div>

      <div className="cal-weekdays">
        {WEEK_DAYS.map(d => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}
      </div>

      <div className="cal-grid">
        {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}

        {days.map(day => {
          const key        = format(day, 'yyyy-MM-dd')
          const daySumm    = summary[key]
          const isSelected = isSameDay(day, selectedDate)
          const isTodayDay = isToday(day)
          const color      = colorClass(daySumm)

          return (
            <button
              key={key}
              onClick={() => onSelectDate(day)}
              className={[
                'cal-day',
                color,
                isSelected ? 'selected' : '',
                isTodayDay && !color ? 'today' : '',
              ].filter(Boolean).join(' ')}
              title={daySumm ? `${daySumm.completed}/${daySumm.total} (${daySumm.percentage}%)` : undefined}
            >
              {format(day, 'd')}
              {daySumm && daySumm.total > 0 && (
                <span className="cal-day-pct">{Math.round(daySumm.percentage)}%</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="cal-legend">
        <div className="legend-item"><div className="legend-dot" style={{ background: 'rgba(74,222,128,0.5)' }} />100%</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'rgba(52,211,153,0.5)' }} />70–99%</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'rgba(251,191,36,0.5)' }} />50–69%</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'rgba(248,113,113,0.5)' }} />{'< 50%'}</div>
      </div>
    </div>
  )
}

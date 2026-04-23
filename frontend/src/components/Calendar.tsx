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
import { ptBR, enUS } from 'date-fns/locale'
import { useMonthSummary } from '../hooks/useTasks'
import { useLanguage } from '../contexts/LanguageContext'
import type { DaySummary } from '../types'

interface CalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  currentMonth: Date
  onChangeMonth: (date: Date) => void
}

/** Returns CSS class + bar colour for a day */
function dayStyle(summary: DaySummary | undefined): { cls: string; bar: string } {
  if (!summary || summary.color === 'NONE') return { cls: '', bar: '' }
  switch (summary.color) {
    case 'GREEN':       return { cls: 'day-green',      bar: '#4ade80' }
    case 'LIGHT_GREEN': return { cls: 'day-lightgreen', bar: '#34d399' }
    case 'YELLOW':      return { cls: 'day-yellow',     bar: '#fbbf24' }
    case 'RED':         return { cls: 'day-red',        bar: '#f87171' }
    default:            return { cls: '',               bar: '' }
  }
}

// Sun-first order matching date-fns getDay() (0 = Sunday)
const WD_KEYS = [
  'cal.wd.sun',
  'cal.wd.mon',
  'cal.wd.tue',
  'cal.wd.wed',
  'cal.wd.thu',
  'cal.wd.fri',
  'cal.wd.sat',
]

export default function Calendar({ selectedDate, onSelectDate, currentMonth, onChangeMonth }: CalendarProps) {
  const { lang, t } = useLanguage()
  const locale = lang === 'en' ? enUS : ptBR

  const year  = currentMonth.getFullYear()
  const month = currentMonth.getMonth() + 1

  const { data: summary = {} } = useMonthSummary(year, month)

  const firstDay    = startOfMonth(currentMonth)
  const lastDay     = endOfMonth(currentMonth)
  const days        = eachDayOfInterval({ start: firstDay, end: lastDay })
  const startOffset = getDay(firstDay)
  const monthLabel  = format(currentMonth, 'MMMM yyyy', { locale })

  return (
    <div className="calendar-wrap">
      {/* Header */}
      <div className="calendar-header">
        <button
          className="cal-nav"
          onClick={() => onChangeMonth(subMonths(currentMonth, 1))}
          aria-label={t('cal.nav.prev')}
        >‹</button>
        <h2 className="calendar-month" style={{ textTransform: 'capitalize' }}>{monthLabel}</h2>
        <button
          className="cal-nav"
          onClick={() => onChangeMonth(addMonths(currentMonth, 1))}
          aria-label={t('cal.nav.next')}
        >›</button>
      </div>

      {/* Weekday labels */}
      <div className="cal-weekdays">
        {WD_KEYS.map(key => (
          <div key={key} className="cal-weekday">{t(key)}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="cal-grid">
        {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}

        {days.map(day => {
          const key        = format(day, 'yyyy-MM-dd')
          const daySumm    = summary[key]
          const isSelected = isSameDay(day, selectedDate)
          const isTodayDay = isToday(day)
          const { cls, bar } = dayStyle(daySumm)
          const hasTasks   = daySumm && daySumm.color !== 'NONE'
          const pct        = hasTasks ? Math.round(daySumm!.percentage) : 0

          return (
            <button
              key={key}
              onClick={() => onSelectDate(day)}
              className={[
                'cal-day',
                cls,
                isSelected ? 'selected' : '',
                isTodayDay && !cls ? 'today' : '',
              ].filter(Boolean).join(' ')}
              title={hasTasks ? `${daySumm!.completed}/${daySumm!.total} · ${pct}%` : undefined}
            >
              <span className="cal-day-num">{format(day, 'd')}</span>

              {hasTasks && (
                <>
                  <span className="cal-day-pct">{pct}%</span>
                  <div className="cal-day-bar-track">
                    <div
                      className="cal-day-bar-fill"
                      style={{ width: `${pct}%`, background: bar }}
                    />
                  </div>
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <div className="legend-item"><div className="legend-dot" style={{ background: '#4ade80' }} />100%</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#34d399' }} />70–99%</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#fbbf24' }} />50–69%</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#f87171' }} />{'< 50%'}</div>
      </div>
    </div>
  )
}

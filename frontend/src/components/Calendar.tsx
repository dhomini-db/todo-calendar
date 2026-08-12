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
import type { CSSProperties } from 'react'

interface CalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  currentMonth: Date
  onChangeMonth: (date: Date) => void
  selectedDayScore?: number | null
  selectedDayTotal?: number
}

/** Returns CSS class + bar colour for a day */
function dayStyle(summary: DaySummary | undefined): { cls: string; bar: string } {
  if (!summary || summary.total <= 0) return { cls: '', bar: '' }
  if (summary.percentage >= 100) return { cls: 'day-green', bar: '#4ade80' }
  if (summary.percentage >= 70) return { cls: 'day-lightgreen', bar: '#34d399' }
  if (summary.percentage >= 50) return { cls: 'day-yellow', bar: '#fbbf24' }
  if (summary.percentage < 50) return { cls: 'day-red', bar: '#9f1239' }
  switch (summary.color) {
    case 'GREEN':       return { cls: 'day-green',      bar: '#4ade80' }
    case 'LIGHT_GREEN': return { cls: 'day-lightgreen', bar: '#34d399' }
    case 'YELLOW':      return { cls: 'day-yellow',     bar: '#fbbf24' }
    case 'RED':         return { cls: 'day-red',        bar: '#9f1239' }
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

export default function Calendar({ selectedDate, onSelectDate, currentMonth, onChangeMonth, selectedDayScore, selectedDayTotal = 0 }: CalendarProps) {
  const { lang, t } = useLanguage()
  const locale = lang === 'en' ? enUS : ptBR

  const year  = currentMonth.getFullYear()
  const month = currentMonth.getMonth() + 1

  const { data: summary = {} } = useMonthSummary(year, month)
  const normalizeBackendDate = (rawDate: unknown, fallback = '') => {
    if (Array.isArray(rawDate)) return `${rawDate[0]}-${String(rawDate[1]).padStart(2, '0')}-${String(rawDate[2]).padStart(2, '0')}`
    if (rawDate && typeof rawDate === 'object') {
      const value = rawDate as Record<string, number>
      const y = value.year
      const m = value.month ?? value.monthValue
      const d = value.day ?? value.dayOfMonth
      if (y && m && d) return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
    const text = String(rawDate ?? fallback)
    const match = text.match(/\d{4}-\d{2}-\d{2}/)
    return match?.[0] ?? fallback
  }
  const summaryByDate = Object.entries(summary).reduce<Record<string, DaySummary>>((result, [entryKey, day]) => {
    const normalizedDate = normalizeBackendDate(day.date as unknown, entryKey)
    if (normalizedDate) result[normalizedDate] = day
    return result
  }, {})

  const firstDay    = startOfMonth(currentMonth)
  const lastDay     = endOfMonth(currentMonth)
  const days        = eachDayOfInterval({ start: firstDay, end: lastDay })
  const startOffset = getDay(firstDay)
  const monthLabel  = format(currentMonth, 'MMMM yyyy', { locale })
  const planningDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(selectedDate)
    date.setDate(selectedDate.getDate() + index)
    const key = format(date, 'yyyy-MM-dd')
    return { date, key, summary: summaryByDate[key] }
  })

  return (
    <>
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
          const monthlyDay = summaryByDate[key]
          const isSelected = isSameDay(day, selectedDate)
          const daySumm = isSelected && selectedDayScore != null && selectedDayTotal > 0
            ? {
                date: key,
                total: selectedDayTotal,
                completed: Math.round((selectedDayScore / 100) * selectedDayTotal),
                percentage: selectedDayScore,
                color: selectedDayScore >= 100 ? 'GREEN' : selectedDayScore >= 70 ? 'LIGHT_GREEN' : selectedDayScore >= 50 ? 'YELLOW' : 'RED',
              } as DaySummary
            : monthlyDay
          const isTodayDay = isToday(day)
          const { cls, bar } = dayStyle(daySumm)
          const hasTasks = Boolean(
            daySumm &&
            daySumm.total > 0 &&
            (daySumm.percentage > 0 || isSelected),
          )
          const pct        = hasTasks ? Math.round(daySumm!.percentage) : 0

          return (
            <button
              key={`${key}-${pct}`}
              onClick={() => onSelectDate(day)}
              className={[
                'cal-day',
                hasTasks ? 'has-progress-ring' : '',
                cls,
                isSelected ? 'selected' : '',
                isTodayDay && !cls ? 'today' : '',
              ].filter(Boolean).join(' ')}
              style={hasTasks ? {
                '--day-progress': `${pct * 3.6}deg`,
                '--day-progress-color': bar,
              } as CSSProperties : undefined}
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
        <div className="legend-item"><div className="legend-dot" style={{ background: '#9f1239' }} />{'< 50%'}</div>
      </div>
    </div>
    <section className="calendar-week-planner" aria-label={lang === 'en' ? 'Next 7 days' : 'Próximos 7 dias'}>
      <div className="week-planner-heading">
        <div><span>{lang === 'en' ? 'Planning' : 'Planejamento'}</span><strong>{lang === 'en' ? 'Next 7 days' : 'Próximos 7 dias'}</strong></div>
        <p>{lang === 'en' ? 'Select a day to organize it' : 'Selecione um dia para organizá-lo'}</p>
      </div>
      <div className="week-planner-days">
        {planningDays.map(({ date, key, summary: day }) => {
          const pct = day?.total ? Math.round(day.percentage) : null
          const style = dayStyle(day)
          return <button key={key} type="button" className={`week-planner-day ${style.cls} ${isSameDay(date, selectedDate) ? 'active' : ''}`} onClick={() => { onSelectDate(date); if (date.getMonth() !== currentMonth.getMonth()) onChangeMonth(date) }}>
            <span>{format(date, 'EEE', { locale }).replace('.', '')}</span>
            <strong>{format(date, 'd')}</strong>
            <small>{pct == null ? (lang === 'en' ? 'Free' : 'Livre') : `${day!.total} ${day!.total === 1 ? (lang === 'en' ? 'task' : 'tarefa') : (lang === 'en' ? 'tasks' : 'tarefas')}`}</small>
            {pct != null && <em>{pct}%</em>}
          </button>
        })}
      </div>
    </section>
    </>
  )
}

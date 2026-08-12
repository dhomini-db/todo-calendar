import { format } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import { useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useTasksByDate, useCreateTask, useCreateRecurringTask } from '../hooks/useTasks'
import { useLanguage } from '../contexts/LanguageContext'
import type { TaskType, RecurrenceType } from '../types'
import TaskItem from './TaskItem'
import { composeTaskTitle, parseTaskMetadata, timeToMinutes } from '../utils/taskMetadata'

interface TaskPanelProps {
  selectedDate: Date
}

// ── Helpers ────────────────────────────────────────────────────

function progressColor(pct: number): string {
  if (pct === 100) return '#4ade80'
  if (pct >= 70)   return '#34d399'
  if (pct >= 50)   return '#fbbf24'
  if (pct > 0)     return '#f87171'
  return 'var(--line)'
}

function calcScore(tasks: { completed: boolean; interacted: boolean; type: TaskType }[]) {
  if (tasks.length === 0) return 0
  const positives        = tasks.filter(t => t.type === 'POSITIVE')
  const checkedNegatives = tasks.filter(t => t.type === 'NEGATIVE' && t.interacted && t.completed)
  const denominator      = positives.length + checkedNegatives.length
  if (denominator === 0) return 0
  const good = positives.filter(t => t.interacted && t.completed).length
  return Math.round((good / denominator) * 100)
}

// Mon–Sun ordered weekday values (matches rec.day.* keys)
const WEEK_DAY_VALUES = ['1', '2', '3', '4', '5', '6', '7']

// ── Icons ──────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5"  y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function RepeatIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  )
}

// ── Component ──────────────────────────────────────────────────

export default function TaskPanel({ selectedDate }: TaskPanelProps) {
  const { lang, t } = useLanguage()
  const locale = lang === 'en' ? enUS : ptBR

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const { data: tasks = [], isLoading } = useTasksByDate(dateStr)
  const createTask      = useCreateTask(dateStr)
  const createRecurring = useCreateRecurringTask(dateStr)

  // Form state
  const [showForm,       setShowForm]       = useState(false)
  const [title,          setTitle]          = useState('')
  const [description,    setDescription]    = useState('')
  const [taskType,       setTaskType]       = useState<TaskType>('POSITIVE')
  const [isRecurring,    setIsRecurring]    = useState(false)
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('DAILY')
  const [daysOfWeek,     setDaysOfWeek]     = useState<string[]>([])
  const [startTime,      setStartTime]      = useState('')
  const [endTime,        setEndTime]        = useState('')

  const orderedTasks = [...tasks].sort((a, b) =>
    timeToMinutes(parseTaskMetadata(a.title).startTime) - timeToMinutes(parseTaskMetadata(b.title).startTime),
  )
  const positiveTasks   = orderedTasks.filter(t => t.type === 'POSITIVE')
  const negativeTasks   = orderedTasks.filter(t => t.type === 'NEGATIVE')

  const interactedTasks = tasks.filter(t => t.interacted)
  const pct             = calcScore(tasks)
  const goodCount       = positiveTasks.filter(t => t.interacted && t.completed).length
  const pendingCount    = tasks.filter(t => !t.completed).length
  const nextTask        = orderedTasks.find(t => !t.completed)
  const nextMetadata    = nextTask ? parseTaskMetadata(nextTask.title) : null
  const plannedMinutes  = tasks.reduce((total, task) => {
    const { startTime: start, endTime: end } = parseTaskMetadata(task.title)
    if (!start || !end) return total
    const duration = timeToMinutes(end) - timeToMinutes(start)
    return total + Math.max(0, duration)
  }, 0)
  const plannedLabel = plannedMinutes > 0
    ? `${Math.floor(plannedMinutes / 60)}h${plannedMinutes % 60 ? String(plannedMinutes % 60).padStart(2, '0') : ''}`
    : `${pct}%`

  // Date header — locale-aware
  const dayName   = format(selectedDate, 'EEEE', { locale })
  const dateLabel = lang === 'en'
    ? format(selectedDate, 'MMMM d', { locale: enUS })
    : format(selectedDate, "d 'de' MMMM", { locale: ptBR })

  function toggleDay(val: string) {
    setDaysOfWeek(prev =>
      prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val].sort(),
    )
  }

  function moveInsightAura(event: ReactPointerEvent<HTMLDivElement>) {
    const card = event.currentTarget
    const bounds = card.getBoundingClientRect()
    card.style.setProperty('--aura-x', `${event.clientX - bounds.left}px`)
    card.style.setProperty('--aura-y', `${event.clientY - bounds.top}px`)
  }

  function handleSubmit() {
    if (!title.trim()) return
    const storedTitle = composeTaskTitle(title, startTime, endTime)

    if (isRecurring) {
      createRecurring.mutate(
        {
          title:         storedTitle,
          description:   description.trim() || undefined,
          type:          taskType,
          recurrenceType,
          daysOfWeek:    recurrenceType === 'WEEKLY' ? daysOfWeek.join(',') : undefined,
        },
        { onSuccess: resetForm },
      )
    } else {
      createTask.mutate(
        { title: storedTitle, description: description.trim() || undefined, date: dateStr, type: taskType },
        { onSuccess: resetForm },
      )
    }
  }

  function resetForm() {
    setShowForm(false)
    setTitle('')
    setDescription('')
    setTaskType('POSITIVE')
    setIsRecurring(false)
    setRecurrenceType('DAILY')
    setDaysOfWeek([])
    setStartTime('')
    setEndTime('')
  }

  const isPending = createTask.isPending || createRecurring.isPending
  const canSubmit = title.trim() &&
    (!isRecurring || recurrenceType === 'DAILY' || daysOfWeek.length > 0)

  // Weekly hint: "Aparecerá toda Seg, Ter" / "Will appear every Mon, Tue"
  const selectedDayLabels = daysOfWeek.map(v => t(`rec.day.${v}`)).join(', ')

  return (
    <div className="task-panel">
      {/* Header */}
      <div className="panel-header">
        <p className="panel-date" style={{ textTransform: 'capitalize' }}>
          {dayName} · {dateLabel}
        </p>
        <p className="panel-count">
          {goodCount}{' '}
          <span>/ {positiveTasks.length} {positiveTasks.length === 1 ? t('cal.panel.task') : t('cal.panel.tasks')}</span>
        </p>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, backgroundColor: progressColor(pct) }}
          />
        </div>
        {interactedTasks.length > 0 && (
          <p className="panel-score-label">{pct}% {t('cal.panel.score')}</p>
        )}
        <div className="day-insights" aria-label="Resumo do dia">
          <div className="day-insight-card" onPointerMove={moveInsightAura}>
            <strong>{plannedLabel}</strong>
            <span>{plannedMinutes > 0 ? 'tempo planejado' : 'progresso do dia'}</span>
          </div>
          <div className="day-insight-card day-insight-next" onPointerMove={moveInsightAura}>
            <span>{nextTask ? 'Próxima atividade' : 'Tudo concluído'}</span>
            <strong>{nextMetadata?.startTime ? `${nextMetadata.startTime} · ` : ''}{nextMetadata?.title ?? 'Bom trabalho!'}</strong>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="panel-body">
        {isLoading && (
          <div className="panel-loading" aria-label={t('cal.panel.loading')} role="status">
            <div className="panel-spinner" />
          </div>
        )}

        {!isLoading && tasks.length === 0 && (
          <p className="panel-empty">{t('cal.panel.empty')}</p>
        )}

        {!isLoading && tasks.length > 0 && (
          <div className="task-list-heading">
            <span>{lang === 'en' ? 'Today’s activities' : 'Atividades do dia'}</span>
            <small>
              {pendingCount === 0
                ? (lang === 'en' ? 'All done' : 'Tudo concluído')
                : `${pendingCount} ${lang === 'en' ? 'pending' : pendingCount === 1 ? 'pendente' : 'pendentes'}`}
            </small>
          </div>
        )}

        {positiveTasks.map(task => (
          <TaskItem key={task.id} task={task} date={dateStr} />
        ))}

        {positiveTasks.length > 0 && negativeTasks.length > 0 && (
          <div className="task-type-divider">
            <span>{t('cal.panel.neg_divider')}</span>
          </div>
        )}

        {negativeTasks.map(task => (
          <TaskItem key={task.id} task={task} date={dateStr} />
        ))}
      </div>

      {/* Footer — form or add button */}
      <div className="panel-footer">
        {showForm ? (
          <div className="add-form">
            {/* Positive / Negative type */}
            <div className="type-toggle">
              <button
                className={`type-btn positive ${taskType === 'POSITIVE' ? 'active' : ''}`}
                onClick={() => setTaskType('POSITIVE')}
                type="button"
              >
                {t('cal.panel.positive')}
              </button>
              <button
                className={`type-btn negative ${taskType === 'NEGATIVE' ? 'active' : ''}`}
                onClick={() => setTaskType('NEGATIVE')}
                type="button"
              >
                {t('cal.panel.negative')}
              </button>
            </div>

            {taskType === 'NEGATIVE' && (
              <p className="type-hint">{t('cal.panel.neg_hint')}</p>
            )}

            {/* Title */}
            <input
              className="add-input"
              placeholder={t('cal.panel.name_ph')}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isRecurring && handleSubmit()}
              autoFocus
              aria-label={t('cal.panel.name_ph')}
            />

            {/* Description */}
            <textarea
              className="add-input"
              placeholder={t('cal.panel.desc_ph')}
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              aria-label={t('cal.panel.desc_ph')}
            />

            <div className="schedule-fields">
              <label>
                <span>Início</span>
                <input className="add-input" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </label>
              <label>
                <span>Fim</span>
                <input className="add-input" type="time" value={endTime} min={startTime || undefined} onChange={e => setEndTime(e.target.value)} />
              </label>
            </div>

            {/* Recurrence toggle */}
            <label className="recurrence-toggle-row">
              <input
                type="checkbox"
                className="recurrence-checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
              />
              <span className="recurrence-toggle-icon"><RepeatIcon /></span>
              <span className="recurrence-toggle-label">{t('cal.panel.recurring')}</span>
            </label>

            {/* Recurrence options */}
            {isRecurring && (
              <div className="recurrence-options">
                <div className="type-toggle">
                  <button
                    type="button"
                    className={`type-btn positive ${recurrenceType === 'DAILY' ? 'active' : ''}`}
                    onClick={() => setRecurrenceType('DAILY')}
                  >
                    {t('cal.panel.daily')}
                  </button>
                  <button
                    type="button"
                    className={`type-btn positive ${recurrenceType === 'WEEKLY' ? 'active' : ''}`}
                    onClick={() => setRecurrenceType('WEEKLY')}
                  >
                    {t('cal.panel.weekly')}
                  </button>
                </div>

                {recurrenceType === 'WEEKLY' && (
                  <div className="weekday-picker">
                    {WEEK_DAY_VALUES.map(v => (
                      <button
                        key={v}
                        type="button"
                        className={`weekday-btn ${daysOfWeek.includes(v) ? 'active' : ''}`}
                        onClick={() => toggleDay(v)}
                      >
                        {t(`rec.day.${v}`)}
                      </button>
                    ))}
                  </div>
                )}

                <p className="type-hint">
                  {recurrenceType === 'DAILY'
                    ? t('cal.panel.hint.daily')
                    : daysOfWeek.length === 0
                      ? t('cal.panel.hint.wk_empty')
                      : `${t('cal.panel.hint.weekly')} ${selectedDayLabels}`
                  }
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="add-form-actions">
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!canSubmit || isPending}
              >
                {isPending
                  ? t('cal.panel.saving')
                  : isRecurring
                    ? t('cal.panel.create')
                    : t('cal.panel.add')
                }
              </button>
              <button className="btn-ghost" onClick={resetForm}>{t('common.cancel')}</button>
            </div>
          </div>
        ) : (
          <button className="add-btn" onClick={() => setShowForm(true)}>
            <PlusIcon />
            {t('cal.panel.new_task')}
          </button>
        )}
      </div>
    </div>
  )
}

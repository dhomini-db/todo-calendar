import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { useTasksByDate, useCreateTask, useCreateRecurringTask } from '../hooks/useTasks'
import type { TaskType, RecurrenceType } from '../types'
import TaskItem from './TaskItem'

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
  const interacted = tasks.filter(t => t.interacted)
  if (interacted.length === 0) return 0
  const good = interacted.filter(t =>
    (t.type === 'POSITIVE' && t.completed) ||
    (t.type === 'NEGATIVE' && !t.completed),
  ).length
  return Math.round((good / interacted.length) * 100)
}

const WEEK_DAYS = [
  { value: '1', label: 'Seg' },
  { value: '2', label: 'Ter' },
  { value: '3', label: 'Qua' },
  { value: '4', label: 'Qui' },
  { value: '5', label: 'Sex' },
  { value: '6', label: 'Sáb' },
  { value: '7', label: 'Dom' },
]

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

  // Score — baseado apenas em tarefas com interação do usuário
  const interactedTasks = tasks.filter(t => t.interacted)
  const pct       = calcScore(tasks)
  const goodCount = interactedTasks.filter(t =>
    (t.type === 'POSITIVE' && t.completed) ||
    (t.type === 'NEGATIVE' && !t.completed),
  ).length

  const dayName   = format(selectedDate, "EEEE", { locale: ptBR })
  const dateLabel = format(selectedDate, "d 'de' MMMM", { locale: ptBR })

  function toggleDay(val: string) {
    setDaysOfWeek(prev =>
      prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val].sort(),
    )
  }

  function handleSubmit() {
    if (!title.trim()) return

    if (isRecurring) {
      // Cria template → backend auto-gera a instância do dia
      createRecurring.mutate(
        {
          title:         title.trim(),
          description:   description.trim() || undefined,
          type:          taskType,
          recurrenceType,
          daysOfWeek:    recurrenceType === 'WEEKLY' ? daysOfWeek.join(',') : undefined,
        },
        { onSuccess: resetForm },
      )
    } else {
      // Tarefa avulsa
      createTask.mutate(
        { title: title.trim(), description: description.trim() || undefined, date: dateStr, type: taskType },
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
  }

  const isPending = createTask.isPending || createRecurring.isPending
  const canSubmit = title.trim() &&
    (!isRecurring || recurrenceType === 'DAILY' || daysOfWeek.length > 0)

  const positiveTasks = tasks.filter(t => t.type === 'POSITIVE')
  const negativeTasks = tasks.filter(t => t.type === 'NEGATIVE')

  return (
    <div className="task-panel">
      {/* Header */}
      <div className="panel-header">
        <p className="panel-date" style={{ textTransform: 'capitalize' }}>
          {dayName} · {dateLabel}
        </p>
        <p className="panel-count">
          {goodCount} <span>/ {interactedTasks.length} {interactedTasks.length === 1 ? 'interagida' : 'interagidas'}</span>
        </p>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, backgroundColor: progressColor(pct) }}
          />
        </div>
        {interactedTasks.length > 0 && (
          <p className="panel-score-label">{pct}% de boas escolhas hoje</p>
        )}
      </div>

      {/* Task list */}
      <div className="panel-body">
        {isLoading && (
          <div className="panel-loading" aria-label="Carregando tarefas" role="status">
            <div className="panel-spinner" />
          </div>
        )}

        {!isLoading && tasks.length === 0 && (
          <p className="panel-empty">Nenhuma tarefa para este dia.</p>
        )}

        {positiveTasks.map(task => (
          <TaskItem key={task.id} task={task} date={dateStr} />
        ))}

        {positiveTasks.length > 0 && negativeTasks.length > 0 && (
          <div className="task-type-divider">
            <span>Hábitos a evitar</span>
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
            {/* Tipo positiva/negativa */}
            <div className="type-toggle">
              <button
                className={`type-btn positive ${taskType === 'POSITIVE' ? 'active' : ''}`}
                onClick={() => setTaskType('POSITIVE')}
                type="button"
              >
                ↑ Positiva
              </button>
              <button
                className={`type-btn negative ${taskType === 'NEGATIVE' ? 'active' : ''}`}
                onClick={() => setTaskType('NEGATIVE')}
                type="button"
              >
                ↓ Negativa
              </button>
            </div>

            {taskType === 'NEGATIVE' && (
              <p className="type-hint">Evitar esse hábito conta como boa escolha</p>
            )}

            {/* Título */}
            <input
              className="add-input"
              placeholder="Nome da tarefa"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isRecurring && handleSubmit()}
              autoFocus
              aria-label="Nome da tarefa"
            />

            {/* Descrição */}
            <textarea
              className="add-input"
              placeholder="Descrição (opcional)"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              aria-label="Descrição da tarefa"
            />

            {/* Toggle recorrência */}
            <label className="recurrence-toggle-row">
              <input
                type="checkbox"
                className="recurrence-checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
              />
              <span className="recurrence-toggle-icon"><RepeatIcon /></span>
              <span className="recurrence-toggle-label">Tornar tarefa recorrente</span>
            </label>

            {/* Opções de recorrência */}
            {isRecurring && (
              <div className="recurrence-options">
                <div className="type-toggle">
                  <button
                    type="button"
                    className={`type-btn positive ${recurrenceType === 'DAILY' ? 'active' : ''}`}
                    onClick={() => setRecurrenceType('DAILY')}
                  >
                    Diário
                  </button>
                  <button
                    type="button"
                    className={`type-btn positive ${recurrenceType === 'WEEKLY' ? 'active' : ''}`}
                    onClick={() => setRecurrenceType('WEEKLY')}
                  >
                    Semanal
                  </button>
                </div>

                {recurrenceType === 'WEEKLY' && (
                  <div className="weekday-picker">
                    {WEEK_DAYS.map(d => (
                      <button
                        key={d.value}
                        type="button"
                        className={`weekday-btn ${daysOfWeek.includes(d.value) ? 'active' : ''}`}
                        onClick={() => toggleDay(d.value)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                )}

                <p className="type-hint">
                  {recurrenceType === 'DAILY'
                    ? 'Aparecerá automaticamente todos os dias'
                    : daysOfWeek.length === 0
                      ? 'Selecione ao menos um dia da semana'
                      : `Aparecerá toda ${WEEK_DAYS.filter(d => daysOfWeek.includes(d.value)).map(d => d.label).join(', ')}`
                  }
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="add-form-actions">
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!canSubmit || isPending}
              >
                {isPending
                  ? 'Salvando...'
                  : isRecurring
                    ? 'Criar recorrente'
                    : 'Adicionar'
                }
              </button>
              <button className="btn-ghost" onClick={resetForm}>Cancelar</button>
            </div>
          </div>
        ) : (
          <button className="add-btn" onClick={() => setShowForm(true)}>
            <PlusIcon />
            Nova tarefa
          </button>
        )}
      </div>
    </div>
  )
}

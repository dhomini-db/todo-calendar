import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { useTasksByDate, useCreateTask } from '../hooks/useTasks'
import type { TaskType } from '../types'
import TaskItem from './TaskItem'

interface TaskPanelProps {
  selectedDate: Date
}

function progressColor(pct: number): string {
  if (pct === 100) return '#4ade80'
  if (pct >= 70)   return '#34d399'
  if (pct >= 50)   return '#fbbf24'
  if (pct > 0)     return '#f87171'
  return 'var(--line)'
}

function calcScore(tasks: { completed: boolean; type: TaskType }[]) {
  if (tasks.length === 0) return 0
  const good = tasks.filter(t =>
    (t.type === 'POSITIVE' && t.completed) ||
    (t.type === 'NEGATIVE' && !t.completed),
  ).length
  return Math.round((good / tasks.length) * 100)
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5"  y1="12" x2="19" y2="12"/>
    </svg>
  )
}

export default function TaskPanel({ selectedDate }: TaskPanelProps) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const { data: tasks = [], isLoading } = useTasksByDate(dateStr)
  const create = useCreateTask(dateStr)

  const [showForm,    setShowForm]    = useState(false)
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [taskType,    setTaskType]    = useState<TaskType>('POSITIVE')

  const pct       = calcScore(tasks)
  const goodCount = tasks.filter(t =>
    (t.type === 'POSITIVE' && t.completed) ||
    (t.type === 'NEGATIVE' && !t.completed),
  ).length

  // Date labels
  const dayName   = format(selectedDate, "EEEE", { locale: ptBR })
  const dateLabel = format(selectedDate, "d 'de' MMMM", { locale: ptBR })

  function handleCreate() {
    if (!title.trim()) return
    create.mutate(
      { title: title.trim(), description: description.trim() || undefined, date: dateStr, type: taskType },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
          setTaskType('POSITIVE')
          setShowForm(false)
        },
      },
    )
  }

  function cancelForm() {
    setShowForm(false)
    setTitle('')
    setDescription('')
    setTaskType('POSITIVE')
  }

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
          {goodCount} <span>/ {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}</span>
        </p>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, backgroundColor: progressColor(pct) }}
          />
        </div>
        {tasks.length > 0 && (
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

      {/* Footer */}
      <div className="panel-footer">
        {showForm ? (
          <div className="add-form">
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

            <input
              id="task-title"
              className="add-input"
              placeholder="Nome da tarefa"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
              aria-label="Nome da tarefa"
            />
            <textarea
              id="task-desc"
              className="add-input"
              placeholder="Descrição (opcional)"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              aria-label="Descrição da tarefa"
            />
            <div className="add-form-actions">
              <button
                className="btn-primary"
                onClick={handleCreate}
                disabled={!title.trim() || create.isPending}
              >
                {create.isPending ? 'Salvando...' : 'Adicionar'}
              </button>
              <button className="btn-ghost" onClick={cancelForm}>Cancelar</button>
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

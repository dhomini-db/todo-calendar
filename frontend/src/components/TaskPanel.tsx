import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { useTasksByDate, useCreateTask } from '../hooks/useTasks'
import TaskItem from './TaskItem'

interface TaskPanelProps {
  selectedDate: Date
}

function progressColor(pct: number): string {
  if (pct === 100) return '#4ade80'
  if (pct >= 70)   return '#34d399'
  if (pct >= 50)   return '#fbbf24'
  return '#f87171'
}

export default function TaskPanel({ selectedDate }: TaskPanelProps) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const { data: tasks = [], isLoading } = useTasksByDate(dateStr)
  const create = useCreateTask(dateStr)

  const [showForm,    setShowForm]    = useState(false)
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')

  const total     = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const pct       = total === 0 ? 0 : Math.round((completed / total) * 100)

  const dateLabel = format(selectedDate, "EEEE',' d 'de' MMMM 'de' yyyy", { locale: ptBR })

  function handleCreate() {
    if (!title.trim()) return
    create.mutate(
      { title: title.trim(), description: description.trim() || undefined, date: dateStr },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
          setShowForm(false)
        },
      },
    )
  }

  return (
    <div className="task-panel">
      {/* Header */}
      <div className="panel-header">
        <p className="panel-date">{dateLabel}</p>
        <p className="panel-count">
          {completed} <span>/ {total} {total === 1 ? 'tarefa' : 'tarefas'}</span>
        </p>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, backgroundColor: progressColor(pct) }}
          />
        </div>
      </div>

      {/* Task list */}
      <div className="panel-body">
        {isLoading && (
          <p className="panel-empty">Carregando...</p>
        )}
        {!isLoading && tasks.length === 0 && (
          <p className="panel-empty">Nenhuma tarefa para este dia.</p>
        )}
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} date={dateStr} />
        ))}
      </div>

      {/* Footer — add task */}
      <div className="panel-footer">
        {showForm ? (
          <div className="add-form">
            <input
              className="add-input"
              placeholder="Título da tarefa"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <textarea
              className="add-input"
              placeholder="Descrição (opcional)"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <div className="add-form-actions">
              <button className="btn-primary" onClick={handleCreate} disabled={!title.trim() || create.isPending}>
                {create.isPending ? 'Salvando...' : 'Adicionar'}
              </button>
              <button className="btn-ghost" onClick={() => { setShowForm(false); setTitle(''); setDescription('') }}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button className="add-btn" onClick={() => setShowForm(true)}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Nova tarefa
          </button>
        )}
      </div>
    </div>
  )
}

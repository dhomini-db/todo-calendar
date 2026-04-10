import { useState } from 'react'
import type { Task } from '../types'
import { useToggleTask, useDeleteTask, useUpdateTask } from '../hooks/useTasks'

interface TaskItemProps {
  task: Task
  date: string
}

export default function TaskItem({ task, date }: TaskItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing,       setEditing]       = useState(false)
  const [editTitle,     setEditTitle]     = useState(task.title)

  const toggle = useToggleTask(date)
  const remove = useDeleteTask(date)
  const update = useUpdateTask(date)

  const isPositive = task.type === 'POSITIVE'

  // Para tarefa negativa: "boa escolha" é quando NÃO está concluída
  const isGoodOutcome = isPositive ? task.completed : !task.completed

  function handleEditSave() {
    const trimmed = editTitle.trim()
    if (!trimmed || trimmed === task.title) { setEditing(false); return }
    update.mutate(
      { id: task.id, data: { title: trimmed, description: task.description, date: task.date, type: task.type } },
      { onSuccess: () => setEditing(false) },
    )
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter')  handleEditSave()
    if (e.key === 'Escape') { setEditTitle(task.title); setEditing(false) }
  }

  const typeClass = isPositive ? 'task-positive' : 'task-negative'
  const doneClass = task.completed ? 'done' : ''

  return (
    <div className={`task-item ${typeClass} ${doneClass}`}>
      {/* Indicador de tipo */}
      <span
        className="task-type-icon"
        title={isPositive ? 'Tarefa positiva' : 'Hábito a evitar'}
        aria-hidden
      >
        {isPositive ? '↑' : '↓'}
      </span>

      {/* Checkbox */}
      <button
        className={`task-checkbox ${isPositive ? 'positive' : 'negative'} ${task.completed ? 'checked' : ''}`}
        onClick={() => toggle.mutate(task.id)}
        aria-label={task.completed ? 'Desmarcar' : 'Marcar'}
      />

      {/* Content */}
      <div className="task-content">
        {editing ? (
          <input
            className="task-edit-input"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleEditSave}
            onKeyDown={handleEditKeyDown}
            autoFocus
          />
        ) : (
          <>
            <p className={`task-title ${task.completed ? 'done' : ''}`}>{task.title}</p>
            {task.description && <p className="task-desc">{task.description}</p>}
            {/* Badge de resultado */}
            {task.completed && (
              <span className={`task-outcome ${isGoodOutcome ? 'good' : 'bad'}`}>
                {isPositive
                  ? '✓ boa escolha'
                  : '✗ hábito realizado'}
              </span>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      {!editing && (
        <div className="task-actions">
          {confirmDelete ? (
            <div className="delete-confirm">
              <button className="confirm-yes" onClick={() => remove.mutate(task.id)}>Excluir</button>
              <button className="confirm-no"  onClick={() => setConfirmDelete(false)}>Cancelar</button>
            </div>
          ) : (
            <>
              <button className="task-action-btn" onClick={() => setEditing(true)} title="Editar">✎</button>
              <button className="task-action-btn danger" onClick={() => setConfirmDelete(true)} title="Excluir">✕</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

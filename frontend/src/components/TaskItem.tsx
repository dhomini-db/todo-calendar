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

  function handleToggle() {
    toggle.mutate(task.id)
  }

  function handleDelete() {
    remove.mutate(task.id)
  }

  function handleEditSave() {
    const trimmed = editTitle.trim()
    if (!trimmed || trimmed === task.title) { setEditing(false); return }
    update.mutate(
      { id: task.id, data: { title: trimmed, description: task.description, date: task.date } },
      { onSuccess: () => setEditing(false) },
    )
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleEditSave()
    if (e.key === 'Escape') { setEditTitle(task.title); setEditing(false) }
  }

  return (
    <div className={`task-item ${task.completed ? 'done' : ''}`}>
      {/* Checkbox */}
      <button
        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
        onClick={handleToggle}
        aria-label={task.completed ? 'Desmarcar' : 'Marcar como concluída'}
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
          <p className={`task-title ${task.completed ? 'done' : ''}`}>{task.title}</p>
        )}
        {task.description && !editing && (
          <p className="task-desc">{task.description}</p>
        )}
      </div>

      {/* Actions */}
      {!editing && (
        <div className="task-actions">
          {confirmDelete ? (
            <div className="delete-confirm">
              <button className="confirm-yes" onClick={handleDelete}>Excluir</button>
              <button className="confirm-no"  onClick={() => setConfirmDelete(false)}>Cancelar</button>
            </div>
          ) : (
            <>
              <button
                className="task-action-btn"
                onClick={() => setEditing(true)}
                title="Editar"
              >✎</button>
              <button
                className="task-action-btn danger"
                onClick={() => setConfirmDelete(true)}
                title="Excluir"
              >✕</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

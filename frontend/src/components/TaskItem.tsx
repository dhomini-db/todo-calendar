import { useState, useRef } from 'react'
import type { Task } from '../types'
import { useToggleTask, useDeleteTask, useUpdateTask } from '../hooks/useTasks'
import { useLanguage } from '../contexts/LanguageContext'

interface TaskItemProps {
  task: Task
  date: string
}

export default function TaskItem({ task, date }: TaskItemProps) {
  const { t } = useLanguage()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing,       setEditing]       = useState(false)
  const [editTitle,     setEditTitle]     = useState(task.title)
  const [xpType,        setXpType]        = useState<'positive' | 'negative' | null>(null)
  const xpTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggle = useToggleTask(date)
  const remove = useDeleteTask(date)
  const update = useUpdateTask(date)

  const isPositive = task.type === 'POSITIVE'
  const isPending  = !task.interacted

  function handleToggle() {
    if (!task.completed) {
      setXpType(isPositive ? 'positive' : 'negative')
      if (xpTimer.current) clearTimeout(xpTimer.current)
      xpTimer.current = setTimeout(() => setXpType(null), 900)
    } else {
      setXpType(null)
    }
    toggle.mutate(task.id)
  }

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
  const isRecurring = task.sourceTemplateId != null

  return (
    <div className={`task-item ${typeClass} ${doneClass}`} style={{ position: 'relative' }}>
      {/* FloatingXP */}
      {xpType && (
        <span className={`floating-xp ${xpType === 'negative' ? 'floating-xp--neg' : ''}`}>
          {xpType === 'positive' ? '+1' : '-1'}
        </span>
      )}

      {/* Checkbox */}
      <button
        className={`task-checkbox ${isPositive ? 'positive' : 'negative'} ${task.completed ? 'checked' : ''}`}
        onClick={handleToggle}
        aria-label={task.completed ? t('cal.task.uncheck') : t('cal.task.check')}
      >
        {task.completed && (
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2 6 5 9 10 3"/>
          </svg>
        )}
      </button>

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
            {isPending && isRecurring && isPositive && (
              <span className="task-outcome pending">{t('cal.task.pending')}</span>
            )}
            {!isPending && (
              <span className={`task-outcome ${isPositive ? 'good' : 'bad'}`}>
                {isPositive ? t('cal.task.done') : t('cal.task.habit_done')}
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
              <button className="confirm-yes" onClick={() => remove.mutate(task.id)}>{t('common.delete')}</button>
              <button className="confirm-no"  onClick={() => setConfirmDelete(false)}>{t('common.cancel')}</button>
            </div>
          ) : (
            <>
              <button className="task-action-btn" onClick={() => setEditing(true)} aria-label={t('common.edit')} title={t('common.edit')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button className="task-action-btn danger" onClick={() => setConfirmDelete(true)} aria-label={t('common.delete')} title={t('common.delete')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { RecurrenceType, Task, TaskType } from '../types'
import { useDeleteTask, useTemplates, useToggleTask, useUpdateTask, useUpdateTemplate } from '../hooks/useTasks'
import { useLanguage } from '../contexts/LanguageContext'
import { composeTaskTitle, parseTaskMetadata } from '../utils/taskMetadata'

interface TaskItemProps { task: Task; date: string }

const WEEK_DAYS = ['1', '2', '3', '4', '5', '6', '7']

export default function TaskItem({ task, date }: TaskItemProps) {
  const { t, lang } = useLanguage()
  const metadata = parseTaskMetadata(task.title)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(metadata.title)
  const [editDescription, setEditDescription] = useState(task.description ?? '')
  const [editDate, setEditDate] = useState(task.date)
  const [editType, setEditType] = useState<TaskType>(task.type)
  const [editStart, setEditStart] = useState(metadata.startTime ?? '')
  const [editEnd, setEditEnd] = useState(metadata.endTime ?? '')
  const [editRecurrence, setEditRecurrence] = useState<RecurrenceType>('DAILY')
  const [editDays, setEditDays] = useState<string[]>([])
  const [xpType, setXpType] = useState<'positive' | 'negative' | null>(null)
  const xpTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggle = useToggleTask(date)
  const remove = useDeleteTask(date)
  const update = useUpdateTask(date)
  const updateTemplate = useUpdateTemplate()
  const { data: templates = [] } = useTemplates()
  const template = task.sourceTemplateId != null
    ? templates.find(item => item.id === task.sourceTemplateId)
    : undefined

  const isPositive = task.type === 'POSITIVE'
  const isPending = !task.interacted
  const isRecurring = task.sourceTemplateId != null

  function handleToggle() {
    if (!task.completed) {
      setXpType(isPositive ? 'positive' : 'negative')
      if (xpTimer.current) clearTimeout(xpTimer.current)
      xpTimer.current = setTimeout(() => setXpType(null), 900)
    } else setXpType(null)
    toggle.mutate(task.id)
  }

  function beginEditing() {
    const current = parseTaskMetadata(task.title)
    setEditTitle(current.title)
    setEditDescription(task.description ?? '')
    setEditDate(task.date)
    setEditType(task.type)
    setEditStart(current.startTime ?? '')
    setEditEnd(current.endTime ?? '')
    setEditRecurrence(template?.recurrenceType ?? 'DAILY')
    setEditDays(template?.daysOfWeek?.split(',').filter(Boolean) ?? [])
    setEditing(true)
  }

  function toggleEditDay(day: string) {
    setEditDays(current => current.includes(day)
      ? current.filter(value => value !== day)
      : [...current, day].sort())
  }

  function handleEditSave() {
    if (!editTitle.trim()) return
    const storedTitle = composeTaskTitle(editTitle, editStart, editEnd)
    update.mutate({
      id: task.id,
      data: { title: storedTitle, description: editDescription.trim() || undefined, date: editDate, type: editType },
    }, {
      onSuccess: () => {
        if (isRecurring && task.sourceTemplateId != null) {
          updateTemplate.mutate({
            id: task.sourceTemplateId,
            data: {
              title: storedTitle,
              description: editDescription.trim() || undefined,
              type: editType,
              recurrenceType: editRecurrence,
              daysOfWeek: editRecurrence === 'WEEKLY' ? editDays.join(',') : undefined,
            },
          }, { onSuccess: () => setEditing(false) })
        } else setEditing(false)
      },
    })
  }

  function handleEditKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') setEditing(false)
  }

  return (
    <div className={`task-item ${isPositive ? 'task-positive' : 'task-negative'} ${task.completed ? 'done' : ''} ${editing ? 'editing-full' : ''}`}>
      {xpType && <span className={`floating-xp ${xpType === 'negative' ? 'floating-xp--neg' : ''}`}>{xpType === 'positive' ? '+1' : '-1'}</span>}

      {!editing && (
        <button className={`task-checkbox ${isPositive ? 'positive' : 'negative'} ${task.completed ? 'checked' : ''}`} onClick={handleToggle} aria-label={task.completed ? t('cal.task.uncheck') : t('cal.task.check')}>
          {task.completed && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3" /></svg>}
        </button>
      )}

      <div className="task-content">
        {editing ? (
          <div className="task-full-edit-form">
            <div className="task-edit-heading"><strong>{lang === 'en' ? 'Edit activity' : 'Editar atividade'}</strong>{isRecurring && <span>{lang === 'en' ? 'Recurring series' : 'Série recorrente'}</span>}</div>
            <input className="add-input" value={editTitle} onChange={event => setEditTitle(event.target.value)} onKeyDown={handleEditKeyDown} placeholder={lang === 'en' ? 'Activity name' : 'Nome da atividade'} autoFocus />
            <textarea className="add-input" rows={2} value={editDescription} onChange={event => setEditDescription(event.target.value)} placeholder={lang === 'en' ? 'Description (optional)' : 'Descrição (opcional)'} />
            <div className="schedule-fields">
              <label><span>{lang === 'en' ? 'Start' : 'Início'}</span><input className="add-input" type="time" value={editStart} onChange={event => setEditStart(event.target.value)} /></label>
              <label><span>{lang === 'en' ? 'End' : 'Fim'}</span><input className="add-input" type="time" value={editEnd} min={editStart || undefined} onChange={event => setEditEnd(event.target.value)} /></label>
            </div>
            <label className="task-edit-date"><span>{lang === 'en' ? 'Date' : 'Data'}</span><input className="add-input" type="date" value={editDate} onChange={event => setEditDate(event.target.value)} disabled={isRecurring} />{isRecurring && <small>{lang === 'en' ? 'Dates are controlled by the recurrence below.' : 'As datas são controladas pela recorrência abaixo.'}</small>}</label>
            <div className="type-toggle">
              <button type="button" className={`type-btn positive ${editType === 'POSITIVE' ? 'active' : ''}`} onClick={() => setEditType('POSITIVE')}>{lang === 'en' ? 'Positive' : 'Positiva'}</button>
              <button type="button" className={`type-btn negative ${editType === 'NEGATIVE' ? 'active' : ''}`} onClick={() => setEditType('NEGATIVE')}>{lang === 'en' ? 'Negative' : 'Negativa'}</button>
            </div>
            {isRecurring && <div className="task-edit-recurrence">
              <span className="task-edit-label">{lang === 'en' ? 'Repeats' : 'Repete'}</span>
              <div className="type-toggle">
                <button type="button" className={`type-btn positive ${editRecurrence === 'DAILY' ? 'active' : ''}`} onClick={() => setEditRecurrence('DAILY')}>{lang === 'en' ? 'Every day' : 'Todos os dias'}</button>
                <button type="button" className={`type-btn positive ${editRecurrence === 'WEEKLY' ? 'active' : ''}`} onClick={() => setEditRecurrence('WEEKLY')}>{lang === 'en' ? 'Selected days' : 'Dias escolhidos'}</button>
              </div>
              {editRecurrence === 'WEEKLY' && <div className="weekday-picker">{WEEK_DAYS.map(day => <button key={day} type="button" className={`weekday-btn ${editDays.includes(day) ? 'active' : ''}`} onClick={() => toggleEditDay(day)}>{t(`rec.day.${day}`)}</button>)}</div>}
            </div>}
            <div className="add-form-actions">
              <button className="btn-primary" onClick={handleEditSave} disabled={!editTitle.trim() || update.isPending || updateTemplate.isPending || (isRecurring && editRecurrence === 'WEEKLY' && editDays.length === 0)}>{lang === 'en' ? 'Save changes' : 'Salvar alterações'}</button>
              <button className="btn-ghost" onClick={() => setEditing(false)}>{t('common.cancel')}</button>
            </div>
          </div>
        ) : <>
          <div className="task-title-row">{metadata.startTime && <span className="task-time-badge">{metadata.startTime}{metadata.endTime ? `–${metadata.endTime}` : ''}</span>}<p className={`task-title ${task.completed ? 'done' : ''}`}>{metadata.title}</p></div>
          {task.description && <p className="task-desc">{task.description}</p>}
          {isRecurring && template && <p className="task-recurrence-days">{template.recurrenceType === 'DAILY' ? (lang === 'en' ? 'Every day' : 'Todos os dias') : template.daysOfWeek?.split(',').filter(Boolean).map(day => t(`rec.day.${day}`)).join(' · ')}</p>}
          {isPending && isRecurring && isPositive && <span className="task-outcome pending">{t('cal.task.pending')}</span>}
          {!isPending && !isPositive && <span className="task-outcome bad">{t('cal.task.habit_done')}</span>}
        </>}
      </div>

      {!editing && <div className="task-actions">{confirmDelete ? <div className="delete-confirm"><button className="confirm-yes" onClick={() => remove.mutate(task.id)} disabled={remove.isPending}>{t('common.delete')}</button><button className="confirm-no" onClick={() => setConfirmDelete(false)}>{t('common.cancel')}</button></div> : <>
        <button className="task-action-btn" onClick={beginEditing} aria-label={t('common.edit')} title={t('common.edit')}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
        <button className="task-action-btn danger" onClick={() => setConfirmDelete(true)} aria-label={t('common.delete')} title={t('common.delete')}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg></button>
      </>}</div>}
    </div>
  )
}

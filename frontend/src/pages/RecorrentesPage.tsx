import { useState } from 'react'
import type { TaskTemplate, TaskTemplateRequest, RecurrenceType, TaskType } from '../types'
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useToggleTemplate,
  useDeleteTemplate,
} from '../hooks/useTasks'

// ── Helpers ────────────────────────────────────────────────────

const DAYS = [
  { value: '1', label: 'Seg' },
  { value: '2', label: 'Ter' },
  { value: '3', label: 'Qua' },
  { value: '4', label: 'Qui' },
  { value: '5', label: 'Sex' },
  { value: '6', label: 'Sáb' },
  { value: '7', label: 'Dom' },
]

function recurrenceLabel(t: TaskTemplate): string {
  if (t.recurrenceType === 'DAILY') return 'Todo dia'
  if (!t.daysOfWeek) return 'Semanal'
  const ids = t.daysOfWeek.split(',')
  return DAYS.filter(d => ids.includes(d.value)).map(d => d.label).join(', ')
}

// ── Form state ─────────────────────────────────────────────────

const EMPTY_FORM: TaskTemplateRequest = {
  title: '',
  description: '',
  type: 'POSITIVE',
  recurrenceType: 'DAILY',
  daysOfWeek: '',
}

// ── Icons ──────────────────────────────────────────────────────

function IconRepeat() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  )
}

function IconEdit() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

// ── Template Form ──────────────────────────────────────────────

interface TemplateFormProps {
  initial?: TaskTemplateRequest
  onSubmit: (data: TaskTemplateRequest) => void
  onCancel: () => void
  loading?: boolean
}

function TemplateForm({ initial = EMPTY_FORM, onSubmit, onCancel, loading }: TemplateFormProps) {
  const [form, setForm] = useState<TaskTemplateRequest>(initial)

  function set<K extends keyof TaskTemplateRequest>(key: K, value: TaskTemplateRequest[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleDay(val: string) {
    const current = form.daysOfWeek ? form.daysOfWeek.split(',').filter(Boolean) : []
    const next = current.includes(val)
      ? current.filter(d => d !== val)
      : [...current, val].sort()
    set('daysOfWeek', next.join(','))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit({
      ...form,
      daysOfWeek: form.recurrenceType === 'WEEKLY' ? form.daysOfWeek : undefined,
    })
  }

  const selectedDays = form.daysOfWeek ? form.daysOfWeek.split(',').filter(Boolean) : []

  return (
    <form onSubmit={handleSubmit} className="template-form">
      {/* Tipo */}
      <div className="type-toggle">
        <button
          type="button"
          className={`type-btn positive ${form.type === 'POSITIVE' ? 'active' : ''}`}
          onClick={() => set('type', 'POSITIVE' as TaskType)}
        >↑ Positiva</button>
        <button
          type="button"
          className={`type-btn negative ${form.type === 'NEGATIVE' ? 'active' : ''}`}
          onClick={() => set('type', 'NEGATIVE' as TaskType)}
        >↓ Negativa</button>
      </div>

      {/* Título */}
      <input
        className="add-input"
        placeholder="Nome da tarefa recorrente"
        value={form.title}
        onChange={e => set('title', e.target.value)}
        autoFocus
        required
      />

      {/* Descrição */}
      <textarea
        className="add-input"
        placeholder="Descrição (opcional)"
        rows={2}
        value={form.description ?? ''}
        onChange={e => set('description', e.target.value)}
      />

      {/* Recorrência */}
      <div className="type-toggle">
        <button
          type="button"
          className={`type-btn positive ${form.recurrenceType === 'DAILY' ? 'active' : ''}`}
          onClick={() => set('recurrenceType', 'DAILY' as RecurrenceType)}
        >Todo dia</button>
        <button
          type="button"
          className={`type-btn positive ${form.recurrenceType === 'WEEKLY' ? 'active' : ''}`}
          onClick={() => set('recurrenceType', 'WEEKLY' as RecurrenceType)}
        >Dias específicos</button>
      </div>

      {/* Dias da semana */}
      {form.recurrenceType === 'WEEKLY' && (
        <div className="weekday-picker">
          {DAYS.map(d => (
            <button
              key={d.value}
              type="button"
              className={`weekday-btn ${selectedDays.includes(d.value) ? 'active' : ''}`}
              onClick={() => toggleDay(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      <div className="add-form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={!form.title.trim() || (form.recurrenceType === 'WEEKLY' && selectedDays.length === 0) || loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  )
}

// ── Template Card ──────────────────────────────────────────────

interface TemplateCardProps {
  template: TaskTemplate
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}

function TemplateCard({ template, onEdit, onDelete, onToggle }: TemplateCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className={`template-card ${!template.active ? 'inactive' : ''}`}>
      <div className="template-card-left">
        {/* Indicador de tipo */}
        <div className={`template-type-dot ${template.type === 'POSITIVE' ? 'positive' : 'negative'}`} />

        <div className="template-card-info">
          <p className="template-card-title">{template.title}</p>
          <div className="template-card-meta">
            <span className="template-recurrence-badge">
              <IconRepeat />
              {recurrenceLabel(template)}
            </span>
            {template.description && (
              <span className="template-card-desc">{template.description}</span>
            )}
          </div>
        </div>
      </div>

      <div className="template-card-actions">
        {/* Toggle active */}
        <button
          className={`template-toggle-btn ${template.active ? 'on' : 'off'}`}
          onClick={onToggle}
          title={template.active ? 'Pausar' : 'Ativar'}
        >
          <div className="template-toggle-knob" />
        </button>

        <button className="task-action-btn" onClick={onEdit} title="Editar">
          <IconEdit />
        </button>

        {confirmDelete ? (
          <div className="delete-confirm">
            <button className="confirm-yes" onClick={onDelete}>Excluir</button>
            <button className="confirm-no" onClick={() => setConfirmDelete(false)}>Cancelar</button>
          </div>
        ) : (
          <button className="task-action-btn danger" onClick={() => setConfirmDelete(true)} title="Excluir">
            <IconTrash />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────

export default function RecorrentesPage() {
  const { data: templates = [], isLoading } = useTemplates()
  const createMut  = useCreateTemplate()
  const updateMut  = useUpdateTemplate()
  const toggleMut  = useToggleTemplate()
  const deleteMut  = useDeleteTemplate()

  const [showForm,   setShowForm]   = useState(false)
  const [editTarget, setEditTarget] = useState<TaskTemplate | null>(null)

  function handleCreate(data: TaskTemplateRequest) {
    createMut.mutate(data, { onSuccess: () => setShowForm(false) })
  }

  function handleUpdate(data: TaskTemplateRequest) {
    if (!editTarget) return
    updateMut.mutate({ id: editTarget.id, data }, { onSuccess: () => setEditTarget(null) })
  }

  const active   = templates.filter(t => t.active)
  const inactive = templates.filter(t => !t.active)

  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <h1 className="page-title">Tarefas Recorrentes</h1>
        <p className="page-sub">Defina tarefas que aparecem automaticamente todos os dias</p>
      </div>

      {/* Form criar */}
      {showForm && !editTarget && (
        <div className="settings-section">
          <p className="settings-section-title">Nova tarefa recorrente</p>
          <div className="template-form-wrapper">
            <TemplateForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              loading={createMut.isPending}
            />
          </div>
        </div>
      )}

      {/* Botão criar */}
      {!showForm && (
        <button className="add-btn" style={{ marginBottom: 24, maxWidth: 320 }} onClick={() => setShowForm(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova tarefa recorrente
        </button>
      )}

      {/* Lista ativa */}
      {isLoading && <p className="panel-empty">Carregando...</p>}

      {!isLoading && active.length === 0 && !showForm && (
        <div className="placeholder-banner" style={{ marginBottom: 24 }}>
          <div className="placeholder-banner-icon">🔁</div>
          <p className="placeholder-banner-title">Nenhuma tarefa recorrente ativa</p>
          <p className="placeholder-banner-desc">
            Crie uma tarefa recorrente e ela aparecerá automaticamente no calendário todos os dias.
          </p>
        </div>
      )}

      {active.length > 0 && (
        <div className="settings-section">
          <p className="settings-section-title">Ativas ({active.length})</p>
          <div className="template-list">
            {active.map(t => (
              editTarget?.id === t.id ? (
                <div key={t.id} className="template-form-wrapper">
                  <p className="settings-section-title" style={{ marginBottom: 10 }}>Editando: {t.title}</p>
                  <TemplateForm
                    initial={{ title: t.title, description: t.description ?? '', type: t.type, recurrenceType: t.recurrenceType, daysOfWeek: t.daysOfWeek ?? '' }}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditTarget(null)}
                    loading={updateMut.isPending}
                  />
                </div>
              ) : (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onEdit={() => setEditTarget(t)}
                  onDelete={() => deleteMut.mutate(t.id)}
                  onToggle={() => toggleMut.mutate(t.id)}
                />
              )
            ))}
          </div>
        </div>
      )}

      {/* Lista pausada */}
      {inactive.length > 0 && (
        <div className="settings-section">
          <p className="settings-section-title">Pausadas ({inactive.length})</p>
          <div className="template-list">
            {inactive.map(t => (
              <TemplateCard
                key={t.id}
                template={t}
                onEdit={() => setEditTarget(t)}
                onDelete={() => deleteMut.mutate(t.id)}
                onToggle={() => toggleMut.mutate(t.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

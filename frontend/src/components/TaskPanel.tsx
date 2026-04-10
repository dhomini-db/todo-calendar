import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import {
  useCreateTask,
  useDeleteTask,
  useTasksByDate,
  useToggleTask,
} from '../hooks/useTasks'
import TaskItem from './TaskItem'

interface TaskPanelProps {
  selectedDate: Date
}

export default function TaskPanel({ selectedDate }: TaskPanelProps) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const year    = selectedDate.getFullYear()
  const month   = selectedDate.getMonth() + 1

  const { data: tasks = [], isLoading } = useTasksByDate(dateStr)
  const createTask  = useCreateTask(dateStr, year, month)
  const toggleTask  = useToggleTask(dateStr, year, month)
  const deleteTask  = useDeleteTask(dateStr, year, month)

  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [showForm, setShowForm]     = useState(false)

  const total     = tasks.length
  const completed = tasks.filter(t => t.completed).length

  /**
   * Cálculo de porcentagem local (espelho do backend).
   * Exibido em tempo real enquanto o usuário marca tarefas.
   */
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)

  function progressColor(): string {
    if (total === 0)         return 'bg-gray-700'
    if (percentage === 100)  return 'bg-green-500'
    if (percentage >= 70)    return 'bg-emerald-400'
    if (percentage >= 50)    return 'bg-yellow-400'
    return 'bg-red-500'
  }

  function progressTextColor(): string {
    if (total === 0)         return 'text-gray-500'
    if (percentage === 100)  return 'text-green-400'
    if (percentage >= 70)    return 'text-emerald-400'
    if (percentage >= 50)    return 'text-yellow-400'
    return 'text-red-400'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await createTask.mutateAsync({ title: title.trim(), description: description.trim() || undefined, date: dateStr })
    setTitle('')
    setDescription('')
    setShowForm(false)
  }

  const dateLabel = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-lg h-full flex flex-col">
      {/* Cabeçalho */}
      <div className="mb-5">
        <h3 className="capitalize text-white font-semibold text-base">{dateLabel}</h3>

        {/* Barra de progresso */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">
              {completed} de {total} {total === 1 ? 'tarefa' : 'tarefas'}
            </span>
            <span className={`text-xs font-bold ${progressTextColor()}`}>
              {total === 0 ? '—' : `${percentage}%`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#2c2c2c] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista de tarefas */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          <p className="text-gray-600 text-sm text-center mt-8">Carregando...</p>
        ) : tasks.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 text-sm">Nenhuma tarefa para este dia.</p>
            <p className="text-gray-600 text-xs mt-1">Clique em "+" para adicionar.</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={id => toggleTask.mutate(id)}
              onDelete={id => deleteTask.mutate(id)}
            />
          ))
        )}
      </div>

      {/* Formulário de nova tarefa */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <input
            autoFocus
            type="text"
            placeholder="Título da tarefa"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-[#2c2c2c] border border-[#3a3a3a] rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Descrição (opcional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-[#2c2c2c] border border-[#3a3a3a] rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!title.trim() || createTask.isPending}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-xl transition-colors"
            >
              {createTask.isPending ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setTitle(''); setDescription('') }}
              className="flex-1 bg-[#2c2c2c] hover:bg-[#333] text-gray-400 text-sm py-2 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-[#2c2c2c] hover:bg-[#333] border border-dashed border-[#3a3a3a] hover:border-violet-500 text-gray-400 hover:text-violet-400 text-sm py-2.5 rounded-xl transition-all"
        >
          <span className="text-lg leading-none">+</span>
          Nova tarefa
        </button>
      )}
    </div>
  )
}

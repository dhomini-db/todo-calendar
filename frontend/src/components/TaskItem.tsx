import { useState } from 'react'
import type { Task } from '../types'

interface TaskItemProps {
  task: Task
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div
      className={`
        group flex items-start gap-3 p-3 rounded-xl border transition-all
        ${task.completed
          ? 'bg-[#1a1a1a] border-[#2a2a2a] opacity-60'
          : 'bg-[#242424] border-[#333]'}
      `}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`
          mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center
          transition-all
          ${task.completed
            ? 'bg-violet-600 border-violet-600'
            : 'border-[#555] hover:border-violet-400'}
        `}
        aria-label="Marcar como concluída"
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {task.description}
          </p>
        )}
      </div>

      {/* Botão de excluir */}
      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all ml-1 mt-0.5 shrink-0"
          aria-label="Excluir tarefa"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      ) : (
        <div className="flex gap-1 shrink-0 mt-0.5">
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs text-red-400 hover:text-red-300 font-medium"
          >
            Excluir
          </button>
          <span className="text-gray-600 text-xs">|</span>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

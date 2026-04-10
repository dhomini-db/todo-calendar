import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTask,
  deleteTask,
  getMonthlySummary,
  getTasksByDate,
  toggleTask,
  updateTask,
} from '../api/tasks'
import type { TaskRequest } from '../types'

/**
 * Chaves de cache do React Query.
 * Centralizar aqui evita strings duplicadas em vários componentes.
 */
export const queryKeys = {
  tasks: (date: string) => ['tasks', date] as const,
  summary: (year: number, month: number) => ['summary', year, month] as const,
}

/** Tarefas de um dia específico */
export function useTasksByDate(date: string) {
  return useQuery({
    queryKey: queryKeys.tasks(date),
    queryFn: () => getTasksByDate(date),
    enabled: !!date,
  })
}

/** Resumo mensal (cores dos dias no calendário) */
export function useMonthSummary(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.summary(year, month),
    queryFn: () => getMonthlySummary(year, month),
  })
}

/** Criar tarefa — invalida o cache do dia e do mês ao salvar */
export function useCreateTask(date: string, year: number, month: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TaskRequest) => createTask(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks(date) })
      qc.invalidateQueries({ queryKey: queryKeys.summary(year, month) })
    },
  })
}

/** Alternar conclusão — invalida o cache do dia e do mês */
export function useToggleTask(date: string, year: number, month: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => toggleTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks(date) })
      qc.invalidateQueries({ queryKey: queryKeys.summary(year, month) })
    },
  })
}

/** Excluir tarefa */
export function useDeleteTask(date: string, year: number, month: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks(date) })
      qc.invalidateQueries({ queryKey: queryKeys.summary(year, month) })
    },
  })
}

/** Atualizar tarefa */
export function useUpdateTask(date: string, year: number, month: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskRequest }) =>
      updateTask(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks(date) })
      qc.invalidateQueries({ queryKey: queryKeys.summary(year, month) })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTask,
  deleteTask,
  getMonthlySummary,
  getTasksByDate,
  toggleTask,
  updateTask,
  getTemplates,
  createTemplate,
  updateTemplate,
  toggleTemplate,
  deleteTemplate,
} from '../api/tasks'
import type { TaskRequest, TaskTemplateRequest } from '../types'

export const queryKeys = {
  tasks:     (date: string)                => ['tasks', date]          as const,
  summary:   (year: number, month: number) => ['summary', year, month] as const,
  templates: ()                            => ['templates']            as const,
}

/** Extrai year/month de uma string "YYYY-MM-DD" */
function ymFromDate(date: string) {
  const [y, m] = date.split('-').map(Number)
  return { year: y, month: m }
}

export function useTasksByDate(date: string) {
  return useQuery({
    queryKey: queryKeys.tasks(date),
    queryFn:  () => getTasksByDate(date),
    enabled:  !!date,
  })
}

export function useMonthSummary(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.summary(year, month),
    queryFn:  () => getMonthlySummary(year, month),
  })
}

function useInvalidateBoth(date: string) {
  const qc = useQueryClient()
  const { year, month } = ymFromDate(date)
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.tasks(date) })
    qc.invalidateQueries({ queryKey: queryKeys.summary(year, month) })
  }
}

export function useCreateTask(date: string) {
  const invalidate = useInvalidateBoth(date)
  return useMutation({
    mutationFn: (data: TaskRequest) => createTask(data),
    onSuccess:  invalidate,
  })
}

export function useToggleTask(date: string) {
  const invalidate = useInvalidateBoth(date)
  return useMutation({
    mutationFn: (id: number) => toggleTask(id),
    onSuccess:  invalidate,
  })
}

export function useDeleteTask(date: string) {
  const invalidate = useInvalidateBoth(date)
  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess:  invalidate,
  })
}

export function useUpdateTask(date: string) {
  const invalidate = useInvalidateBoth(date)
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskRequest }) => updateTask(id, data),
    onSuccess:  invalidate,
  })
}

// ── Template hooks ─────────────────────────────────────────────

export function useTemplates() {
  return useQuery({
    queryKey: queryKeys.templates(),
    queryFn:  getTemplates,
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TaskTemplateRequest) => createTemplate(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.templates() }),
  })
}

export function useUpdateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskTemplateRequest }) => updateTemplate(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.templates() }),
  })
}

export function useToggleTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => toggleTemplate(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.templates() }),
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTemplate(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: queryKeys.templates() }),
  })
}

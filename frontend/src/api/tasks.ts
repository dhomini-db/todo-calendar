import axios from 'axios'
import type { Task, TaskRequest, DaySummary } from '../types'

/**
 * Instância do Axios apontando para a API.
 * Em dev, o Vite proxy redireciona /api → http://localhost:8081
 * Em produção (Docker), o Nginx faz o mesmo proxy.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Tarefas ──────────────────────────────────────────────────────────────────

/** Busca todas as tarefas de um dia específico */
export const getTasksByDate = (date: string): Promise<Task[]> =>
  api.get<Task[]>('/tasks', { params: { date } }).then(r => r.data)

/** Cria uma nova tarefa */
export const createTask = (data: TaskRequest): Promise<Task> =>
  api.post<Task>('/tasks', data).then(r => r.data)

/** Atualiza título/descrição/data de uma tarefa */
export const updateTask = (id: number, data: TaskRequest): Promise<Task> =>
  api.put<Task>(`/tasks/${id}`, data).then(r => r.data)

/** Alterna o estado concluído/não-concluído */
export const toggleTask = (id: number): Promise<Task> =>
  api.patch<Task>(`/tasks/${id}/toggle`).then(r => r.data)

/** Exclui uma tarefa */
export const deleteTask = (id: number): Promise<void> =>
  api.delete(`/tasks/${id}`).then(() => undefined)

// ─── Resumo Mensal ────────────────────────────────────────────────────────────

/** Retorna o resumo de todos os dias de um mês com porcentagem e cor */
export const getMonthlySummary = (
  year: number,
  month: number,
): Promise<Record<string, DaySummary>> =>
  api.get('/tasks/summary', { params: { year, month } }).then(r => r.data)

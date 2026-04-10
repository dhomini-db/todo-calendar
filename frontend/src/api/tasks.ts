import axios from 'axios'
import type { Task, TaskRequest, DaySummary, AuthResponse, LoginRequest, RegisterRequest } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: anexa o token JWT em toda requisição autenticada
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: redireciona para login se o token expirar
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 403 || err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// ── Autenticação ───────────────────────────────────────────────

export const login = (data: LoginRequest): Promise<AuthResponse> =>
  api.post<AuthResponse>('/auth/login', data).then(r => r.data)

export const register = (data: RegisterRequest): Promise<AuthResponse> =>
  api.post<AuthResponse>('/auth/register', data).then(r => r.data)

// ── Tarefas ────────────────────────────────────────────────────

export const getTasksByDate = (date: string): Promise<Task[]> =>
  api.get<Task[]>('/tasks', { params: { date } }).then(r => r.data)

export const createTask = (data: TaskRequest): Promise<Task> =>
  api.post<Task>('/tasks', data).then(r => r.data)

export const updateTask = (id: number, data: TaskRequest): Promise<Task> =>
  api.put<Task>(`/tasks/${id}`, data).then(r => r.data)

export const toggleTask = (id: number): Promise<Task> =>
  api.patch<Task>(`/tasks/${id}/toggle`).then(r => r.data)

export const deleteTask = (id: number): Promise<void> =>
  api.delete(`/tasks/${id}`).then(() => undefined)

// ── Resumo Mensal ──────────────────────────────────────────────

export const getMonthlySummary = (
  year: number,
  month: number,
): Promise<Record<string, DaySummary>> =>
  api.get('/tasks/summary', { params: { year, month } }).then(r => r.data)

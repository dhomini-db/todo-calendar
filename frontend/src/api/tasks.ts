import axios from 'axios'
import type { Task, TaskRequest, DaySummary, AuthResponse, LoginRequest, RegisterRequest, TaskTemplate, TaskTemplateRequest, StreakData, UserProfile, UpdateProfileRequest, ChangePasswordRequest, MonthlyPerformance } from '../types'

/**
 * Em dev  → Vite proxy redireciona /api para localhost:8081 (sem CORS)
 * Em Docker → Nginx proxy redireciona /api para backend:8081
 * Em produção (Vercel) → VITE_API_URL aponta para o backend hospedado
 */
const BASE = import.meta.env.VITE_API_URL ?? '/api'

const api = axios.create({
  baseURL: BASE,
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

// ── Templates recorrentes ──────────────────────────────────────

export const getTemplates = (): Promise<TaskTemplate[]> =>
  api.get<TaskTemplate[]>('/templates').then(r => r.data)

export const createTemplate = (data: TaskTemplateRequest): Promise<TaskTemplate> =>
  api.post<TaskTemplate>('/templates', data).then(r => r.data)

export const updateTemplate = (id: number, data: TaskTemplateRequest): Promise<TaskTemplate> =>
  api.put<TaskTemplate>(`/templates/${id}`, data).then(r => r.data)

export const toggleTemplate = (id: number): Promise<TaskTemplate> =>
  api.patch<TaskTemplate>(`/templates/${id}/toggle`).then(r => r.data)

export const deleteTemplate = (id: number): Promise<void> =>
  api.delete(`/templates/${id}`).then(() => undefined)

// ── Perfil ─────────────────────────────────────────────────────

export const getProfile = (): Promise<UserProfile> =>
  api.get<UserProfile>('/users/me').then(r => r.data)

export const updateProfile = (data: UpdateProfileRequest): Promise<UserProfile> =>
  api.put<UserProfile>('/users/me', data).then(r => r.data)

export const changePassword = (data: ChangePasswordRequest): Promise<{ message: string }> =>
  api.put<{ message: string }>('/users/me/password', data).then(r => r.data)

// ── Stats ──────────────────────────────────────────────────────

export const getMonthlyPerformance = (): Promise<MonthlyPerformance[]> =>
  api.get<MonthlyPerformance[]>('/stats/monthly-performance').then(r => r.data)

// ── Streak ─────────────────────────────────────────────────────

export const getStreak = (): Promise<StreakData> =>
  api.get<StreakData>('/streak').then(r => r.data)

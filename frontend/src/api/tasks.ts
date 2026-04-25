import axios from 'axios'
import type { Task, TaskRequest, DaySummary, AuthResponse, LoginRequest, RegisterRequest, TaskTemplate, TaskTemplateRequest, StreakData, UserProfile, UpdateProfileRequest, ChangePasswordRequest, MonthlyPerformance, DashboardStats, AiChatRequest, AiChatResponse, UserRanking, PublicProfile, FollowUser } from '../types'

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

export const uploadAvatar = (file: File): Promise<UserProfile> => {
  const form = new FormData()
  form.append('file', file)
  return api.post<UserProfile>('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const removeAvatar = (): Promise<UserProfile> =>
  api.delete<UserProfile>('/users/me/avatar').then(r => r.data)

export const uploadBanner = (file: File): Promise<UserProfile> => {
  const form = new FormData()
  form.append('file', file)
  return api.post<UserProfile>('/users/me/banner', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const removeBanner = (): Promise<UserProfile> =>
  api.delete<UserProfile>('/users/me/banner').then(r => r.data)

export const saveBannerPosition = (position: number): Promise<UserProfile> =>
  api.patch<UserProfile>('/users/me/banner/position', { position }).then(r => r.data)

// ── Export ─────────────────────────────────────────────────────

export const exportTasksCsv = async (): Promise<void> => {
  const res = await api.get('/export/tasks', { responseType: 'blob' })
  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `taskflow-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ── Stats ──────────────────────────────────────────────────────

export const getDashboardStats = (): Promise<DashboardStats> =>
  api.get<DashboardStats>('/stats/dashboard').then(r => r.data)

export const getMonthlyPerformance = (): Promise<MonthlyPerformance[]> =>
  api.get<MonthlyPerformance[]>('/stats/monthly-performance').then(r => r.data)

// ── Streak ─────────────────────────────────────────────────────

export const getStreak = (): Promise<StreakData> =>
  api.get<StreakData>('/streak').then(r => r.data)

// ── IA / Chat ──────────────────────────────────────────────────

export const sendAiMessage = (data: AiChatRequest): Promise<AiChatResponse> =>
  api.post<AiChatResponse>('/ai/chat', data).then(r => r.data)

export const getAiStatus = (): Promise<{ configured: boolean }> =>
  api.get<{ configured: boolean }>('/ai/status').then(r => r.data)

// ── Social ─────────────────────────────────────────────────────

export const getSocialRankings = (): Promise<UserRanking[]> =>
  api.get<UserRanking[]>('/social/rankings').then(r => r.data)

export const getUserPublicProfile = (userId: number): Promise<PublicProfile> =>
  api.get<PublicProfile>(`/social/profile/${userId}`).then(r => r.data)

export const followUser = (userId: number): Promise<void> =>
  api.post(`/social/follow/${userId}`).then(() => undefined)

export const unfollowUser = (userId: number): Promise<void> =>
  api.delete(`/social/follow/${userId}`).then(() => undefined)

export const getFollowers = (userId: number): Promise<FollowUser[]> =>
  api.get<FollowUser[]>(`/social/followers/${userId}`).then(r => r.data)

export const getFollowing = (userId: number): Promise<FollowUser[]> =>
  api.get<FollowUser[]>(`/social/following/${userId}`).then(r => r.data)

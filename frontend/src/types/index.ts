// ── Tarefas ────────────────────────────────────────────────────

export type TaskType       = 'POSITIVE' | 'NEGATIVE'
export type TaskColor      = 'GREEN' | 'LIGHT_GREEN' | 'YELLOW' | 'RED' | 'NONE'
export type RecurrenceType = 'DAILY' | 'WEEKLY'

export interface Task {
  id: number
  title: string
  description?: string
  date: string        // "YYYY-MM-DD"
  completed: boolean
  type: TaskType
  sourceTemplateId?: number | null   // null = tarefa manual
  createdAt: string
  updatedAt: string
}

// ── Tarefas recorrentes ────────────────────────────────────────

export interface TaskTemplate {
  id: number
  title: string
  description?: string
  type: TaskType
  recurrenceType: RecurrenceType
  daysOfWeek?: string   // "1,3,5" para WEEKLY
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskTemplateRequest {
  title: string
  description?: string
  type: TaskType
  recurrenceType: RecurrenceType
  daysOfWeek?: string
}

export interface TaskRequest {
  title: string
  description?: string
  date: string
  type?: TaskType
}

export interface DaySummary {
  date: string
  total: number
  completed: number   // representa "boas escolhas" no novo modelo
  percentage: number
  color: TaskColor
}

export type MonthSummary = Record<string, DaySummary>

// ── Autenticação ───────────────────────────────────────────────

export interface AuthUser {
  userId: number
  name: string
  email: string
}

export interface AuthResponse {
  token: string
  userId: number
  name: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

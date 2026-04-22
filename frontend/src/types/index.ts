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
  interacted: boolean                // false = gerada por template, ainda não tocada (PENDING)
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

// ── Streak ─────────────────────────────────────────────────────

export interface DayStatus {
  date: string        // "yyyy-MM-dd"
  dayName: string     // "Seg", "Ter", ...
  completed: boolean  // atingiu >= 70%
  isToday: boolean
  isFuture: boolean
}

export interface StreakData {
  currentStreak: number
  bestStreak: number
  lastCompletedDate: string | null
  completedToday: boolean
  weekDays: DayStatus[]
}

// ── Dashboard ──────────────────────────────────────────────────

export interface DailyScore {
  date: string
  label: string          // "22/04"
  percentage: number | null
}

export interface DashboardStats {
  scoreHoje: number | null
  streakAtual: number
  tarefasTotalMes: number
  tarefasConcluidasMes: number
  taxaConclusaoMes: number | null
  last30Days: DailyScore[]
}

// ── Estatísticas ───────────────────────────────────────────────

export interface MonthlyPerformance {
  month: string              // "Jan", "Fev", ...
  percentage: number | null  // null = sem dados naquele mês
}

// ── Perfil do usuário ──────────────────────────────────────────

export interface UserProfile {
  id: number
  name: string
  email: string
  createdAt: string
  profileImageUrl?: string | null
}

export interface UpdateProfileRequest {
  name: string
  email: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

// ── Autenticação ───────────────────────────────────────────────

export interface AuthUser {
  userId: number
  name: string
  email: string
  profileImageUrl?: string | null
}

export interface AuthResponse {
  token: string
  userId: number
  name: string
  email: string
  profileImageUrl?: string | null
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

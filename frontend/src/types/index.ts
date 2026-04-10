export interface Task {
  id: number
  title: string
  description?: string
  date: string // formato ISO: "2024-04-10"
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskRequest {
  title: string
  description?: string
  date: string
}

/**
 * Resumo de um dia retornado pela API.
 * color pode ser: "GREEN" | "LIGHT_GREEN" | "YELLOW" | "RED" | "NONE"
 */
export interface DaySummary {
  date: string
  total: number
  completed: number
  percentage: number
  color: 'GREEN' | 'LIGHT_GREEN' | 'YELLOW' | 'RED' | 'NONE'
}

export type MonthSummary = Record<string, DaySummary>

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type ThemeId = 'amber-night' | 'arctic' | 'rose-dawn'

export interface ThemeOption {
  id: ThemeId
  label: string
  description: string
  preview: string   // cor principal para preview visual
}

export const THEMES: ThemeOption[] = [
  { id: 'amber-night', label: 'Midnight Blue', description: 'Escuro com acento azul',       preview: '#3b82f6' },
  { id: 'arctic',      label: 'Arctic Blue',   description: 'Escuro com acento azul',       preview: '#38bdf8' },
  { id: 'rose-dawn',   label: 'Rose Dawn',     description: 'Claro com acento rosado',      preview: '#f43f5e' },
]

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
  themes: ThemeOption[]
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(
    () => (localStorage.getItem('theme') as ThemeId) ?? 'amber-night',
  )

  const setTheme = useCallback((id: ThemeId) => {
    localStorage.setItem('theme', id)
    document.documentElement.setAttribute('data-theme', id)
    setThemeState(id)
  }, [])

  // Aplica o tema salvo no mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}

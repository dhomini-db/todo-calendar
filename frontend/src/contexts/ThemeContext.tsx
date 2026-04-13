import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type ThemeId =
  | 'amber-night'
  | 'arctic'
  | 'rose-dawn'
  | 'tyrian-purple'
  | 'moss-velvet'
  | 'midnight-espresso'
  | 'banana-cream'
  | 'blue-mirage'
  | 'pistachio'

export interface ThemeOption {
  id: ThemeId
  label: string
  description: string
  preview: string   // accent color — barra colorida no card
  bg: string        // cor de fundo para o preview do card
  dark: boolean     // true = tema escuro, false = tema claro
}

export const THEMES: ThemeOption[] = [
  // ── Escuros ──────────────────────────────────────────────────
  { id: 'amber-night',       label: 'Midnight Blue',     description: 'Escuro com acento azul',        preview: '#3b82f6', bg: '#0d0d0d', dark: true  },
  { id: 'arctic',            label: 'Arctic Blue',       description: 'Escuro com acento ciano',       preview: '#38bdf8', bg: '#08090f', dark: true  },
  { id: 'tyrian-purple',     label: 'Tyrian Purple',     description: 'Escuro com acento vinho',       preview: '#c0245c', bg: '#0e0b10', dark: true  },
  { id: 'moss-velvet',       label: 'Moss Velvet',       description: 'Escuro com acento verde-musgo', preview: '#52b07a', bg: '#090e0a', dark: true  },
  { id: 'midnight-espresso', label: 'Midnight Espresso', description: 'Escuro com acento dourado',     preview: '#e8a736', bg: '#0e0905', dark: true  },
  // ── Claros ───────────────────────────────────────────────────
  { id: 'rose-dawn',         label: 'Rose Dawn',         description: 'Claro com acento rosado',       preview: '#be123c', bg: '#faf7f4', dark: false },
  { id: 'banana-cream',      label: 'Banana Cream',      description: 'Claro com acento vinho',        preview: '#700143', bg: '#fdf6d5', dark: false },
  { id: 'blue-mirage',       label: 'Blue Mirage',       description: 'Claro com acento azul-aço',     preview: '#5a7aaa', bg: '#fdfaf6', dark: false },
  { id: 'pistachio',         label: 'Pistachio Frost',   description: 'Claro com acento verde-musgo',  preview: '#385144', bg: '#f4fae6', dark: false },
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

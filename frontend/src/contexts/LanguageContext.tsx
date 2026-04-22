import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

// ── Translations ───────────────────────────────────────────────

export type Lang = 'pt' | 'en'

const translations: Record<Lang, Record<string, string>> = {
  pt: {
    // Sidebar
    'nav.workspace':   'Workspace',
    'nav.account':     'Conta',
    'nav.calendar':    'Calendário',
    'nav.dashboard':   'Dashboard',
    'nav.charts':      'Gráficos',
    'nav.profile':     'Meu Perfil',
    'nav.appearance':  'Aparência',
    'nav.settings':    'Configurações',

    // Settings page
    'cfg.title':              'Configurações',
    'cfg.sub':                'Preferências e ajustes do aplicativo',
    'cfg.section.general':    'Geral',
    'cfg.section.data':       'Dados',

    // Language
    'cfg.lang.title':         'Idioma',
    'cfg.lang.desc':          'Idioma da interface do aplicativo',
    'cfg.lang.pt':            'Português (Brasil)',
    'cfg.lang.en':            'English',

    // Notifications
    'cfg.notif.title':        'Notificações',
    'cfg.notif.desc':         'Lembretes diários de tarefas',
    'cfg.notif.time':         'Horário do lembrete',
    'cfg.notif.enable':       'Ativar notificações',
    'cfg.notif.request':      'Solicitar permissão',
    'cfg.notif.granted':      'Permissão concedida',
    'cfg.notif.blocked':      'Bloqueado pelo navegador',
    'cfg.notif.unsupported':  'Não suportado',
    'cfg.notif.hint':         'Funciona somente enquanto o app estiver aberto no navegador.',

    // Export
    'cfg.export.title':       'Exportar dados',
    'cfg.export.desc':        'Baixar histórico de tarefas em CSV',
    'cfg.export.btn':         'Baixar CSV',
    'cfg.export.ok':          'Baixado!',
    'cfg.export.hint':        'Exporta todas as suas tarefas compatível com Excel.',

    // Common
    'common.active':    'Ativo',
    'common.inactive':  'Inativo',
  },

  en: {
    // Sidebar
    'nav.workspace':   'Workspace',
    'nav.account':     'Account',
    'nav.calendar':    'Calendar',
    'nav.dashboard':   'Dashboard',
    'nav.charts':      'Charts',
    'nav.profile':     'My Profile',
    'nav.appearance':  'Appearance',
    'nav.settings':    'Settings',

    // Settings page
    'cfg.title':              'Settings',
    'cfg.sub':                'Application preferences and adjustments',
    'cfg.section.general':    'General',
    'cfg.section.data':       'Data',

    // Language
    'cfg.lang.title':         'Language',
    'cfg.lang.desc':          'Application interface language',
    'cfg.lang.pt':            'Português (Brasil)',
    'cfg.lang.en':            'English',

    // Notifications
    'cfg.notif.title':        'Notifications',
    'cfg.notif.desc':         'Daily task reminders',
    'cfg.notif.time':         'Reminder time',
    'cfg.notif.enable':       'Enable notifications',
    'cfg.notif.request':      'Request permission',
    'cfg.notif.granted':      'Permission granted',
    'cfg.notif.blocked':      'Blocked by browser',
    'cfg.notif.unsupported':  'Not supported',
    'cfg.notif.hint':         'Only works while the app is open in the browser.',

    // Export
    'cfg.export.title':       'Export data',
    'cfg.export.desc':        'Download task history as CSV',
    'cfg.export.btn':         'Download CSV',
    'cfg.export.ok':          'Downloaded!',
    'cfg.export.hint':        'Exports all your tasks, compatible with Excel.',

    // Common
    'common.active':    'Active',
    'common.inactive':  'Inactive',
  },
}

// ── Context ────────────────────────────────────────────────────

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'app-lang'

function loadLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'en' ? 'en' : 'pt'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  const t = useCallback((key: string): string => {
    return translations[lang][key] ?? translations['pt'][key] ?? key
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider')
  return ctx
}

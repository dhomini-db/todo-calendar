import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

// ── Translations ───────────────────────────────────────────────

export type Lang = 'pt' | 'en'

const translations: Record<Lang, Record<string, string>> = {
  pt: {
    // ── Sidebar ────────────────────────────────────────────────
    'nav.workspace':   'Workspace',
    'nav.account':     'Conta',
    'nav.calendar':    'Calendário',
    'nav.dashboard':   'Dashboard',
    'nav.charts':      'Gráficos',
    'nav.profile':     'Meu Perfil',
    'nav.appearance':  'Aparência',
    'nav.settings':    'Configurações',

    // ── Common ─────────────────────────────────────────────────
    'common.save':       'Salvar',
    'common.saving':     'Salvando…',
    'common.cancel':     'Cancelar',
    'common.edit':       'Editar',
    'common.delete':     'Excluir',
    'common.active':     'Ativo',
    'common.inactive':   'Inativo',
    'common.loading':    'Carregando…',
    'common.error.load': 'Não foi possível carregar',
    'common.error.conn': 'Verifique sua conexão e recarregue a página.',
    'common.no_data':    'Sem dados',

    // ── Settings page ──────────────────────────────────────────
    'cfg.title':              'Configurações',
    'cfg.sub':                'Preferências e ajustes do aplicativo',
    'cfg.section.general':    'Geral',
    'cfg.section.data':       'Dados',
    'cfg.lang.title':         'Idioma',
    'cfg.lang.desc':          'Idioma da interface do aplicativo',
    'cfg.lang.pt':            'Português (Brasil)',
    'cfg.lang.en':            'English',
    'cfg.notif.title':        'Notificações',
    'cfg.notif.desc':         'Lembretes diários de tarefas',
    'cfg.notif.time':         'Horário do lembrete',
    'cfg.notif.enable':       'Ativar notificações',
    'cfg.notif.request':      'Solicitar permissão',
    'cfg.notif.granted':      'Permissão concedida',
    'cfg.notif.blocked':      'Bloqueado pelo navegador',
    'cfg.notif.unsupported':  'Não suportado',
    'cfg.notif.hint':         'Funciona somente enquanto o app estiver aberto no navegador.',
    'cfg.export.title':       'Exportar dados',
    'cfg.export.desc':        'Baixar histórico de tarefas em CSV',
    'cfg.export.btn':         'Baixar CSV',
    'cfg.export.ok':          'Baixado!',
    'cfg.export.hint':        'Exporta todas as suas tarefas compatível com Excel.',

    // ── Conta page ─────────────────────────────────────────────
    'conta.title':            'Minha Conta',
    'conta.sub':              'Gerencie seu perfil e segurança',
    'conta.section.profile':  'Perfil',
    'conta.section.security': 'Segurança',
    'conta.section.session':  'Sessão',
    'conta.avatar.change':    'Alterar foto',
    'conta.avatar.remove':    'Remover foto',
    'conta.avatar.removing':  'Removendo…',
    'conta.avatar.save':      'Salvar foto',
    'conta.avatar.saving':    'Enviando…',
    'conta.avatar.selected':  'Foto selecionada:',
    'conta.avatar.err.upload':'Erro ao enviar foto',
    'conta.avatar.err.remove':'Erro ao remover foto',
    'conta.label.name':       'Nome',
    'conta.label.email':      'E-mail',
    'conta.label.pwd.current':'Senha atual',
    'conta.label.pwd.new':    'Nova senha',
    'conta.label.pwd.confirm':'Confirmar nova senha',
    'conta.ph.name':          'Seu nome',
    'conta.ph.pwd':           '••••••••',
    'conta.ph.pwd.new':       'mín. 8 caracteres',
    'conta.pwd.title':        'Alterar senha',
    'conta.pwd.desc':         'Defina uma nova senha de acesso',
    'conta.pwd.btn':          'Alterar senha',
    'conta.pwd.ok':           'Senha alterada com sucesso ✓',
    'conta.profile.ok':       'Perfil atualizado ✓',
    'conta.logout.title':     'Sair da conta',
    'conta.logout.desc':      'Encerra sua sessão neste dispositivo',
    'conta.logout.btn':       'Sair',
    'conta.pwd.weak':         'Fraca',
    'conta.pwd.medium':       'Média',
    'conta.pwd.good':         'Boa',
    'conta.pwd.strong':       'Forte',
    'conta.err.profile':      'Erro ao salvar perfil',
    'conta.err.pwd':          'Erro ao alterar senha',

    // ── Dashboard page ─────────────────────────────────────────
    'dash.title':              'Dashboard',
    'dash.sub':                'Visão geral do seu desempenho',
    'dash.metric.score':       'Score hoje',
    'dash.metric.streak':      'Streak atual',
    'dash.metric.tasks':       'Tarefas este mês',
    'dash.metric.rate':        'Taxa de conclusão',
    'dash.metric.rate.sub':    'Média mensal do desempenho',
    'dash.score.great':        'Ótimo desempenho!',
    'dash.score.ok':           'Continue assim',
    'dash.score.low':          'Você consegue mais',
    'dash.score.none':         'Sem tarefas hoje',
    'dash.streak.sub':         'Dias consecutivos ≥ 50%',
    'dash.streak.none':        'Complete hoje para começar',
    'dash.streak.day':         'dia',
    'dash.streak.days':        'dias',
    'dash.tasks.sub':          'positivas concluídas',
    'dash.chart.title':        'Desempenho — últimos 30 dias',
    'dash.chart.hint':         'Linha tracejada = meta de 50%',
    'dash.trend.up':           'Melhorando',
    'dash.trend.down':         'Piorando',
    'dash.trend.stable':       'Estável',
    'dash.tooltip.none':       'Sem dados',
    'dash.tooltip.good':       'Bom dia',
    'dash.tooltip.avg':        'Dia médio',
    'dash.tooltip.bad':        'Dia difícil',

    // ── Gráficos page ──────────────────────────────────────────
    'graficos.title':          'Gráficos',
    'graficos.sub':            'Seu desempenho ao longo do tempo',
    'graficos.section':        'Desempenho mensal',
    'graficos.avg':            'Média do ano',
    'graficos.best':           'Melhor mês',
    'graficos.worst':          'Pior mês',
    'graficos.legend.good':    'Bom (≥70%)',
    'graficos.legend.avg':     'Médio (40–69%)',
    'graficos.legend.low':     'Baixo (<40%)',
    'graficos.legend.none':    'Sem dados',
    'graficos.empty.title':    'Ainda sem dados',
    'graficos.empty.desc':     'Complete tarefas ao longo do mês para ver seu desempenho aqui.',
    'graficos.error.title':    'Erro ao carregar',
    'graficos.error.desc':     'Não foi possível buscar os dados. Tente recarregar a página.',
    'graficos.tooltip.good':   'Bom desempenho',
    'graficos.tooltip.avg':    'Desempenho médio',
    'graficos.tooltip.low':    'Abaixo da meta',

    // ── Personalizar page ──────────────────────────────────────
    'appear.title':            'Personalizar',
    'appear.sub':              'Escolha a aparência do aplicativo',
    'appear.dark':             'Temas Escuros',
    'appear.light':            'Temas Claros',
    'appear.active':           'Ativo',

    // ── Recorrentes page ───────────────────────────────────────
    'rec.title':               'Tarefas Recorrentes',
    'rec.sub':                 'Defina tarefas que aparecem automaticamente todos os dias',
    'rec.new.section':         'Nova tarefa recorrente',
    'rec.new.btn':             'Nova tarefa recorrente',
    'rec.ph.title':            'Nome da tarefa recorrente',
    'rec.ph.desc':             'Descrição (opcional)',
    'rec.type.positive':       '↑ Positiva',
    'rec.type.negative':       '↓ Negativa',
    'rec.freq.daily':          'Todo dia',
    'rec.freq.weekly':         'Dias específicos',
    'rec.save':                'Salvar',
    'rec.saving':              'Salvando...',
    'rec.active':              'Ativas',
    'rec.inactive':            'Pausadas',
    'rec.editing':             'Editando',
    'rec.pause':               'Pausar',
    'rec.activate':            'Ativar',
    'rec.daily':               'Todo dia',
    'rec.weekly':              'Semanal',
    'rec.loading':             'Carregando...',
    'rec.empty.title':         'Nenhuma tarefa recorrente ativa',
    'rec.empty.desc':          'Crie uma tarefa recorrente e ela aparecerá automaticamente no calendário todos os dias.',
    'rec.confirm.delete':      'Excluir',
    'rec.day.1':               'Seg',
    'rec.day.2':               'Ter',
    'rec.day.3':               'Qua',
    'rec.day.4':               'Qui',
    'rec.day.5':               'Sex',
    'rec.day.6':               'Sáb',
    'rec.day.7':               'Dom',
  },

  en: {
    // ── Sidebar ────────────────────────────────────────────────
    'nav.workspace':   'Workspace',
    'nav.account':     'Account',
    'nav.calendar':    'Calendar',
    'nav.dashboard':   'Dashboard',
    'nav.charts':      'Charts',
    'nav.profile':     'My Profile',
    'nav.appearance':  'Appearance',
    'nav.settings':    'Settings',

    // ── Common ─────────────────────────────────────────────────
    'common.save':       'Save',
    'common.saving':     'Saving…',
    'common.cancel':     'Cancel',
    'common.edit':       'Edit',
    'common.delete':     'Delete',
    'common.active':     'Active',
    'common.inactive':   'Inactive',
    'common.loading':    'Loading…',
    'common.error.load': 'Could not load',
    'common.error.conn': 'Check your connection and reload the page.',
    'common.no_data':    'No data',

    // ── Settings page ──────────────────────────────────────────
    'cfg.title':              'Settings',
    'cfg.sub':                'Application preferences and adjustments',
    'cfg.section.general':    'General',
    'cfg.section.data':       'Data',
    'cfg.lang.title':         'Language',
    'cfg.lang.desc':          'Application interface language',
    'cfg.lang.pt':            'Português (Brasil)',
    'cfg.lang.en':            'English',
    'cfg.notif.title':        'Notifications',
    'cfg.notif.desc':         'Daily task reminders',
    'cfg.notif.time':         'Reminder time',
    'cfg.notif.enable':       'Enable notifications',
    'cfg.notif.request':      'Request permission',
    'cfg.notif.granted':      'Permission granted',
    'cfg.notif.blocked':      'Blocked by browser',
    'cfg.notif.unsupported':  'Not supported',
    'cfg.notif.hint':         'Only works while the app is open in the browser.',
    'cfg.export.title':       'Export data',
    'cfg.export.desc':        'Download task history as CSV',
    'cfg.export.btn':         'Download CSV',
    'cfg.export.ok':          'Downloaded!',
    'cfg.export.hint':        'Exports all your tasks, compatible with Excel.',

    // ── Conta page ─────────────────────────────────────────────
    'conta.title':            'My Account',
    'conta.sub':              'Manage your profile and security',
    'conta.section.profile':  'Profile',
    'conta.section.security': 'Security',
    'conta.section.session':  'Session',
    'conta.avatar.change':    'Change photo',
    'conta.avatar.remove':    'Remove photo',
    'conta.avatar.removing':  'Removing…',
    'conta.avatar.save':      'Save photo',
    'conta.avatar.saving':    'Uploading…',
    'conta.avatar.selected':  'File selected:',
    'conta.avatar.err.upload':'Error uploading photo',
    'conta.avatar.err.remove':'Error removing photo',
    'conta.label.name':       'Name',
    'conta.label.email':      'E-mail',
    'conta.label.pwd.current':'Current password',
    'conta.label.pwd.new':    'New password',
    'conta.label.pwd.confirm':'Confirm new password',
    'conta.ph.name':          'Your name',
    'conta.ph.pwd':           '••••••••',
    'conta.ph.pwd.new':       'min. 8 characters',
    'conta.pwd.title':        'Change password',
    'conta.pwd.desc':         'Set a new access password',
    'conta.pwd.btn':          'Change password',
    'conta.pwd.ok':           'Password changed successfully ✓',
    'conta.profile.ok':       'Profile updated ✓',
    'conta.logout.title':     'Sign out',
    'conta.logout.desc':      'Signs you out of this device',
    'conta.logout.btn':       'Sign out',
    'conta.pwd.weak':         'Weak',
    'conta.pwd.medium':       'Medium',
    'conta.pwd.good':         'Good',
    'conta.pwd.strong':       'Strong',
    'conta.err.profile':      'Error saving profile',
    'conta.err.pwd':          'Error changing password',

    // ── Dashboard page ─────────────────────────────────────────
    'dash.title':              'Dashboard',
    'dash.sub':                'Overview of your performance',
    'dash.metric.score':       "Today's Score",
    'dash.metric.streak':      'Current Streak',
    'dash.metric.tasks':       'Tasks this month',
    'dash.metric.rate':        'Completion rate',
    'dash.metric.rate.sub':    'Monthly average performance',
    'dash.score.great':        'Great performance!',
    'dash.score.ok':           'Keep it up',
    'dash.score.low':          'You can do better',
    'dash.score.none':         'No tasks today',
    'dash.streak.sub':         'Consecutive days ≥ 50%',
    'dash.streak.none':        'Complete today to start',
    'dash.streak.day':         'day',
    'dash.streak.days':        'days',
    'dash.tasks.sub':          'positive completed',
    'dash.chart.title':        'Performance — last 30 days',
    'dash.chart.hint':         'Dashed line = 50% target',
    'dash.trend.up':           'Improving',
    'dash.trend.down':         'Declining',
    'dash.trend.stable':       'Stable',
    'dash.tooltip.none':       'No data',
    'dash.tooltip.good':       'Good day',
    'dash.tooltip.avg':        'Average day',
    'dash.tooltip.bad':        'Tough day',

    // ── Gráficos page ──────────────────────────────────────────
    'graficos.title':          'Charts',
    'graficos.sub':            'Your performance over time',
    'graficos.section':        'Monthly performance',
    'graficos.avg':            'Year average',
    'graficos.best':           'Best month',
    'graficos.worst':          'Worst month',
    'graficos.legend.good':    'Good (≥70%)',
    'graficos.legend.avg':     'Average (40–69%)',
    'graficos.legend.low':     'Low (<40%)',
    'graficos.legend.none':    'No data',
    'graficos.empty.title':    'No data yet',
    'graficos.empty.desc':     'Complete tasks throughout the month to see your performance here.',
    'graficos.error.title':    'Error loading',
    'graficos.error.desc':     'Could not fetch data. Try reloading the page.',
    'graficos.tooltip.good':   'Good performance',
    'graficos.tooltip.avg':    'Average performance',
    'graficos.tooltip.low':    'Below target',

    // ── Personalizar page ──────────────────────────────────────
    'appear.title':            'Appearance',
    'appear.sub':              'Choose the application theme',
    'appear.dark':             'Dark Themes',
    'appear.light':            'Light Themes',
    'appear.active':           'Active',

    // ── Recorrentes page ───────────────────────────────────────
    'rec.title':               'Recurring Tasks',
    'rec.sub':                 'Define tasks that appear automatically every day',
    'rec.new.section':         'New recurring task',
    'rec.new.btn':             'New recurring task',
    'rec.ph.title':            'Recurring task name',
    'rec.ph.desc':             'Description (optional)',
    'rec.type.positive':       '↑ Positive',
    'rec.type.negative':       '↓ Negative',
    'rec.freq.daily':          'Every day',
    'rec.freq.weekly':         'Specific days',
    'rec.save':                'Save',
    'rec.saving':              'Saving...',
    'rec.active':              'Active',
    'rec.inactive':            'Paused',
    'rec.editing':             'Editing',
    'rec.pause':               'Pause',
    'rec.activate':            'Activate',
    'rec.daily':               'Every day',
    'rec.weekly':              'Weekly',
    'rec.loading':             'Loading...',
    'rec.empty.title':         'No active recurring tasks',
    'rec.empty.desc':          'Create a recurring task and it will appear automatically on the calendar every day.',
    'rec.confirm.delete':      'Delete',
    'rec.day.1':               'Mon',
    'rec.day.2':               'Tue',
    'rec.day.3':               'Wed',
    'rec.day.4':               'Thu',
    'rec.day.5':               'Fri',
    'rec.day.6':               'Sat',
    'rec.day.7':               'Sun',
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

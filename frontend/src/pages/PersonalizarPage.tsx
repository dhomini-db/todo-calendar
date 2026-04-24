import { useTheme, THEMES } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function PersonalizarPage() {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()

  const dark  = THEMES.filter(th => th.dark)
  const light = THEMES.filter(th => !th.dark)

  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <h1 className="page-title">{t('appear.title')}</h1>
        <p className="page-sub">{t('appear.sub')}</p>
      </div>

      {/* ── Temas Escuros ──────────────────────────────────── */}
      <div className="settings-section">
        <p className="settings-section-title">{t('appear.dark')}</p>
        <div className="theme-grid">
          {dark.map(th => (
            <ThemeCard key={th.id} t={th} active={theme === th.id} onSelect={() => setTheme(th.id)} />
          ))}
        </div>
      </div>

      {/* ── Temas Claros ───────────────────────────────────── */}
      <div className="settings-section">
        <p className="settings-section-title">{t('appear.light')}</p>
        <div className="theme-grid">
          {light.map(th => (
            <ThemeCard key={th.id} t={th} active={theme === th.id} onSelect={() => setTheme(th.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── ThemeCard ─────────────────────────────────────────────── */
import type { ThemeOption } from '../contexts/ThemeContext'

function ThemeCard({ t, active, onSelect }: { t: ThemeOption; active: boolean; onSelect: () => void }) {
  const { t: translate } = useLanguage()
  return (
    <button
      className={`theme-card${active ? ' active' : ''}`}
      onClick={onSelect}
      title={translate(t.description)}
    >
      {/* Preview swatch */}
      <div className="theme-preview" style={{ background: t.bg }}>
        {/* Simula sidebar + conteúdo */}
        <div className="theme-preview-sidebar" style={{ background: t.dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' }}>
          <div className="theme-preview-dot" style={{ background: t.preview }} />
          <div className="theme-preview-dot-sm" style={{ background: t.dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)' }} />
          <div className="theme-preview-dot-sm" style={{ background: t.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }} />
        </div>
        {/* Simula content area */}
        <div className="theme-preview-content">
          <div className="theme-preview-bar" style={{ background: t.preview, opacity: 0.9 }} />
          <div className="theme-preview-lines">
            <div className="theme-preview-line long"  style={{ background: t.dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)' }} />
            <div className="theme-preview-line short" style={{ background: t.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
            <div className="theme-preview-line long"  style={{ background: t.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', width: '60%' }} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="theme-card-body">
        <div className="theme-card-top">
          <span className="theme-card-label">{t.label}</span>
          {active && <span className="theme-card-badge">{translate('appear.active')}</span>}
        </div>
        <span className="theme-card-desc">{translate(t.description)}</span>
      </div>

      {/* Color dot */}
      <div className="theme-color-dot" style={{ background: t.preview }} />
    </button>
  )
}

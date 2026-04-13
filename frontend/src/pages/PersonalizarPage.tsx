import { useTheme, THEMES } from '../contexts/ThemeContext'

export default function PersonalizarPage() {
  const { theme, setTheme } = useTheme()

  const dark  = THEMES.filter(t => t.dark)
  const light = THEMES.filter(t => !t.dark)

  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <h1 className="page-title">Personalizar</h1>
        <p className="page-sub">Escolha a aparência do aplicativo</p>
      </div>

      {/* ── Temas Escuros ──────────────────────────────────── */}
      <div className="settings-section">
        <p className="settings-section-title">Temas Escuros</p>
        <div className="theme-grid">
          {dark.map(t => (
            <ThemeCard key={t.id} t={t} active={theme === t.id} onSelect={() => setTheme(t.id)} />
          ))}
        </div>
      </div>

      {/* ── Temas Claros ───────────────────────────────────── */}
      <div className="settings-section">
        <p className="settings-section-title">Temas Claros</p>
        <div className="theme-grid">
          {light.map(t => (
            <ThemeCard key={t.id} t={t} active={theme === t.id} onSelect={() => setTheme(t.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── ThemeCard ─────────────────────────────────────────────── */
import type { ThemeOption } from '../contexts/ThemeContext'

function ThemeCard({ t, active, onSelect }: { t: ThemeOption; active: boolean; onSelect: () => void }) {
  return (
    <button
      className={`theme-card${active ? ' active' : ''}`}
      onClick={onSelect}
      title={t.description}
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
          {active && <span className="theme-card-badge">Ativo</span>}
        </div>
        <span className="theme-card-desc">{t.description}</span>
      </div>

      {/* Color dot */}
      <div className="theme-color-dot" style={{ background: t.preview }} />
    </button>
  )
}

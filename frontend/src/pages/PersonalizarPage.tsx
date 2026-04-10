import { useTheme, THEMES } from '../contexts/ThemeContext'

export default function PersonalizarPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <h1 className="page-title">Personalizar</h1>
        <p className="page-sub">Escolha a aparência do aplicativo</p>
      </div>

      <div className="settings-section">
        <p className="settings-section-title">Tema</p>
        <div className="theme-grid">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`theme-card${theme === t.id ? ' active' : ''}`}
              onClick={() => setTheme(t.id)}
            >
              {/* Preview swatch */}
              <div className="theme-preview" style={{ background: t.id === 'rose-dawn' ? '#faf8f6' : '#0a0a0f' }}>
                <div className="theme-preview-bar" style={{ background: t.preview }} />
                <div className="theme-preview-lines">
                  <div className="theme-preview-line long"  style={{ background: t.id === 'rose-dawn' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)' }} />
                  <div className="theme-preview-line short" style={{ background: t.id === 'rose-dawn' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)' }} />
                </div>
              </div>

              {/* Info */}
              <div className="theme-card-body">
                <div className="theme-card-top">
                  <span className="theme-card-label">{t.label}</span>
                  {theme === t.id && (
                    <span className="theme-card-badge">Ativo</span>
                  )}
                </div>
                <span className="theme-card-desc">{t.description}</span>
              </div>

              {/* Color dot */}
              <div className="theme-color-dot" style={{ background: t.preview }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

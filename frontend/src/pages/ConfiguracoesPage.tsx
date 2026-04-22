import { useState, type ReactNode } from 'react'
import { useLanguage, type Lang } from '../contexts/LanguageContext'
import { useNotifications } from '../hooks/useNotifications'
import { exportTasksCsv } from '../api/tasks'

// ── Toggle switch ──────────────────────────────────────────────

function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      disabled={disabled}
      className={`cfg-toggle${on ? ' cfg-toggle--on' : ''}${disabled ? ' cfg-toggle--disabled' : ''}`}
    />
  )
}

// ── Config row (standard layout) ──────────────────────────────

function CfgRow({
  title, desc, children, open, onClick,
}: {
  title: string
  desc: string
  children?: React.ReactNode
  open?: boolean
  onClick?: () => void
}) {
  return (
    <div className="cfg-row">
      <div
        className={`cfg-row-head${onClick ? ' cfg-row-head--click' : ''}`}
        onClick={onClick}
      >
        <div>
          <p className="cfg-row-title">{title}</p>
          <p className="cfg-row-desc">{desc}</p>
        </div>
        {children && !onClick && <div className="cfg-row-control">{children}</div>}
        {onClick && (
          <span className="cfg-row-chevron">{open ? '▲' : '▼'}</span>
        )}
      </div>
    </div>
  )
}

// ── Language section ───────────────────────────────────────────

function LanguageSection() {
  const { lang, setLang, t } = useLanguage()

  const options: { value: Lang; label: string; flag: string }[] = [
    { value: 'pt', label: t('cfg.lang.pt'), flag: '🇧🇷' },
    { value: 'en', label: t('cfg.lang.en'), flag: '🇺🇸' },
  ]

  return (
    <div className="cfg-row">
      <div className="cfg-row-head">
        <div>
          <p className="cfg-row-title">{t('cfg.lang.title')}</p>
          <p className="cfg-row-desc">{t('cfg.lang.desc')}</p>
        </div>
      </div>
      <div className="cfg-lang-options">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => setLang(opt.value)}
            className={`cfg-lang-btn${lang === opt.value ? ' cfg-lang-btn--active' : ''}`}
          >
            <span className="cfg-lang-flag">{opt.flag}</span>
            <span className="cfg-lang-label">{opt.label}</span>
            {lang === opt.value && <span className="cfg-lang-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Notifications section ──────────────────────────────────────

function NotificationsSection() {
  const { t } = useLanguage()
  const { prefs, permission, toggle, setTime } = useNotifications()
  const [open, setOpen] = useState(false)

  const canEnable = permission !== 'unsupported' && permission !== 'denied'

  const permissionLabel = (() => {
    if (permission === 'unsupported') return t('cfg.notif.unsupported')
    if (permission === 'denied')      return t('cfg.notif.blocked')
    if (permission === 'granted')     return t('cfg.notif.granted')
    return t('cfg.notif.request')
  })()

  const permissionColor = (() => {
    if (permission === 'granted') return '#4ade80'
    if (permission === 'denied')  return '#f87171'
    return 'var(--text-3)'
  })()

  return (
    <div className="cfg-row">
      <div className="cfg-row-head cfg-row-head--click" onClick={() => setOpen(o => !o)}>
        <div>
          <p className="cfg-row-title">{t('cfg.notif.title')}</p>
          <p className="cfg-row-desc">{t('cfg.notif.desc')}</p>
        </div>
        <div className="cfg-row-control" onClick={e => e.stopPropagation()}>
          <Toggle on={prefs.enabled} onToggle={toggle} disabled={!canEnable} />
        </div>
      </div>

      {open && (
        <div className="cfg-expand">
          {/* Permission status */}
          <div className="cfg-expand-row">
            <span className="cfg-expand-label">Status</span>
            <span className="cfg-expand-value" style={{ color: permissionColor }}>
              {permissionLabel}
            </span>
          </div>

          {/* Time picker — only when enabled + granted */}
          {prefs.enabled && permission === 'granted' && (
            <div className="cfg-expand-row">
              <label htmlFor="notif-time" className="cfg-expand-label">
                {t('cfg.notif.time')}
              </label>
              <input
                id="notif-time"
                type="time"
                value={prefs.time}
                onChange={e => setTime(e.target.value)}
                className="cfg-time-input"
              />
            </div>
          )}

          {/* Hint */}
          <p className="cfg-expand-hint">{t('cfg.notif.hint')}</p>

          {/* Request button when default */}
          {permission === 'default' && (
            <button className="cfg-btn-accent" onClick={toggle}>
              {t('cfg.notif.request')}
            </button>
          )}

          {/* Blocked warning */}
          {permission === 'denied' && (
            <p className="cfg-expand-warn">
              ⚠️ {t('cfg.notif.blocked')} — altere nas configurações do navegador.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Export section ─────────────────────────────────────────────

function ExportSection() {
  const { t } = useLanguage()
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  async function handleExport() {
    setState('loading')
    try {
      await exportTasksCsv()
      setState('done')
      setTimeout(() => setState('idle'), 2500)
    } catch {
      setState('idle')
    }
  }

  const btnLabel = state === 'loading' ? '↓ Baixando…'
                 : state === 'done'    ? `✓ ${t('cfg.export.ok')}`
                 :                       `↓ ${t('cfg.export.btn')}`

  return (
    <div className="cfg-row">
      <div className="cfg-row-head">
        <div>
          <p className="cfg-row-title">{t('cfg.export.title')}</p>
          <p className="cfg-row-desc">{t('cfg.export.desc')}</p>
        </div>
        <div className="cfg-row-control">
          <button
            className={`cfg-btn-export${state === 'done' ? ' cfg-btn-export--done' : ''}`}
            onClick={handleExport}
            disabled={state === 'loading'}
          >
            {btnLabel}
          </button>
        </div>
      </div>
      <p className="cfg-expand-hint" style={{ marginTop: 8 }}>{t('cfg.export.hint')}</p>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const { t } = useLanguage()

  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <h1 className="page-title">{t('cfg.title')}</h1>
        <p className="page-sub">{t('cfg.sub')}</p>
      </div>

      {/* General */}
      <div className="settings-section">
        <p className="settings-section-title">{t('cfg.section.general')}</p>
        <div className="cfg-card">
          <LanguageSection />
          <div className="cfg-divider" />
          <NotificationsSection />
        </div>
      </div>

      {/* Data */}
      <div className="settings-section">
        <p className="settings-section-title">{t('cfg.section.data')}</p>
        <div className="cfg-card">
          <ExportSection />
        </div>
      </div>
    </div>
  )
}

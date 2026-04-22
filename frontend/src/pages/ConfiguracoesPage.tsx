import { useState } from 'react'
import { useLanguage, type Lang } from '../contexts/LanguageContext'
import { useNotifications } from '../hooks/useNotifications'
import { exportTasksCsv } from '../api/tasks'

// ── Icons ──────────────────────────────────────────────────────

function IconGlobe() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

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

// ── Language section ───────────────────────────────────────────

const LANG_OPTIONS: { value: Lang; label: string; short: string }[] = [
  { value: 'pt', label: 'Português (Brasil)', short: 'PT' },
  { value: 'en', label: 'English',            short: 'EN' },
]

function LanguageSection() {
  const { lang, setLang, t } = useLanguage()

  return (
    <div className="cfg-row">
      <div className="cfg-row-head">
        <div className="cfg-row-icon"><IconGlobe /></div>
        <div className="cfg-row-info">
          <p className="cfg-row-title">{t('cfg.lang.title')}</p>
          <p className="cfg-row-desc">{t('cfg.lang.desc')}</p>
        </div>
      </div>
      <div className="cfg-lang-options">
        {LANG_OPTIONS.map(opt => {
          const active = lang === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setLang(opt.value)}
              className={`cfg-lang-btn${active ? ' cfg-lang-btn--active' : ''}`}
            >
              <span className="cfg-lang-code">{opt.short}</span>
              <span className="cfg-lang-label">{opt.label}</span>
              {active && (
                <span className="cfg-lang-check"><IconCheck /></span>
              )}
            </button>
          )
        })}
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

  const statusInfo = (() => {
    if (permission === 'unsupported') return { label: t('cfg.notif.unsupported'), color: 'var(--text-3)' }
    if (permission === 'denied')      return { label: t('cfg.notif.blocked'),     color: '#f87171' }
    if (permission === 'granted')     return { label: t('cfg.notif.granted'),     color: '#4ade80' }
    return                                   { label: t('cfg.notif.request'),     color: 'var(--text-3)' }
  })()

  return (
    <div className="cfg-row">
      <div
        className="cfg-row-head cfg-row-head--click"
        onClick={() => setOpen(o => !o)}
      >
        <div className="cfg-row-icon"><IconBell /></div>
        <div className="cfg-row-info">
          <p className="cfg-row-title">{t('cfg.notif.title')}</p>
          <p className="cfg-row-desc">{t('cfg.notif.desc')}</p>
        </div>
        <div className="cfg-row-controls">
          <div onClick={e => e.stopPropagation()}>
            <Toggle on={prefs.enabled} onToggle={toggle} disabled={!canEnable} />
          </div>
          <span className="cfg-row-chevron"><IconChevron open={open} /></span>
        </div>
      </div>

      {open && (
        <div className="cfg-expand">
          {/* Status badge */}
          <div className="cfg-expand-row">
            <span className="cfg-expand-label">Status</span>
            <span className="cfg-expand-badge" style={{ color: statusInfo.color }}>
              {statusInfo.label}
            </span>
          </div>

          {/* Time picker */}
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

          {/* Request permission button */}
          {permission === 'default' && (
            <button className="cfg-btn-accent" onClick={toggle}>
              {t('cfg.notif.request')}
            </button>
          )}

          {/* Blocked warning */}
          {permission === 'denied' && (
            <p className="cfg-expand-warn">
              ⚠ {t('cfg.notif.blocked')} — {t('cfg.notif.hint')}
            </p>
          )}

          {/* Hint */}
          {permission !== 'denied' && (
            <p className="cfg-expand-hint">{t('cfg.notif.hint')}</p>
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

  return (
    <div className="cfg-row">
      <div className="cfg-row-head">
        <div className="cfg-row-icon"><IconDownload /></div>
        <div className="cfg-row-info">
          <p className="cfg-row-title">{t('cfg.export.title')}</p>
          <p className="cfg-row-desc">{t('cfg.export.desc')}</p>
        </div>
        <div className="cfg-row-controls">
          <button
            className={`cfg-btn-export${state === 'done' ? ' cfg-btn-export--done' : ''}`}
            onClick={handleExport}
            disabled={state === 'loading'}
          >
            {state === 'loading' && 'Baixando…'}
            {state === 'done'    && <><IconCheck /> {t('cfg.export.ok')}</>}
            {state === 'idle'    && t('cfg.export.btn')}
          </button>
        </div>
      </div>
      <p className="cfg-row-hint">{t('cfg.export.hint')}</p>
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

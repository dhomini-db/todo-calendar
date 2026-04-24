/**
 * InstallPrompt
 * ─────────────
 * Shows a bottom banner when the PWA can be installed.
 *
 * • Android/Desktop Chrome & Edge: listens for `beforeinstallprompt`,
 *   captures the event and shows a custom "Install" button.
 * • iOS Safari: detects iOS + Safari and shows step-by-step instructions
 *   (iOS does not fire `beforeinstallprompt`).
 * • Dismissed state is persisted in localStorage so the banner only
 *   appears once per device.
 * • Hidden if the app is already running as a standalone PWA.
 */

import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'pwa-install-dismissed'

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
}
function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  )
}
function isIOSSafari() {
  return isIOS() && /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent)
}

// ── SVG icons ─────────────────────────────────────────────────

function IconShare() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  )
}
function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5"  y1="12" x2="19" y2="12"/>
    </svg>
  )
}
function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6"  x2="6" y2="18"/>
      <line x1="6"  y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

// ── Component ──────────────────────────────────────────────────

export default function InstallPrompt() {
  const { t } = useLanguage()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible]               = useState(false)
  const [showIOSSteps, setShowIOSSteps]     = useState(false)

  useEffect(() => {
    // Already installed as PWA — never show
    if (isInStandaloneMode()) return
    // Already dismissed — never show
    if (localStorage.getItem(DISMISSED_KEY)) return

    // ── iOS Safari path ──────────────────────────────────────
    if (isIOSSafari()) {
      const timer = setTimeout(() => {
        setVisible(true)
        setShowIOSSteps(true)
      }, 3500)
      return () => clearTimeout(timer)
    }

    // ── Android / Desktop Chrome / Edge path ─────────────────
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Small delay so it doesn't fire immediately on page load
      setTimeout(() => setVisible(true), 2500)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // ── Handlers ──────────────────────────────────────────────

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      dismiss()
    } else {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  function dismiss() {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  if (!visible) return null

  // ── iOS instructions ───────────────────────────────────────
  if (showIOSSteps) {
    return (
      <div className="pwa-prompt pwa-prompt--ios" role="dialog" aria-label={t('pwa.install.title')}>
        <button className="pwa-prompt-close" onClick={dismiss} aria-label={t('common.cancel')}>
          <IconX />
        </button>
        <div className="pwa-prompt-header">
          <img src="/icons/icon-192.png" alt="TaskFlow" className="pwa-prompt-icon" />
          <div>
            <p className="pwa-prompt-name">TaskFlow</p>
            <p className="pwa-prompt-desc">{t('pwa.install.desc')}</p>
          </div>
        </div>
        <p className="pwa-prompt-ios-title">{t('pwa.ios.title')}</p>
        <ol className="pwa-prompt-ios-steps">
          <li>
            <span className="pwa-ios-step-icon"><IconShare /></span>
            <span>{t('pwa.ios.step1')}</span>
          </li>
          <li>
            <span className="pwa-ios-step-icon"><IconPlus /></span>
            <span>{t('pwa.ios.step2')}</span>
          </li>
          <li>
            <span className="pwa-ios-step-icon" style={{ fontSize: 13, fontWeight: 700 }}>✓</span>
            <span>{t('pwa.ios.step3')}</span>
          </li>
        </ol>
        {/* Arrow pointing down to the Safari share button */}
        <div className="pwa-prompt-ios-arrow" aria-hidden="true">▼</div>
      </div>
    )
  }

  // ── Standard install banner ────────────────────────────────
  return (
    <div className="pwa-prompt" role="dialog" aria-label={t('pwa.install.title')}>
      <button className="pwa-prompt-close" onClick={dismiss} aria-label={t('common.cancel')}>
        <IconX />
      </button>
      <div className="pwa-prompt-header">
        <img src="/icons/icon-192.png" alt="TaskFlow" className="pwa-prompt-icon" />
        <div>
          <p className="pwa-prompt-name">{t('pwa.install.title')}</p>
          <p className="pwa-prompt-desc">{t('pwa.install.desc')}</p>
        </div>
      </div>
      <div className="pwa-prompt-actions">
        <button className="pwa-prompt-dismiss" onClick={dismiss}>
          {t('pwa.install.later')}
        </button>
        <button className="pwa-prompt-install" onClick={handleInstall}>
          <IconDownload />
          {t('pwa.install.btn')}
        </button>
      </div>
    </div>
  )
}

/**
 * OfflineBanner
 * ─────────────
 * Thin bar at the top of the viewport that appears when the device loses
 * network connectivity and disappears when it reconnects.
 * Uses the browser's `online`/`offline` events + navigator.onLine.
 */

import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

function IconWifiOff() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1"/>
    </svg>
  )
}

export default function OfflineBanner() {
  const { t } = useLanguage()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    function goOnline() {
      setIsOnline(true)
      if (wasOffline) {
        setShowReconnected(true)
        const timer = setTimeout(() => {
          setShowReconnected(false)
          setWasOffline(false)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
    function goOffline() {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [wasOffline])

  if (isOnline && !showReconnected) return null

  if (showReconnected) {
    return (
      <div className="offline-banner offline-banner--online" role="status">
        ✓ {t('pwa.online')}
      </div>
    )
  }

  return (
    <div className="offline-banner" role="alert">
      <IconWifiOff />
      {t('pwa.offline')}
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'

// ── Types ──────────────────────────────────────────────────────

export interface NotifPrefs {
  enabled: boolean
  time: string          // "HH:MM"
  lastFiredDate: string | null  // "YYYY-MM-DD"
}

type Permission = 'granted' | 'denied' | 'default' | 'unsupported'

const STORAGE_KEY = 'notif-prefs'
const DEFAULT_PREFS: NotifPrefs = { enabled: false, time: '09:00', lastFiredDate: null }

function loadPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS
  } catch {
    return DEFAULT_PREFS
  }
}

function savePrefs(prefs: NotifPrefs): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

function getBrowserPermission(): Permission {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission as Permission
}

// ── Hook ───────────────────────────────────────────────────────

export function useNotifications() {
  const [prefs,      setPrefs]      = useState<NotifPrefs>(loadPrefs)
  const [permission, setPermission] = useState<Permission>(getBrowserPermission)

  // Keep permission state fresh (e.g. user changes browser setting)
  useEffect(() => {
    setPermission(getBrowserPermission())
  }, [prefs.enabled])

  /** Merge + persist a partial update to prefs */
  const updatePrefs = useCallback((patch: Partial<NotifPrefs>) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch }
      savePrefs(next)
      return next
    })
  }, [])

  /** Request browser permission and enable */
  const requestAndEnable = useCallback(async () => {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result as Permission)
    if (result === 'granted') {
      updatePrefs({ enabled: true })
    }
  }, [updatePrefs])

  /** Toggle on/off */
  const toggle = useCallback(() => {
    if (!prefs.enabled && permission !== 'granted') {
      requestAndEnable()
    } else {
      updatePrefs({ enabled: !prefs.enabled })
    }
  }, [prefs.enabled, permission, requestAndEnable, updatePrefs])

  /** Change reminder time */
  const setTime = useCallback((time: string) => {
    updatePrefs({ time })
  }, [updatePrefs])

  return { prefs, permission, toggle, setTime }
}

// ── Scheduler (runs globally in App) ──────────────────────────

/**
 * Call this once at the app root. Checks every 60 s if it's time
 * to fire a daily notification. Fires at most once per calendar day.
 */
export function useNotificationScheduler() {
  useEffect(() => {
    const check = () => {
      if (!('Notification' in window)) return
      if (Notification.permission !== 'granted') return

      let prefs: NotifPrefs
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        prefs = raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS
      } catch {
        return
      }

      if (!prefs.enabled) return

      const now     = new Date()
      const hhmm    = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const today   = now.toISOString().split('T')[0]

      if (hhmm === prefs.time && prefs.lastFiredDate !== today) {
        new Notification('TaskFlow 📋', {
          body: 'Não esqueça de registrar suas tarefas de hoje!',
          icon: '/logo-icon.svg',
          badge: '/logo-icon.svg',
        })
        const updated: NotifPrefs = { ...prefs, lastFiredDate: today }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      }
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [])
}

/**
 * SplashScreen
 * ────────────
 * Shown once per session when the authenticated app first loads.
 * Timeline (total ≈ 1 900 ms):
 *   0 ms   — logo scales + fades in (400 ms)
 *   180 ms — brand name fades up (350 ms)
 *   500 ms — loading bar starts filling (1 000 ms)
 *   1 500 ms — whole screen fades out (350 ms)
 *   1 850 ms — onDone() called → unmounted
 */

import { useEffect, useState } from 'react'

const FADE_START = 1500   // ms before fade-out starts
const TOTAL     = 1850   // ms before onDone fires

interface SplashScreenProps {
  onDone: () => void
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setLeaving(true), FADE_START)
    const doneTimer = setTimeout(onDone, TOTAL)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div className={`splash${leaving ? ' splash--out' : ''}`} aria-hidden="true">
      <div className="splash-center">
        {/* Logo */}
        <div className="splash-logo-wrap">
          <img src="/logo-icon.svg" alt="" className="splash-logo" />
        </div>

        {/* Brand name */}
        <p className="splash-brand">TaskFlow</p>

        {/* Loading bar */}
        <div className="splash-bar-track">
          <div className="splash-bar-fill" />
        </div>
      </div>
    </div>
  )
}

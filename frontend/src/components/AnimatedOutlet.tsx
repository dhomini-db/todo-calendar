/**
 * AnimatedOutlet
 * ──────────────
 * Wraps <Outlet> with a keyed div so React unmounts/remounts on
 * every route change — replaying the .page-animate entry animation.
 *
 * No extra library needed. Exit animations are handled separately on
 * the login page (auth-page--leaving class).
 */

import { useLocation, Outlet } from 'react-router-dom'

export default function AnimatedOutlet() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-animate">
      <Outlet />
    </div>
  )
}

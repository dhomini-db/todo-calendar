const performanceStyle = document.createElement('style')
performanceStyle.textContent = `
body{background-attachment:scroll!important}
.sidebar,.mobile-topbar,.calendar-wrap,.panel-area,.task-panel,.auth-card,.chart-card,.cfg-card,.conta-card,.profile-hero,.soc-rankings-wrap{
  transform:translateZ(0);
}
.dash-card,.chart-summary-card,.graf-insight-card,.template-card,.soc-rank-card,.placeholder-stat-card,.conta-action-row,.profile-social-grid>*,.flm-row,.task-item,.add-form,.template-form,.recurrence-options,.streak-bar,.soc-info-bar,.conta-form,.cfg-expand,.chart-tooltip,.sidebar-user-menu{
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
.auth-page::before,.auth-page::after{
  filter:none!important;
  will-change:transform;
  backface-visibility:hidden;
  animation-duration:24s!important;
}
.cal-day,.sidebar-item,.dash-card,.chart-summary-card,.graf-insight-card,.template-card,.soc-rank-card{
  transition-property:transform,border-color,box-shadow,background-color!important;
  transition-duration:.16s!important;
}
.page-hidden .auth-page::before,.page-hidden .auth-page::after,.page-hidden .splash-logo,.page-hidden *{
  animation-play-state:paused!important;
}
@media(max-width:760px){
  .sidebar,.mobile-topbar,.calendar-wrap,.panel-area,.task-panel,.auth-card,.chart-card,.cfg-card,.conta-card{
    backdrop-filter:none!important;
    -webkit-backdrop-filter:none!important;
  }
  html,body,#root,.app-shell{min-height:100%;height:100%;background:var(--bg)}
  .app-shell{height:100dvh;min-height:100svh}
  .auth-page::before,.auth-page::after,
  .auth-wave-back,.auth-wave-mid,.auth-wave-front,
  .auth-particle,.calendar-liquid-texture,.calendar-particles i,
  .journal-images figure.animated{animation:none!important}
  .auth-particles-layer,.calendar-particles{display:none!important}
  .auth-wave-glow,.calendar-ambient-glow{filter:none!important;opacity:.28!important}
  .calendar-liquid-texture{filter:none!important;mix-blend-mode:normal!important;transform:none!important;will-change:auto!important;opacity:.16!important}
  .auth-wave-svg,.auth-wave-scene{transform:none!important;will-change:auto!important}
  .sidebar,.sidebar-backdrop,.mobile-topbar,.main-content,.auth-card,.calendar-wrap,.task-panel,.daily-journal{
    will-change:auto!important;backface-visibility:hidden;-webkit-backface-visibility:hidden
  }
  .page-enter,.page-exit,.splash,.splash--out{animation:none!important}
}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}

/* Universal calendar background: the same stable, GPU-light composition on every browser. */
.calendar-liquid-texture{
  animation:none!important;filter:none!important;mix-blend-mode:normal!important;
  transform:none!important;will-change:auto!important;opacity:.28!important
}
.calendar-particles{display:none!important}
.calendar-ambient-glow{filter:none!important;opacity:.22!important}
/* Keep the complete calendar composition identical in Safari, Brave and mobile browsers. */
.calendar-wrap,.daily-journal,.panel-area,.task-panel{
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  box-shadow:0 10px 30px rgba(0,0,0,.10)!important
}
.calendar-wrap,.daily-journal,.task-panel{
  contain:layout paint style
}
.daily-journal{content-visibility:auto;contain-intrinsic-size:760px}
.cal-day,.task-item{
  transition-duration:.1s!important;will-change:auto!important
}
`
document.head.appendChild(performanceStyle)

const syncPageVisibility = () => {
  document.documentElement.classList.toggle('page-hidden', document.hidden)
}
document.addEventListener('visibilitychange', syncPageVisibility, {passive:true})
syncPageVisibility()

const nav = navigator as Navigator & { brave?: { isBrave?: () => Promise<boolean> } }
if (nav.brave?.isBrave) {
  void nav.brave.isBrave().then(isBrave => {
    if (isBrave) document.documentElement.classList.add('brave-performance')
  }).catch(() => { /* browser detection is only a performance hint */ })
}

export {}

performanceStyle.textContent += `\n.dash-card,.chart-card,.chart-summary-card,.graf-insight-card,.template-card,.soc-rank-card{content-visibility:auto;contain-intrinsic-size:160px}.route-loading{min-height:100vh;background:var(--bg)}`

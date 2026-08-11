const performanceStyle = document.createElement('style')
performanceStyle.textContent = `
body{background-attachment:scroll!important}
.sidebar,.mobile-topbar,.calendar-wrap,.panel-area,.task-panel,.auth-card,.chart-card,.cfg-card,.conta-card,.profile-hero,.soc-rankings-wrap{
  backdrop-filter:blur(12px) saturate(120%)!important;
  -webkit-backdrop-filter:blur(12px) saturate(120%)!important;
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
    backdrop-filter:blur(8px) saturate(110%)!important;
    -webkit-backdrop-filter:blur(8px) saturate(110%)!important;
  }
  .auth-page::before,.auth-page::after{animation:none!important}
}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`
document.head.appendChild(performanceStyle)

const syncPageVisibility = () => {
  document.documentElement.classList.toggle('page-hidden', document.hidden)
}
document.addEventListener('visibilitychange', syncPageVisibility, {passive:true})
syncPageVisibility()

export {}

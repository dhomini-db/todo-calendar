const isMobileSafeMode = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches

if (isMobileSafeMode) {
  document.documentElement.classList.add('mobile-safe-mode')
  const style = document.createElement('style')
  style.textContent = `
    .mobile-safe-mode *,
    .mobile-safe-mode *::before,
    .mobile-safe-mode *::after {
      animation: none !important;
      transition: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      filter: none !important;
      mix-blend-mode: normal !important;
      will-change: auto !important;
    }
    .mobile-safe-mode .auth-particles-layer,
    .mobile-safe-mode .calendar-particles,
    .mobile-safe-mode .calendar-ambient-glow,
    .mobile-safe-mode .auth-wave-glow { display: none !important; }
    .mobile-safe-mode .auth-page {
      background: linear-gradient(155deg,#f2f3f5 0%,#d9dce1 52%,#f6eeee 100%) !important;
    }
    .mobile-safe-mode[data-theme="amber-night"] .auth-page {
      background: linear-gradient(155deg,#090b0f 0%,#1b2028 52%,#080a0e 100%) !important;
    }
    .mobile-safe-mode .auth-wave-scene { opacity: .42 !important; }
    .mobile-safe-mode .auth-card,
    .mobile-safe-mode .demo-notice,
    .mobile-safe-mode .demo-notice-backdrop {
      transform: none !important;
    }
  `
  document.head.appendChild(style)
}

export { isMobileSafeMode }

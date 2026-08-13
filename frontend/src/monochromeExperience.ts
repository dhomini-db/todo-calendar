const allowedThemes = new Set(['rose-dawn', 'amber-night'])
try {
  const savedTheme = localStorage.getItem('theme')
  if (!savedTheme || !allowedThemes.has(savedTheme)) {
    localStorage.setItem('theme', 'rose-dawn')
    document.documentElement.setAttribute('data-theme', 'rose-dawn')
  }
} catch {
  document.documentElement.setAttribute('data-theme', 'rose-dawn')
}

const style = document.createElement('style')
style.textContent = `
[data-theme="rose-dawn"]{
--bg:#e9eaec;--surface:#f1f2f3;--elevated:#fafafa;--raised:#e5e6e8;--lift:#dfe1e4;--lift-hover:#d5d7da;
--line:rgba(25,28,33,.09);--line-md:rgba(25,28,33,.16);--line-hi:rgba(25,28,33,.25);
--accent:#5e646d;--accent-soft:rgba(70,76,85,.11);--accent-glow:rgba(70,76,85,.07);--accent-border:rgba(70,76,85,.28);
--text:#17191d;--text-2:#5d626a;--text-3:#92969c;
}
[data-theme="amber-night"]{
--accent:#b7bbc2;--accent-soft:rgba(210,214,222,.11);--accent-glow:rgba(210,214,222,.07);--accent-border:rgba(210,214,222,.24);
--text:#f2f3f5;--text-2:#a2a6ad;--text-3:#666b73;
}
.settings-section .theme-card:not(:first-child){display:none}
.theme-grid{grid-template-columns:minmax(230px,360px)!important}
.auth-page{position:relative;isolation:isolate;overflow:hidden;background:linear-gradient(145deg,#f8f8f9 0%,#d9dadd 48%,#f4f4f5 100%)!important}
[data-theme="amber-night"] .auth-page{background:linear-gradient(145deg,#08090b 0%,#26282c 52%,#0b0c0f 100%)!important}
.auth-page::before,.auth-page::after{content:'';position:absolute;z-index:-2;left:-18%;width:136%;height:58%;border-radius:48% 52% 45% 55%/42% 48% 52% 58%;filter:blur(2px);pointer-events:none}
.auth-page::before{top:4%;background:linear-gradient(115deg,rgba(255,255,255,.88),rgba(128,132,139,.20) 45%,rgba(20,22,26,.22));box-shadow:0 34px 80px rgba(0,0,0,.16);animation:psWaveOne 13s ease-in-out infinite alternate}
.auth-page::after{bottom:-18%;background:linear-gradient(120deg,rgba(22,24,28,.72),rgba(145,148,154,.35) 46%,rgba(255,255,255,.82));box-shadow:0 -28px 70px rgba(255,255,255,.22);animation:psWaveTwo 16s ease-in-out infinite alternate}
[data-theme="amber-night"] .auth-page::before{background:linear-gradient(115deg,rgba(255,255,255,.13),rgba(105,109,118,.16) 45%,rgba(0,0,0,.84))}
[data-theme="amber-night"] .auth-page::after{background:linear-gradient(120deg,rgba(0,0,0,.9),rgba(112,116,124,.25) 48%,rgba(255,255,255,.10))}
.auth-card{position:relative;z-index:2;background:color-mix(in srgb,var(--elevated) 72%,transparent)!important;border:1px solid color-mix(in srgb,var(--line-hi) 75%,white 20%)!important;backdrop-filter:blur(30px) saturate(125%)!important;-webkit-backdrop-filter:blur(30px) saturate(125%)!important;box-shadow:0 28px 90px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.38)!important}
@keyframes psWaveOne{from{transform:translate3d(-3%,-3%,0) rotate(-3deg) scale(1.03)}to{transform:translate3d(4%,5%,0) rotate(3deg) scale(1.10)}}
@keyframes psWaveTwo{from{transform:translate3d(4%,4%,0) rotate(2deg) scale(1.06)}to{transform:translate3d(-4%,-5%,0) rotate(-4deg) scale(1.12)}}
@media(max-width:600px){.auth-page::before,.auth-page::after{left:-65%;width:230%}.auth-card{backdrop-filter:blur(24px) saturate(120%)!important}}
@media(prefers-reduced-motion:reduce){.auth-page::before,.auth-page::after{animation:none}}
`
document.head.appendChild(style)

const renameThemes = () => {
  document.querySelectorAll<HTMLElement>('.theme-card-label').forEach((label) => {
    if (label.textContent === 'Midnight Blue') label.textContent = 'Noturno'
    if (label.textContent === 'Rose Dawn') label.textContent = 'Branco acinzentado'
  })
}
new MutationObserver(renameThemes).observe(document.body, {childList:true,subtree:true})
renameThemes()

export {}

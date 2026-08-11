const style = document.createElement('style')

style.textContent = `
.sidebar-logo{--aura-x:50%;--aura-y:50%;position:relative;isolation:isolate;overflow:hidden;transition:border-color .25s ease,box-shadow .25s ease,transform .25s ease}
.sidebar-logo::before{content:'';position:absolute;z-index:-1;inset:-1px;pointer-events:none;opacity:0;background:radial-gradient(135px circle at var(--aura-x) var(--aura-y),color-mix(in srgb,var(--accent) 32%,transparent),color-mix(in srgb,var(--accent) 13%,transparent) 36%,transparent 72%);transition:opacity .28s ease}
.sidebar-logo::after{content:'';position:absolute;z-index:-2;inset:0;pointer-events:none;opacity:0;background:radial-gradient(90px circle at var(--aura-x) var(--aura-y),color-mix(in srgb,white 18%,transparent),transparent 76%);transition:opacity .28s ease}
.sidebar-logo:hover{transform:translateY(-1px);border-color:color-mix(in srgb,var(--accent) 46%,var(--glass-border));box-shadow:0 15px 38px color-mix(in srgb,var(--accent) 18%,transparent),inset 0 1px 0 color-mix(in srgb,white 24%,transparent)}
.sidebar-logo:hover::before,.sidebar-logo:hover::after{opacity:1}
.sidebar-logo>*{position:relative;z-index:1}
@media (hover:none){.sidebar-logo::before{opacity:.45}}
@media (prefers-reduced-motion:reduce){.sidebar-logo,.sidebar-logo::before,.sidebar-logo::after{transition:none}}
`
document.head.appendChild(style)

document.addEventListener('pointermove', (event) => {
  const card = (event.target as Element).closest<HTMLElement>('.sidebar-logo')
  if (!card) return
  const bounds = card.getBoundingClientRect()
  card.style.setProperty('--aura-x', `${event.clientX - bounds.left}px`)
  card.style.setProperty('--aura-y', `${event.clientY - bounds.top}px`)
})

export {}

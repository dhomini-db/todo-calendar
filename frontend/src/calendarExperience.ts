const style = document.createElement('style')
style.textContent = `
.calendar-area{position:relative}.calendar-area:before{content:"";position:absolute;inset:70px 8px 8px;z-index:-1;opacity:.18;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:28px 28px;mask-image:radial-gradient(ellipse,#000,transparent 76%)}
.cal-day.ring{background-image:conic-gradient(from 0deg,var(--ring) var(--pct),transparent 0)!important;background-origin:border-box}.cal-day.ring:after{content:"";position:absolute;inset:3px;border-radius:10px;background:var(--surface);z-index:-1}
.cal-day.selected{transform:translateY(-2px);box-shadow:0 12px 30px var(--accent-soft)!important}
.day-intelligence{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:11px 13px 3px}.day-intelligence>div{padding:11px 12px;border:1px solid var(--glass-border);border-radius:14px;background:linear-gradient(145deg,var(--glass-bg-strong),var(--glass-bg-soft));box-shadow:var(--glass-shadow-soft)}
.day-intelligence b{display:block;margin-bottom:5px;color:var(--accent);font-size:9px;letter-spacing:.8px;text-transform:uppercase}.day-intelligence strong{display:block;color:var(--text);font-size:12px}.day-intelligence small{display:block;margin-top:4px;color:var(--text-2);font-size:10px}
.panel-body.agenda{position:relative;padding-left:22px}.panel-body.agenda:before{content:"";position:absolute;left:13px;top:12px;bottom:12px;width:1px;background:linear-gradient(transparent,var(--line-hi),transparent)}.panel-body.agenda .task-item:before{content:"";position:absolute;left:-15px;top:18px;width:7px;height:7px;border-radius:50%;background:var(--cat,var(--accent));box-shadow:0 0 0 3px var(--bg)}
.cat-picker{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}.cat-btn{padding:7px 3px;border:1px solid var(--glass-border);border-radius:9px;background:var(--glass-bg-soft);color:var(--text-2);font-size:9px}.cat-btn.active{border-color:var(--c);color:var(--text);box-shadow:inset 0 0 0 1px var(--c)}.cat-dot{display:inline-block;width:6px;height:6px;margin-right:6px;border-radius:50%;background:var(--cat)}
@media(max-width:560px){.day-intelligence{grid-template-columns:1fr}.cat-picker{grid-template-columns:1fr 1fr}}
`
document.head.appendChild(style)

const categories = [
  ['study', 'Estudo', '#8b5cf6'], ['work', 'Trabalho', '#3b82f6'],
  ['health', 'Saúde', '#22c55e'], ['personal', 'Pessoal', '#f59e0b'],
] as const

function enhance(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.cal-day:not([data-experience])').forEach(day => {
    day.dataset.experience = '1'
    const match = day.title.match(/(\d+)%/)
    if (!match) return
    const percentage = Number(match[1])
    day.classList.add('ring')
    day.style.setProperty('--pct', `${percentage * 3.6}deg`)
    day.style.setProperty('--ring', percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#34d399' : percentage >= 40 ? '#f59e0b' : '#ef4444')
  })

  root.querySelectorAll<HTMLElement>('.add-form:not([data-experience])').forEach(form => {
    form.dataset.experience = '1'
    const picker = document.createElement('div')
    picker.className = 'cat-picker'; picker.dataset.cat = 'personal'
    categories.forEach(category => {
      const button = document.createElement('button')
      button.type = 'button'; button.className = `cat-btn${category[0] === 'personal' ? ' active' : ''}`
      button.textContent = category[1]; button.style.setProperty('--c', category[2])
      button.onclick = () => { picker.dataset.cat = category[0]; picker.querySelectorAll('.cat-btn').forEach(item => item.classList.remove('active')); button.classList.add('active') }
      picker.appendChild(button)
    })
    form.querySelector('.recurrence-toggle-row')?.before(picker)
    form.querySelector('.btn-primary')?.addEventListener('pointerdown', () => {
      const input = form.querySelector<HTMLInputElement>('input.add-input')
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      if (!input || !setter) return
      setter.call(input, `[cat:${picker.dataset.cat}] ${input.value.replace(/^\[cat:[^\]]+\]\s*/, '')}`)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }, { capture: true })
  })

  root.querySelectorAll<HTMLElement>('.task-panel:not([data-experience])').forEach(panel => {
    panel.dataset.experience = '1'
    const body = panel.querySelector<HTMLElement>('.panel-body')
    const header = panel.querySelector<HTMLElement>('.panel-header')
    if (!body || !header) return
    body.classList.add('agenda')
    body.querySelectorAll<HTMLElement>('.task-item').forEach(item => {
      const title = item.querySelector<HTMLElement>('.task-title')
      if (!title || title.dataset.catdone) return
      const raw = title.textContent ?? ''
      const match = raw.match(/^\[cat:(study|work|health|personal)\]\s*/)
      const category = categories.find(value => value[0] === (match?.[1] ?? 'personal')) ?? categories[3]
      item.style.setProperty('--cat', category[2]); title.textContent = ''
      const dot = document.createElement('span'); dot.className = 'cat-dot'
      title.append(dot, document.createTextNode(raw.replace(/^\[cat:[^\]]+\]\s*/, ''))); title.dataset.catdone = '1'
    })
  })
}

let frame = 0
const scheduleEnhance = () => {
  if (frame) return
  frame = requestAnimationFrame(() => { frame = 0; enhance() })
}
new MutationObserver(mutations => {
  if (mutations.some(mutation => Array.from(mutation.addedNodes).some(node => node instanceof HTMLElement && (node.matches('.calendar-area,.task-panel,.add-form,.cal-day') || node.querySelector('.calendar-area,.task-panel,.add-form,.cal-day'))))) scheduleEnhance()
}).observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true })
scheduleEnhance()

export {}

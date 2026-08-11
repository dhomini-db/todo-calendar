const scheduleStyle = document.createElement('style')
scheduleStyle.textContent = `
.task-schedule-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px;border:1px solid var(--glass-border);border-radius:14px;background:var(--glass-bg-soft);box-shadow:inset 0 1px 0 var(--glass-highlight)}
.task-schedule-heading{grid-column:1/-1;display:flex;align-items:center;gap:7px;margin:0;color:var(--text);font-size:12px;font-weight:650}
.task-schedule-label{display:flex;flex-direction:column;gap:5px;color:var(--text-2);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.55px}
.task-schedule-input{width:100%;min-width:0;height:38px;padding:0 10px;border:1px solid var(--glass-border);border-radius:10px;background:color-mix(in srgb,var(--raised) 72%,transparent);color:var(--text);font:inherit;color-scheme:light dark}
.task-schedule-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.task-time-badge{display:inline-flex;align-items:center;margin-right:8px;padding:2px 7px;border:1px solid var(--accent-border);border-radius:8px;background:var(--accent-soft);color:var(--accent);font-size:10px;font-weight:750;letter-spacing:.2px;vertical-align:1px}
@media(max-width:420px){.task-schedule-fields{grid-template-columns:1fr}.task-schedule-heading{grid-column:1}}
`
document.head.appendChild(scheduleStyle)

const titleSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set
const timePattern = /^\[(\d{2}:\d{2})(?:–(\d{2}:\d{2}))?\]\s*/

function applySchedule(form: HTMLElement){
  const start=form.querySelector<HTMLInputElement>('[data-schedule=start]')
  const end=form.querySelector<HTMLInputElement>('[data-schedule=end]')
  const title=form.querySelector<HTMLInputElement>('input.add-input')
  if(!start?.value || !title || !titleSetter) return
  const range=end?.value ? `${start.value}–${end.value}` : start.value
  const cleanTitle=title.value.replace(timePattern,'')
  titleSetter.call(title,`[${range}] ${cleanTitle}`)
  title.dispatchEvent(new Event('input',{bubbles:true}))
}

function enhanceForm(form: HTMLElement){
  if(form.querySelector('.task-schedule-fields')) return
  const block=document.createElement('div')
  block.className='task-schedule-fields'
  block.innerHTML=`
    <p class="task-schedule-heading"><span aria-hidden="true">◷</span> Horário da atividade <span style="color:var(--text-3);font-weight:500">(opcional)</span></p>
    <label class="task-schedule-label">Início<input class="task-schedule-input" data-schedule="start" type="time" aria-label="Horário de início"></label>
    <label class="task-schedule-label">Término<input class="task-schedule-input" data-schedule="end" type="time" aria-label="Horário de término"></label>
  `
  const recurrence=form.querySelector('.recurrence-toggle-row')
  form.insertBefore(block,recurrence)
  const start=block.querySelector<HTMLInputElement>('[data-schedule=start]')!
  const end=block.querySelector<HTMLInputElement>('[data-schedule=end]')!
  start.addEventListener('change',()=>{end.min=start.value})
  form.querySelector('.btn-primary')?.addEventListener('pointerdown',()=>applySchedule(form),{capture:true})
  form.querySelector<HTMLInputElement>('input.add-input')?.addEventListener('keydown',(event)=>{
    if(event.key!=='Enter'||!start.value) return
    event.preventDefault()
    event.stopImmediatePropagation()
    applySchedule(form)
    window.setTimeout(()=>form.querySelector<HTMLButtonElement>('.btn-primary')?.click(),0)
  },{capture:true})
}

function enhanceTaskTitles(){
  document.querySelectorAll<HTMLElement>('.task-title:not([data-time-enhanced])').forEach(title=>{
    const match=title.textContent?.match(timePattern)
    if(!match) return
    const time=match[2]?`${match[1]}–${match[2]}`:match[1]
    const name=title.textContent!.replace(timePattern,'')
    title.textContent=''
    const badge=document.createElement('span')
    badge.className='task-time-badge'
    badge.textContent=time
    title.append(badge,document.createTextNode(name))
    title.dataset.timeEnhanced='true'
  })
}

function enhanceSchedules(){
  document.querySelectorAll<HTMLElement>('.add-form').forEach(enhanceForm)
  enhanceTaskTitles()
}
new MutationObserver(enhanceSchedules).observe(document.body,{childList:true,subtree:true})
enhanceSchedules()

export {}

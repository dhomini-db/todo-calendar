const mobileSidebarStyle = document.createElement('style')
mobileSidebarStyle.textContent = `
@media(max-width:1024px){
  .app-shell{flex-direction:column;height:100dvh;overflow:hidden}
  .sidebar{
    position:fixed!important;
    inset:0 auto 0 0!important;
    width:min(82vw,300px)!important;
    max-width:300px!important;
    height:100dvh!important;
    z-index:1001!important;
    transform:translate3d(-105%,0,0)!important;
    visibility:hidden;
    pointer-events:none;
    transition:transform .24s cubic-bezier(.22,1,.36,1),visibility 0s linear .24s!important;
  }
  .sidebar.sidebar--open{
    transform:translate3d(0,0,0)!important;
    visibility:visible;
    pointer-events:auto;
    transition-delay:0s!important;
  }
  .sidebar-backdrop{
    display:block!important;
    position:fixed!important;
    inset:0!important;
    z-index:1000!important;
    background:rgba(0,0,0,.48)!important;
    touch-action:none;
  }
  .sidebar-mobile-close{
    display:grid!important;
  }
  .main-content{width:100%;min-width:0}
}
.sidebar-mobile-close{
  display:none;
  position:absolute;
  top:14px;
  right:14px;
  z-index:3;
  width:36px;
  height:36px;
  place-items:center;
  border:1px solid var(--glass-border);
  border-radius:12px;
  color:var(--text);
  background:var(--glass-bg-strong);
  font-size:24px;
  line-height:1;
  cursor:pointer;
  box-shadow:var(--glass-shadow-soft);
}
`
document.head.appendChild(mobileSidebarStyle)

const requestSidebarClose = () => {
  const backdrop = document.querySelector<HTMLElement>('.sidebar-backdrop')
  backdrop?.click()
}

const ensureCloseButton = () => {
  const sidebar = document.querySelector<HTMLElement>('.sidebar')
  if (!sidebar || sidebar.querySelector('.sidebar-mobile-close')) return
  const button = document.createElement('button')
  button.className = 'sidebar-mobile-close'
  button.type = 'button'
  button.setAttribute('aria-label', 'Fechar menu')
  button.textContent = '×'
  button.addEventListener('click', requestSidebarClose)
  sidebar.prepend(button)
}

new MutationObserver(ensureCloseButton).observe(document.body,{childList:true,subtree:true})
ensureCloseButton()

document.addEventListener('keydown',(event)=>{
  if(event.key==='Escape' && document.querySelector('.sidebar--open')) requestSidebarClose()
})
window.addEventListener('resize',()=>{
  if(window.innerWidth>1024 && document.querySelector('.sidebar--open')) requestSidebarClose()
},{passive:true})

export {}

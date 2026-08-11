const style = document.createElement('style')
style.textContent = `
@media (min-width:769px) and (max-width:1024px){
  .main-content{display:flex;flex-direction:column;overflow-y:auto!important}
  .mobile-topbar{
    position:sticky;
    top:0;
    z-index:50;
    display:flex!important;
    align-items:center;
    gap:10px;
    flex-shrink:0;
    padding:11px 16px;
    border-bottom:1px solid var(--glass-border);
    background:var(--glass-bg-strong);
  }
  .mobile-menu-btn{
    display:flex;
    align-items:center;
    justify-content:center;
    padding:7px;
    border:0;
    border-radius:10px;
    color:var(--text);
    background:var(--glass-bg-soft);
  }
}
`
document.head.appendChild(style)
export {}

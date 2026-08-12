const style=document.createElement('style')
style.textContent=`
.auth-particle-canvas{display:none!important}
.auth-particles-layer{position:absolute;inset:-6%;z-index:1;pointer-events:none;overflow:hidden;transition:transform .9s cubic-bezier(.2,.8,.2,1)}
.auth-particle{--size:5px;--x:50%;--delay:0s;--duration:18s;position:absolute;left:var(--x);bottom:-24px;width:var(--size);height:var(--size);border-radius:50%;background:var(--particle-color,var(--text-2));opacity:0;box-shadow:0 0 calc(var(--size)*2.6) color-mix(in srgb,var(--particle-color,var(--text-2)) 42%,transparent);animation:particleRise var(--duration) linear var(--delay) infinite;will-change:transform,opacity}
.auth-particle.accent{--particle-color:var(--accent)}
.auth-particle.ring{background:transparent;border:1.3px solid var(--particle-color,var(--text-2));box-shadow:0 0 calc(var(--size)*2) color-mix(in srgb,var(--particle-color,var(--text-2)) 34%,transparent)}
.auth-wave-back{animation-duration:12s!important}.auth-wave-mid{animation-duration:15s!important}.auth-wave-front{animation-duration:18s!important}
@keyframes particleRise{0%{transform:translate3d(0,20px,0) scale(.7);opacity:0}12%{opacity:.68}55%{transform:translate3d(var(--drift,24px),-52vh,0) scale(1)}88%{opacity:.52}100%{transform:translate3d(calc(var(--drift,24px)*-0.45),-112vh,0) scale(.82);opacity:0}}
@media(max-width:600px){.auth-particle:nth-child(n+19){display:none}.auth-particles-layer{inset:-4% -14%}.auth-particle{animation-duration:calc(var(--duration)*1.15)}}
@media(prefers-reduced-motion:reduce){.auth-particles-layer{display:none}}
`
document.head.appendChild(style)
function mount(page:HTMLElement){if(page.querySelector('.auth-particles-layer')||matchMedia('(prefers-reduced-motion:reduce)').matches)return
const layer=document.createElement('div');layer.className='auth-particles-layer';layer.ariaHidden='true'
for(let i=0;i<38;i++){const p=document.createElement('span');p.className='auth-particle';if(Math.random()<.42)p.classList.add('accent');if(Math.random()<.3)p.classList.add('ring');p.style.setProperty('--size',`${2.5+Math.random()*5}px`);p.style.setProperty('--x',`${Math.random()*100}%`);p.style.setProperty('--delay',`${-Math.random()*22}s`);p.style.setProperty('--duration',`${16+Math.random()*13}s`);p.style.setProperty('--drift',`${-55+Math.random()*110}px`);layer.appendChild(p)}
page.insertBefore(layer,page.querySelector('.auth-card'))
page.addEventListener('pointermove',e=>{const r=page.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)/r.width;const y=(e.clientY-r.top-r.height/2)/r.height;layer.style.transform=`translate3d(${x*-16}px,${y*-10}px,0)`},{passive:true})
page.addEventListener('pointerleave',()=>{layer.style.transform='translate3d(0,0,0)'},{passive:true})}
function all(){document.querySelectorAll<HTMLElement>('.auth-page').forEach(mount)}new MutationObserver(all).observe(document.body,{childList:true,subtree:true});all()
export {}

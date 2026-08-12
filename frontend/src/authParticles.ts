const s=document.createElement('style');s.textContent=`
.auth-particle-canvas{position:absolute;inset:0;z-index:1;width:100%;height:100%;pointer-events:none;opacity:.9}
[data-theme="amber-night"] .auth-particle-canvas{opacity:.94}
.auth-wave-back{animation-duration:12s!important}.auth-wave-mid{animation-duration:15s!important}.auth-wave-front{animation-duration:18s!important}
@media(max-width:600px){.auth-particle-canvas{opacity:.76}}
@media(prefers-reduced-motion:reduce){.auth-particle-canvas{display:none}}`;document.head.appendChild(s)
type P={x:number;y:number;r:number;vx:number;vy:number;a:number;accent:boolean;ring:boolean;phase:number}
function particle(w:number,h:number):P{return{x:Math.random()*w,y:Math.random()*h,r:2+Math.random()*4.2,vx:(Math.random()-.5)*.22,vy:-.07-Math.random()*.17,a:.4+Math.random()*.34,accent:Math.random()<.42,ring:Math.random()<.3,phase:Math.random()*Math.PI*2}}
function mount(page:HTMLElement){if(page.querySelector('.auth-particle-canvas')||matchMedia('(prefers-reduced-motion:reduce)').matches)return
const canvas=document.createElement('canvas');canvas.className='auth-particle-canvas';canvas.ariaHidden='true';page.insertBefore(canvas,page.querySelector('.auth-card'));const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return
let w=0,h=0,dpr=1,ps:P[]=[],frame=0,px=0,py=0,tx=0,ty=0
const resize=()=>{const r=page.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,1.35);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);const n=w<650?18:Math.min(46,Math.round(w/30));ps=Array.from({length:n},()=>particle(w,h))}
const ro=new ResizeObserver(resize);ro.observe(page);resize()
page.addEventListener('pointermove',e=>{const r=page.getBoundingClientRect();tx=(e.clientX-r.left-w/2)/w;ty=(e.clientY-r.top-h/2)/h},{passive:true});page.addEventListener('pointerleave',()=>{tx=0;ty=0},{passive:true})
const draw=()=>{if(!page.isConnected){ro.disconnect();cancelAnimationFrame(frame);return}frame=requestAnimationFrame(draw);if(document.hidden)return;px+=(tx-px)*.04;py+=(ty-py)*.04;ctx.clearRect(0,0,w,h);const accent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#c9233f';const dark=document.documentElement.getAttribute('data-theme')==='amber-night'
ps.forEach((p,i)=>{p.phase+=.012;p.x+=p.vx+Math.sin(p.phase)*.055+px*(p.accent?-.32:.18);p.y+=p.vy+py*.1;if(p.y < -18){p.y=h+18;p.x=Math.random()*w}if(p.x < -18)p.x=w+18;if(p.x>w+18)p.x=-18;const pulse=.8+Math.sin(p.phase*1.6)*.2;const base=dark?'255,255,255':'54,57,64';const color=p.accent?accent:`rgb(${base})`;ctx.globalAlpha=p.a
if(p.ring){ctx.beginPath();ctx.arc(p.x,p.y,p.r*pulse,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=1.25;ctx.stroke()}else{ctx.beginPath();ctx.arc(p.x,p.y,p.r*pulse,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
if(i%4===0){ctx.beginPath();ctx.arc(p.x,p.y,p.r*3.6,0,Math.PI*2);const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3.6);g.addColorStop(0,p.accent?accent:(dark?'rgba(255,255,255,.55)':'rgba(54,57,64,.42)'));g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.globalAlpha=.22;ctx.fill()}});ctx.globalAlpha=1};frame=requestAnimationFrame(draw)}
function all(){document.querySelectorAll<HTMLElement>('.auth-page').forEach(mount)}new MutationObserver(all).observe(document.body,{childList:true,subtree:true});all();export {}

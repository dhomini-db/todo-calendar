const waveStyle=document.createElement('style')
waveStyle.textContent=`
.auth-page::before,.auth-page::after{display:none!important}.auth-page{position:relative;isolation:isolate;overflow:hidden}
.auth-wave-scene{position:absolute;inset:-4%;z-index:0;pointer-events:none;overflow:hidden;color:var(--accent)}
.auth-wave-svg{width:108%;height:108%;margin:-2% -4%;overflow:visible;transform:translateZ(0)}
.auth-wave-back{opacity:.7;animation:authWaveDrift 28s ease-in-out infinite alternate}
.auth-wave-mid{opacity:.92;animation:authWaveDriftReverse 34s ease-in-out infinite alternate}
.auth-wave-front{opacity:.86;animation:authWaveDrift 38s ease-in-out infinite alternate-reverse}
.auth-wave-line{fill:none;stroke:currentColor;stroke-width:1.15;opacity:.2}
.auth-wave-glow{position:absolute;inset:8% 10%;z-index:-1;background:radial-gradient(ellipse at center,color-mix(in srgb,var(--accent) 9%,transparent),transparent 66%);filter:blur(30px);opacity:.72}
.auth-card{z-index:2}
@keyframes authWaveDrift{from{transform:translate3d(-1.2%,0,0) scaleX(1.015)}to{transform:translate3d(1.2%,-1%,0) scaleX(.995)}}
@keyframes authWaveDriftReverse{from{transform:translate3d(1%,.8%,0) scaleX(1)}to{transform:translate3d(-1.1%,-.5%,0) scaleX(1.018)}}
@media(max-width:760px),(hover:none) and (pointer:coarse){.auth-wave-scene{inset:0;overflow:hidden}.auth-wave-svg{width:120%;height:100%;margin:0 -10%;transform:none!important}.auth-wave-back,.auth-wave-mid,.auth-wave-front{animation:none!important;transform:none!important;will-change:auto!important}.auth-wave-glow{display:none}.auth-wave-line{stroke-width:1.5;opacity:.13}}
@media(prefers-reduced-motion:reduce){.auth-wave-back,.auth-wave-mid,.auth-wave-front{animation:none}}
`
document.head.appendChild(waveStyle)
const waveMarkup=`
<div class="auth-wave-glow"></div><svg class="auth-wave-svg" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true">
<defs>
<linearGradient id="waveBack" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".94"/><stop offset=".48" stop-color="#b9bcc2" stop-opacity=".54"/><stop offset="1" stop-color="currentColor" stop-opacity=".11"/></linearGradient>
<linearGradient id="waveMid" x1="0" y1="0" x2="1" y2=".7"><stop offset="0" stop-color="#3b3d43" stop-opacity=".42"/><stop offset=".52" stop-color="#8d9097" stop-opacity=".2"/><stop offset="1" stop-color="currentColor" stop-opacity=".18"/></linearGradient>
<linearGradient id="waveFront" x1="0" y1=".3" x2="1" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".13"/><stop offset=".46" stop-color="#fff" stop-opacity=".72"/><stop offset="1" stop-color="#71747b" stop-opacity=".3"/></linearGradient>
</defs>
<g class="auth-wave-back"><path fill="url(#waveBack)" d="M-120 170 C190 15 465 40 725 150 C1010 270 1245 155 1720 10 L1720 485 C1370 565 1100 480 820 390 C510 290 230 390-120 545 Z"/></g>
<g class="auth-wave-mid"><path fill="url(#waveMid)" d="M-150 610 C170 420 420 425 675 535 C970 662 1230 580 1720 330 L1720 775 C1420 875 1110 805 845 700 C525 575 260 665-150 850 Z"/><path class="auth-wave-line" d="M-80 615 C205 448 435 455 690 555 C985 670 1260 585 1690 370"/></g>
<g class="auth-wave-front"><path fill="url(#waveFront)" d="M-120 830 C235 650 490 690 755 790 C1030 895 1310 850 1720 650 L1720 1080 L-120 1080 Z"/><path class="auth-wave-line" d="M-70 846 C245 690 490 712 760 810 C1040 912 1320 865 1690 690"/></g>
</svg>`
function mountAuthWaves(){document.querySelectorAll<HTMLElement>('.auth-page').forEach(page=>{if(page.querySelector('.auth-wave-scene'))return;const scene=document.createElement('div');scene.className='auth-wave-scene';scene.innerHTML=waveMarkup;page.prepend(scene)})}
new MutationObserver(mountAuthWaves).observe(document.body,{childList:true,subtree:true});mountAuthWaves()
export {}

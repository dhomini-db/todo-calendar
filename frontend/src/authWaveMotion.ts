const motionStyle=document.createElement('style');motionStyle.textContent=`
.auth-wave-back,.auth-wave-mid,.auth-wave-front{transform-box:fill-box;transform-origin:center;will-change:transform}
.auth-wave-back{animation:waveFloatBack 11s ease-in-out infinite alternate!important}
.auth-wave-mid{animation:waveFloatMid 14s ease-in-out infinite alternate!important}
.auth-wave-front{animation:waveFloatFront 17s ease-in-out infinite alternate!important}
@keyframes waveFloatBack{0%{transform:translate3d(-5%,-2.5%,0) scale(1.04) rotate(-.6deg)}50%{transform:translate3d(1.5%,2%,0) scale(1.075) rotate(.35deg)}100%{transform:translate3d(6%,-1%,0) scale(1.035) rotate(.8deg)}}
@keyframes waveFloatMid{0%{transform:translate3d(6%,2%,0) scale(1.05) rotate(.7deg)}50%{transform:translate3d(-1%,-2.8%,0) scale(1.085) rotate(-.3deg)}100%{transform:translate3d(-6%,1.4%,0) scale(1.04) rotate(-.75deg)}}
@keyframes waveFloatFront{0%{transform:translate3d(-4%,3%,0) scale(1.055) rotate(-.45deg)}50%{transform:translate3d(2%,-2%,0) scale(1.09) rotate(.25deg)}100%{transform:translate3d(5%,-.5%,0) scale(1.045) rotate(.65deg)}}
@media(max-width:600px){.auth-wave-back{animation-duration:15s!important}.auth-wave-mid{animation-duration:18s!important}.auth-wave-front{animation-duration:21s!important}}
@media(prefers-reduced-motion:reduce){.auth-wave-back,.auth-wave-mid,.auth-wave-front{animation:none!important}}
`;document.head.appendChild(motionStyle);export {}

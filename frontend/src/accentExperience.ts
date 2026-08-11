const accentStyle = document.createElement('style')
accentStyle.textContent = `
/* Light: graphite glass with restrained crimson accents. */
[data-theme="rose-dawn"]{
  --accent:#c9233f;
  --accent-soft:rgba(201,35,63,.11);
  --accent-glow:rgba(201,35,63,.075);
  --accent-border:rgba(201,35,63,.30);
}
[data-theme="rose-dawn"] .auth-page::before{
  box-shadow:0 34px 90px rgba(201,35,63,.10),0 34px 80px rgba(0,0,0,.12);
}
[data-theme="rose-dawn"] .auth-page::after{
  background:linear-gradient(120deg,rgba(28,29,33,.72),rgba(166,59,76,.20) 48%,rgba(255,255,255,.85));
}
[data-theme="rose-dawn"] .auth-card{
  box-shadow:0 28px 90px rgba(33,20,23,.20),0 0 55px rgba(201,35,63,.055),inset 0 1px 0 rgba(255,255,255,.55)!important;
}

/* Dark: black glass with PlayStation-like electric blue accents. */
[data-theme="amber-night"]{
  --accent:#4f8cff;
  --accent-soft:rgba(79,140,255,.14);
  --accent-glow:rgba(79,140,255,.09);
  --accent-border:rgba(79,140,255,.32);
}
[data-theme="amber-night"] .auth-page::before{
  background:linear-gradient(115deg,rgba(79,140,255,.13),rgba(84,92,110,.14) 45%,rgba(0,0,0,.88));
  box-shadow:0 34px 95px rgba(32,91,201,.12);
}
[data-theme="amber-night"] .auth-page::after{
  background:linear-gradient(120deg,rgba(0,0,0,.92),rgba(47,91,170,.22) 48%,rgba(123,169,255,.12));
}
[data-theme="amber-night"] .auth-card{
  box-shadow:0 28px 90px rgba(0,0,0,.48),0 0 64px rgba(79,140,255,.08),inset 0 1px 0 rgba(255,255,255,.10)!important;
}
`
document.head.appendChild(accentStyle)

export {}

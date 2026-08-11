if (!localStorage.getItem('monochrome-theme-migrated')) {
  localStorage.setItem('theme', 'rose-dawn')
  localStorage.setItem('monochrome-theme-migrated', '1')
  document.documentElement.setAttribute('data-theme', 'rose-dawn')
}

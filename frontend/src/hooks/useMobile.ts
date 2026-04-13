import { useEffect, useState } from 'react'

/**
 * Detecta se a tela é mobile usando window.innerWidth.
 * Atualiza quando a janela é redimensionada.
 * Usado para adicionar classe .mobile no app-shell e controlar
 * o layout via CSS sem depender apenas de media queries.
 */
export function useMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  )

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth <= breakpoint)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])

  return isMobile
}

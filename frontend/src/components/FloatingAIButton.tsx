import { useState } from 'react'
import AIChatPanel from './AIChatPanel'

function IconSparkle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z"/>
      <path d="M19 2L19.5 4.5L22 5L19.5 5.5L19 8L18.5 5.5L16 5L18.5 4.5Z"/>
      <path d="M5 17L5.5 19.5L8 20L5.5 20.5L5 23L4.5 20.5L2 20L4.5 19.5Z"/>
    </svg>
  )
}

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function FloatingAIButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && <AIChatPanel onClose={() => setOpen(false)} />}

      <button
        className={`ai-fab${open ? ' ai-fab--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Assistente IA"
        aria-label="Abrir assistente de IA"
      >
        <span className="ai-fab-inner">
          {open ? <IconX /> : <IconSparkle />}
        </span>
        {!open && <span className="ai-fab-pulse" />}
      </button>
    </>
  )
}

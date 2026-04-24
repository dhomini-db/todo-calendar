import { useState, useRef, useEffect, useCallback } from 'react'
import { sendAiMessage } from '../api/tasks'
import { useLanguage } from '../contexts/LanguageContext'
import type { AiChatMessage } from '../types'

interface Props { onClose: () => void }

const QUICK_ACTIONS_PT = [
  '💡 Sugira tarefas para hoje',
  '📊 Analise minha produtividade',
  '🗓️ Gere minha rotina diária',
  '🔥 Como melhorar meu streak?',
]
const QUICK_ACTIONS_EN = [
  '💡 Suggest tasks for today',
  '📊 Analyze my productivity',
  '🗓️ Generate my daily routine',
  '🔥 How to improve my streak?',
]

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}

export default function AIChatPanel({ onClose }: Props) {
  const { t, lang } = useLanguage()
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)

  const quickActions = lang === 'pt' ? QUICK_ACTIONS_PT : QUICK_ACTIONS_EN

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when panel opens
  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')

    const history = [...messages]
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const res = await sendAiMessage({ message: msg, history })
      if (res.success && res.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.response! }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ ${res.error ?? t('ai.error')}`,
        }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${t('ai.conn_error')}` }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [input, loading, messages, t])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ai-panel" role="dialog" aria-label={t('ai.panel_title')}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="ai-panel-header">
        <div className="ai-panel-title-wrap">
          <div className="ai-panel-avatar">✨</div>
          <div>
            <p className="ai-panel-name">TaskFlow AI</p>
            <p className="ai-panel-sub">{t('ai.sub')}</p>
          </div>
        </div>
        <button className="ai-panel-close" onClick={onClose} aria-label={t('common.close')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* ── Messages ───────────────────────────────────────────── */}
      <div className="ai-panel-messages">
        {messages.length === 0 && !loading && (
          <div className="ai-panel-empty">
            <p className="ai-empty-greeting">{t('ai.greeting')}</p>
            <div className="ai-quick-grid">
              {quickActions.map((q, i) => (
                <button
                  key={i}
                  className="ai-quick-btn"
                  onClick={() => handleSend(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`ai-msg ai-msg--${msg.role}`}>
            {msg.role === 'assistant' && (
              <span className="ai-msg-avatar">✨</span>
            )}
            <div className="ai-msg-bubble">
              {msg.content.split('\n').map((line, j) => (
                line ? <p key={j}>{line}</p> : <br key={j} />
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-msg ai-msg--assistant">
            <span className="ai-msg-avatar">✨</span>
            <div className="ai-msg-bubble ai-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ──────────────────────────────────────────────── */}
      <div className="ai-panel-input-row">
        <input
          ref={inputRef}
          className="ai-panel-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t('ai.placeholder')}
          disabled={loading}
          maxLength={800}
        />
        <button
          className="ai-panel-send"
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          aria-label={t('ai.send')}
        >
          <IconSend />
        </button>
      </div>
    </div>
  )
}

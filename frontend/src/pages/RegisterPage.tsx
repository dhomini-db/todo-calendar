import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/tasks'
import { useAuth } from '../contexts/AuthContext'
import DemoEmailNotice from '../components/DemoEmailNotice'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { saveAuth } = useAuth()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [leaving,  setLeaving]  = useState(false)
  const [showDemoNotice, setShowDemoNotice] = useState(() => {
    if (window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches) return false
    try { return sessionStorage.getItem('taskflow-demo-notice-seen') !== '1' } catch { return true }
  })

  function closeDemoNotice() {
    try { sessionStorage.setItem('taskflow-demo-notice-seen', '1') } catch { /* storage blocked */ }
    setShowDemoNotice(false)
  }

  const strengthScore = [
    password.length >= 10,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length
  const strength = password.length === 0 ? null : strengthScore <= 1
    ? { label: 'Fraca', level: 'weak' }
    : strengthScore <= 3
      ? { label: 'Média', level: 'medium' }
      : { label: 'Forte', level: 'strong' }

  function validate(): string | null {
    if (name.trim().length < 2)  return 'Nome deve ter pelo menos 2 caracteres'
    if (!/\S+@\S+\.\S+/.test(email)) return 'E-mail inválido'
    if (password.length < 10)    return 'Senha deve ter pelo menos 10 caracteres'
    if (password.length > 128)   return 'Senha deve ter no máximo 128 caracteres'
    if (password !== confirm)    return 'As senhas não coincidem'
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setError('')
    setLoading(true)
    try {
      const res = await register({ name: name.trim(), email, password })
      saveAuth(res)
      setLeaving(true)
      setTimeout(() => navigate('/', { replace: true }), 230)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error
      setError(msg ?? 'Erro ao criar conta')
      setLoading(false)
    }
  }

  return (
    <div className={`auth-page${leaving ? ' auth-page--leaving' : ''}`}>
      {showDemoNotice && <DemoEmailNotice onClose={closeDemoNotice} />}
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo-icon.svg" alt="TaskFlow" className="auth-logo-img" />
          <span className="auth-logo-text">TaskFlow</span>
        </div>

        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-subtitle">Comece a organizar seu dia</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label">Nome</label>
            <input
              type="text"
              className="field-input"
              placeholder="Seu nome"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field-group">
            <label className="field-label">E-mail</label>
            <input
              type="email"
              className="field-input"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Senha</label>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                className="field-input"
                placeholder="Mínimo 10 caracteres"
                minLength={10}
                maxLength={128}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword}>
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {strength && (
              <div className={`password-strength password-strength--${strength.level}`} aria-live="polite">
                <div className="password-strength-bars"><i /><i /><i /></div>
                <span>Senha {strength.label.toLowerCase()}</span>
              </div>
            )}
          </div>

          <div className="field-group">
            <label className="field-label">Confirmar senha</label>
            <div className="password-field">
              <input
                type={showConfirm ? 'text' : 'password'}
                className="field-input"
                placeholder="Repita a senha"
                minLength={10}
                maxLength={128}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirm(value => !value)} aria-label={showConfirm ? 'Ocultar confirmação da senha' : 'Mostrar confirmação da senha'} aria-pressed={showConfirm}>
                <EyeIcon open={showConfirm} />
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Criar conta'}
          </button>
        </form>

        <p className="auth-switch">
          Já tem conta?{' '}
          <Link to="/login" className="auth-link">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.8 10.8 0 0112 4c5.2 0 8.6 4.3 9.5 5.7a4 4 0 010 4.6 15.5 15.5 0 01-2.4 2.8M6.2 6.2a16 16 0 00-3.7 3.5 4 4 0 000 4.6C3.4 15.7 6.8 20 12 20a10.8 10.8 0 004.1-.8" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 9.7C3.4 8.3 6.8 4 12 4s8.6 4.3 9.5 5.7a4 4 0 010 4.6C20.6 15.7 17.2 20 12 20s-8.6-4.3-9.5-5.7a4 4 0 010-4.6z" /><circle cx="12" cy="12" r="3" /></svg>
  )
}

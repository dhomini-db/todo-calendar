import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/tasks'
import { useAuth } from '../contexts/AuthContext'
import DemoEmailNotice from '../components/DemoEmailNotice'

export default function LoginPage() {
  const navigate = useNavigate()
  const { saveAuth } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [leaving,  setLeaving]  = useState(false)
  const [showDemoNotice, setShowDemoNotice] = useState(() => {
    try { return sessionStorage.getItem('taskflow-demo-notice-seen') !== '1' } catch { return true }
  })

  function closeDemoNotice() {
    try { sessionStorage.setItem('taskflow-demo-notice-seen', '1') } catch { /* storage blocked */ }
    setShowDemoNotice(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ email, password })
      saveAuth(res)
      // Play exit animation before navigating
      setLeaving(true)
      setTimeout(() => navigate('/', { replace: true }), 230)
    } catch (err: unknown) {
      const data = (err as {
        response?: { data?: { error?: string | { message?: string }; message?: string } }
      }).response?.data
      const apiError = data?.error
      const msg = typeof apiError === 'string'
        ? apiError
        : apiError?.message ?? data?.message ?? 'Credenciais inválidas'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className={`auth-page${leaving ? ' auth-page--leaving' : ''}`}>
      {showDemoNotice && <DemoEmailNotice onClose={closeDemoNotice} />}
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/logo-icon.svg" alt="TaskFlow" className="auth-logo-img" />
          <span className="auth-logo-text">TaskFlow</span>
        </div>

        <h1 className="auth-title">Bem-vindo de volta</h1>
        <p className="auth-subtitle">Entre na sua conta para continuar</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label">E-mail</label>
            <input
              type="email"
              className="field-input"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              maxLength={254}
              autoFocus
            />
          </div>

          <div className="field-group">
            <label className="field-label">Senha</label>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                className="field-input"
                placeholder="Sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                maxLength={128}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword}>
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.8 10.8 0 0112 4c5.2 0 8.6 4.3 9.5 5.7a4 4 0 010 4.6 15.5 15.5 0 01-2.4 2.8M6.2 6.2a16 16 0 00-3.7 3.5 4 4 0 000 4.6C3.4 15.7 6.8 20 12 20a10.8 10.8 0 004.1-.8" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 9.7C3.4 8.3 6.8 4 12 4s8.6 4.3 9.5 5.7a4 4 0 010 4.6C20.6 15.7 17.2 20 12 20s-8.6-4.3-9.5-5.7a4 4 0 010-4.6z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          Não tem conta?{' '}
          <Link to="/register" className="auth-link">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}

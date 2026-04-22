import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile, changePassword } from '../api/tasks'
import type { UpdateProfileRequest, ChangePasswordRequest } from '../types'

// ── Password strength ──────────────────────────────────────────

function passwordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8)  score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return { score, label: 'Fraca',  color: '#f87171' }
  if (score <= 2) return { score, label: 'Média',  color: '#fb923c' }
  if (score <= 3) return { score, label: 'Boa',    color: '#facc15' }
  return               { score, label: 'Forte',   color: '#4ade80' }
}

// ── Main component ─────────────────────────────────────────────

export default function ContaPage() {
  const { user, updateUser, logout } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  // ── Edit profile state ─────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false)
  const [profileName,  setProfileName]  = useState(user?.name  ?? '')
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '')
  const [profileError, setProfileError] = useState('')
  const [profileOk,    setProfileOk]    = useState(false)

  const profileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: (res) => {
      updateUser({ name: res.name, email: res.email })
      setProfileOk(true)
      setProfileError('')
      setTimeout(() => { setProfileOk(false); setEditOpen(false) }, 1200)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error ?? 'Erro ao salvar perfil'
      setProfileError(msg)
    },
  })

  function handleProfileSave(e: FormEvent) {
    e.preventDefault()
    setProfileError('')
    setProfileOk(false)
    profileMutation.mutate({ name: profileName.trim(), email: profileEmail.trim().toLowerCase() })
  }

  function openEdit() {
    setProfileName(user?.name  ?? '')
    setProfileEmail(user?.email ?? '')
    setProfileError('')
    setProfileOk(false)
    setEditOpen(true)
  }

  // ── Change password state ──────────────────────────────────
  const [pwdOpen,    setPwdOpen]    = useState(false)
  const [curPwd,     setCurPwd]     = useState('')
  const [newPwd,     setNewPwd]     = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError,   setPwdError]   = useState('')
  const [pwdOk,      setPwdOk]      = useState(false)

  const strength = passwordStrength(newPwd)

  const pwdMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
    onSuccess: () => {
      setPwdOk(true)
      setPwdError('')
      setCurPwd(''); setNewPwd(''); setConfirmPwd('')
      setTimeout(() => { setPwdOk(false); setPwdOpen(false) }, 1400)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error ?? 'Erro ao alterar senha'
      setPwdError(msg)
    },
  })

  function handlePwdSave(e: FormEvent) {
    e.preventDefault()
    setPwdError('')
    setPwdOk(false)
    if (newPwd !== confirmPwd) {
      setPwdError('A confirmação não coincide com a nova senha')
      return
    }
    pwdMutation.mutate({ currentPassword: curPwd, newPassword: newPwd, confirmNewPassword: confirmPwd })
  }

  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <h1 className="page-title">Minha Conta</h1>
        <p className="page-sub">Gerencie seu perfil e segurança</p>
      </div>

      {/* ── Profile card ──────────────────────────────────────── */}
      <div className="settings-section">
        <p className="settings-section-title">Perfil</p>
        <div className="conta-card">
          <div className="conta-avatar conta-avatar--lg">{initials}</div>
          <div className="conta-info">
            <p className="conta-name">{user?.name}</p>
            <p className="conta-email">{user?.email}</p>
          </div>
          <button className="conta-edit-btn" onClick={openEdit}>Editar</button>
        </div>

        {/* Edit profile form */}
        {editOpen && (
          <form className="conta-form" onSubmit={handleProfileSave}>
            <div className="conta-form-row">
              <label className="conta-label">Nome</label>
              <input
                className="conta-input"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
            <div className="conta-form-row">
              <label className="conta-label">E-mail</label>
              <input
                className="conta-input"
                type="email"
                value={profileEmail}
                onChange={e => setProfileEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            {profileError && <p className="conta-error">{profileError}</p>}
            {profileOk    && <p className="conta-success">Perfil atualizado ✓</p>}
            <div className="conta-form-actions">
              <button type="button" className="conta-btn-cancel" onClick={() => setEditOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="conta-btn-save" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Change password ────────────────────────────────────── */}
      <div className="settings-section">
        <p className="settings-section-title">Segurança</p>
        <div className="conta-action-row" onClick={() => { setPwdOpen(o => !o); setPwdError(''); setPwdOk(false) }}>
          <div>
            <p className="conta-action-title">Alterar senha</p>
            <p className="conta-action-desc">Defina uma nova senha de acesso</p>
          </div>
          <span className="conta-chevron">{pwdOpen ? '▲' : '▼'}</span>
        </div>

        {pwdOpen && (
          <form className="conta-form conta-form--indent" onSubmit={handlePwdSave}>
            <div className="conta-form-row">
              <label className="conta-label">Senha atual</label>
              <input
                className="conta-input"
                type="password"
                value={curPwd}
                onChange={e => setCurPwd(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="conta-form-row">
              <label className="conta-label">Nova senha</label>
              <input
                className="conta-input"
                type="password"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="mín. 8 caracteres"
                required
                minLength={8}
              />
              {newPwd && (
                <div className="pwd-strength">
                  <div className="pwd-strength-bar">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className="pwd-strength-seg"
                        style={{ background: i <= strength.score ? strength.color : 'var(--line)' }}
                      />
                    ))}
                  </div>
                  <span className="pwd-strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>
            <div className="conta-form-row">
              <label className="conta-label">Confirmar nova senha</label>
              <input
                className="conta-input"
                type="password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {pwdError && <p className="conta-error">{pwdError}</p>}
            {pwdOk    && <p className="conta-success">Senha alterada com sucesso ✓</p>}
            <div className="conta-form-actions">
              <button type="button" className="conta-btn-cancel" onClick={() => setPwdOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="conta-btn-save" disabled={pwdMutation.isPending}>
                {pwdMutation.isPending ? 'Salvando…' : 'Alterar senha'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Danger zone ────────────────────────────────────────── */}
      <div className="settings-section">
        <p className="settings-section-title">Sessão</p>
        <div className="conta-logout-row">
          <div>
            <p className="conta-action-title">Sair da conta</p>
            <p className="conta-action-desc">Encerra sua sessão neste dispositivo</p>
          </div>
          <button className="conta-btn-logout" onClick={logout}>Sair</button>
        </div>
      </div>
    </div>
  )
}

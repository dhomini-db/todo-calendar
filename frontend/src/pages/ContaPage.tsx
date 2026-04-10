import { useAuth } from '../contexts/AuthContext'

export default function ContaPage() {
  const { user } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <h1 className="page-title">Minha Conta</h1>
        <p className="page-sub">Informações do seu perfil</p>
      </div>

      {user && (
        <div className="settings-section">
          <p className="settings-section-title">Perfil</p>
          <div className="conta-card">
            <div className="conta-avatar">{initials}</div>
            <div className="conta-info">
              <p className="conta-name">{user.name}</p>
              <p className="conta-email">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="settings-section">
        <p className="settings-section-title">Ações</p>
        <div className="placeholder-actions">
          <div className="placeholder-action-item">
            <div className="placeholder-action-text">
              <p className="placeholder-action-title">Editar perfil</p>
              <p className="placeholder-action-desc">Alterar nome e e-mail</p>
            </div>
            <span className="soon-badge">Em breve</span>
          </div>
          <div className="placeholder-action-item">
            <div className="placeholder-action-text">
              <p className="placeholder-action-title">Alterar senha</p>
              <p className="placeholder-action-desc">Definir nova senha de acesso</p>
            </div>
            <span className="soon-badge">Em breve</span>
          </div>
        </div>
      </div>
    </div>
  )
}

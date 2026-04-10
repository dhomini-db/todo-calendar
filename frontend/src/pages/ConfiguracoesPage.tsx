export default function ConfiguracoesPage() {
  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <h1 className="page-title">Configurações</h1>
        <p className="page-sub">Preferências e ajustes do aplicativo</p>
      </div>

      <div className="settings-section">
        <p className="settings-section-title">Geral</p>
        <div className="placeholder-actions">
          <div className="placeholder-action-item">
            <div className="placeholder-action-text">
              <p className="placeholder-action-title">Idioma</p>
              <p className="placeholder-action-desc">Português (Brasil)</p>
            </div>
            <span className="soon-badge">Em breve</span>
          </div>
          <div className="placeholder-action-item">
            <div className="placeholder-action-text">
              <p className="placeholder-action-title">Notificações</p>
              <p className="placeholder-action-desc">Lembretes diários de tarefas</p>
            </div>
            <span className="soon-badge">Em breve</span>
          </div>
          <div className="placeholder-action-item">
            <div className="placeholder-action-text">
              <p className="placeholder-action-title">Exportar dados</p>
              <p className="placeholder-action-desc">Baixar histórico em CSV</p>
            </div>
            <span className="soon-badge">Em breve</span>
          </div>
        </div>
      </div>

      <div className="placeholder-banner">
        <div className="placeholder-banner-icon">⚙️</div>
        <p className="placeholder-banner-title">Em desenvolvimento</p>
        <p className="placeholder-banner-desc">
          As configurações permitirão ajustar notificações, idioma e exportar seus dados.
        </p>
      </div>
    </div>
  )
}

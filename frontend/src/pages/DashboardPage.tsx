export default function DashboardPage() {
  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Visão geral do seu desempenho</p>
      </div>

      <div className="placeholder-grid">
        <div className="placeholder-stat-card">
          <p className="placeholder-stat-label">Score hoje</p>
          <p className="placeholder-stat-value">—</p>
        </div>
        <div className="placeholder-stat-card">
          <p className="placeholder-stat-label">Streak atual</p>
          <p className="placeholder-stat-value">—</p>
        </div>
        <div className="placeholder-stat-card">
          <p className="placeholder-stat-label">Tarefas este mês</p>
          <p className="placeholder-stat-value">—</p>
        </div>
        <div className="placeholder-stat-card">
          <p className="placeholder-stat-label">Taxa de conclusão</p>
          <p className="placeholder-stat-value">—</p>
        </div>
      </div>

      <div className="placeholder-banner">
        <div className="placeholder-banner-icon">📊</div>
        <p className="placeholder-banner-title">Em desenvolvimento</p>
        <p className="placeholder-banner-desc">
          O Dashboard mostrará seu score dos últimos 30 dias, streak de dias consecutivos
          e análises detalhadas das suas tarefas.
        </p>
      </div>
    </div>
  )
}

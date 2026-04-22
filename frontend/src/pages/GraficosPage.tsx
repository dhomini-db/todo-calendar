import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import { getMonthlyPerformance } from '../api/tasks'
import type { MonthlyPerformance } from '../types'

// ── Helpers ────────────────────────────────────────────────────

function barColor(pct: number | null): string {
  if (pct === null) return 'var(--line)'
  if (pct >= 70)   return '#4ade80'
  if (pct >= 40)   return '#facc15'
  return '#f87171'
}

function barOpacity(pct: number | null): number {
  return pct === null ? 0.35 : 1
}

// ── Chart data shape ───────────────────────────────────────────

interface ChartItem extends MonthlyPerformance {
  display: number
}

// ── Custom Tooltip ─────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload as ChartItem
  const { percentage } = item
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-month">{label}</p>
      <p className="chart-tooltip-value" style={{ color: barColor(percentage) }}>
        {percentage !== null ? `${percentage}%` : 'Sem dados'}
      </p>
      {percentage !== null && (
        <p className="chart-tooltip-label">
          {percentage >= 70
            ? 'Bom desempenho'
            : percentage >= 40
              ? 'Desempenho médio'
              : 'Abaixo da meta'}
        </p>
      )}
    </div>
  )
}

// ── Summary cards ──────────────────────────────────────────────

interface WithData { month: string; percentage: number }

function SummaryCards({ data }: { data: MonthlyPerformance[] }) {
  const withData = data.filter((d): d is WithData => d.percentage !== null)
  if (!withData.length) return null

  const avg   = Math.round(withData.reduce((s, d) => s + d.percentage, 0) / withData.length)
  const best  = withData.reduce((a, b) => a.percentage >= b.percentage ? a : b)
  const worst = withData.reduce((a, b) => a.percentage <= b.percentage ? a : b)

  return (
    <div className="chart-summary-grid">
      <div className="chart-summary-card">
        <p className="chart-summary-label">Média do ano</p>
        <p className="chart-summary-value" style={{ color: barColor(avg) }}>{avg}%</p>
      </div>
      <div className="chart-summary-card">
        <p className="chart-summary-label">Melhor mês</p>
        <p className="chart-summary-value" style={{ color: '#4ade80' }}>
          {best.month} · {best.percentage}%
        </p>
      </div>
      <div className="chart-summary-card">
        <p className="chart-summary-label">Pior mês</p>
        <p className="chart-summary-value" style={{ color: barColor(worst.percentage) }}>
          {worst.month} · {worst.percentage}%
        </p>
      </div>
    </div>
  )
}

// ── Skeleton bars ──────────────────────────────────────────────

const SKELETON_HEIGHTS = [55, 72, 40, 68, 30, 78, 50, 65, 42, 58, 35, 70]

function SkeletonChart() {
  return (
    <div className="chart-placeholder">
      <div className="chart-placeholder-bars">
        {SKELETON_HEIGHTS.map((h, i) => (
          <div key={i} className="chart-placeholder-bar" style={{ height: `${h}%` }} />
        ))}
      </div>
      <p className="chart-placeholder-label">Carregando…</p>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────

export default function GraficosPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['stats', 'monthly-performance'],
    queryFn: getMonthlyPerformance,
    staleTime: 5 * 60 * 1000,
  })

  const chartData: ChartItem[] = (data ?? []).map(d => ({
    ...d,
    display: d.percentage ?? 0,
  }))

  const year = new Date().getFullYear()
  const allEmpty = !isLoading && !isError && data?.every(d => d.percentage === null)

  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <h1 className="page-title">Gráficos</h1>
        <p className="page-sub">Seu desempenho ao longo do tempo</p>
      </div>

      {/* Summary cards */}
      {data && <SummaryCards data={data} />}

      {/* Bar chart */}
      <div className="settings-section">
        <p className="settings-section-title">Desempenho mensal — {year}</p>
        <div className="chart-card">

          {isLoading && <SkeletonChart />}

          {isError && (
            <div className="chart-empty">
              <span className="chart-empty-icon">⚠️</span>
              <p className="chart-empty-title">Erro ao carregar</p>
              <p className="chart-empty-desc">Não foi possível buscar os dados. Tente recarregar a página.</p>
            </div>
          )}

          {!isLoading && !isError && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                barCategoryGap="35%"
                margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--text-3)', fontSize: 11.5, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fill: 'var(--text-3)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'var(--raised)', radius: 4 }}
                />
                <Bar dataKey="display" radius={[5, 5, 0, 0]} maxBarSize={40}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={barColor(entry.percentage)}
                      fillOpacity={barOpacity(entry.percentage)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {!isLoading && !isError && (
            <div className="chart-legend">
              <span className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: '#4ade80' }} />
                Bom (≥70%)
              </span>
              <span className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: '#facc15' }} />
                Médio (40–69%)
              </span>
              <span className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: '#f87171' }} />
                Baixo (&lt;40%)
              </span>
              <span className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: 'var(--line)', opacity: 1 }} />
                Sem dados
              </span>
            </div>
          )}
        </div>
      </div>

      {allEmpty && (
        <div className="chart-empty">
          <span className="chart-empty-icon">📊</span>
          <p className="chart-empty-title">Ainda sem dados</p>
          <p className="chart-empty-desc">
            Complete tarefas ao longo do mês para ver seu desempenho aqui.
          </p>
        </div>
      )}
    </div>
  )
}

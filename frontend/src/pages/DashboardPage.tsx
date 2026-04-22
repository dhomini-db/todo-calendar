import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import { getDashboardStats } from '../api/tasks'
import type { DashboardStats, DailyScore } from '../types'

// ── Color helpers ──────────────────────────────────────────────

function scoreColor(pct: number | null): string {
  if (pct === null) return 'var(--text-3)'
  if (pct >= 70)   return '#4ade80'
  if (pct >= 40)   return '#facc15'
  return '#f87171'
}

// ── Trend calculation ──────────────────────────────────────────

function calcTrend(days: DailyScore[]): { label: string; color: string; arrow: string } | null {
  const valid = days.filter(d => d.percentage !== null) as { percentage: number }[]
  if (valid.length < 8) return null

  const recent = valid.slice(-7).reduce((s, d) => s + d.percentage, 0) / 7
  const prev   = valid.slice(-14, -7).reduce((s, d) => s + d.percentage, 0) / valid.slice(-14, -7).length

  const diff = recent - prev
  if (diff > 3)  return { label: 'Melhorando', color: '#4ade80', arrow: '↑' }
  if (diff < -3) return { label: 'Piorando',   color: '#f87171', arrow: '↓' }
  return             { label: 'Estável',     color: '#facc15', arrow: '→' }
}

// ── Metric card icons ──────────────────────────────────────────

function IconScore() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}
function IconFlame() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.387 0 2.5-1.343 2.5-3 0-1.657-1.5-3-1.5-5 0 0 3 1.343 3 4.5 0 2.485-2.015 4.5-4.5 4.5S6 15.985 6 13.5C6 11.5 8 8 12 6c0 0-1 3.5 1 5.5-.5-.5-1-1.5-1-2.5s.5-1 .5-1"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  )
}

// ── Metric card ────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  accent?: string
  loading?: boolean
}

function MetricCard({ icon, label, value, sub, accent, loading }: MetricCardProps) {
  return (
    <div className="dash-card" style={accent ? { '--dash-accent': accent } as React.CSSProperties : undefined}>
      <div className="dash-card-header">
        <span className="dash-card-icon" style={{ color: accent ?? 'var(--text-3)' }}>{icon}</span>
        <span className="dash-card-label">{label}</span>
      </div>
      {loading
        ? <div className="dash-card-skeleton" />
        : <p className="dash-card-value" style={{ color: accent ?? 'var(--text)' }}>{value}</p>
      }
      {sub && !loading && <p className="dash-card-sub">{sub}</p>}
    </div>
  )
}

// ── Custom tooltip ─────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload as DailyScore & { display: number }
  const pct  = item.percentage
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-month">{label}</p>
      <p className="chart-tooltip-value" style={{ color: scoreColor(pct) }}>
        {pct !== null ? `${pct}%` : 'Sem dados'}
      </p>
      {pct !== null && (
        <p className="chart-tooltip-label">
          {pct >= 70 ? 'Bom dia' : pct >= 40 ? 'Dia médio' : 'Dia difícil'}
        </p>
      )}
    </div>
  )
}

// ── Chart area ─────────────────────────────────────────────────

function PerformanceChart({ days }: { days: DailyScore[] }) {
  const trend = calcTrend(days)

  // Replace null with undefined so recharts draws gaps
  type ChartPoint = DailyScore & { display: number | undefined }
  const data: ChartPoint[] = days.map(d => ({
    ...d,
    display: d.percentage ?? undefined,
  }))

  // Show every 5th label on X axis to avoid clutter
  const tickInterval = Math.floor(days.length / 6)

  return (
    <div className="settings-section">
      <div className="dash-chart-header">
        <p className="settings-section-title" style={{ margin: 0 }}>Desempenho — últimos 30 dias</p>
        {trend && (
          <span className="dash-trend-badge" style={{ color: trend.color }}>
            {trend.arrow} {trend.label}
          </span>
        )}
      </div>
      <div className="chart-card" style={{ marginTop: 10 }}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={tickInterval}
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
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--line-md)', strokeWidth: 1 }} />
            <ReferenceLine y={50} stroke="var(--line-md)" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="display"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#dashGrad)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--base)', strokeWidth: 2 }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <p className="dash-chart-hint">Linha tracejada = meta de 50%</p>
      </div>
    </div>
  )
}

// ── Loading skeleton ───────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <>
      <div className="dash-cards-grid">
        {[0,1,2,3].map(i => (
          <div key={i} className="dash-card">
            <div className="dash-card-header">
              <div className="dash-skel dash-skel--icon" />
              <div className="dash-skel dash-skel--label" />
            </div>
            <div className="dash-skel dash-skel--value" />
            <div className="dash-skel dash-skel--sub" />
          </div>
        ))}
      </div>
      <div className="settings-section">
        <div className="dash-skel dash-skel--title" />
        <div className="chart-card" style={{ marginTop: 10 }}>
          <div className="chart-placeholder" style={{ height: 220 }}>
            <div className="chart-placeholder-bars">
              {[60,45,70,55,80,40,65,75,50,60,70,45,55,80,65,70,50,60,75,55,65,70,45,80,60,55,70,65,50,75]
                .map((h,i) => <div key={i} className="chart-placeholder-bar" style={{ height: `${h}%` }} />)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main page ──────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ['stats', 'dashboard'],
    queryFn:  getDashboardStats,
    staleTime: 60 * 1000,
  })

  const scoreColor_ = scoreColor(data?.scoreHoje ?? null)
  const taxaColor   = scoreColor(data?.taxaConclusaoMes ?? null)

  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Visão geral do seu desempenho</p>
      </div>

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <div className="chart-empty">
          <span className="chart-empty-icon">⚠️</span>
          <p className="chart-empty-title">Não foi possível carregar</p>
          <p className="chart-empty-desc">Verifique sua conexão e recarregue a página.</p>
        </div>
      )}

      {data && (
        <>
          {/* Metric cards */}
          <div className="dash-cards-grid">
            <MetricCard
              icon={<IconScore />}
              label="Score hoje"
              value={data.scoreHoje !== null ? `${data.scoreHoje}%` : '—'}
              sub={data.scoreHoje !== null
                ? data.scoreHoje >= 70 ? 'Ótimo desempenho!'
                : data.scoreHoje >= 40 ? 'Continue assim'
                : 'Você consegue mais'
                : 'Sem tarefas hoje'}
              accent={scoreColor_}
            />
            <MetricCard
              icon={<IconFlame />}
              label="Streak atual"
              value={`${data.streakAtual} ${data.streakAtual === 1 ? 'dia' : 'dias'}`}
              sub={data.streakAtual > 0 ? 'Dias consecutivos ≥ 50%' : 'Complete hoje para começar'}
              accent={data.streakAtual > 0 ? '#fb923c' : undefined}
            />
            <MetricCard
              icon={<IconCheck />}
              label="Tarefas este mês"
              value={data.tarefasTotalMes}
              sub={`${data.tarefasConcluidasMes} positivas concluídas`}
              accent="var(--accent)"
            />
            <MetricCard
              icon={<IconChart />}
              label="Taxa de conclusão"
              value={data.taxaConclusaoMes !== null ? `${data.taxaConclusaoMes}%` : '—'}
              sub="Média mensal do desempenho"
              accent={taxaColor}
            />
          </div>

          {/* 30-day chart */}
          <PerformanceChart days={data.last30Days} />
        </>
      )}
    </div>
  )
}

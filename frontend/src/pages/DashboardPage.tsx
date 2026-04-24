import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import { getDashboardStats } from '../api/tasks'
import type { DashboardStats, DailyScore } from '../types'
import { useLanguage } from '../contexts/LanguageContext'

// ── Semantic chart colors (muted, minimalist palette) ──────────
const CLR_GOOD   = '#6dbc98'   // sage green   (was #4ade80)
const CLR_AVG    = '#c4a04a'   // muted amber  (was #facc15)
const CLR_BAD    = '#c47878'   // soft brick   (was #f87171)
const CLR_STREAK = '#c0804a'   // warm amber   (was #fb923c)
const CLR_NONE   = 'var(--line-md)'

// ── Color helpers ──────────────────────────────────────────────

function scoreColor(pct: number | null): string {
  if (pct === null) return 'var(--text-3)'
  if (pct >= 70)   return CLR_GOOD
  if (pct >= 40)   return CLR_AVG
  return CLR_BAD
}

// ── Trend calculation ──────────────────────────────────────────

function calcTrend(days: DailyScore[], t: (k: string) => string): { label: string; color: string; arrow: string } | null {
  const valid = days.filter(d => d.percentage !== null) as { percentage: number }[]
  if (valid.length < 8) return null

  const recent = valid.slice(-7).reduce((s, d) => s + d.percentage, 0) / 7
  const prev   = valid.slice(-14, -7).reduce((s, d) => s + d.percentage, 0) / valid.slice(-14, -7).length

  const diff = recent - prev
  if (diff > 3)  return { label: t('dash.trend.up'),     color: CLR_GOOD, arrow: '↑' }
  if (diff < -3) return { label: t('dash.trend.down'),   color: CLR_BAD,  arrow: '↓' }
  return             { label: t('dash.trend.stable'),  color: CLR_AVG,  arrow: '→' }
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
  const { t } = useLanguage()
  if (!active || !payload?.length) return null
  const item = payload[0].payload as DailyScore & { display: number }
  const pct  = item.percentage
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-month">{label}</p>
      <p className="chart-tooltip-value" style={{ color: scoreColor(pct) }}>
        {pct !== null ? `${pct}%` : t('dash.tooltip.none')}
      </p>
      {pct !== null && (
        <p className="chart-tooltip-label">
          {pct >= 70 ? t('dash.tooltip.good') : pct >= 40 ? t('dash.tooltip.avg') : t('dash.tooltip.bad')}
        </p>
      )}
    </div>
  )
}

// ── Chart area ─────────────────────────────────────────────────

function PerformanceChart({ days, t }: { days: DailyScore[]; t: (k: string) => string }) {
  const trend = calcTrend(days, t)

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
        <p className="settings-section-title" style={{ margin: 0 }}>{t('dash.chart.title')}</p>
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
        <p className="dash-chart-hint">{t('dash.chart.hint')}</p>
      </div>
    </div>
  )
}

// ── Activity heatmap ───────────────────────────────────────────

function heatColor(pct: number | null): string {
  if (pct === null) return CLR_NONE
  if (pct >= 70)   return CLR_GOOD
  if (pct >= 40)   return CLR_AVG
  return CLR_BAD
}

function HeatmapSection({ days, t }: { days: DailyScore[]; t: (k: string) => string }) {
  const hasAny = days.some(d => d.percentage !== null)
  if (!days.length) return null

  // ── Build week-column grid (GitHub contribution style) ────
  // Pad so index 0 of the flat array = Sunday of the first week
  const firstDow = new Date(days[0].date + 'T12:00:00').getDay() // 0=Sun … 6=Sat

  // After the real data, add 4 extra weeks of neutral future cells
  const FUTURE_WEEKS = 4
  const padded: (DailyScore | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...days,
    ...Array<null>(FUTURE_WEEKS * 7).fill(null),
  ]
  const numWeeks = Math.ceil(padded.length / 7)
  while (padded.length < numWeeks * 7) padded.push(null) // fill trailing row

  // grid[dow][weekIdx]  (dow 0=Sun … 6=Sat)
  const grid: (DailyScore | null)[][] = Array.from({ length: 7 }, (_, dow) =>
    Array.from({ length: numWeeks }, (_, w) => padded[w * 7 + dow])
  )

  // Row labels — show only Mon(1), Wed(3), Fri(5) like GitHub
  const DOW_ALL = t('dash.weekdays').split(',').map(s => s.trim())

  return (
    <div className="settings-section">
      <p className="settings-section-title">{t('dash.heatmap.title')}</p>
      <div className="chart-card">
        <div className="dash-heatmap-wrap">
          {/* Day-of-week labels */}
          <div className="dash-heatmap-ylabels">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="dash-heatmap-ylabel">
                {[1, 3, 5].includes(i) ? DOW_ALL[i] : ''}
              </span>
            ))}
          </div>

          {/* Week columns */}
          <div className="dash-heatmap-weeks">
            {Array.from({ length: numWeeks }, (_, w) => (
              <div key={w} className="dash-heatmap-week">
                {Array.from({ length: 7 }, (_, dow) => {
                  const day = grid[dow][w]
                  if (!day) return (
                    <div key={dow} className="dash-heatmap-cell dash-heatmap-cell--pad" />
                  )
                  return (
                    <div
                      key={dow}
                      className="dash-heatmap-cell"
                      style={{ background: heatColor(day.percentage) }}
                      title={
                        day.percentage !== null
                          ? `${day.label} · ${day.percentage}%`
                          : `${day.label} · ${t('common.no_data')}`
                      }
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {hasAny && (
          <div className="dash-heatmap-legend">
            <span className="chart-legend-item">
              <span className="chart-legend-dot" style={{ background: CLR_NONE }} />
              {t('graficos.legend.none')}
            </span>
            <span className="chart-legend-item">
              <span className="chart-legend-dot" style={{ background: CLR_BAD }} />
              {t('graficos.legend.low')}
            </span>
            <span className="chart-legend-item">
              <span className="chart-legend-dot" style={{ background: CLR_AVG }} />
              {t('graficos.legend.avg')}
            </span>
            <span className="chart-legend-item">
              <span className="chart-legend-dot" style={{ background: CLR_GOOD }} />
              {t('graficos.legend.good')}
            </span>
          </div>
        )}
        {!hasAny && (
          <p className="dash-chart-hint" style={{ textAlign: 'center', padding: '16px 0 4px' }}>
            {t('dash.heatmap.empty')}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Weekday rhythm ─────────────────────────────────────────────

function WeekdaySection({ days, t }: { days: DailyScore[]; t: (k: string) => string }) {
  // Group by day of week (0 = Sun … 6 = Sat)
  const sums: Record<number, { total: number; count: number }> =
    Object.fromEntries([0,1,2,3,4,5,6].map(i => [i, { total: 0, count: 0 }]))

  days.forEach(day => {
    if (day.percentage === null || !day.date) return
    // Use T12:00:00 to avoid UTC-offset off-by-one on the weekday
    const wd = new Date(day.date + 'T12:00:00').getDay()
    sums[wd].total  += day.percentage
    sums[wd].count  += 1
  })

  const names = t('dash.weekdays').split(',')
  const chartData = names.map((name, i) => ({
    name: name.trim(),
    avg:  sums[i].count > 0 ? Math.round(sums[i].total / sums[i].count) : null,
    display: sums[i].count > 0 ? Math.round(sums[i].total / sums[i].count) : 0,
    count: sums[i].count,
  }))

  if (chartData.every(d => d.avg === null)) return null

  const best = chartData.reduce((a, b) =>
    (a.avg ?? -1) >= (b.avg ?? -1) ? a : b
  )

  return (
    <div className="settings-section">
      <div className="dash-chart-header">
        <p className="settings-section-title" style={{ margin: 0 }}>{t('dash.weekday.title')}</p>
        {best.avg !== null && (
          <span className="dash-trend-badge" style={{ color: scoreColor(best.avg) }}>
            ★ {best.name}
          </span>
        )}
      </div>
      <div className="chart-card" style={{ marginTop: 10 }}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={chartData}
            barCategoryGap="30%"
            margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="4 4" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--text-3)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={v => `${v}%`}
              ticks={[0, 50, 100]}
              tick={{ fill: 'var(--text-3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as typeof chartData[0]
                return (
                  <div className="chart-tooltip">
                    <p className="chart-tooltip-month">{label}</p>
                    <p className="chart-tooltip-value" style={{ color: scoreColor(d.avg) }}>
                      {d.avg !== null ? `${d.avg}%` : t('common.no_data')}
                    </p>
                    {d.count > 0 && (
                      <p className="chart-tooltip-label">{d.count} {t('dash.weekday.days')}</p>
                    )}
                  </div>
                )
              }}
              cursor={{ fill: 'var(--raised)', radius: 4 }}
            />
            <Bar dataKey="display" radius={[5, 5, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={scoreColor(entry.avg)}
                  fillOpacity={entry.avg === null ? 0.25 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="dash-chart-hint">{t('dash.weekday.hint')}</p>
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
  const { t } = useLanguage()
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
        <h1 className="page-title">{t('dash.title')}</h1>
        <p className="page-sub">{t('dash.sub')}</p>
      </div>

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <div className="chart-empty">
          <span className="chart-empty-icon">⚠️</span>
          <p className="chart-empty-title">{t('common.error.load')}</p>
          <p className="chart-empty-desc">{t('common.error.conn')}</p>
        </div>
      )}

      {data && (
        <>
          {/* Metric cards */}
          <div className="dash-cards-grid">
            <MetricCard
              icon={<IconScore />}
              label={t('dash.metric.score')}
              value={data.scoreHoje !== null ? `${data.scoreHoje}%` : '—'}
              sub={data.scoreHoje !== null
                ? data.scoreHoje >= 70 ? t('dash.score.great')
                : data.scoreHoje >= 40 ? t('dash.score.ok')
                : t('dash.score.low')
                : t('dash.score.none')}
              accent={scoreColor_}
            />
            <MetricCard
              icon={<IconFlame />}
              label={t('dash.metric.streak')}
              value={`${data.streakAtual} ${data.streakAtual === 1 ? t('dash.streak.day') : t('dash.streak.days')}`}
              sub={data.streakAtual > 0 ? t('dash.streak.sub') : t('dash.streak.none')}
              accent={data.streakAtual > 0 ? CLR_STREAK : undefined}
            />
            <MetricCard
              icon={<IconCheck />}
              label={t('dash.metric.tasks')}
              value={data.tarefasTotalMes}
              sub={`${data.tarefasConcluidasMes} ${t('dash.tasks.sub')}`}
              accent="var(--accent)"
            />
            <MetricCard
              icon={<IconChart />}
              label={t('dash.metric.rate')}
              value={data.taxaConclusaoMes !== null ? `${data.taxaConclusaoMes}%` : '—'}
              sub={t('dash.metric.rate.sub')}
              accent={taxaColor}
            />
          </div>

          {/* 30-day chart */}
          <PerformanceChart days={data.last30Days} t={t} />

          {/* 30-day heatmap */}
          <HeatmapSection days={data.last30Days} t={t} />

          {/* Weekday rhythm */}
          <WeekdaySection days={data.last30Days} t={t} />
        </>
      )}
    </div>
  )
}

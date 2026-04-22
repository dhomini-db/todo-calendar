import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import { getMonthlyPerformance } from '../api/tasks'
import type { MonthlyPerformance } from '../types'
import { useLanguage } from '../contexts/LanguageContext'

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
  const { t } = useLanguage()
  if (!active || !payload?.length) return null
  const item = payload[0].payload as ChartItem
  const { percentage } = item
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-month">{label}</p>
      <p className="chart-tooltip-value" style={{ color: barColor(percentage) }}>
        {percentage !== null ? `${percentage}%` : t('common.no_data')}
      </p>
      {percentage !== null && (
        <p className="chart-tooltip-label">
          {percentage >= 70
            ? t('graficos.tooltip.good')
            : percentage >= 40
              ? t('graficos.tooltip.avg')
              : t('graficos.tooltip.low')}
        </p>
      )}
    </div>
  )
}

// ── Summary cards ──────────────────────────────────────────────

interface WithData { month: string; percentage: number }

function SummaryCards({ data }: { data: MonthlyPerformance[] }) {
  const { t } = useLanguage()
  const withData = data.filter((d): d is WithData => d.percentage !== null)
  if (!withData.length) return null

  const avg   = Math.round(withData.reduce((s, d) => s + d.percentage, 0) / withData.length)
  const best  = withData.reduce((a, b) => a.percentage >= b.percentage ? a : b)
  const worst = withData.reduce((a, b) => a.percentage <= b.percentage ? a : b)

  return (
    <div className="chart-summary-grid">
      <div className="chart-summary-card">
        <p className="chart-summary-label">{t('graficos.avg')}</p>
        <p className="chart-summary-value" style={{ color: barColor(avg) }}>{avg}%</p>
      </div>
      <div className="chart-summary-card">
        <p className="chart-summary-label">{t('graficos.best')}</p>
        <p className="chart-summary-value" style={{ color: '#4ade80' }}>
          {best.month} · {best.percentage}%
        </p>
      </div>
      <div className="chart-summary-card">
        <p className="chart-summary-label">{t('graficos.worst')}</p>
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
  const { t } = useLanguage()
  return (
    <div className="chart-placeholder">
      <div className="chart-placeholder-bars">
        {SKELETON_HEIGHTS.map((h, i) => (
          <div key={i} className="chart-placeholder-bar" style={{ height: `${h}%` }} />
        ))}
      </div>
      <p className="chart-placeholder-label">{t('common.loading')}</p>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────

export default function GraficosPage() {
  const { t } = useLanguage()
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
        <h1 className="page-title">{t('graficos.title')}</h1>
        <p className="page-sub">{t('graficos.sub')}</p>
      </div>

      {/* Summary cards */}
      {data && <SummaryCards data={data} />}

      {/* Bar chart */}
      <div className="settings-section">
        <p className="settings-section-title">{`${t('graficos.section')} — ${year}`}</p>
        <div className="chart-card">

          {isLoading && <SkeletonChart />}

          {isError && (
            <div className="chart-empty">
              <span className="chart-empty-icon">⚠️</span>
              <p className="chart-empty-title">{t('graficos.error.title')}</p>
              <p className="chart-empty-desc">{t('graficos.error.desc')}</p>
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
                {t('graficos.legend.good')}
              </span>
              <span className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: '#facc15' }} />
                {t('graficos.legend.avg')}
              </span>
              <span className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: '#f87171' }} />
                {t('graficos.legend.low')}
              </span>
              <span className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: 'var(--line)', opacity: 1 }} />
                {t('graficos.legend.none')}
              </span>
            </div>
          )}
        </div>
      </div>

      {allEmpty && (
        <div className="chart-empty">
          <span className="chart-empty-icon">📊</span>
          <p className="chart-empty-title">{t('graficos.empty.title')}</p>
          <p className="chart-empty-desc">{t('graficos.empty.desc')}</p>
        </div>
      )}
    </div>
  )
}

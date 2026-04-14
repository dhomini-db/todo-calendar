import { useStreak } from '../hooks/useTasks'

export default function StreakBadge() {
  const { data: streak, isLoading } = useStreak()

  if (isLoading || !streak) return null

  return (
    <div className="streak-badge">
      {/* Cabeçalho: fogo + streak atual + melhor */}
      <div className="streak-header">
        <div className="streak-flame-wrap">
          <span className={`streak-flame ${streak.completedToday ? 'active' : ''}`}>🔥</span>
          <span className="streak-count">{streak.currentStreak}</span>
        </div>
        <div className="streak-meta">
          <span className="streak-label">dias seguidos</span>
          {streak.bestStreak > 0 && (
            <span className="streak-best">Recorde: {streak.bestStreak}</span>
          )}
        </div>
      </div>

      {/* Grid da semana */}
      <div className="streak-week">
        {streak.weekDays.map(day => (
          <div
            key={day.date}
            className={[
              'streak-day',
              day.completed  ? 'streak-day--done'   : '',
              day.isToday    ? 'streak-day--today'   : '',
              day.isFuture   ? 'streak-day--future'  : '',
            ].filter(Boolean).join(' ')}
            title={day.date}
          >
            <span className="streak-day-name">{day.dayName}</span>
            <span className="streak-day-dot" />
          </div>
        ))}
      </div>
    </div>
  )
}

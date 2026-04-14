import { useStreak } from '../hooks/useTasks'

export default function StreakBadge() {
  const { data: streak, isLoading } = useStreak()

  if (isLoading || !streak) return null

  const { currentStreak, bestStreak, completedToday, weekDays } = streak

  return (
    <div className="streak-bar">
      {/* Left: flame + count */}
      <div className="streak-bar-left">
        <span className={`streak-bar-flame ${completedToday ? 'on' : ''}`}>🔥</span>
        <span className="streak-bar-count">{currentStreak}</span>
        <span className="streak-bar-label">
          {currentStreak === 1 ? 'dia' : 'dias'}
          {bestStreak > 0 && (
            <span className="streak-bar-best"> · recorde {bestStreak}</span>
          )}
        </span>
      </div>

      {/* Right: 7 dots (Mon–Sun), no labels */}
      <div className="streak-dots">
        {weekDays.map(day => (
          <span
            key={day.date}
            className={[
              'streak-dot',
              day.completed ? 'done'   : '',
              day.isToday   ? 'today'  : '',
              day.isFuture  ? 'future' : '',
            ].filter(Boolean).join(' ')}
            title={day.dayName}
          />
        ))}
      </div>
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { getSocialRankings } from '../api/tasks'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import type { UserRanking } from '../types'

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="rank-medal">🥇</span>
  if (rank === 2) return <span className="rank-medal">🥈</span>
  if (rank === 3) return <span className="rank-medal">🥉</span>
  return <span className="rank-num">#{rank}</span>
}

function IconFlame() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.387 0 2.5-1.343 2.5-3 0-1.657-1.5-3-1.5-5 0 0 3 1.343 3 4.5 0 2.485-2.015 4.5-4.5 4.5S6 15.985 6 13.5C6 11.5 8 8 12 6c0 0-1 3.5 1 5.5"/>
    </svg>
  )
}

function RankCard({ user, isMe }: { user: UserRanking; isMe: boolean }) {
  const { t } = useLanguage()
  const top3 = user.rank <= 3

  return (
    <div className={`rank-card${top3 ? ' rank-card--top' : ''}${isMe ? ' rank-card--me' : ''}`}>
      <div className="rank-card-left">
        <div className="rank-position">
          <Medal rank={user.rank} />
        </div>
        <div
          className="rank-avatar"
          style={{
            background: `hsl(${(user.id * 47) % 360}, 55%, 45%)`,
          }}
        >
          {user.initial}
        </div>
        <div className="rank-info">
          <p className="rank-name">
            {user.name}
            {isMe && <span className="rank-you-badge">{t('social.you')}</span>}
          </p>
          <p className="rank-best">
            {t('social.best')}: {user.bestStreak} {t('social.days')}
          </p>
        </div>
      </div>

      <div className="rank-streak-wrap">
        <span className="rank-streak-icon"><IconFlame /></span>
        <div>
          <p className="rank-streak-value">{user.currentStreak}</p>
          <p className="rank-streak-label">{t('social.days')}</p>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────

function RankSkeleton() {
  return (
    <div className="rank-skeleton-list">
      {[0,1,2,3,4].map(i => (
        <div key={i} className="rank-card">
          <div className="rank-card-left">
            <div className="dash-skel" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <div className="dash-skel" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="dash-skel" style={{ width: 120, height: 13 }} />
              <div className="dash-skel" style={{ width: 80, height: 11 }} />
            </div>
          </div>
          <div className="dash-skel" style={{ width: 48, height: 40 }} />
        </div>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────

export default function SocialPage() {
  const { t } = useLanguage()
  const { user } = useAuth()

  const { data, isLoading, isError } = useQuery<UserRanking[]>({
    queryKey: ['social', 'rankings'],
    queryFn: getSocialRankings,
    staleTime: 2 * 60 * 1000,
  })

  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <h1 className="page-title">{t('social.title')}</h1>
        <p className="page-sub">{t('social.sub')}</p>
      </div>

      {/* Podium - top 3 highlight */}
      {data && data.length >= 3 && (
        <div className="social-podium">
          {/* 2nd */}
          <div className="podium-item podium-item--2">
            <div className="podium-avatar" style={{ background: `hsl(${(data[1].id * 47) % 360}, 55%, 45%)` }}>
              {data[1].initial}
            </div>
            <p className="podium-name">{data[1].name}</p>
            <div className="podium-block podium-block--2">
              <span>🥈</span>
              <p className="podium-streak">{data[1].currentStreak}🔥</p>
            </div>
          </div>
          {/* 1st */}
          <div className="podium-item podium-item--1">
            <div className="podium-crown">👑</div>
            <div className="podium-avatar podium-avatar--1" style={{ background: `hsl(${(data[0].id * 47) % 360}, 55%, 45%)` }}>
              {data[0].initial}
            </div>
            <p className="podium-name">{data[0].name}</p>
            <div className="podium-block podium-block--1">
              <span>🥇</span>
              <p className="podium-streak">{data[0].currentStreak}🔥</p>
            </div>
          </div>
          {/* 3rd */}
          <div className="podium-item podium-item--3">
            <div className="podium-avatar" style={{ background: `hsl(${(data[2].id * 47) % 360}, 55%, 45%)` }}>
              {data[2].initial}
            </div>
            <p className="podium-name">{data[2].name}</p>
            <div className="podium-block podium-block--3">
              <span>🥉</span>
              <p className="podium-streak">{data[2].currentStreak}🔥</p>
            </div>
          </div>
        </div>
      )}

      {/* Full rankings list */}
      <div className="settings-section">
        <p className="settings-section-title">{t('social.rankings_title')}</p>

        {isLoading && <RankSkeleton />}

        {isError && (
          <div className="chart-empty">
            <span className="chart-empty-icon">⚠️</span>
            <p className="chart-empty-title">{t('common.error.load')}</p>
          </div>
        )}

        {data && data.length === 0 && (
          <div className="chart-empty">
            <span className="chart-empty-icon">👥</span>
            <p className="chart-empty-title">{t('social.empty')}</p>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="rank-list">
            {data.map(u => (
              <RankCard
                key={u.id}
                user={u}
                isMe={u.id === user?.userId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="settings-section">
        <div className="social-info-card">
          <p className="social-info-icon">💡</p>
          <p className="social-info-text">{t('social.info')}</p>
        </div>
      </div>
    </div>
  )
}

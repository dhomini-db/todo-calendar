import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSocialRankings, followUser, unfollowUser } from '../api/tasks'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import UserProfileModal from '../components/UserProfileModal'
import type { UserRanking } from '../types'

/* ── Icons ─────────────────────────────────────────────────────── */
function IconFlame({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.387 0 2.5-1.343 2.5-3 0-1.657-1.5-3-1.5-5 0 0 3 1.343 3 4.5 0 2.485-2.015 4.5-4.5 4.5S6 15.985 6 13.5C6 11.5 8 8 12 6c0 0-1 3.5 1 5.5"/>
    </svg>
  )
}
function IconStar({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
}
function IconUsers({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

/* ── Avatar ─────────────────────────────────────────────────────── */
function UserAvatar({ user, size, ring }: { user: UserRanking; size: number; ring?: string }) {
  const bg = `hsl(${(user.id * 47) % 360}, 60%, 42%)`
  return (
    <div
      className="soc-avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.37,
        background: bg,
        boxShadow: ring ? `0 0 0 3px ${ring}, 0 8px 24px rgba(0,0,0,0.4)` : undefined,
      }}
    >
      {user.profileImageUrl
        ? <img src={user.profileImageUrl} alt={user.name} className="soc-avatar-img" />
        : user.initial}
    </div>
  )
}

/* ── Follow button ──────────────────────────────────────────────── */
function FollowBtn({ userId, isFollowing, small }: { userId: number; isFollowing: boolean; small?: boolean }) {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const [opt, setOpt] = useState<boolean | null>(null)
  const following = opt !== null ? opt : isFollowing

  const followMut   = useMutation({ mutationFn: () => followUser(userId),   onMutate: () => setOpt(true),  onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social'] }); setOpt(null) }, onError: () => setOpt(null) })
  const unfollowMut = useMutation({ mutationFn: () => unfollowUser(userId), onMutate: () => setOpt(false), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social'] }); setOpt(null) }, onError: () => setOpt(null) })

  const pending = followMut.isPending || unfollowMut.isPending
  return (
    <button
      className={`soc-follow-btn${following ? ' soc-follow-btn--on' : ''}${small ? ' soc-follow-btn--sm' : ''}`}
      onClick={e => { e.stopPropagation(); following ? unfollowMut.mutate() : followMut.mutate() }}
      disabled={pending}
    >
      {pending ? '…' : following ? t('social.following') : t('social.follow')}
    </button>
  )
}

/* ── Podium ─────────────────────────────────────────────────────── */
const GOLD   = '#f59e0b'
const SILVER = '#94a3b8'
const BRONZE = '#b45309'

const PODIUM_CFG = [
  { rank: 2, place: 1, avatarSize: 72,  blockH: 84,  ring: SILVER, glow: 'rgba(148,163,184,0.28)', medal: '🥈', animDelay: '0.15s' },
  { rank: 1, place: 0, avatarSize: 96,  blockH: 116, ring: GOLD,   glow: 'rgba(245,158,11,0.40)',  medal: '🥇', animDelay: '0s'    },
  { rank: 3, place: 2, avatarSize: 62,  blockH: 60,  ring: BRONZE, glow: 'rgba(180,83,9,0.28)',    medal: '🥉', animDelay: '0.25s' },
]

function Podium({ data, myId, onSelect }: { data: UserRanking[]; myId?: number; onSelect: (id: number) => void }) {
  return (
    <div className="soc-podium">
      {PODIUM_CFG.map(cfg => {
        const u = data[cfg.place]
        if (!u) return null
        const isMe = u.id === myId
        return (
          <button
            key={u.id}
            className={`soc-pod-item soc-pod-item--${cfg.rank}${isMe ? ' soc-pod-item--me' : ''}`}
            style={{ '--pod-delay': cfg.animDelay } as React.CSSProperties}
            onClick={() => onSelect(u.id)}
          >
            {cfg.rank === 1 && <span className="soc-pod-crown">👑</span>}
            <div className="soc-pod-avatar-wrap" style={{ filter: `drop-shadow(0 4px 16px ${cfg.glow})` }}>
              <UserAvatar user={u} size={cfg.avatarSize} ring={cfg.ring} />
            </div>
            <p className="soc-pod-name">{isMe ? '✨ ' : ''}{u.name}</p>
            <div
              className={`soc-pod-block soc-pod-block--${cfg.rank}`}
              style={{ height: cfg.blockH }}
            >
              <span className="soc-pod-medal">{cfg.medal}</span>
              <span className="soc-pod-streak">
                <IconFlame size={12} />
                {u.currentStreak}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

/* ── Rank card ──────────────────────────────────────────────────── */
const RANK_COLORS = ['rgba(245,158,11,0.12)', 'rgba(148,163,184,0.08)', 'rgba(180,83,9,0.08)']
const RANK_BORDERS = ['rgba(245,158,11,0.30)', 'rgba(148,163,184,0.20)', 'rgba(180,83,9,0.20)']

function RankCard({ user, isMe, rank, onClick }: { user: UserRanking; isMe: boolean; rank: number; onClick: () => void }) {
  const { t } = useLanguage()
  const top3 = rank <= 3
  const medals = ['🥇', '🥈', '🥉']

  const cardStyle = top3 ? {
    background: `${RANK_COLORS[rank - 1]}, var(--raised)`,
    borderColor: RANK_BORDERS[rank - 1],
  } : undefined

  const meStyle = isMe ? {
    borderColor: 'var(--accent)',
    background: 'color-mix(in srgb, var(--accent) 8%, var(--raised))',
    boxShadow: '0 0 0 1px rgba(59,130,246,0.2), 0 4px 20px rgba(59,130,246,0.08)',
  } : undefined

  return (
    <div
      className={`soc-rank-card${isMe ? ' soc-rank-card--me' : ''}`}
      style={{ ...cardStyle, ...meStyle }}
      onClick={onClick}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Position */}
      <div className="soc-rank-pos">
        {top3
          ? <span className="soc-rank-medal">{medals[rank - 1]}</span>
          : <span className="soc-rank-num">#{rank}</span>}
      </div>

      {/* Avatar */}
      <UserAvatar user={user} size={46} />

      {/* Info */}
      <div className="soc-rank-info">
        <div className="soc-rank-name-row">
          <span className="soc-rank-name">{user.name}</span>
          {isMe && <span className="soc-rank-you">Você</span>}
        </div>
        <div className="soc-rank-meta">
          <span className="soc-rank-meta-item">
            <IconStar size={11} /> {user.bestStreak} {t('social.days')}
          </span>
          {user.followersCount > 0 && (
            <span className="soc-rank-meta-item">
              <IconUsers size={11} /> {user.followersCount}
            </span>
          )}
        </div>
      </div>

      {/* Streak */}
      <div className="soc-rank-streak">
        <span className="soc-rank-streak-val">{user.currentStreak}</span>
        <span className="soc-rank-streak-sub">
          <IconFlame size={11} /> {t('social.days')}
        </span>
      </div>

      {/* Follow */}
      {!isMe && (
        <div className="soc-rank-action">
          <FollowBtn userId={user.id} isFollowing={user.isFollowing} small />
        </div>
      )}
    </div>
  )
}

/* ── Skeleton ───────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="soc-skeleton">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="soc-rank-card" style={{ opacity: 1 - i * 0.12 }}>
          <div className="dash-skel" style={{ width: 28, height: 16, borderRadius: 6 }} />
          <div className="dash-skel" style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0 }} />
          <div className="soc-rank-info">
            <div className="dash-skel" style={{ width: '55%', height: 13, marginBottom: 6 }} />
            <div className="dash-skel" style={{ width: '35%', height: 11 }} />
          </div>
          <div className="dash-skel" style={{ width: 40, height: 40, borderRadius: 10 }} />
          <div className="dash-skel" style={{ width: 72, height: 30, borderRadius: 20 }} />
        </div>
      ))}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function SocialPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const { data, isLoading, isError } = useQuery<UserRanking[]>({
    queryKey: ['social', 'rankings'],
    queryFn: getSocialRankings,
    staleTime: 2 * 60 * 1000,
  })

  return (
    <div className="soc-page">
      {/* Header */}
      <div className="soc-header">
        <h1 className="soc-title">{t('social.title')}</h1>
        <p className="soc-sub">{t('social.sub')}</p>
      </div>

      {/* Podium */}
      {data && data.length >= 3 && (
        <Podium data={data} myId={user?.userId} onSelect={id => setSelectedUserId(id)} />
      )}

      {/* Rankings */}
      <div className="soc-rankings-wrap">
        <div className="soc-rankings-header">
          <span className="soc-rankings-label">{t('social.rankings_title')}</span>
          <span className="soc-rankings-count">{data?.length ?? 0} usuários</span>
        </div>

        {isLoading && <Skeleton />}

        {isError && (
          <div className="chart-empty">
            <span className="chart-empty-icon">⚠️</span>
            <p className="chart-empty-title">{t('common.error.load')}</p>
          </div>
        )}

        {data?.length === 0 && (
          <div className="chart-empty">
            <span className="chart-empty-icon">👥</span>
            <p className="chart-empty-title">{t('social.empty')}</p>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="soc-rank-list">
            {data.map((u, i) => (
              <RankCard
                key={u.id}
                user={u}
                rank={i + 1}
                isMe={u.id === user?.userId}
                onClick={() => setSelectedUserId(u.id)}
              />
            ))}
          </div>
        )}

        {/* Info */}
        <div className="soc-info-bar">
          <span>💡</span>
          <span>{t('social.info')}</span>
        </div>
      </div>

      {selectedUserId !== null && (
        <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  )
}

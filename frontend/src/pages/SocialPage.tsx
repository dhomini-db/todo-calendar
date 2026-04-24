import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSocialRankings, followUser, unfollowUser } from '../api/tasks'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import UserProfileModal from '../components/UserProfileModal'
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

// ── Follow button (inline, in the rank card) ───────────────────

interface FollowBtnProps { userId: number; isFollowing: boolean; disabled?: boolean }

function FollowBtn({ userId, isFollowing, disabled }: FollowBtnProps) {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const [optimistic, setOptimistic] = useState<boolean | null>(null)

  const following = optimistic !== null ? optimistic : isFollowing

  const followMut = useMutation({
    mutationFn: () => followUser(userId),
    onMutate: () => setOptimistic(true),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social', 'rankings'] }); setOptimistic(null) },
    onError: () => setOptimistic(null),
  })
  const unfollowMut = useMutation({
    mutationFn: () => unfollowUser(userId),
    onMutate: () => setOptimistic(false),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social', 'rankings'] }); setOptimistic(null) },
    onError: () => setOptimistic(null),
  })

  const pending = followMut.isPending || unfollowMut.isPending

  return (
    <button
      className={`rank-follow-btn${following ? ' rank-follow-btn--following' : ''}`}
      onClick={e => { e.stopPropagation(); if (following) unfollowMut.mutate(); else followMut.mutate() }}
      disabled={disabled || pending}
      title={following ? t('social.unfollow') : t('social.follow')}
    >
      {pending ? '…' : following ? t('social.following') : t('social.follow')}
    </button>
  )
}

// ── Rank card ──────────────────────────────────────────────────

interface RankCardProps {
  user: UserRanking
  isMe: boolean
  onClick: () => void
}

function RankCard({ user, isMe, onClick }: RankCardProps) {
  const { t } = useLanguage()
  const top3 = user.rank <= 3

  return (
    <div
      className={`rank-card rank-card--clickable${top3 ? ' rank-card--top' : ''}${isMe ? ' rank-card--me' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div className="rank-card-left">
        <div className="rank-position">
          <Medal rank={user.rank} />
        </div>
        <div
          className="rank-avatar"
          style={{ background: `hsl(${(user.id * 47) % 360}, 55%, 45%)` }}
        >
          {user.profileImageUrl
            ? <img src={user.profileImageUrl} alt={user.name} className="rank-avatar-img" />
            : user.initial}
        </div>
        <div className="rank-info">
          <p className="rank-name">
            {user.name}
            {isMe && <span className="rank-you-badge">{t('social.you')}</span>}
          </p>
          <p className="rank-best">
            {t('social.best')}: {user.bestStreak} {t('social.days')}
            {user.followersCount > 0 && (
              <span className="rank-followers-count"> · {user.followersCount} {t('social.followers')}</span>
            )}
          </p>
        </div>
      </div>

      <div className="rank-right">
        <div className="rank-streak-wrap">
          <span className="rank-streak-icon"><IconFlame /></span>
          <div>
            <p className="rank-streak-value">{user.currentStreak}</p>
            <p className="rank-streak-label">{t('social.days')}</p>
          </div>
        </div>
        {!isMe && (
          <FollowBtn userId={user.id} isFollowing={user.isFollowing} />
        )}
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
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

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

      {/* Podium - top 3 */}
      {data && data.length >= 3 && (
        <div className="social-podium">
          {/* 2nd */}
          <div className="podium-item podium-item--2" onClick={() => setSelectedUserId(data[1].id)} style={{ cursor: 'pointer' }}>
            <div className="podium-avatar" style={{ background: `hsl(${(data[1].id * 47) % 360}, 55%, 45%)` }}>
              {data[1].profileImageUrl
                ? <img src={data[1].profileImageUrl} alt={data[1].name} className="podium-avatar-img" />
                : data[1].initial}
            </div>
            <p className="podium-name">{data[1].name}</p>
            <div className="podium-block podium-block--2">
              <span>🥈</span>
              <p className="podium-streak">{data[1].currentStreak}🔥</p>
            </div>
          </div>
          {/* 1st */}
          <div className="podium-item podium-item--1" onClick={() => setSelectedUserId(data[0].id)} style={{ cursor: 'pointer' }}>
            <div className="podium-crown">👑</div>
            <div className="podium-avatar podium-avatar--1" style={{ background: `hsl(${(data[0].id * 47) % 360}, 55%, 45%)` }}>
              {data[0].profileImageUrl
                ? <img src={data[0].profileImageUrl} alt={data[0].name} className="podium-avatar-img" />
                : data[0].initial}
            </div>
            <p className="podium-name">{data[0].name}</p>
            <div className="podium-block podium-block--1">
              <span>🥇</span>
              <p className="podium-streak">{data[0].currentStreak}🔥</p>
            </div>
          </div>
          {/* 3rd */}
          <div className="podium-item podium-item--3" onClick={() => setSelectedUserId(data[2].id)} style={{ cursor: 'pointer' }}>
            <div className="podium-avatar" style={{ background: `hsl(${(data[2].id * 47) % 360}, 55%, 45%)` }}>
              {data[2].profileImageUrl
                ? <img src={data[2].profileImageUrl} alt={data[2].name} className="podium-avatar-img" />
                : data[2].initial}
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
                onClick={() => setSelectedUserId(u.id)}
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

      {/* User profile modal */}
      {selectedUserId !== null && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  )
}

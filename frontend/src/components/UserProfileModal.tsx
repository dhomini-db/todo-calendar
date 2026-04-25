import { useState } from 'react'
import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserPublicProfile, followUser, unfollowUser } from '../api/tasks'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  userId: number
  onClose: () => void
}

function StatBox({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="upm-stat">
      <p className="upm-stat-value">{value}</p>
      <p className="upm-stat-label">{label}</p>
    </div>
  )
}

function IconFlame() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.387 0 2.5-1.343 2.5-3 0-1.657-1.5-3-1.5-5 0 0 3 1.343 3 4.5 0 2.485-2.015 4.5-4.5 4.5S6 15.985 6 13.5C6 11.5 8 8 12 6c0 0-1 3.5 1 5.5"/>
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function UserProfileModal({ userId, onClose }: Props) {
  const { t } = useLanguage()
  const { user: me } = useAuth()
  const queryClient = useQueryClient()
  const isMe = me?.userId === userId

  const { data, isLoading, isError } = useQuery({
    queryKey: ['social', 'profile', userId],
    queryFn: () => getUserPublicProfile(userId),
    staleTime: 30_000,
  })

  const [optimisticFollowing, setOptimisticFollowing] = useState<boolean | null>(null)

  const followMut = useMutation({
    mutationFn: () => followUser(userId),
    onMutate: () => setOptimisticFollowing(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] })
      setOptimisticFollowing(null)
    },
    onError: () => setOptimisticFollowing(null),
  })

  const unfollowMut = useMutation({
    mutationFn: () => unfollowUser(userId),
    onMutate: () => setOptimisticFollowing(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] })
      setOptimisticFollowing(null)
    },
    onError: () => setOptimisticFollowing(null),
  })

  const isFollowing = optimisticFollowing !== null ? optimisticFollowing : data?.isFollowing ?? false
  const pending = followMut.isPending || unfollowMut.isPending

  function handleFollowToggle() {
    if (isFollowing) unfollowMut.mutate()
    else followMut.mutate()
  }

  const avatarBg = data ? `hsl(${(data.id * 47) % 360}, 55%, 45%)` : 'var(--raised)'

  return (
    <>
      {/* Backdrop */}
      <div className="upm-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="upm-modal" role="dialog" aria-modal="true" aria-label={t('social.profile_title')}>
        {/* Close */}
        <button className="upm-close" onClick={onClose} aria-label={t('common.cancel')}>
          <IconClose />
        </button>

        {isLoading && (
          <div className="upm-loading">
            <div className="upm-avatar-skel dash-skel" />
            <div className="dash-skel" style={{ width: 120, height: 16, borderRadius: 8 }} />
            <div className="dash-skel" style={{ width: 80, height: 12, borderRadius: 6 }} />
          </div>
        )}

        {isError && (
          <div className="upm-error">
            <span>⚠️</span>
            <p>{t('common.error.load')}</p>
          </div>
        )}

        {data && (
          <>
            {/* Banner */}
            {data.bannerImageUrl && (
              <div className="upm-banner" style={{ backgroundImage: `url(${data.bannerImageUrl})` }} />
            )}

            {/* Avatar + name */}
            <div className={`upm-header${data.bannerImageUrl ? ' upm-header--has-banner' : ''}`}>
              <div className="upm-avatar" style={{ background: avatarBg }}>
                {data.profileImageUrl
                  ? <img src={data.profileImageUrl} alt={data.name} className="upm-avatar-img" />
                  : data.initial}
              </div>
              <h2 className="upm-name">{data.name}</h2>

              {/* Bio */}
              {data.bio && <p className="upm-bio">{data.bio}</p>}

              {/* Follow counts */}
              <div className="upm-follow-counts">
                <span><strong>{data.followersCount}</strong> {t('social.followers')}</span>
                <span className="upm-dot">·</span>
                <span><strong>{data.followingCount}</strong> {t('social.following_count')}</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="upm-stats">
              <StatBox
                value={<><IconFlame /> {data.currentStreak}</>}
                label={t('social.streak_current')}
              />
              <StatBox value={data.bestStreak} label={t('social.streak_best')} />
              <StatBox value={data.totalTasksCompleted} label={t('social.tasks_done')} />
            </div>

            {/* Follow button */}
            {isMe ? (
              <div className="upm-self-badge">{t('social.cant_follow_self')}</div>
            ) : (
              <button
                className={`upm-follow-btn${isFollowing ? ' upm-follow-btn--following' : ''}`}
                onClick={handleFollowToggle}
                disabled={pending}
              >
                {pending
                  ? '…'
                  : isFollowing
                    ? t('social.following')
                    : t('social.follow')}
              </button>
            )}
          </>
        )}
      </div>
    </>
  )
}

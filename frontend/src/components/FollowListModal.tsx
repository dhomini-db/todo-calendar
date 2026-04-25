import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFollowers, getFollowing, followUser, unfollowUser } from '../api/tasks'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import UserProfileModal from './UserProfileModal'
import type { FollowUser } from '../types'

interface Props {
  userId: number
  tab: 'followers' | 'following'
  onClose: () => void
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function FollowRow({ user, isMe, onOpenProfile }: {
  user: FollowUser
  isMe: boolean
  onOpenProfile: (id: number) => void
}) {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const [optimistic, setOptimistic] = useState<boolean | null>(null)
  const isFollowing = optimistic !== null ? optimistic : user.isFollowing

  const followMut = useMutation({
    mutationFn: () => followUser(user.id),
    onMutate: () => setOptimistic(true),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social'] }); setOptimistic(null) },
    onError:   () => setOptimistic(null),
  })
  const unfollowMut = useMutation({
    mutationFn: () => unfollowUser(user.id),
    onMutate: () => setOptimistic(false),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social'] }); setOptimistic(null) },
    onError:   () => setOptimistic(null),
  })

  const avatarBg = `hsl(${(user.id * 47) % 360}, 55%, 45%)`
  const pending = followMut.isPending || unfollowMut.isPending

  return (
    <div className="flm-row">
      <button className="flm-row-info" onClick={() => onOpenProfile(user.id)}>
        <div className="flm-avatar" style={{ background: avatarBg }}>
          {user.profileImageUrl
            ? <img src={user.profileImageUrl} alt={user.name} className="flm-avatar-img" />
            : user.initial}
        </div>
        <div className="flm-row-text">
          <span className="flm-row-name">{user.name}</span>
          {user.bio && <span className="flm-row-bio">{user.bio}</span>}
        </div>
      </button>
      {!isMe && (
        <button
          className={`flm-follow-btn${isFollowing ? ' flm-follow-btn--following' : ''}`}
          onClick={() => isFollowing ? unfollowMut.mutate() : followMut.mutate()}
          disabled={pending}
        >
          {pending ? '…' : isFollowing ? t('social.following') : t('social.follow')}
        </button>
      )}
    </div>
  )
}

export default function FollowListModal({ userId, tab: initialTab, onClose }: Props) {
  const { t } = useLanguage()
  const { user: me } = useAuth()
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab)
  const [profileUserId, setProfileUserId] = useState<number | null>(null)

  const { data: followers, isLoading: loadingF } = useQuery({
    queryKey: ['social', 'followers', userId],
    queryFn: () => getFollowers(userId),
    staleTime: 30_000,
  })
  const { data: following, isLoading: loadingG } = useQuery({
    queryKey: ['social', 'following', userId],
    queryFn: () => getFollowing(userId),
    staleTime: 30_000,
  })

  const list = activeTab === 'followers' ? followers : following
  const loading = activeTab === 'followers' ? loadingF : loadingG

  return (
    <>
      <div className="upm-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="flm-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="flm-header">
          <div className="flm-tabs">
            <button
              className={`flm-tab${activeTab === 'followers' ? ' flm-tab--active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              {t('social.followers')}
            </button>
            <button
              className={`flm-tab${activeTab === 'following' ? ' flm-tab--active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              {t('social.following_count')}
            </button>
          </div>
          <button className="upm-close" onClick={onClose} aria-label={t('common.cancel')}>
            <IconClose />
          </button>
        </div>

        {/* List */}
        <div className="flm-list">
          {loading && (
            <div className="flm-empty">
              <div className="dash-skel" style={{ width: 120, height: 14, borderRadius: 7 }} />
            </div>
          )}
          {!loading && list?.length === 0 && (
            <div className="flm-empty">
              <p>{activeTab === 'followers' ? t('social.no_followers') : t('social.no_following')}</p>
            </div>
          )}
          {!loading && list?.map(u => (
            <FollowRow
              key={u.id}
              user={u}
              isMe={me?.userId === u.id}
              onOpenProfile={id => setProfileUserId(id)}
            />
          ))}
        </div>
      </div>

      {/* Nested profile modal */}
      {profileUserId !== null && (
        <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
      )}
    </>
  )
}

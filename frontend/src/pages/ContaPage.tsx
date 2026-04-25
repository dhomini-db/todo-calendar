import { useState, useRef, useCallback, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { updateProfile, changePassword, uploadAvatar, removeAvatar, uploadBanner, removeBanner, getUserPublicProfile } from '../api/tasks'
import type { UpdateProfileRequest, ChangePasswordRequest } from '../types'
import ImageCropper from '../components/ImageCropper'

/* ── Icons ───────────────────────────────────────────────────── */
function IconCamera() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}
function IconFlame() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.387 0 2.5-1.343 2.5-3 0-1.657-1.5-3-1.5-5 0 0 3 1.343 3 4.5 0 2.485-2.015 4.5-4.5 4.5S6 15.985 6 13.5C6 11.5 8 8 12 6c0 0-1 3.5 1 5.5"/>
    </svg>
  )
}

/* ── Password strength ────────────────────────────────────────── */
function passwordStrength(pwd: string, t: (k: string) => string) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8)           score++
  if (pwd.length >= 12)          score++
  if (/[A-Z]/.test(pwd))         score++
  if (/[0-9]/.test(pwd))         score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return { score, label: t('conta.pwd.weak'),   color: '#f87171' }
  if (score <= 2) return { score, label: t('conta.pwd.medium'), color: '#fb923c' }
  if (score <= 3) return { score, label: t('conta.pwd.good'),   color: '#facc15' }
  return               { score, label: t('conta.pwd.strong'),  color: '#4ade80' }
}

/* ── Social stat card ─────────────────────────────────────────── */
function SocialStat({ value, label, icon }: { value: string | number; label: string; icon?: React.ReactNode }) {
  return (
    <div className="profile-social-stat">
      <p className="profile-social-stat-value">
        {icon && <span className="profile-social-stat-icon">{icon}</span>}
        {value}
      </p>
      <p className="profile-social-stat-label">{label}</p>
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────── */
export default function ContaPage() {
  const { user, updateUser } = useAuth()
  const { t } = useLanguage()

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  /* ── Social stats (public profile data) ────────────────────── */
  const { data: publicProfile } = useQuery({
    queryKey: ['social', 'profile', user?.userId],
    queryFn: () => getUserPublicProfile(user!.userId),
    enabled: !!user?.userId,
    staleTime: 60_000,
  })

  /* ── Banner upload ──────────────────────────────────────────── */
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [bannerPending,  setBannerPending]  = useState<File | null>(null)
  const [bannerPreview,  setBannerPreview]  = useState<string | null>(null)
  const [bannerError,    setBannerError]    = useState('')

  const handleBannerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (file.size > 10 * 1024 * 1024) { setBannerError('Arquivo muito grande. Máximo 10 MB.'); return }
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { setBannerError('Formato inválido. Use JPG, PNG ou WebP.'); return }
    setBannerError('')
    setBannerPreview(URL.createObjectURL(file))
    setBannerPending(file)
  }, [])

  const uploadBannerMut = useMutation({
    mutationFn: (file: File) => uploadBanner(file),
    onSuccess: (res) => {
      updateUser({ bannerImageUrl: res.bannerImageUrl })
      if (bannerPreview) URL.revokeObjectURL(bannerPreview)
      setBannerPending(null); setBannerPreview(null); setBannerError('')
    },
    onError: () => setBannerError(t('conta.banner.err.upload')),
  })
  const removeBannerMut = useMutation({
    mutationFn: removeBanner,
    onSuccess: () => { updateUser({ bannerImageUrl: null }); setBannerError('') },
    onError: () => setBannerError(t('conta.banner.err.remove')),
  })

  const currentBanner = bannerPreview ?? user?.bannerImageUrl ?? null

  /* ── Avatar upload ──────────────────────────────────────────── */
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFile,   setPendingFile]   = useState<File | null>(null)
  const [cropSrc,       setCropSrc]       = useState<string | null>(null)
  const [previewUrl,    setPreviewUrl]    = useState<string | null>(null)
  const [avatarError,   setAvatarError]   = useState('')

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (file.size > 10 * 1024 * 1024) { setAvatarError('Arquivo muito grande. Máximo 10 MB.'); return }
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { setAvatarError('Formato inválido. Use JPG, PNG ou WebP.'); return }
    setAvatarError('')
    setCropSrc(URL.createObjectURL(file))
  }, [])

  function handleCropDone(blob: Blob) {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    setPendingFile(croppedFile)
    setPreviewUrl(URL.createObjectURL(blob))
  }
  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }
  function cancelPhotoUpload() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPendingFile(null); setPreviewUrl(null); setAvatarError('')
  }

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: (res) => {
      updateUser({ profileImageUrl: res.profileImageUrl })
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPendingFile(null); setPreviewUrl(null); setAvatarError('')
    },
    onError: (err: unknown) => {
      setAvatarError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? t('conta.avatar.err.upload'))
    },
  })
  const removeMutation = useMutation({
    mutationFn: removeAvatar,
    onSuccess: () => { updateUser({ profileImageUrl: null }); setAvatarError('') },
    onError: () => setAvatarError(t('conta.avatar.err.remove')),
  })

  const currentAvatarSrc = previewUrl ?? user?.profileImageUrl ?? null

  /* ── Edit profile ───────────────────────────────────────────── */
  const [editOpen,     setEditOpen]     = useState(false)
  const [profileName,  setProfileName]  = useState(user?.name  ?? '')
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '')
  const [profileBio,   setProfileBio]   = useState(user?.bio   ?? '')
  const [profileError, setProfileError] = useState('')
  const [profileOk,    setProfileOk]    = useState(false)

  const profileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: (res) => {
      updateUser({ name: res.name, email: res.email, bio: res.bio ?? null })
      setProfileOk(true); setProfileError('')
      setTimeout(() => { setProfileOk(false); setEditOpen(false) }, 1200)
    },
    onError: (err: unknown) => {
      setProfileError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? t('conta.err.profile'))
    },
  })

  function openEdit() {
    setProfileName(user?.name  ?? '')
    setProfileEmail(user?.email ?? '')
    setProfileBio(user?.bio   ?? '')
    setProfileError(''); setProfileOk(false); setEditOpen(true)
  }
  function handleProfileSave(e: FormEvent) {
    e.preventDefault(); setProfileError(''); setProfileOk(false)
    profileMutation.mutate({ name: profileName.trim(), email: profileEmail.trim().toLowerCase(), bio: profileBio.trim() || null })
  }

  /* ── Change password ────────────────────────────────────────── */
  const [pwdOpen,    setPwdOpen]    = useState(false)
  const [curPwd,     setCurPwd]     = useState('')
  const [newPwd,     setNewPwd]     = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError,   setPwdError]   = useState('')
  const [pwdOk,      setPwdOk]      = useState(false)
  const strength = passwordStrength(newPwd, t)

  const pwdMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
    onSuccess: () => {
      setPwdOk(true); setPwdError(''); setCurPwd(''); setNewPwd(''); setConfirmPwd('')
      setTimeout(() => { setPwdOk(false); setPwdOpen(false) }, 1400)
    },
    onError: (err: unknown) => {
      setPwdError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? t('conta.err.pwd'))
    },
  })
  function handlePwdSave(e: FormEvent) {
    e.preventDefault(); setPwdError(''); setPwdOk(false)
    if (newPwd !== confirmPwd) { setPwdError('A confirmação não coincide com a nova senha'); return }
    pwdMutation.mutate({ currentPassword: curPwd, newPassword: newPwd, confirmNewPassword: confirmPwd })
  }

  return (
    <div className="inner-page">
      {cropSrc && <ImageCropper src={cropSrc} onCrop={handleCropDone} onCancel={handleCropCancel} />}

      <div className="inner-page-header">
        <h1 className="page-title">{t('conta.title')}</h1>
        <p className="page-sub">{t('conta.sub')}</p>
      </div>

      {/* ── Public Profile Card ──────────────────────────────────── */}
      <div className="settings-section">
        <p className="settings-section-title">{t('conta.section.public')}</p>

        {/* Banner */}
        <div
          className="profile-banner"
          onClick={() => bannerInputRef.current?.click()}
          title={t('conta.banner.change')}
          style={currentBanner ? { backgroundImage: `url(${currentBanner})` } : undefined}
        >
          {!currentBanner && (
            <div className="profile-banner-empty">
              <IconCamera />
              <span>{t('conta.banner.hint')}</span>
            </div>
          )}
          <div className="profile-banner-overlay">
            <IconCamera />
            <span>{t('conta.banner.change')}</span>
          </div>
        </div>
        <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }} onChange={handleBannerChange} />

        {/* Banner action bar */}
        {bannerPending && (
          <div className="conta-photo-bar">
            <span className="conta-photo-bar-label">
              {uploadBannerMut.isPending ? t('conta.banner.saving') : `${t('conta.banner.selected')} ${bannerPending.name}`}
            </span>
            <div className="conta-photo-bar-actions">
              <button className="conta-btn-cancel" onClick={() => { if (bannerPreview) URL.revokeObjectURL(bannerPreview); setBannerPending(null); setBannerPreview(null) }} disabled={uploadBannerMut.isPending}>{t('common.cancel')}</button>
              <button className="conta-btn-save" onClick={() => uploadBannerMut.mutate(bannerPending!)} disabled={uploadBannerMut.isPending}>
                {uploadBannerMut.isPending ? t('common.saving') : t('conta.banner.save')}
              </button>
            </div>
          </div>
        )}
        {!bannerPending && (currentBanner || user?.bannerImageUrl) && (
          <button className="profile-remove-banner-btn" onClick={() => removeBannerMut.mutate()} disabled={removeBannerMut.isPending}>
            {removeBannerMut.isPending ? '…' : t('conta.banner.remove')}
          </button>
        )}
        {bannerError && <p className="conta-error" style={{ marginTop: 4 }}>{bannerError}</p>}

        {/* Avatar + info row */}
        <div className="profile-hero">
          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <div
              className="profile-avatar"
              onClick={() => !pendingFile && fileInputRef.current?.click()}
              title={t('conta.avatar.change')}
            >
              {currentAvatarSrc
                ? <img src={currentAvatarSrc} alt="avatar" className="profile-avatar-img" />
                : <span className="profile-avatar-initials">{initials}</span>
              }
              {!pendingFile && (
                <div className="profile-avatar-overlay">
                  <IconCamera />
                </div>
              )}
            </div>
            {user?.profileImageUrl && !pendingFile && (
              <button className="profile-remove-photo" onClick={() => removeMutation.mutate()} disabled={removeMutation.isPending}>
                {removeMutation.isPending ? t('conta.avatar.removing') : t('conta.avatar.remove')}
              </button>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }} onChange={handleFileChange} />

          {/* Name, bio, edit button */}
          <div className="profile-hero-info">
            <div className="profile-hero-top">
              <div>
                <h2 className="profile-hero-name">{user?.name}</h2>
                <p className="profile-hero-email">{user?.email}</p>
              </div>
              <button className="profile-edit-btn" onClick={openEdit}>{t('common.edit')}</button>
            </div>
            <p className="profile-hero-bio">
              {user?.bio || <span className="profile-bio-empty">{t('conta.bio.empty')}</span>}
            </p>
          </div>
        </div>

        {/* Avatar photo pending bar */}
        {pendingFile && (
          <div className="conta-photo-bar">
            <span className="conta-photo-bar-label">
              {uploadMutation.isPending ? t('conta.avatar.saving') : `${t('conta.avatar.selected')} ${pendingFile.name}`}
            </span>
            <div className="conta-photo-bar-actions">
              <button className="conta-btn-cancel" onClick={cancelPhotoUpload} disabled={uploadMutation.isPending}>{t('common.cancel')}</button>
              <button className="conta-btn-save" onClick={() => uploadMutation.mutate(pendingFile!)} disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? t('common.saving') : t('conta.avatar.save')}
              </button>
            </div>
          </div>
        )}
        {avatarError && <p className="conta-error" style={{ marginTop: 8 }}>{avatarError}</p>}

        {/* Edit form */}
        {editOpen && (
          <form className="conta-form" onSubmit={handleProfileSave} style={{ marginTop: 16 }}>
            <div className="conta-form-row">
              <label className="conta-label">{t('conta.label.name')}</label>
              <input className="conta-input" value={profileName}
                onChange={e => setProfileName(e.target.value)} placeholder={t('conta.ph.name')} required />
            </div>
            <div className="conta-form-row">
              <label className="conta-label">{t('conta.label.email')}</label>
              <input className="conta-input" type="email" value={profileEmail}
                onChange={e => setProfileEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div className="conta-form-row">
              <label className="conta-label">{t('conta.label.bio')}</label>
              <textarea
                className="conta-input conta-textarea"
                value={profileBio}
                onChange={e => setProfileBio(e.target.value)}
                placeholder={t('conta.ph.bio')}
                maxLength={160}
                rows={3}
              />
              <span className="conta-bio-count">{profileBio.length}/160</span>
            </div>
            {profileError && <p className="conta-error">{profileError}</p>}
            {profileOk    && <p className="conta-success">{t('conta.profile.ok')}</p>}
            <div className="conta-form-actions">
              <button type="button" className="conta-btn-cancel" onClick={() => setEditOpen(false)}>{t('common.cancel')}</button>
              <button type="submit" className="conta-btn-save" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Social Activity ──────────────────────────────────────── */}
      <div className="settings-section">
        <p className="settings-section-title">{t('conta.section.social')}</p>
        <div className="profile-social-grid">
          <SocialStat
            value={publicProfile?.followersCount ?? '—'}
            label={t('conta.social.followers')}
          />
          <SocialStat
            value={publicProfile?.followingCount ?? '—'}
            label={t('conta.social.following')}
          />
          <SocialStat
            value={publicProfile?.currentStreak ?? user?.profileImageUrl !== undefined ? (publicProfile?.currentStreak ?? '—') : '—'}
            label={t('conta.social.streak')}
            icon={<IconFlame />}
          />
          <SocialStat
            value={publicProfile?.totalTasksCompleted ?? '—'}
            label={t('conta.social.tasks')}
          />
        </div>
      </div>

      {/* ── Security ─────────────────────────────────────────────── */}
      <div className="settings-section">
        <p className="settings-section-title">{t('conta.section.security')}</p>
        <div className="conta-action-row" onClick={() => { setPwdOpen(o => !o); setPwdError(''); setPwdOk(false) }}>
          <div>
            <p className="conta-action-title">{t('conta.pwd.title')}</p>
            <p className="conta-action-desc">{t('conta.pwd.desc')}</p>
          </div>
          <span className="conta-chevron">{pwdOpen ? '▲' : '▼'}</span>
        </div>
        {pwdOpen && (
          <form className="conta-form conta-form--indent" onSubmit={handlePwdSave}>
            <div className="conta-form-row">
              <label className="conta-label">{t('conta.label.pwd.current')}</label>
              <input className="conta-input" type="password" value={curPwd}
                onChange={e => setCurPwd(e.target.value)} placeholder="••••••••" required />
            </div>
            <div className="conta-form-row">
              <label className="conta-label">{t('conta.label.pwd.new')}</label>
              <input className="conta-input" type="password" value={newPwd}
                onChange={e => setNewPwd(e.target.value)} placeholder={t('conta.ph.pwd.new')} required minLength={8} />
              {newPwd && (
                <div className="pwd-strength">
                  <div className="pwd-strength-bar">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="pwd-strength-seg"
                        style={{ background: i <= strength.score ? strength.color : 'var(--line)' }} />
                    ))}
                  </div>
                  <span className="pwd-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>
            <div className="conta-form-row">
              <label className="conta-label">{t('conta.label.pwd.confirm')}</label>
              <input className="conta-input" type="password" value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" required />
            </div>
            {pwdError && <p className="conta-error">{pwdError}</p>}
            {pwdOk    && <p className="conta-success">{t('conta.pwd.ok')}</p>}
            <div className="conta-form-actions">
              <button type="button" className="conta-btn-cancel" onClick={() => setPwdOpen(false)}>{t('common.cancel')}</button>
              <button type="submit" className="conta-btn-save" disabled={pwdMutation.isPending}>
                {pwdMutation.isPending ? t('common.saving') : t('conta.pwd.btn')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

import { t } from '../i18n'
import { useProfile, profileName, profilePhoto, profileQuote } from '../lib/profile'
import type { View } from '../App'

export default function Profile({ setView }: { setView: (v: View) => void }) {
  useProfile()
  const name = profileName()
  const photo = profilePhoto()
  const quote = profileQuote()

  return (
    <div className="page-content active" id="page-profile" data-od-id="screen-profile">
      <div className="profile-header">
        <div className="avatar" id="profileFace">
          {photo
            ? <img src={photo} className="avatar-img" alt="" style={{ display: 'block' }} />
            : <span className="avatar-face-icon" id="profileFaceIcon">▲</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="profile-name" style={{ fontSize: 22, fontWeight: 700 }}>{name}</div>
        </div>
        {quote && <div className="profile-quote" id="profileQuote">&#8220;{quote}&#8221;</div>}
      </div>
      <div className="profile-menu">
        <div className="profile-menu-item glass-surface">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>{t('profile-community')}</span> <span className="arrow">→</span>
        </div>
        <div className="profile-menu-item glass-surface">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>{t('profile-privacy')}</span> <span className="arrow">→</span>
        </div>
        <div className="profile-menu-item glass-surface">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span>{t('profile-about')}</span> <span className="arrow">→</span>
        </div>
        <div className="profile-menu-item glass-surface" style={{ color: 'var(--danger)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>{t('profile-signout')}</span>
        </div>
      </div>
    </div>
  )
}

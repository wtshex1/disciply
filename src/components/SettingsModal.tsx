import { useEffect, useState } from 'react'
import { t, toggleLangNow } from '../i18n'
import { useLang } from '../lib/useLang'
import { toggleDark, applyDark } from '../theme'
import { exportAllData } from '../lib/export'

export default function SettingsModal({ closeModal, onDiscovery }: { closeModal: () => void; onDiscovery: () => void }) {
  const lang = useLang()
  const [exportStatus, setExportStatus] = useState<'idle' | 'done' | 'failed'>('idle')
  useEffect(() => { applyDark() }, [])
  const onExport = async () => {
    const ok = await exportAllData()
    setExportStatus(ok ? 'done' : 'failed')
    setTimeout(() => setExportStatus('idle'), 2500)
  }
  return (
    <div className="modal-overlay active" id="settingsModal" data-od-id="modal-settings" onClick={closeModal}>
      <div className="modal-sheet glass-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"></div>
        <button className="close-btn" onClick={closeModal} aria-label="Close settings">×</button>
        <h2>{t('settings-title')}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="profile-menu-item glass-surface">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>{t('settings-profile')}</span> <span className="arrow">→</span>
          </div>
          <div className="profile-menu-item glass-surface">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="5"/><path d="M3 21a9 9 0 0 1 18 0"/></svg>
            <span>{t('settings-edit-profile')}</span> <span className="arrow">→</span>
          </div>
          <div className="profile-menu-item glass-surface" onClick={toggleDark}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            <span>{t('settings-dark-mode')}</span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span id="darkSwitch"><span id="darkKnob"></span></span>
            </span>
          </div>
          <div className="profile-menu-item glass-surface" onClick={toggleLangNow}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>{t('settings-language')}</span>
            <span style={{ marginLeft: 'auto' }}>
              <button className="lang-toggle" aria-label="Language">
                <span className={lang === 'en' ? 'active' : ''} data-lt="en" onClick={e => { e.stopPropagation(); toggleLangNow() }}>EN</span><span className="lt-sep">/</span><span className={lang === 'ro' ? 'active' : ''} data-lt="ro" onClick={e => { e.stopPropagation(); toggleLangNow() }}>RO</span>
              </button>
            </span>
          </div>
          <div className="profile-menu-item glass-surface">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span>{t('settings-notifications')}</span>
            <span style={{ marginLeft: 'auto' }}><span style={{ width: 40, height: 22, background: 'var(--accent)', borderRadius: 14, display: 'inline-block', position: 'relative' }}><span style={{ position: 'absolute', right: 3, top: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff' }}></span></span></span>
          </div>
          <div className="profile-menu-item glass-surface" onClick={onDiscovery}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span>{t('settings-discovery')}</span> <span className="arrow">→</span>
          </div>
          <div className="profile-menu-item glass-surface" onClick={onExport}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>{exportStatus === 'done' || exportStatus === 'failed' ? (exportStatus === 'done' ? t('export-done') : t('export-failed')) : t('settings-export')}</span>
            <span className="arrow">{exportStatus === 'done' ? '✓' : exportStatus === 'failed' ? '!' : '→'}</span>
          </div>
          <div className="profile-menu-item glass-surface">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            <span>{t('settings-api')}</span> <span className="arrow">→</span>
          </div>
          <div className="profile-menu-item glass-surface">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span>{t('settings-about')}</span> <span className="arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  )
}

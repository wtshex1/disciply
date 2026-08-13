import { t } from '../i18n'

export default function WorkoutModal({ closeModal }: { closeModal: () => void }) {
  return (
    <div className="modal-overlay active" id="workoutModal" data-od-id="modal-workout" onClick={closeModal}>
      <div className="modal-sheet glass-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle"></div>
        <button className="close-btn" onClick={closeModal} aria-label="Close workout modal">×</button>
        <h2>{t('workout-title')}</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer' }}>{t('workout-strength')}</button>
          <button className="u-ghost-btn">{t('workout-cardio')}</button>
          <button className="u-ghost-btn">{t('workout-hiit')}</button>
          <button className="u-ghost-btn">{t('workout-yoga')}</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="u-field">
            <input className="glass-input u-input" type="text" defaultValue="Bench Press" placeholder={t('workout-ex-name')} />
          </div>
          <div className="u-row">
            <div className="u-field-row">
              <span className="u-muted13">{t('workout-sets')}</span>
              <input className="glass-input u-input-row" type="text" defaultValue="4" />
            </div>
            <div className="u-field-row">
              <span className="u-muted13">{t('workout-reps')}</span>
              <input className="glass-input u-input-row" type="text" defaultValue="10" />
            </div>
            <div className="u-field-row">
              <span className="u-muted13">{t('workout-kg')}</span>
              <input className="glass-input u-input-row" type="text" defaultValue="80" />
            </div>
          </div>
          <div className="u-field">
            <input className="glass-input u-input" type="text" defaultValue="Squat" placeholder={t('workout-ex-name')} />
          </div>
          <div className="u-row">
            <div className="u-field-row">
              <span className="u-muted13">{t('workout-sets')}</span>
              <input className="glass-input u-input-row" type="text" defaultValue="4" />
            </div>
            <div className="u-field-row">
              <span className="u-muted13">{t('workout-reps')}</span>
              <input className="glass-input u-input-row" type="text" defaultValue="8" />
            </div>
            <div className="u-field-row">
              <span className="u-muted13">{t('workout-kg')}</span>
              <input className="glass-input u-input-row" type="text" defaultValue="100" />
            </div>
          </div>
        </div>
        <button style={{ width: '100%', padding: 16, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--accent)', color: 'var(--bg-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', marginTop: 16 }}><span>{t('workout-save')}</span>  <span style={{ color: 'rgba(0,0,0,0.6)' }}>+120 XP</span></button>
      </div>
    </div>
  )
}

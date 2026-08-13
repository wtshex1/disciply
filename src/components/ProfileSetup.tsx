import { useRef, useState } from 'react'
import { t } from '../i18n'
import {
  DEFAULT_NAME, loadProfile, persistProfile, profileName, profilePhoto, profileQuote,
  removeProfile, resizePhoto
} from '../lib/profile'

type PsMode = 'create' | 'login' | 'edit'

export default function ProfileSetup({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<PsMode>(() => (loadProfile() ? 'login' : 'create'))
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [quote, setQuote] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const login = mode === 'login'
  const edit = mode === 'edit'
  const pName = profileName()
  const pPhoto = profilePhoto()
  const pQuote = profileQuote()

  const src = pendingPhoto || pPhoto

  const render = (m: PsMode) => {
    if (m === 'edit') {
      setName(pName)
      setQuote(pQuote)
    }
    setPendingPhoto(null)
    setMode(m)
  }

  const commit = () => {
    const profile = loadProfile() || {}
    const trimmedName = (name || '').trim() || pName || DEFAULT_NAME
    profile.name = trimmedName
    profile.quote = (quote || '').trim()
    if (pendingPhoto) profile.photo = pendingPhoto
    persistProfile(profile)
    setPendingPhoto(null)
  }

  const mainAction = () => {
    if (login) return onDone()
    commit()
    if (edit) { setMode('login'); return }
    onDone()
  }

  const onFile = async (f: File | null) => {
    if (!f) return
    const data = await resizePhoto(f)
    setPendingPhoto(data)
  }

  return (
    <div className="profile-setup active" id="profileSetup" data-od-id="screen-profile-setup">
      <div className="ps-card glass-card">
        <h2 id="psTitle">{login ? t('ps-welcome') : t('ps-title')}</h2>
        {!login && <p className="u-muted13" id="psSub">{t('ps-sub')}</p>}
        <div className="ps-avatar">
          {src
            ? <img id="psPhoto" src={src} alt="" style={{ display: 'block' }} />
            : <span className="ps-face" id="psFace">▲</span>}
          {!login && (
            <span className="ps-cam" id="psCam" role="button" aria-label="Choose photo" onClick={() => fileRef.current && fileRef.current.click()}>✚</span>
          )}
        </div>
        {login && <div className="ps-name-display" id="psNameDisplay">{pName}</div>}
        {!login && <p className="ps-hint" id="psCaption">{t('ps-caption')}</p>}
        <input type="file" id="psFile" accept="image/*" hidden ref={fileRef} onChange={e => onFile(e.target.files ? e.target.files[0] : null)} />
        {!login && (
          <>
            <input
              className="ps-name" id="psName" type="text" maxLength={30} placeholder={t('ps-name')}
              value={name} onChange={e => setName(e.target.value)} autoComplete="off"
            />
            <input
              className="ps-name" id="psQuote" type="text" maxLength={90} placeholder={t('ps-quote')}
              value={quote} onChange={e => setQuote(e.target.value)} autoComplete="off"
              style={{ fontSize: 14, fontWeight: 500 }}
            />
            <button className="ps-skip" id="psPhotoBtn" onClick={() => fileRef.current && fileRef.current.click()}>
              {pendingPhoto || pPhoto ? t('ps-change-photo') : t('ps-photo')}
            </button>
          </>
        )}
        <button className="ps-continue" id="psMainBtn" onClick={mainAction}>
          {login ? t('ps-continue-as').replace('{0}', pName) : edit ? t('ps-save') : t('ps-continue')}
        </button>
        <div className="ps-row">
          {!login && !edit && <button className="ps-skip" id="psSkipBtn" onClick={() => { commit(); onDone() }}>{t('ps-skip')}</button>}
          {login && (
            <>
              <button className="ps-skip" id="psEditBtn" onClick={() => render('edit')}>{t('settings-edit-profile')}</button>
              <span className="ps-sep" id="psSep"></span>
              <button className="ps-skip" id="psNewBtn" onClick={() => { removeProfile(); setMode('create'); setName(''); setQuote('') }}>{t('ps-new')}</button>
            </>
          )}
          {edit && <button className="ps-skip" id="psCancelBtn" onClick={() => setMode('login')}>{t('ps-cancel')}</button>}
        </div>
      </div>
    </div>
  )
}

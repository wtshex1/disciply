import { useCallback, useEffect, useState } from 'react'
import { t } from '../i18n'
import { useProfile, profileName, profilePhoto, profileQuote, profileResult, removeProfile } from '../lib/profile'
import { db, type GoalItem } from '../db'
import { todayKey } from '../lib/date'
import { MODULES, moduleNameKey, moduleDescKey } from '../lib/modules'
import { CATEGORIES, catName } from '../questions'
import type { View } from '../App'

function calcStreak(dates: string[]): number {
  const set = new Set(dates)
  const today = todayKey()
  const y = new Date()
  y.setDate(y.getDate() - 1)
  const yesterday = todayKey(y)
  if (!set.has(today) && !set.has(yesterday)) return 0
  let streak = 0
  const cur = new Date((set.has(today) ? today : yesterday) + 'T00:00:00')
  while (set.has(todayKey(cur))) {
    streak++
    cur.setDate(cur.getDate() - 1)
  }
  return streak
}

export default function Profile({ setView, onSignOut }: { setView: (v: View) => void; onSignOut: () => void }) {
  useProfile()
  const name = profileName()
  const photo = profilePhoto()
  const quote = profileQuote()
  const result = profileResult()

  const [goals, setGoals] = useState<GoalItem[]>([])
  const reload = useCallback(async () => {
    setGoals(await db.goals.toArray())
  }, [])
  useEffect(() => { void reload() }, [reload])

  const objs = goals.filter(g => g.type === 'objective')
  const habits = goals.filter(g => g.type === 'habit')
  const today = todayKey()

  const vals = result ? result.vals : CATEGORIES.map(() => 0)
  const objDone = objs.filter(g => g.done).length
  const habitToday = habits.filter(h => h.doneDates.includes(today)).length
  const bestStreak = habits.length ? Math.max(...habits.map(h => calcStreak(h.doneDates))) : 0

  return (
    <div className="page-content active" id="page-profile" data-od-id="screen-profile">

      <div className="hero-card glass-card">
        <div className="hero-avatar">
          <div className="avatar-ring"></div>
          <div className="avatar-face" id="profileFace">
            {photo
              ? <img src={photo} className="avatar-img" alt="" style={{ display: 'block' }} />
              : <span className="avatar-face-icon" id="profileFaceIcon">▲</span>}
          </div>
        </div>
        <div className="hero-info">
          <div className="hero-name" id="profileName">{name}</div>
          {quote && <div className="profile-quote" id="profileQuote">&#8220;{quote}&#8221;</div>}
          <div className="hero-streak" id="profileStreak">{t('profile-best-streak').replace('{0}', String(bestStreak))}</div>
        </div>
        {result && (
          <div className="profile-ring" id="profileScore">
            <div className="result-ring-wrap">
              <svg className="result-ring-svg" viewBox="0 0 100 100">
                <circle className="result-ring-bg" cx="50" cy="50" r="42" />
                <circle className="result-ring-fg" cx="50" cy="50" r="42" style={{ strokeDasharray: 264, strokeDashoffset: 264 - 264 * result.overall / 100 }} />
              </svg>
              <div className="result-center">
                <span className="sphere-pct">{result.overall}</span>
                <span className="sphere-label">{t('result-overall')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="profile-stats">
        <div className="profile-stat glass-surface">
          <span className="ps-num">{objDone}<small>/{objs.length}</small></span>
          <span className="ps-lbl">{t('profile-stats-objectives')}</span>
        </div>
        <div className="profile-stat glass-surface">
          <span className="ps-num">{habitToday}<small>/{habits.length}</small></span>
          <span className="ps-lbl">{t('profile-stats-habits')}</span>
        </div>
        <div className="profile-stat glass-surface">
          <span className="ps-num">{bestStreak}<small>{t('hd-days-unit')}</small></span>
          <span className="ps-lbl">{t('profile-best-streak-label')}</span>
        </div>
      </div>

      {result && (
        <div className="card glass-card">
          <div className="u-section-h">{t('profile-score')}</div>
          <div className="result-bars area-bars" style={{ maxWidth: '100%' }}>
            {CATEGORIES.map((c, i) => (
              <div className="result-bar-row" key={c.key} style={{ marginBottom: 6 }}>
                <span className="rb-name">{catName(c)}</span>
                <div className="rb-track"><span style={{ width: vals[i] + '%' }}></span></div>
                <span className="rb-pct">{vals[i]}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card glass-card">
        <div className="u-section-h">{t('profile-objectives')} <span className="section-count" style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}>{objs.length}</span></div>
        {objs.length === 0 ? (
          <p className="u-muted13" style={{ textAlign: 'center' }}>{t('pg-obj-empty')}</p>
        ) : (
          objs.map(g => (
            <div className="wkt-progress-row clickable" key={g.id} onClick={() => setView({ page: 'objective', id: g.id!, from: 'profile' })}>
              <span className="wkt-p-name">{g.done ? '✓ ' : ''}{g.name}</span>
              <span className={'goal-term t' + g.term}>{t('term-' + g.term)}</span>
              <span className="streak-chip">{t('habit-streak').replace('{0}', String(calcStreak(g.doneDates)))}</span>
            </div>
          ))
        )}
      </div>

      <div className="card glass-card">
        <div className="u-section-h">{t('profile-habits')} <span className="section-count" style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}>{habits.length}</span></div>
        {habits.length === 0 ? (
          <p className="u-muted13" style={{ textAlign: 'center' }}>{t('habits-empty')}</p>
        ) : (
          habits.map(h => {
            const doneToday = h.doneDates.includes(today)
            return (
              <div className="wkt-progress-row clickable" key={h.id} onClick={() => setView({ page: 'habit', id: h.id!, from: 'profile' })}>
                <span className="wkt-p-name">{doneToday ? '✓ ' : ''}{h.name}</span>
                <span className="streak-chip">{t('habit-streak').replace('{0}', String(calcStreak(h.doneDates)))}</span>
              </div>
            )
          })
        )}
      </div>

      <div className="u-section-h" style={{ marginTop: 16 }}>{t('profile-modules')}</div>
      <div className="more-grid">
        {MODULES.map(item => (
          <div className="more-item glass-card" key={item.id} onClick={() => setView({ page: 'sub', id: item.id as never })}>
            <div className="more-icon">{item.icon}</div>
            <div className="more-info">
              <span className="more-name">{t(moduleNameKey(item.id))}</span>
              <span className="u-muted13">{t(moduleDescKey(item.id))}</span>
            </div>
            <span className="arrow">→</span>
          </div>
        ))}
      </div>

      <button className="profile-signout" onClick={() => {
        if (window.confirm(t('profile-signout-confirm'))) onSignOut()
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        {t('profile-signout')}
      </button>
    </div>
  )
}
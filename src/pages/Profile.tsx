import { useCallback, useEffect, useState } from 'react'
import { t } from '../i18n'
import { useProfile, profileName, profilePhoto, profileQuote, profileResult, removeProfile } from '../lib/profile'
import { db, type GoalItem } from '../db'
import { todayKey } from '../lib/date'
import { MODULES, moduleNameKey, moduleDescKey } from '../lib/modules'
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

  return (
    <div className="page-content active" id="page-profile" data-od-id="screen-profile">
      <div className="profile-header">
        <div className="avatar" id="profileFace">
          {photo
            ? <img src={photo} className="avatar-img" alt="" style={{ display: 'block' }} />
            : <span className="avatar-face-icon" id="profileFaceIcon">▲</span>}
        </div>
        <div className="profile-name" style={{ fontSize: 22, fontWeight: 700 }}>{name}</div>
        {quote && <div className="profile-quote" id="profileQuote">&#8220;{quote}&#8221;</div>}
        {result && (
          <div className="profile-score-chip" id="profileScore">
            <span className="profile-score-val">{result.overall}</span>
            <span className="profile-score-label">{t('profile-score')}</span>
          </div>
        )}
      </div>

      <div className="section-label" style={{ padding: '0 6px', marginBottom: 8, marginTop: 4 }}>
        <span>{t('profile-objectives')}</span>
        <span className="section-count" style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}>{objs.length}</span>
      </div>
      {objs.length === 0 && <div className="profile-menu-item glass-surface" style={{ color: 'var(--text-muted)', cursor: 'default' }}>{t('profile-no-objectives')}</div>}
      {objs.map(g => {
        const streak = calcStreak(g.doneDates)
        return (
          <div className="profile-menu-item glass-surface" key={g.id} onClick={() => setView({ page: 'objective', id: g.id!, from: 'profile' })}>
            <span className="more-icon" style={{ width: 36, height: 36, fontSize: 18 }}>{g.icon || '🎯'}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="profile-item-name" style={{ display: 'block', fontWeight: 600 }}>{g.name}</span>
              <span className="u-muted13">{g.area}</span>
            </span>
            <span className="hd-stat-val" style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>{streak}<small>{t('hd-days-unit')}</small></span>
            <span className="arrow">→</span>
          </div>
        )
      })}

      <div className="section-label" style={{ padding: '0 6px', marginBottom: 8, marginTop: 16 }}>
        <span>{t('profile-habits')}</span>
        <span className="section-count" style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}>{habits.length}</span>
      </div>
      {habits.length === 0 && <div className="profile-menu-item glass-surface" style={{ color: 'var(--text-muted)', cursor: 'default' }}>{t('habits-empty')}</div>}
      {habits.map(g => {
        const streak = calcStreak(g.doneDates)
        const doneToday = g.doneDates.includes(today)
        return (
          <div className="profile-menu-item glass-surface" key={g.id} onClick={() => setView({ page: 'habit', id: g.id!, from: 'profile' })}>
            <span className="more-icon" style={{ width: 36, height: 36, fontSize: 18 }}>{g.icon || '🔁'}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="profile-item-name" style={{ display: 'block', fontWeight: 600 }}>{g.name}</span>
              <span className="u-muted13">{doneToday ? t('habit-done-today') : t('habit-pending-today')}</span>
            </span>
            <span className="hd-stat-val" style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>{streak}<small>{t('hd-days-unit')}</small></span>
            <span className="arrow">→</span>
          </div>
        )
      })}

      <div className="section-label" style={{ padding: '0 6px', marginBottom: 8, marginTop: 16 }}>
        <span>{t('profile-modules')}</span>
      </div>
      <div className="more-grid" style={{ marginBottom: 8 }}>
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

      <div className="profile-menu-item glass-surface" style={{ color: 'var(--danger)' }} onClick={() => {
        if (window.confirm(t('profile-signout-confirm'))) onSignOut()
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span>{t('profile-signout')}</span>
      </div>
    </div>
  )
}
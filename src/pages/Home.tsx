import { useCallback, useEffect, useState } from 'react'
import { t } from '../i18n'
import { useLang } from '../lib/useLang'
import { todayKey, capitalize } from '../lib/date'
import { useProfile, profileName, profileQuote, profilePhoto } from '../lib/profile'
import { useHabits } from '../lib/habits'
import { MODULES, moduleNameKey } from '../lib/modules'
import { goalIcon } from '../lib/icons'
import SwipeRow from '../components/SwipeRow'
import { db, type GoalItem } from '../db'
import { CATEGORIES, catName } from '../questions'
import type { View } from '../App'

function weekCircles(lang: 'en' | 'ro') {
  const now = new Date()
  const locale = lang === 'ro' ? 'ro-RO' : 'en-US'
  const todayIdx = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - todayIdx)
  const rings = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const cls = i < todayIdx ? 'wc-circle done' : i === todayIdx ? 'wc-circle today' : 'wc-circle'
    rings.push(
      <div className="wc-ring" key={i}>
        <div className={cls}>{d.toLocaleDateString(locale, { weekday: 'narrow' })}</div>
        <span className="wc-num">{d.getDate()}</span>
      </div>
    )
  }
  return rings
}

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

export default function Home({ openModal, setView }: { openModal: (id: 'settings') => void; setView: (v: View) => void }) {
  const lang = useLang()
  const habits = useHabits()
  const [lifeTab, setLifeTab] = useState<'life' | 'goals' | 'habits'>('life')
  const [goals, setGoals] = useState<GoalItem[]>([])
  useProfile()
  const name = profileName()
  const quote = profileQuote()
  const photo = profilePhoto()

  const reload = useCallback(async () => {
    setGoals(await db.goals.toArray())
  }, [])
  useEffect(() => { void reload() }, [reload])

  const objs = goals.filter(g => g.type === 'objective').sort((a, b) => a.createdAt - b.createdAt)
  const habitItems = goals.filter(g => g.type === 'habit').sort((a, b) => a.createdAt - b.createdAt)
  const today = todayKey()

  const toggleDone = async (g: GoalItem) => {
    if (g.id == null) return
    await db.goals.update(g.id, { done: !g.done })
    await reload()
  }

  const toggleToday = async (g: GoalItem) => {
    if (g.id == null) return
    const next = g.doneDates.includes(today)
      ? g.doneDates.filter(d => d !== today)
      : [...g.doneDates, today]
    await db.goals.update(g.id, { doneDates: next })
    await reload()
  }

  const delGoal = async (g: GoalItem) => {
    if (g.id == null) return
    await db.goals.delete(g.id)
    await reload()
  }

  const actDone = async (g: GoalItem) => {
    if (g.id == null) return
    if (g.type === 'habit') {
      const next = g.doneDates.includes(today)
        ? g.doneDates
        : [...g.doneDates, today]
      await db.goals.update(g.id, { doneDates: next, blocked: false, blockedReason: undefined })
    } else {
      await db.goals.update(g.id, { done: true, blocked: false, blockedReason: undefined })
    }
    await reload()
  }

  const actNotDone = async (g: GoalItem) => {
    if (g.id == null) return
    if (g.type === 'habit') {
      await db.goals.update(g.id, { doneDates: g.doneDates.filter(d => d !== today) })
    } else {
      await db.goals.update(g.id, { done: false })
    }
    await reload()
  }

  const openReason = (g: GoalItem) => {
    setView({ page: 'reason', id: g.id!, from: 'home' })
  }

  const catOf = (key: string) => CATEGORIES.find(c => c.key === key)

  const fmtDeadline = (s: string) => {
    const [y, m, d] = s.slice(0, 10).split('-').map(Number)
    const date = new Date(y, m - 1, d)
    let out = date.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    const timePart = s.length > 10 ? s.slice(11, 16) : null
    if (timePart) out += ' · ' + timePart
    return out
  }

  const dateValue = capitalize(
    new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
  )

  return (
    <div className="page-content active" id="page-home" data-od-id="screen-home">

      <div className="hero-card glass-card">
        <button className="hero-settings" onClick={() => openModal('settings')} aria-label="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <div className="hero-avatar">
          <div className="avatar-ring"></div>
          <div className="avatar-face" id="heroFace">
            {photo
              ? <img src={photo} className="avatar-img" alt="" style={{ display: 'block' }} />
              : <span className="avatar-face-icon" id="heroFaceIcon">▲</span>}
          </div>
        </div>
        <div className="hero-info">
          <div className="hero-name" id="heroName">{name}</div>
          {quote && <div className="profile-quote" id="heroQuote">&#8220;{quote}&#8221;</div>}
        </div>
      </div>

      <div className="date-section">
        <div className="date-label">{t('home-today')}</div>
        <div className="date-value" id="dateValue">{dateValue}</div>
        <div className="week-circles" id="weekCircles">{weekCircles(lang)}</div>
      </div>

      <div className="card glass-card life-frame">
        <div className="life-tabs">
          <button type="button" className={'life-tab' + (lifeTab === 'life' ? ' on' : '')} onClick={() => setLifeTab('life')}>{t('home-life')}</button>
          <button type="button" className={'life-tab' + (lifeTab === 'goals' ? ' on' : '')} onClick={() => setLifeTab('goals')}>{t('home-objectives')}</button>
          <button type="button" className={'life-tab' + (lifeTab === 'habits' ? ' on' : '')} onClick={() => setLifeTab('habits')}>{t('home-habits-tab')}</button>
        </div>

        {lifeTab === 'life' && (
          <>
            {habits.length === 0 && (
              <p className="u-muted13" style={{ textAlign: 'center', padding: '6px 0 2px' }}>{t('home-habits-empty')}</p>
            )}
            {habits.map((id, i) => {
              const mod = MODULES.find(m => m.id === id)
              if (!mod) return null
              return (
                <div
                  className={'objective-item glass-surface life-mod' + (i > 0 ? ' u-mt8' : '')}
                  key={id}
                  onClick={() => setView({ page: 'sub', id: id as never })}
                >
                  <div className="more-icon">{mod.icon}</div>
                  <div className="obj-body">
                    <div className="obj-text">{t(moduleNameKey(id))}</div>
                    <div className="obj-meta"><span className={'obj-tag glass-chip'}>{t(mod.tag)}</span></div>
                  </div>
                  <span className="arrow">→</span>
                </div>
              )
            })}
          </>
        )}

        {lifeTab === 'goals' && (
          <>
            <div className="section-label">
              <span>{t('home-objectives')}</span>
              <span className="section-count glass-badge">{objs.length}</span>
            </div>
            {objs.length === 0 && (
              <p className="u-muted13" style={{ textAlign: 'center', padding: '6px 0 2px' }}>{t('goals-empty')}</p>
            )}
            {objs.map((g, i) => {
              const cat = catOf(g.area)
              return (
                <SwipeRow
                  key={g.id}
                  mt={i > 0}
                  onTap={() => setView({ page: 'objective', id: g.id!, from: 'home' })}
                  actions={
                    <>
                      <button className="swipe-act done" onClick={() => void actDone(g)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        <span>{t('act-done')}</span>
                      </button>
                      <button className="swipe-act not" onClick={() => void actNotDone(g)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        <span>{t('act-not')}</span>
                      </button>
                      <button className="swipe-act why" onClick={() => openReason(g)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/><path d="M12 8v4M12 16h.01"/></svg>
                        <span>{t('act-reason')}</span>
                      </button>
                    </>
                  }
                >
                  <div className="objective-item glass-surface">
                    <button type="button" className={'obj-check' + (g.done ? ' done' : '')} onClick={e => { e.stopPropagation(); toggleDone(g) }}></button>
                    <div className="more-icon">{goalIcon(g.icon)}</div>
                    <div className="obj-body">
                      <div className={'obj-text' + (g.done ? ' done' : '')}>{g.name}</div>
                      {g.desc && <div className="u-muted13">{g.desc}</div>}
                      <div className="obj-meta">
                        <span className={'goal-term t' + g.term}>{t('term-' + g.term)}</span>
                        {g.blocked && <span className="reason-chip">{g.blockedReason || t('act-reason')}</span>}
                        {g.deadline && <span className="u-muted13">{t('goal-due')} {fmtDeadline(g.deadline)}</span>}
                      </div>
                    </div>
                    <div className="obj-meta">
                      {cat && <span className="area-tag" style={{ color: cat.color }}>{catName(cat)}</span>}
                      <button type="button" className="wkt-del" onClick={e => { e.stopPropagation(); delGoal(g) }}>×</button>
                    </div>
                  </div>
                </SwipeRow>
              )
            })}
          </>
        )}

        {lifeTab === 'habits' && (
          <>
            <div className="section-label">
              <span>{t('home-habits-tab')}</span>
              <span className="section-count glass-badge">{habitItems.length}</span>
            </div>
            {habitItems.length === 0 && (
              <p className="u-muted13" style={{ textAlign: 'center', padding: '6px 0 2px' }}>{t('habits-empty')}</p>
            )}
            {habitItems.map((h, i) => {
              const doneToday = h.doneDates.includes(today)
              const streak = calcStreak(h.doneDates)
              return (
                <SwipeRow
                  key={h.id}
                  mt={i > 0}
                  onTap={() => setView({ page: 'habit', id: h.id!, from: 'home' })}
                  actions={
                    <>
                      <button className="swipe-act done" onClick={() => void actDone(h)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        <span>{t('act-done')}</span>
                      </button>
                      <button className="swipe-act not" onClick={() => void actNotDone(h)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        <span>{t('act-not')}</span>
                      </button>
                      <button className="swipe-act why" onClick={() => openReason(h)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/><path d="M12 8v4M12 16h.01"/></svg>
                        <span>{t('act-reason')}</span>
                      </button>
                    </>
                  }
                >
                  <div className="objective-item glass-surface">
                    <button type="button" className={'obj-check' + (doneToday ? ' done' : '')} onClick={e => { e.stopPropagation(); toggleToday(h) }}></button>
                    <div className="more-icon">{goalIcon(h.icon)}</div>
                    <div className="obj-body">
                      <div className="obj-text">{h.name}</div>
                      <div className="obj-meta">
                        <span className="streak-chip">{t('habit-streak').replace('{0}', String(streak))}</span>
                        {h.blocked && <span className="reason-chip">{h.blockedReason || t('act-reason')}</span>}
                        {h.deadline && <span className="u-muted13">{t('habit-at').replace('{0}', h.deadline.slice(11, 16))}</span>}
                      </div>
                    </div>
                    <button type="button" className="wkt-del" onClick={e => { e.stopPropagation(); delGoal(h) }}>×</button>
                  </div>
                </SwipeRow>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

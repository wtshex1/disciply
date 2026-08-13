import { useCallback, useEffect, useState } from 'react'
import { t } from '../i18n'
import { useLang } from '../lib/useLang'
import { db, type GoalItem } from '../db'
import { todayKey, capitalize } from '../lib/date'
import { goalIcon } from '../lib/icons'
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

function bestStreak(dates: string[]): number {
  const keys = Array.from(new Set(dates)).sort()
  if (!keys.length) return 0
  let best = 1
  let cur = 1
  for (let i = 1; i < keys.length; i++) {
    const prev = new Date(keys[i - 1] + 'T00:00:00')
    prev.setDate(prev.getDate() + 1)
    if (todayKey(prev) === keys[i]) cur++
    else cur = 1
    if (cur > best) best = cur
  }
  return best
}

export default function HabitDetail({ id, from, setView }: { id: number; from?: 'home' | 'progress' | 'profile'; setView: (v: View) => void }) {
  const lang = useLang()
  const [goal, setGoal] = useState<GoalItem | null>(null)

  const reload = useCallback(async () => {
    const g = await db.goals.get(id)
    setGoal(g || null)
  }, [id])

  useEffect(() => { void reload() }, [reload])

  const locale = lang === 'ro' ? 'ro-RO' : 'en-US'
  const now = new Date()
  const todayKeyStr = todayKey()
  const set = new Set(goal ? goal.doneDates : [])
  const doneTotal = set.size

  const streak = calcStreak(goal ? goal.doneDates : [])
  const best = bestStreak(goal ? goal.doneDates : [])

  const started = goal ? new Date(goal.createdAt) : null
  let daysSince = 0
  if (started) {
    const s = new Date(started.getFullYear(), started.getMonth(), started.getDate())
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    daysSince = Math.max(1, Math.round((t.getTime() - s.getTime()) / 86400000) + 1)
  }
  const consistency = goal && daysSince ? Math.min(100, Math.round(doneTotal / daysSince * 100)) : 0

  const startLabel = started
    ? capitalize(started.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }))
    : '—'

  const weeks: { monday: Date; sunday: Date; done: number; missed: boolean; current: boolean }[] = []
  for (let w = 11; w >= 0; w--) {
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) - w * 7)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    let done = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      if (set.has(todayKey(d))) done++
    }
    weeks.push({ monday, sunday, done, missed: done === 0 && todayKey(sunday) < todayKeyStr, current: w === 0 })
  }

  const months: { label: string; done: number; elapsed: number; pct: number }[] = []
  for (let m = 5; m >= 0; m--) {
    const start = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const dim = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
    const elapsed = m === 0 ? now.getDate() : dim
    let done = 0
    for (let d = 1; d <= dim; d++) {
      const key = start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0')
      if (set.has(key)) done++
    }
    const pct = Math.round(done / elapsed * 100)
    months.push({
      label: capitalize(start.toLocaleDateString(locale, { month: 'short' })),
      done,
      elapsed,
      pct
    })
  }

  const missedWeeks = weeks.filter(w => w.missed)
  const weekLabel = (w: { monday: Date; sunday: Date }) => {
    const a = w.monday.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
    const b = w.sunday.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
    return a + ' – ' + b
  }

  return (
    <div className="page-content active" id="page-habit" data-od-id="screen-habit">
      <div className="sub-top">
        <button className="sub-back" onClick={() => setView({ page: from === 'progress' ? 'progress' : from === 'profile' ? 'profile' : 'home' })} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>

      {!goal ? (
        <div className="card glass-card empty-state">
          <div className="more-icon big">{goalIcon('star')}</div>
          <h3 style={{ margin: '0 0 6px' }}>{t('hd-no-data')}</h3>
          <p className="u-muted13" style={{ textAlign: 'center', lineHeight: 1.5 }}>{t('hd-no-data-sub')}</p>
        </div>
      ) : (
        <>
          <div className="sub-hero glass-card">
            <div className="more-icon big" style={{ color: 'var(--accent)' }}>{goalIcon(goal.icon)}</div>
            <h3>{goal.name}</h3>
            {goal.desc && <p className="u-muted13">{goal.desc}</p>}
          </div>

          <div className="card glass-card">
            <div className="hd-stats">
              <div className="hd-stat">
                <span className="hd-stat-val">{streak}<small>{t('hd-days-unit')}</small></span>
                <span className="hd-stat-label">{t('hd-current')}</span>
              </div>
              <div className="hd-stat">
                <span className="hd-stat-val">{best}<small>{t('hd-days-unit')}</small></span>
                <span className="hd-stat-label">{t('hd-best')}</span>
              </div>
              <div className="hd-stat">
                <span className="hd-stat-val">{consistency}%</span>
                <span className="hd-stat-label">{t('hd-consistency')}</span>
              </div>
              <div className="hd-stat">
                <span className="hd-stat-val small">{startLabel}</span>
                <span className="hd-stat-label">{t('hd-started')}</span>
              </div>
            </div>
          </div>

          <div className="card glass-card">
            <div className="u-section-h">{t('hd-weekly')}</div>
            <p className="u-muted13" style={{ margin: '-4px 0 12px' }}>{t('hd-weekly-sub')}</p>
            <div className="hd-weeks">
              {weeks.map((w, i) => (
                <div className={'hd-week-row' + (w.missed ? ' missed' : '') + (w.current ? ' current' : '')} key={i}>
                  <span className="hd-week-label">{weekLabel(w)}</span>
                  <span className="hd-week-dots">
                    {Array.from({ length: 7 }, (_, d) => {
                      const day = new Date(w.monday)
                      day.setDate(w.monday.getDate() + d)
                      const key = todayKey(day)
                      const isFuture = key > todayKeyStr
                      const isDone = set.has(key)
                      const cls = isDone ? 'done' : isFuture ? 'future' : key === todayKeyStr ? 'pending' : 'missed'
                      return <i key={d} className={'hd-dot ' + cls}></i>
                    })}
                  </span>
                  <span className={'hd-week-count' + (w.done === 7 ? ' full' : '')}>{w.done}/7</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card glass-card">
            <div className="u-section-h">{t('hd-monthly')}</div>
            <p className="u-muted13" style={{ margin: '-4px 0 12px' }}>{t('hd-monthly-sub')}</p>
            <div className="hd-months">
              {months.map((mo, i) => (
                <div className="hd-month-row" key={i}>
                  <span className="hd-month-label">{mo.label}</span>
                  <div className="hd-month-track"><span style={{ width: mo.pct + '%' }}></span></div>
                  <span className="hd-month-pct">{t('hd-of').replace('{0}', String(mo.done)).replace('{1}', String(mo.elapsed))} · {mo.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card glass-card">
            <div className="u-section-h">{t('hd-missed-title')}</div>
            <p className="u-muted13" style={{ margin: '-4px 0 12px' }}>{t('hd-missed-note')}</p>
            {missedWeeks.length === 0 ? (
              <p className="u-muted13" style={{ textAlign: 'center' }}>{t('hd-missed-empty')}</p>
            ) : (
              <div className="hd-miss-list">
                {missedWeeks.map((w, i) => (
                  <div className="hd-miss-row" key={i}>
                    <span className="hd-miss-dot"></span>
                    <span>{weekLabel(w)}</span>
                    <span className="u-muted13">0/7</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { t } from '../i18n'
import { useLang } from '../lib/useLang'
import { useProfile, profileResult } from '../lib/profile'
import { CATEGORIES, catName } from '../questions'
import { db, type GoalItem } from '../db'
import { todayKey } from '../lib/date'
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

export default function Progress({ onRetake, setView }: { onRetake: () => void; setView: (v: View) => void }) {
  const lang = useLang()
  useProfile()
  const result = profileResult()
  const overall = result ? result.overall : 0
  const vals = result ? result.vals : CATEGORIES.map(() => 0)
  const tier = Math.min(5, Math.floor(overall / 17))

  const [goals, setGoals] = useState<GoalItem[]>([])
  const reload = useCallback(async () => {
    setGoals(await db.goals.toArray())
  }, [])
  useEffect(() => { void reload() }, [reload])

  const desc = result
    ? (() => {
        const maxIdx = vals.indexOf(Math.max(...vals))
        const minIdx = vals.indexOf(Math.min(...vals))
        return t('result-desc')
          .replace('{0}', catName(CATEGORIES[maxIdx]))
          .replace('{1}', String(vals[maxIdx]))
          .replace('{2}', catName(CATEGORIES[minIdx]))
          .replace('{3}', String(vals[minIdx]))
          .replace('{4}', t('cmp-' + tier))
      })()
    : ''

  const objs = goals.filter(g => g.type === 'objective')
  const habitItems = goals.filter(g => g.type === 'habit')
  const today = todayKey()
  const objDone = objs.filter(g => g.done).length
  const objPct = objs.length ? Math.round(objDone / objs.length * 100) : 0
  const habitToday = habitItems.filter(h => h.doneDates.includes(today)).length
  const habitPct = habitItems.length ? Math.round(habitToday / habitItems.length * 100) : 0

  return (
    <div className="page-content active" id="page-progress" data-od-id="screen-progress">

      <button className="cal-link" onClick={() => setView({ page: 'allcal' })}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
        <span>{t('allcal-title')}</span>
        <span className="arrow">→</span>
      </button>

      {result ? (
        <>
          <div className="card glass-card">
            <div className="u-section-h">{t('pg-potential')}</div>
            <div className="result-sphere-wrap">
              <div className="result-ring-wrap">
                <svg className="result-ring-svg" viewBox="0 0 100 100">
                  <circle className="result-ring-bg" cx="50" cy="50" r="42" />
                  <circle className="result-ring-fg" cx="50" cy="50" r="42" style={{ strokeDasharray: 264, strokeDashoffset: 264 - 264 * overall / 100 }} />
                </svg>
                <div className="result-center">
                  <span className="sphere-pct">{overall}</span>
                  <span className="sphere-label">{t('result-overall')}</span>
                </div>
              </div>
            </div>
            <p className="u-muted13" style={{ textAlign: 'center', lineHeight: 1.5 }}>{desc}</p>
          </div>

          <div className="card glass-card">
            <div className="u-section-h">{t('pg-areas')}</div>
            <div className="result-bars area-bars" style={{ maxWidth: '100%' }}>
              {CATEGORIES.map((c, i) => (
                <div className="result-bar-row" key={c.key}>
                  <span className="rb-name">{catName(c)}</span>
                  <div className="rb-track"><span style={{ width: vals[i] + '%' }}></span></div>
                  <span className="rb-pct">{vals[i]}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card glass-card empty-state">
          <div className="result-sphere-wrap">
            <div className="result-ring-wrap">
              <svg className="result-ring-svg" viewBox="0 0 100 100">
                <circle className="result-ring-bg" cx="50" cy="50" r="42" />
              </svg>
              <div className="result-center">
                <span className="sphere-pct">?</span>
              </div>
            </div>
          </div>
          <h3 style={{ margin: '0 0 6px' }}>{t('progress-empty-title')}</h3>
          <p className="u-muted13" style={{ textAlign: 'center', lineHeight: 1.5, marginBottom: 14 }}>{t('progress-empty-sub')}</p>
          <button className="hyd-btn" onClick={onRetake}>{t('progress-take')}</button>
        </div>
      )}

      <div className="card glass-card">
        <div className="u-section-h">{t('home-objectives')}</div>
        {objs.length === 0 ? (
          <p className="u-muted13" style={{ textAlign: 'center' }}>{t('pg-obj-empty')}</p>
        ) : (
          <>
            <div className="result-bar-row" style={{ marginBottom: 12 }}>
              <span className="rb-name">{t('pg-obj-done').replace('{0}', String(objDone)).replace('{1}', String(objs.length))}</span>
              <div className="rb-track"><span style={{ width: objPct + '%', background: 'var(--accent)' }}></span></div>
              <span className="rb-pct">{objPct}%</span>
            </div>
            {objs.map(g => (
              <div className="wkt-progress-row clickable" key={g.id} onClick={() => setView({ page: 'objective', id: g.id!, from: 'progress' })}>
                <span className="wkt-p-name">{g.done ? '✓ ' : ''}{g.name}</span>
                <span className={'goal-term t' + g.term}>{t('term-' + g.term)}</span>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="card glass-card">
        <div className="u-section-h">{t('home-habits-tab')}</div>
        {habitItems.length === 0 ? (
          <p className="u-muted13" style={{ textAlign: 'center' }}>{t('pg-habit-empty')}</p>
        ) : (
          <>
            <div className="result-bar-row" style={{ marginBottom: 12 }}>
              <span className="rb-name">{t('pg-habit-today').replace('{0}', String(habitToday)).replace('{1}', String(habitItems.length))}</span>
              <div className="rb-track"><span style={{ width: habitPct + '%', background: 'var(--success)' }}></span></div>
              <span className="rb-pct">{habitPct}%</span>
            </div>
            {habitItems.map(h => {
              const streak = calcStreak(h.doneDates)
              const doneToday = h.doneDates.includes(today)
              return (
                <div className="wkt-progress-row clickable" key={h.id} onClick={() => setView({ page: 'habit', id: h.id!, from: 'progress' })}>
                  <span className="wkt-p-name">{doneToday ? '✓ ' : ''}{h.name}</span>
                  <span className="streak-chip">{t('habit-streak').replace('{0}', String(streak))}</span>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

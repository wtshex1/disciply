import { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '../i18n'
import HabitToggle from '../components/HabitToggle'
import { useLang } from '../lib/useLang'
import { db, type FacialLogRow, type FacialEx } from '../db'
import { todayKey, capitalize } from '../lib/date'
import { CalCard, buildCells, type CalCell } from '../components/CalCard'
import type { View } from '../App'

interface PresetEx {
  key: string
  nameKey: string
  sec: number
}

const PRESETS: PresetEx[] = [
  { key: 'ex-face-forehead', nameKey: 'ex-face-forehead', sec: 60 },
  { key: 'ex-face-eyes', nameKey: 'ex-face-eyes', sec: 60 },
  { key: 'ex-face-cheeks', nameKey: 'ex-face-cheeks', sec: 60 },
  { key: 'ex-face-jaw', nameKey: 'ex-face-jaw', sec: 120 },
  { key: 'ex-face-smile', nameKey: 'ex-face-smile', sec: 90 },
  { key: 'ex-face-neck', nameKey: 'ex-face-neck', sec: 60 },
  { key: 'ex-face-pucker', nameKey: 'ex-face-pucker', sec: 60 },
  { key: 'ex-face-lion', nameKey: 'ex-face-lion', sec: 90 }
]

const DURATIONS = [45, 60, 90, 120]

interface ExItem {
  key: string
  name: string
  sec: number
}

interface FaceSession {
  exercises: ExItem[]
  idx: number
  remaining: number
  elapsed: number
  paused: boolean
  finished: boolean
  breakLeft: number
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.max(0, Math.round(sec) % 60)
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
}

export default function Facial({ setView }: { setView: (v: View) => void }) {
  const lang = useLang()
  const [logs, setLogs] = useState<FacialLogRow[]>([])
  const [custom, setCustom] = useState<FacialEx[]>([])
  const [running, setRunning] = useState(false)
  const [calOffset, setCalOffset] = useState(0)
  const [session, setSession] = useState<FaceSession | null>(null)
  const sessionRef = useRef<FaceSession | null>(null)
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PRESETS.map(p => [p.key, true]))
  )
  const [durations, setDurations] = useState<Record<string, number>>(() =>
    Object.fromEntries(PRESETS.map(p => [p.key, p.sec]))
  )
  const [adding, setAdding] = useState(false)
  const [edName, setEdName] = useState('')
  const [edSec, setEdSec] = useState(60)

  const allItems: ExItem[] = [
    ...PRESETS.map(p => ({ key: p.key, name: t(p.nameKey), sec: durations[p.key] ?? p.sec })),
    ...custom.map(c => ({ key: 'c:' + c.id, name: c.name, sec: c.sec }))
  ]
  const chosen = allItems.filter(x => selected[x.key])

  const reload = useCallback(async () => {
    setLogs(await db.facialLogs.toArray())
    setCustom(await db.facialExs.toArray())
  }, [])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const s = sessionRef.current
      if (!s || s.paused || s.finished) return
      s.elapsed++
      if (s.breakLeft > 0) {
        s.breakLeft--
        if (s.breakLeft === 0) s.remaining = s.exercises[s.idx].sec
      } else {
        s.remaining--
        if (s.remaining <= 0) {
          if (s.idx + 1 < s.exercises.length) {
            s.idx++
            s.remaining = s.exercises[s.idx].sec
            s.breakLeft = 10
          } else {
            s.finished = true
            void saveSession(s)
          }
        }
      }
      setSession({ ...s })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const start = () => {
    if (!chosen.length) return
    const s: FaceSession = {
      exercises: chosen,
      idx: 0,
      remaining: chosen[0].sec,
      elapsed: 0,
      paused: false,
      finished: false,
      breakLeft: 0
    }
    sessionRef.current = s
    setSession(s)
    setRunning(true)
  }

  const saveSession = async (s: FaceSession) => {
    const totalSec = s.exercises.reduce((a, e) => a + e.sec, 0)
    const min = Math.max(1, Math.round(totalSec / 60))
    await db.facialLogs.put({
      date: todayKey(),
      name: 'Facial',
      min,
      ex: s.exercises.length,
      ts: Date.now()
    })
    await reload()
  }

  const togglePause = () => {
    const s = sessionRef.current
    if (!s || s.finished) return
    s.paused = !s.paused
    setSession({ ...s })
  }

  const skip = () => {
    const s = sessionRef.current
    if (!s || s.finished) return
    if (s.idx + 1 < s.exercises.length) {
      s.idx++
      s.remaining = s.exercises[s.idx].sec
      s.breakLeft = 0
    } else {
      s.finished = true
      void saveSession(s)
    }
    setSession({ ...s })
  }

  const quit = () => {
    sessionRef.current = null
    setSession(null)
    setRunning(false)
  }

  const toggleSelected = (key: string) => {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const cycleDuration = (key: string) => {
    setDurations(prev => {
      const cur = prev[key] ?? 60
      const i = DURATIONS.indexOf(cur)
      const next = DURATIONS[(i + 1) % DURATIONS.length]
      return { ...prev, [key]: next }
    })
  }

  const addCustom = async () => {
    if (!edName.trim()) return
    const id = 'f' + Date.now()
    await db.facialExs.put({ id, name: edName.trim(), sec: edSec })
    setSelected(prev => ({ ...prev, ['c:' + id]: true }))
    setEdName('')
    setEdSec(60)
    setAdding(false)
    await reload()
  }

  const deleteCustom = async (id: string) => {
    await db.facialExs.delete(id)
    setSelected(prev => {
      const next = { ...prev }
      delete next['c:' + id]
      return next
    })
    await reload()
  }

  const locale = lang === 'ro' ? 'ro-RO' : 'en-US'
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + calOffset, 1)
  const todayKeyStr = todayKey()
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7

  const dayMin: Record<string, number> = {}
  let maxDayMin = 0
  let totalMin = 0
  let totalCount = 0
  for (let i = 1; i <= daysInMonth; i++) {
    const key = first.getFullYear() + '-' + String(first.getMonth() + 1).padStart(2, '0') + '-' + String(i).padStart(2, '0')
    const list = logs.filter(l => l.date === key)
    const sum = list.reduce((a, l) => a + (l.min || 0), 0)
    dayMin[key] = sum
    if (key <= todayKeyStr) {
      totalMin += sum
      totalCount += list.length
      if (sum > maxDayMin) maxDayMin = sum
    }
  }

  const cells = buildCells(first, daysInMonth, lead, (_dayNum, key) => {
    const isFuture = key > todayKeyStr
    const min = dayMin[key] || 0
    const pct = maxDayMin ? Math.max(6, Math.round(min / maxDayMin * 100)) : 0
    const cell: Omit<CalCell, 'dayNum' | 'key'> = {
      cls: 'hyd-cal-cell' + (min > 0 ? ' full' : '') + (isFuture ? ' other' : '') + (key === todayKeyStr ? ' today' : ''),
      barPct: pct,
      label: min ? min + 'm' : ''
    }
    return cell
  })

  let calTitle = first.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  calTitle = capitalize(calTitle)
  const stats = t('facial-cal-total').replace('{0}', (totalMin / 60).toFixed(1)) + ' \u00B7 ' + t('facial-cal-count').replace('{0}', String(totalCount))

  const allLogs = logs.slice().sort((a, b) => b.ts - a.ts).slice(0, 7)
  const ex = session ? session.exercises[session.idx] : null
  const sessionTotal = session ? session.exercises.reduce((a, e) => a + e.sec, 0) : 0
  const chosenTotal = chosen.reduce((a, x) => a + x.sec, 0)

  return (
    <div className="page-content active" id="page-facial" data-od-id="screen-facial">
      <div className="sub-top">
        <button className="sub-back" onClick={() => setView({ page: 'more' })} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>

      {!running && (
        <>
          <div className="sub-hero glass-card">
            <div className="more-icon big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="10" r="1.4"/><circle cx="15" cy="10" r="1.4"/><path d="M12 14.5c1.8 0 3.2 1 3.9 2.5M8.1 17c.7-1.5 2.1-2.5 3.9-2.5"/><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"/></svg></div>
            <h3>{t('more-facials')}</h3>
            <p className="u-muted13">{t('facial-hero')}</p>
            <HabitToggle moduleId="facial" />
          </div>

          <div className="card glass-card">
            <div className="u-section-h">{t('facial-exercises')}</div>
            {allItems.map(item => (
              <div
                className={'facial-row' + (selected[item.key] ? ' on' : '')}
                key={item.key}
                onClick={() => toggleSelected(item.key)}
              >
                <span className={'obj-check' + (selected[item.key] ? ' done' : '')}></span>
                <span className="facial-name">{item.name}</span>
                <button
                  type="button"
                  className="facial-dur"
                  onClick={e => { e.stopPropagation(); cycleDuration(item.key) }}
                >{fmtTime(item.sec)}</button>
              </div>
            ))}
            <button className="hyd-btn" onClick={start} disabled={!chosen.length} style={{ opacity: chosen.length ? 1 : 0.5 }}>
              {t('facial-start')} · {chosen.length} {t('facial-ex-s')} · {fmtTime(chosenTotal)}
            </button>
          </div>

          <div className="card glass-card">
            <div className="u-section-h">{t('facial-mine')}</div>
            <p className="u-muted13">{t('facial-custom-note')}</p>
            {!adding && (
              <button className="hyd-btn alt" onClick={() => setAdding(true)}>+ {t('facial-add')}</button>
            )}
            {adding && (
              <div className="facial-add-form">
                <input className="glass-input" type="text" placeholder={t('facial-name-ph')} value={edName} onChange={e => setEdName(e.target.value)} autoFocus />
                <div className="facial-dur-chips">
                  {DURATIONS.map(d => (
                    <button
                      type="button"
                      className={'facial-chip' + (edSec === d ? ' on' : '')}
                      key={d}
                      onClick={() => setEdSec(d)}
                    >{fmtTime(d)}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="hyd-btn" onClick={addCustom} disabled={!edName.trim()} style={{ flex: 1, opacity: edName.trim() ? 1 : 0.5 }}>{t('facial-add')}</button>
                  <button className="hyd-reset" style={{ padding: '10px 16px', border: '1px solid var(--border)', borderRadius: 12, background: 'transparent', color: 'var(--text-secondary)' }} onClick={() => { setAdding(false); setEdName('') }}>{t('facial-cancel')}</button>
                </div>
              </div>
            )}
            {custom.length === 0 && !adding && <p className="u-muted13" style={{ textAlign: 'center' }}>{t('facial-no-custom')}</p>}
            {custom.map(c => (
              <div className="facial-row on" key={c.id}>
                <span className={'obj-check done'}></span>
                <span className="facial-name">{c.name}</span>
                <button className="wkt-del" type="button" onClick={() => deleteCustom(c.id)}>×</button>
              </div>
            ))}
          </div>

          <div className="card glass-card">
            <div className="u-section-h">{t('facial-stats')}</div>
            <CalCard title={calTitle} locale={locale} offset={calOffset} setOffset={setCalOffset} cells={cells} stats={stats} />
            <div className="u-section-h" style={{ marginTop: 16 }}>{t('facial-recent')}</div>
            {allLogs.length === 0 && <p className="u-muted13" style={{ textAlign: 'center' }}>{t('facial-no-sessions')}</p>}
            {allLogs.map((r, i) => {
              const d = new Date(r.ts)
              const ds = d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
              return (
                <div className="wkt-progress-row" key={i}>
                  <span className="wkt-p-name">{r.name}</span>
                  <span className="wkt-p-sets">{ds} \u00B7 {r.min} min</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {running && session && ex && (
        <>
          <div className="card glass-card">
            <div className="u-section-h">{t('facial-ex')} {session.idx + 1}/{session.exercises.length}</div>
            <div className="facial-timer" id="facialTimer">{fmtTime(session.remaining)}</div>
            <div className="facial-ex-name" id="facialExName">{ex.name}</div>
            <div className="facial-rest" hidden={session.breakLeft === 0}>
              {t('facial-rest')} {session.breakLeft}s
            </div>
            {session.paused && <div className="facial-paused">{t('facial-pause')}</div>}
            <div className="facial-total">{'\u23F1'} {fmtTime(session.elapsed)}</div>
          </div>
          <div className="card glass-card">
            <div className="u-section-h">{t('facial-progress')}</div>
            {session.exercises.map((e, i) => {
              const done = i < session.idx
              const current = i === session.idx
              return (
                <div className={'wkt-progress-row' + (current ? ' current' : '')} key={e.key}>
                  <span className="wkt-p-name">{done ? '✓ ' : ''}{e.name}</span>
                  <span className="wkt-p-sets">{e.sec}s</span>
                </div>
              )
            })}
          </div>
          <div className="facial-actions">
            <button className="hyd-btn alt" onClick={skip}>{t('facial-skip')}</button>
            <button className="hyd-btn" onClick={togglePause}>{session.paused ? t('facial-resume') : t('facial-pause')}</button>
            <button className="hyd-reset" onClick={quit} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '10px 18px', background: 'transparent', color: 'var(--text-secondary)' }}>{t('facial-quit')}</button>
          </div>
          {session.finished && (
            <div className="card glass-card" style={{ textAlign: 'center' }}>
              <div className="wkt-done-mark">✓</div>
              <h3>{t('facial-finished')}</h3>
              <p className="u-muted13">
                {t('facial-summary').replace('{0}', String(session.exercises.length)).replace('{1}', fmtTime(sessionTotal))}
              </p>
              <button className="hyd-btn" onClick={quit}>{t('facial-back')}</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

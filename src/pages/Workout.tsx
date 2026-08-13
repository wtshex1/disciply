import { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '../i18n'
import HabitToggle from '../components/HabitToggle'
import { useLang } from '../lib/useLang'
import { db, type Workout, type WktLogRow } from '../db'
import { todayKey, capitalize } from '../lib/date'
import { CalCard, buildCells, type CalCell } from '../components/CalCard'
import type { View } from '../App'

interface Ex {
  nameKey?: string
  name?: string
  sets: number
  reps: string
}

interface Plan {
  id?: string
  name?: string
  nameKey?: string
  icon?: string
  exercises: Ex[]
}

const WKT_PRESETS: Plan[] = [
  {
    id: 'legs', nameKey: 'wkt-legs', icon: 'M9 3l1.5 3L8 9l2.5 2L9 15l3 4M15 3l-1.5 3L16 9l-2.5 2L15 15l-3 4',
    exercises: [
      { nameKey: 'ex-squat', sets: 4, reps: '15' },
      { nameKey: 'ex-lunge', sets: 3, reps: '12' },
      { nameKey: 'ex-legpress', sets: 4, reps: '12' },
      { nameKey: 'ex-glute', sets: 3, reps: '15' },
      { nameKey: 'ex-calf', sets: 4, reps: '20' }
    ]
  },
  {
    id: 'back', nameKey: 'wkt-back', icon: 'M12 3v3M12 9v3M12 15v3M12 21v1',
    exercises: [
      { nameKey: 'ex-pullup', sets: 4, reps: '8' },
      { nameKey: 'ex-row', sets: 4, reps: '10' },
      { nameKey: 'ex-dbrow', sets: 3, reps: '12' },
      { nameKey: 'ex-lat', sets: 3, reps: '12' },
      { nameKey: 'ex-backext', sets: 3, reps: '15' }
    ]
  },
  {
    id: 'abs', nameKey: 'wkt-abs', icon: 'M5 5h14M5 10h14M5 15h14M5 20h14',
    exercises: [
      { nameKey: 'ex-crunch', sets: 4, reps: '15' },
      { nameKey: 'ex-plank', sets: 3, reps: '60 sec' },
      { nameKey: 'ex-raise', sets: 3, reps: '12' },
      { nameKey: 'ex-twist', sets: 3, reps: '15' },
      { nameKey: 'ex-mountain', sets: 3, reps: '20' }
    ]
  },
  {
    id: 'arms', nameKey: 'wkt-arms', icon: 'M6 9v6M4 11v2M18 9v6M20 11v2M6 12h12',
    exercises: [
      { nameKey: 'ex-curl', sets: 4, reps: '12' },
      { nameKey: 'ex-tri', sets: 3, reps: '12' },
      { nameKey: 'ex-pushup', sets: 4, reps: '15' },
      { nameKey: 'ex-dips', sets: 3, reps: '10' },
      { nameKey: 'ex-hammer', sets: 3, reps: '12' }
    ]
  }
]

function wktName(p: Ex | Plan) {
  return p.nameKey ? t(p.nameKey) : p.name || ''
}

function wktFmt(ms: number) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
}

function wktMinFmt(min: number) {
  if (!min) return ''
  return min >= 60 ? (min / 60).toFixed(1) + 'h' : min + 'm'
}

interface WktSession {
  plan: { name: string; exercises: Ex[] }
  exIdx: number
  setIdx: number
  phase: 'set' | 'rest'
  restEnd: number
  restDur: number
  startT: number
  elapsed: number
  paused: boolean
  finished: boolean
}

function wktIconSvg(path: string, size: number) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d={path} />
    </svg>
  )
}

type ViewMode = 'list' | 'view' | 'editor' | 'session'

export default function Workout({ setView }: { setView: (v: View) => void }) {
  const lang = useLang()
  const [mode, setMode] = useState<ViewMode>('list')
  const [current, setCurrent] = useState<Plan | null>(null)
  const [custom, setCustom] = useState<Workout[]>([])
  const [logs, setLogs] = useState<WktLogRow[]>([])
  const [calOffset, setCalOffset] = useState(0)
  const [, setTick] = useState(0)

  const [edName, setEdName] = useState('')
  const [edRows, setEdRows] = useState<Ex[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const sessionRef = useRef<WktSession | null>(null)

  const reload = useCallback(async () => {
    setCustom(await db.workouts.toArray())
    setLogs(await db.wktLogs.toArray())
  }, [])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    if (!sessionRef.current) return
    const id = setInterval(() => {
      const s = sessionRef.current
      if (!s) return
      if (!s.paused && !s.finished) s.elapsed = performance.now() - s.startT
      if (s.phase === 'rest' && !s.finished) {
        const left = s.restEnd - performance.now()
        if (left <= 0) {
          s.phase = 'set'
          s.restEnd = 0
        }
      }
      setTick(tt => tt + 1)
    }, 200)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode === 'session'])

  const wktStart = (plan: Plan) => {
    sessionRef.current = {
      plan: { name: wktName(plan), exercises: plan.exercises },
      exIdx: 0,
      setIdx: 0,
      phase: 'set',
      restEnd: 0,
      restDur: 60,
      startT: performance.now(),
      elapsed: 0,
      paused: false,
      finished: false
    }
    setMode('session')
  }

  const startRest = (s: WktSession) => {
    s.phase = 'rest'
    s.restEnd = performance.now() + s.restDur * 1000
  }

  const nextExercise = (s: WktSession) => {
    if (s.exIdx + 1 < s.plan.exercises.length) {
      s.exIdx++
      s.setIdx = 0
      startRest(s)
    } else {
      void wktFinish(s)
    }
  }

  const wktSetDone = () => {
    const s = sessionRef.current
    if (!s || s.finished) return
    if (s.phase === 'rest') {
      s.phase = 'set'
      s.restEnd = 0
      setTick(tt => tt + 1)
      return
    }
    const ex = s.plan.exercises[s.exIdx]
    if (s.setIdx + 1 < ex.sets) {
      s.setIdx++
      startRest(s)
    } else {
      nextExercise(s)
    }
    setTick(tt => tt + 1)
  }

  const wktExDone = () => {
    const s = sessionRef.current
    if (!s || s.finished) return
    nextExercise(s)
    setTick(tt => tt + 1)
  }

  const wktSetRest = (sec: number) => {
    const s = sessionRef.current
    if (!s) return
    s.restDur = sec
    if (s.phase === 'rest') s.restEnd = performance.now() + sec * 1000
    setTick(tt => tt + 1)
  }

  const wktTogglePause = () => {
    const s = sessionRef.current
    if (!s) return
    if (s.paused) {
      s.paused = false
      s.startT = performance.now() - s.elapsed
    } else {
      s.elapsed = performance.now() - s.startT
      s.paused = true
    }
    setTick(tt => tt + 1)
  }

  const wktFinish = async (s: WktSession) => {
    if (!s || s.finished) return
    s.finished = true
    if (!s.paused) s.elapsed = performance.now() - s.startT
    await db.wktLogs.put({
      date: todayKey(),
      name: s.plan.name,
      min: Math.max(1, Math.round(s.elapsed / 60000)),
      ex: s.plan.exercises.length,
      ts: Date.now()
    })
    await reload()
    setTick(tt => tt + 1)
  }

  const endSession = () => {
    sessionRef.current = null
    setMode('list')
  }

  const openNew = () => {
    setEditingId(null)
    setEdName('')
    setEdRows([{ name: '', sets: 1, reps: '' }])
    setMode('editor')
  }

  const openEdit = () => {
    if (!current) return
    setEditingId(current.id || null)
    setEdName(current.name || '')
    setEdRows(current.exercises.map(e => ({ ...e })))
    setMode('editor')
  }

  const saveWorkout = async () => {
    const exercises = edRows
      .map(r => ({ name: r.name || '', sets: r.sets, reps: r.reps }))
      .filter(r => r.name.trim() && r.sets > 0 && r.reps)
    if (!exercises.length) return
    if (editingId) {
      const w = custom.find(x => x.id === editingId)
      if (w) await db.workouts.put({ ...w, name: edName.trim() || w.name, exercises })
    } else {
      await db.workouts.put({ id: 'w' + Date.now(), name: edName.trim() || t('wkt-untitled'), exercises })
    }
    await reload()
    setCurrent(null)
    setMode('list')
  }

  const deleteWorkout = async () => {
    if (!current) return
    await db.workouts.delete(current.id || '')
    setCurrent(null)
    await reload()
    setMode('list')
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
      label: min ? wktMinFmt(min) : ''
    }
    return cell
  })

  let calTitle = first.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  calTitle = capitalize(calTitle)
  const stats = t('wkt-cal-total').replace('{0}', (totalMin / 60).toFixed(1)) + ' \u00B7 ' + t('wkt-cal-count').replace('{0}', String(totalCount))

  const allLogs = logs.slice().sort((a, b) => b.ts - a.ts).slice(0, 7)

  const session = sessionRef.current
  const ex = session ? session.plan.exercises[session.exIdx] : null

  return (
    <div className="page-content active" id="page-workout" data-od-id="screen-workout">
      <div className="sub-top">
        <button className="sub-back" onClick={() => { if (session) endSession(); setView({ page: 'more' }) }} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>

      {mode === 'list' && (
        <>
          <div className="sub-hero glass-card">
            <div className="more-icon big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 9.5v5M4 8v8M20 8v8M22 9.5v5M4 12h16"/></svg></div>
            <h3>{t('more-workouts')}</h3>
            <p className="u-muted13">{t('wkt-hero')}</p>
            <HabitToggle moduleId="workout" />
          </div>

          <div className="card glass-card">
            <div className="u-section-h">{t('wkt-templates')}</div>
            <div className="wkt-tiles" id="wktTiles">
              {WKT_PRESETS.map(p => (
                <button className="wkt-tile" key={p.id} onClick={() => { setCurrent(p); setMode('view') }}>
                  {wktIconSvg(p.icon || '', 30)}
                  <span>{wktName(p)}</span>
                  <small>{p.exercises.length} {t('wkt-ex-s')}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="card glass-card">
            <div className="u-section-h">{t('wkt-mine')}</div>
            <div id="wktMine">
              {custom.length === 0 && <p className="u-muted13" style={{ textAlign: 'center' }}>{t('wkt-none')}</p>}
              {custom.map(w => (
                <button className="more-item glass-card" key={w.id} style={{ width: '100%', marginBottom: 8 }} onClick={() => { setCurrent(w); setMode('view') }}>
                  <div className="more-info">
                    <span className="more-name">{w.name}</span>
                    <span className="u-muted13">{w.exercises.length} {t('wkt-ex-s')} · {w.exercises.reduce((a, e) => a + (e.sets || 0), 0)} {t('wkt-sets-s')}</span>
                  </div>
                  <span className="arrow">→</span>
                </button>
              ))}
            </div>
            <button className="hyd-btn" onClick={openNew}>{t('wkt-new')}</button>
          </div>

          <div className="card glass-card">
            <div className="u-section-h">{t('wkt-stats')}</div>
            <CalCard title={calTitle} locale={locale} offset={calOffset} setOffset={setCalOffset} cells={cells} stats={stats} />
            <div className="u-section-h" style={{ marginTop: 16 }}>{t('wkt-recent')}</div>
            <div id="wktRecent">
              {allLogs.length === 0 && <p className="u-muted13" style={{ textAlign: 'center' }}>{t('wkt-no-sessions')}</p>}
              {allLogs.map((r, i) => {
                const d = new Date(r.ts)
                const ds = d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
                return (
                  <div className="wkt-progress-row" key={i}>
                    <span className="wkt-p-name">{r.name}</span>
                    <span className="wkt-p-sets">{ds} \u00B7 {wktMinFmt(r.min)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {mode === 'view' && current && (
        <>
          <div className="card glass-card">
            <div className="more-icon big" style={{ margin: '0 auto 10px' }} id="wktViewIcon">{wktIconSvg(current.icon || '', 34)}</div>
            <h3 style={{ textAlign: 'center' }} id="wktViewName">{wktName(current)}</h3>
            <p className="u-muted13" style={{ textAlign: 'center' }} id="wktViewCount">
              {current.exercises.length} {t('wkt-ex-s')} · {current.exercises.reduce((a, e) => a + e.sets, 0)} {t('wkt-sets-s')}
            </p>
          </div>
          <div className="card glass-card">
            <div className="u-section-h">{t('wkt-exercises')}</div>
            <div id="wktViewEx">
              {current.exercises.map((e, i) => (
                <div className="wkt-progress-row" key={i}>
                  <span className="wkt-p-name">{i + 1}. {wktName(e)}</span>
                  <span className="wkt-p-sets">{e.sets}×{e.reps}</span>
                </div>
              ))}
            </div>
            <button className="hyd-btn" onClick={() => wktStart(current)}>{t('wkt-start')}</button>
            {custom.some(x => x.id === current.id) && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button className="hyd-btn alt" id="wktEditBtn" onClick={openEdit}>{t('wkt-edit')}</button>
                <button className="hyd-reset wkt-btn" onClick={deleteWorkout}>{t('wkt-delete')}</button>
              </div>
            )}
          </div>
        </>
      )}

      {mode === 'editor' && (
        <div className="card glass-card">
          <div className="u-section-h">{t('wkt-edit-title')}</div>
          <div className="u-field" style={{ marginBottom: 12 }}>
            <input className="glass-input u-input" type="text" id="wktNameInput" placeholder={t('wkt-name-ph')} value={edName} onChange={e => setEdName(e.target.value)} />
          </div>
          <div className="u-section-h" style={{ marginBottom: 8 }}>{t('wkt-exercises')}</div>
          <div id="wktExRows">
            {edRows.map((r, i) => (
              <div className="wkt-ex-row" key={i}>
                <input
                  className="glass-input" type="text" placeholder={t('wkt-ex-ph')}
                  value={r.name || ''}
                  onChange={e => setEdRows(rows => rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                />
                <input
                  className="glass-input num" type="number" min={1} placeholder={t('wkt-sets-s')}
                  value={r.sets}
                  onChange={e => setEdRows(rows => rows.map((x, j) => (j === i ? { ...x, sets: parseInt(e.target.value, 10) || 0 } : x)))}
                />
                <input
                  className="glass-input" type="text" placeholder={t('wkt-reps-ph')}
                  value={r.reps}
                  onChange={e => setEdRows(rows => rows.map((x, j) => (j === i ? { ...x, reps: e.target.value } : x)))}
                />
                <button className="wkt-del" type="button" onClick={() => setEdRows(rows => rows.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
          </div>
          <button className="hyd-btn alt" onClick={() => setEdRows(rows => [...rows, { name: '', sets: 1, reps: '' }])}>{t('wkt-add-ex')}</button>
          <button className="hyd-btn" style={{ marginTop: 10 }} onClick={saveWorkout}>{t('wkt-save')}</button>
        </div>
      )}

      {mode === 'session' && session && ex && (
        <>
          <div className="card glass-card">
            <div className="u-section-h" id="wktSessionName">{session.plan.name}</div>
            <div className="wkt-session-timer" id="wktTotalTime">{wktFmt(session.elapsed)}</div>
            <div style={{ textAlign: 'center' }} className="u-muted13">{t('wkt-elapsed')}</div>
            <div className="wkt-rest" id="wktRestWrap" hidden={session.phase !== 'rest'}>
              <span>{t('wkt-rest-title')}</span>
              <span id="wktRest">{session.phase === 'rest' ? Math.max(0, Math.ceil((session.restEnd - performance.now()) / 1000)) + 's' : ''}</span>
            </div>
            <div className="wkt-pills">
              <button className="wkt-pill" onClick={() => wktSetRest(30)}>30s</button>
              <button className="wkt-pill" onClick={() => wktSetRest(60)}>60s</button>
              <button className="wkt-pill" onClick={() => wktSetRest(90)}>90s</button>
            </div>
          </div>
          <div className="card glass-card">
            <div className="u-section-h">{t('wkt-exercise')}</div>
            <div className="wkt-ex-now">
              <div className="wkt-ex-name" id="wktExName">{wktName(ex)}</div>
              <div className="wkt-set-info" id="wktSetInfo">
                {t('wkt-set-info').replace('{0}', String(session.setIdx + 1)).replace('{1}', String(ex.sets)).replace('{2}', ex.reps)}
              </div>
              <div className="wkt-ex-count" id="wktExCount">
                {t('wkt-ex-count').replace('{0}', String(session.exIdx + 1)).replace('{1}', String(session.plan.exercises.length))}
              </div>
            </div>
            <div className="wkt-actions">
              <button className="hyd-btn" id="wktBtnSet" onClick={wktSetDone}>
                {session.phase === 'rest' ? t('wkt-continue') : (session.setIdx + 1 >= ex.sets ? t('wkt-ex-done') : t('wkt-set-done'))}
              </button>
              <button className="hyd-btn alt" onClick={wktExDone}>{t('wkt-ex-done')}</button>
              <button className="hyd-btn alt" id="wktBtnPause" onClick={wktTogglePause}>{session.paused ? t('wkt-resume') : t('wkt-pause')}</button>
              <button className="hyd-reset wkt-btn" onClick={endSession}>{t('wkt-quit')}</button>
            </div>
          </div>
          <div className="card glass-card">
            <div className="u-section-h">{t('wkt-progress')}</div>
            <div id="wktProgress">
              {session.plan.exercises.map((e, i) => {
                const done = i < session.exIdx
                const currentEx = i === session.exIdx
                return (
                  <div className={'wkt-progress-row' + (currentEx ? ' current' : '')} key={i}>
                    <span className="wkt-p-name">{done ? '✓ ' : ''}{wktName(e)}</span>
                    <span className="wkt-p-sets">{e.sets}×{e.reps}</span>
                  </div>
                )
              })}
            </div>
          </div>
          {session.finished && (
            <div id="wktSummary">
              <div className="card glass-card" style={{ textAlign: 'center' }}>
                <div className="wkt-done-mark">✓</div>
                <h3>{t('wkt-finished')}</h3>
                <p className="u-muted13" id="wktSummaryText">
                  {t('wkt-summary').replace('{0}', wktFmt(session.elapsed)).replace('{1}', String(session.plan.exercises.length))}
                </p>
                <button className="hyd-btn" onClick={endSession}>{t('wkt-back')}</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

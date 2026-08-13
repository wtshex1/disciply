import { useEffect, useRef, useState } from 'react'
import { t } from '../i18n'
import HabitToggle from '../components/HabitToggle'
import TimeDial, { dialTo24, type DialTime } from '../components/TimeDial'
import { useLang } from '../lib/useLang'
import { capitalize } from '../lib/date'
import { db, type GoalTerm } from '../db'
import type { View } from '../App'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

interface SwState {
  running: boolean
  startT: number
  accum: number
  laps: { n: number; t: number }[]
}

const TERMS: GoalTerm[] = ['short', 'medium', 'long']

function defaultDialTime(): DialTime {
  const h24 = new Date().getHours()
  return { h: h24 % 12 === 0 ? 12 : h24 % 12, min: 0, mer: h24 < 12 ? 'am' : 'pm' }
}

function swElapsed(s: SwState) {
  return s.accum + (s.running ? performance.now() - s.startT : 0)
}

function swFmt(ms: number) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  const d = Math.floor((ms % 1000) / 100)
  return (h ? pad2(h) + ':' : '') + pad2(m) + ':' + pad2(s) + '.' + d
}

export default function ClockPage({ setView }: { setView: (v: View) => void }) {
  const lang = useLang()
  const [now, setNow] = useState(new Date())
  const [sw, setSw] = useState<SwState>({ running: false, startT: 0, accum: 0, laps: [] })
  const swRef = useRef(sw)
  swRef.current = sw
  const [qaType, setQaType] = useState<'objective' | 'habit'>('objective')
  const [qaName, setQaName] = useState('')
  const [qaDesc, setQaDesc] = useState('')
  const [qaTerm, setQaTerm] = useState<GoalTerm>('medium')
  const [qaTime, setQaTime] = useState<DialTime>(defaultDialTime)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const flashTimer = useRef<number | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!sw.running) return
    const id = setInterval(() => setSw({ ...swRef.current }), 33)
    return () => clearInterval(id)
  }, [sw.running])

  const locale = lang === 'ro' ? 'ro-RO' : 'en-US'
  let dateStr = now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
  dateStr = capitalize(dateStr)

  const swToggle = () => {
    setSw(s => {
      if (s.running) {
        return { ...s, running: false, accum: s.accum + performance.now() - s.startT }
      }
      return { ...s, running: true, startT: performance.now() }
    })
  }

  const swLap = () => {
    setSw(s => {
      if (!s.running) return s
      return { ...s, laps: [{ n: s.laps.length + 1, t: swElapsed(s) }, ...s.laps] }
    })
  }

  const swReset = () => setSw({ running: false, startT: 0, accum: 0, laps: [] })

  const saveQa = async () => {
    const name = qaName.trim()
    if (!name || saving || qaTime.min == null) return
    setSaving(true)
    const nowD = new Date()
    const deadline = `${nowD.getFullYear()}-${pad2(nowD.getMonth() + 1)}-${pad2(nowD.getDate())}T${pad2(dialTo24(qaTime))}:${pad2(qaTime.min)}`
    await db.goals.add({
      type: qaType,
      icon: qaType === 'objective' ? 'target' : 'star',
      name,
      desc: qaDesc.trim(),
      term: qaType === 'objective' ? qaTerm : undefined,
      deadline,
      area: '',
      done: false,
      doneDates: [],
      createdAt: Date.now()
    })
    setQaName('')
    setQaDesc('')
    setQaTerm('medium')
    setQaTime(defaultDialTime())
    setSaving(false)
    setSavedFlash(true)
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setSavedFlash(false), 1800)
  }

  const qaValid = qaName.trim().length > 0

  return (
    <div className="page-content active" id="page-clock" data-od-id="screen-clock">
      <div className="sub-top">
        <button className="sub-back" onClick={() => setView({ page: 'more' })} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>
      <div className="sub-hero glass-card">
        <div className="more-icon big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div>
        <h3>{t('more-clock')}</h3>
        <p className="u-muted13">{t('more-clock-page')}</p>
        <HabitToggle moduleId="clock" />
      </div>

      <div className="card glass-card">
        <div className="u-section-h">{t('clock-time')}</div>
        <div className="clock-face">
          <div className="clock-time" id="clockTime">
            <span className="hm">{pad2(now.getHours())}:{pad2(now.getMinutes())}</span><span className="sep">:</span><span className="sec">{pad2(now.getSeconds())}</span>
          </div>
          <div className="clock-date" id="clockDate">{dateStr}</div>
        </div>
      </div>

      <div className="card glass-card">
        <div className="u-section-h">{t('clock-quick-add')}</div>
        <p className="u-muted13" style={{ textAlign: 'center', marginBottom: 12 }}>{t('clock-quick-add-sub')}</p>
        <div className="life-tabs" style={{ marginBottom: 12 }}>
          <button type="button" className={'life-tab' + (qaType === 'objective' ? ' on' : '')} onClick={() => setQaType('objective')}>{t('add-type-objective')}</button>
          <button type="button" className={'life-tab' + (qaType === 'habit' ? ' on' : '')} onClick={() => setQaType('habit')}>{t('add-type-habit')}</button>
        </div>
        <div className="name-desc" style={{ marginBottom: 14 }}>
          <div className="ni">
            <input className="glass-input" type="text" placeholder={t('add-name-ph')} value={qaName} onChange={e => setQaName(e.target.value)} />
          </div>
          <div className="ni">
            <textarea className="glass-input" rows={2} placeholder={t('add-desc-ph')} value={qaDesc} onChange={e => setQaDesc(e.target.value)} />
          </div>
        </div>
        {qaType === 'objective' && (
          <div className="term-chips" style={{ marginBottom: 14 }}>
            {TERMS.map(tr => (
              <button key={tr} type="button" className={'term-chip' + (qaTerm === tr ? ' on' : '')} onClick={() => setQaTerm(tr)}>{t('term-' + tr)}</button>
            ))}
          </div>
        )}
        <TimeDial value={qaTime} onChange={setQaTime} />
        <button className="hyd-btn" style={{ marginTop: 20 }} onClick={() => void saveQa()} disabled={!qaValid || saving}>
          {saving ? '…' : savedFlash ? t('qa-saved') : t('add-save') + (qaTime.min != null ? ' · ' + pad2(dialTo24(qaTime)) + ':' + pad2(qaTime.min) : '')}
        </button>
        {!qaValid && <p className="u-muted13" style={{ textAlign: 'center', marginTop: 8 }}>{t('add-invalid')}</p>}
      </div>

      <div className="card glass-card">
        <div className="u-section-h">{t('clock-stopwatch')}</div>
        <div className="clock-face">
          <div className="clock-time sw" id="swTime">{swFmt(swElapsed(sw))}</div>
        </div>
        <div className="sw-controls">
          <button className="hyd-btn" id="swStart" onClick={swToggle}>{sw.running ? t('clock-pause') : t('clock-start')}</button>
          <button className="hyd-reset sw-btn" onClick={swLap}>{t('clock-lap')}</button>
          <button className="hyd-reset sw-btn" onClick={swReset}>{t('clock-reset')}</button>
        </div>
        <div className="u-section-h" style={{ marginTop: 18 }}>{t('clock-laps')}</div>
        <p className="u-muted13" style={{ textAlign: 'center' }} id="swLapsEmpty" hidden={sw.laps.length > 0}>{t('clock-no-laps')}</p>
        <div className="sw-laps" id="swLaps">
          {sw.laps.map(l => (
            <div className="sw-lap-row" key={l.n}>
              <span>{t('clock-lap')} {l.n}</span><span>{swFmt(l.t)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

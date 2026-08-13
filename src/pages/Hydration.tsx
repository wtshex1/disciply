import { useCallback, useEffect, useState } from 'react'
import { t } from '../i18n'
import HabitToggle from '../components/HabitToggle'
import { useLang } from '../lib/useLang'
import { db } from '../db'
import { todayKey } from '../lib/date'
import type { View } from '../App'

const ML_PER_KG = 33
const GLASS_ML = 250
const DROPS = 10

function hydGoal(weight: number) {
  return Math.round(weight * ML_PER_KG / 100) * 100
}

export default function Hydration({ setView }: { setView: (v: View) => void }) {
  const lang = useLang()
  const [weight, setWeight] = useState<number | null>(null)
  const [todayMl, setTodayMl] = useState(0)
  const [byDay, setByDay] = useState<Map<string, number>>(new Map())
  const [calOffset, setCalOffset] = useState(0)
  const [weightInput, setWeightInput] = useState('')

  const reload = useCallback(async () => {
    const p = await db.hydProfile.get(1)
    const w = p && p.weight != null ? p.weight : null
    setWeight(w)
    setWeightInput(w != null ? String(w) : '')
    const rows = await db.water.toArray()
    const map = new Map<string, number>()
    for (const r of rows) map.set(r.date, r.ml)
    setByDay(map)
    setTodayMl(map.get(todayKey()) ?? 0)
  }, [])

  useEffect(() => { reload() }, [reload])

  const saveWeight = async () => {
    const v = parseFloat(weightInput)
    if (!v || v < 20 || v > 300) return
    await db.hydProfile.put({ id: 1, weight: Math.round(v * 2) / 2 })
    await reload()
  }

  const addMl = async (ml: number) => {
    const key = todayKey()
    const cur = byDay.get(key) ?? 0
    await db.water.put({ date: key, ml: cur + ml })
    await reload()
  }

  const resetToday = async () => {
    const key = todayKey()
    await db.water.put({ date: key, ml: 0 })
    await reload()
  }

  const goal = weight ? hydGoal(weight) : 2500
  const pct = Math.min(100, Math.round(todayMl / goal * 100))
  const glasses = Math.round(todayMl / GLASS_ML)
  const totalGlasses = Math.round(goal / GLASS_ML)
  const filledDrops = Math.min(DROPS, Math.round(todayMl / (goal / DROPS)))

  const locale = lang === 'ro' ? 'ro-RO' : 'en-US'
  const first = new Date(new Date().getFullYear(), new Date().getMonth() + calOffset, 1)
  let calTitle = first.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  calTitle = calTitle.charAt(0).toUpperCase() + calTitle.slice(1)

  const weekHead = []
  {
    const base = new Date(first)
    base.setDate(base.getDate() - ((first.getDay() + 6) % 7))
    for (let i = 0; i < 7; i++) {
      const wd = new Date(base)
      wd.setDate(base.getDate() + i)
      weekHead.push(<span key={i}>{wd.toLocaleDateString(locale, { weekday: 'narrow' })}</span>)
    }
  }

  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7
  const todayKeyStr = todayKey()
  let monthTotal = 0
  let counted = 0

  const cells = []
  for (let i = 0; i < 42; i++) {
    const dayNum = i - lead + 1
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push(<div className="hyd-cal-cell other" key={i}></div>)
      continue
    }
    const key = first.getFullYear() + '-' + String(first.getMonth() + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0')
    const isFuture = key > todayKeyStr
    const ml = !isFuture && byDay.get(key) ? byDay.get(key)! : 0
    if (!isFuture) {
      monthTotal += ml
      counted++
    }
    const cellPct = Math.min(100, Math.round(ml / goal * 100))
    const cls = 'hyd-cal-cell' +
      (isFuture ? ' other' : '') +
      (key === todayKeyStr ? ' today' : '') +
      (ml >= goal && ml > 0 ? ' full' : '')
    cells.push(
      <div className={cls} key={i}>
        <span className="d">{dayNum}</span>
        <span className="bar"><i style={{ width: cellPct + '%' }}></i></span>
        <span className="m">{ml ? (ml >= 1000 ? (ml / 1000).toFixed(1) + 'L' : ml) : ''}</span>
      </div>
    )
  }

  const days = calOffset === 0 ? new Date().getDate() : daysInMonth
  const avg = days ? Math.round(monthTotal / days) : 0
  const calStats = t('hyd-cal-total').replace('{0}', (monthTotal / 1000).toFixed(1)) +
    ' \u00B7 ' + t('hyd-cal-avg').replace('{0}', (avg / 1000).toFixed(1))

  return (
    <div className="page-content active" id="page-hydration" data-od-id="screen-hydration">
      <div className="sub-top">
        <button className="sub-back" onClick={() => setView({ page: 'more' })} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>
      <div className="sub-hero glass-card">
        <div className="more-icon big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg></div>
        <h3>{t('more-hydration')}</h3>
        <p className="u-muted13" id="hydGoalLabel">
          {weight ? t('hyd-goal').replace('{0}', (goal / 1000).toFixed(1)) : t('hyd-goal-first')}
        </p>
        <HabitToggle moduleId="hydration" />
      </div>

      <div className="card glass-card">
        <div className="u-section-h">{t('hyd-weight')}</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            className="ps-name" id="hydWeight" type="number" inputMode="decimal" min={20} max={300} step={0.5}
            placeholder="70" value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveWeight() }}
            autoComplete="off" style={{ flex: 1, textAlign: 'left' }}
          />
          <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>kg</span>
          <button className="hyd-btn" style={{ flex: '0 0 auto', padding: '14px 20px' }} onClick={saveWeight}>{t('hyd-save')}</button>
        </div>
      </div>

      <div className="card glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="u-section-h">{t('hyd-today')}</div>
          <button className="hyd-reset" onClick={resetToday} aria-label="Reset">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <span id="hydMl" style={{ fontSize: 38, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{todayMl.toLocaleString('en-US')}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}> / <span id="hydGoal">{goal.toLocaleString('en-US')}</span> ml</span>
        </div>
        <div className="level-bar glass-progress"><div className="fill glass-progress-bar" id="hydBar" style={{ width: pct + '%' }}></div></div>
        <div className="hyd-drops" id="hydDrops">
          {Array.from({ length: DROPS }, (_, i) => (
            <span key={i} className={'hyd-drop' + (i < filledDrops ? ' filled' : '')}></span>
          ))}
        </div>
        <p className="u-muted13" style={{ textAlign: 'center' }} id="hydGlasses">
          {t('hyd-glasses').replace('{0}', String(glasses)).replace('{1}', String(totalGlasses))}
        </p>
        <div className="hyd-row">
          <button className="hyd-btn" onClick={() => addMl(250)}>{t('hyd-add-glass')}</button>
          <button className="hyd-btn alt" onClick={() => addMl(500)}>{t('hyd-add-bottle')}</button>
        </div>
        <p className="hyd-done-msg" id="hydDone" hidden={pct < 100}>{t('hyd-done')}</p>
      </div>

      <div className="card glass-card">
        <div className="hyd-cal-head">
          <button className="hyd-reset" onClick={() => setCalOffset(o => o - 1)} aria-label="Previous month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="hyd-cal-title" id="hydCalTitle">{calTitle}</div>
          <button className="hyd-reset" onClick={() => setCalOffset(o => o + 1)} aria-label="Next month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        <div className="hyd-cal-week" id="hydCalWeek">{weekHead}</div>
        <div className="hyd-cal-grid" id="hydCalGrid">{cells}</div>
        <div className="u-muted13" style={{ textAlign: 'center', marginTop: 10 }} id="hydCalStats">{calStats}</div>
      </div>
    </div>
  )
}

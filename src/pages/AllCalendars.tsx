import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { t } from '../i18n'
import { useLang } from '../lib/useLang'
import { db, type MealRow, type WktLogRow, type FacialLogRow, type AgendaEvent } from '../db'
import { todayKey, capitalize } from '../lib/date'
import { CalCard, buildCells, type CalCell } from '../components/CalCard'
import { MODULES, moduleNameKey } from '../lib/modules'
import type { View } from '../App'

const ML_PER_KG = 33
const SLEEP_GOAL_MIN = 480
const MEAL_GOAL_KCAL = 2000

function hydGoal(weight: number | null) {
  return weight ? Math.round(weight * ML_PER_KG / 100) * 100 : 2500
}

function wktMinFmt(min: number) {
  if (!min) return ''
  return min >= 60 ? (min / 60).toFixed(1) + 'h' : min + 'm'
}

export default function AllCalendars({ setView }: { setView: (v: View) => void }) {
  const lang = useLang()
  const [water, setWater] = useState<Map<string, number>>(new Map())
  const [weight, setWeight] = useState<number | null>(null)
  const [sleep, setSleep] = useState<Map<string, number>>(new Map())
  const [meals, setMeals] = useState<MealRow[]>([])
  const [wktLogs, setWktLogs] = useState<WktLogRow[]>([])
  const [facialLogs, setFacialLogs] = useState<FacialLogRow[]>([])
  const [events, setEvents] = useState<AgendaEvent[]>([])
  const [calOffset, setCalOffset] = useState(0)

  const reload = useCallback(async () => {
    const [wRows, p, sRows, mRows, wkRows, fcRows, evRows] = await Promise.all([
      db.water.toArray(),
      db.hydProfile.get(1),
      db.sleep.toArray(),
      db.meals.toArray(),
      db.wktLogs.toArray(),
      db.facialLogs.toArray(),
      db.events.toArray()
    ])
    const wMap = new Map<string, number>()
    for (const r of wRows) wMap.set(r.date, r.ml)
    const sMap = new Map<string, number>()
    for (const r of sRows) sMap.set(r.date, r.min)
    setWater(wMap)
    setWeight(p && p.weight != null ? p.weight : null)
    setSleep(sMap)
    setMeals(mRows)
    setWktLogs(wkRows)
    setFacialLogs(fcRows)
    setEvents(evRows)
  }, [])

  useEffect(() => { void reload() }, [reload])

  const locale = lang === 'ro' ? 'ro-RO' : 'en-US'
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + calOffset, 1)
  const todayKeyStr = todayKey()
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7

  const waterDay: Record<string, number> = {}
  for (const [d, ml] of water) waterDay[d] = ml
  const sleepDay: Record<string, number> = {}
  for (const [d, min] of sleep) sleepDay[d] = min
  const kcalDay: Record<string, number> = {}
  const mealDay: Record<string, number> = {}
  for (const r of meals) {
    let k = 0
    for (const m of r.items) k += m.kcal || 0
    kcalDay[r.date] = k
    mealDay[r.date] = r.items.length
  }
  const wktDay: Record<string, number> = {}
  const wktCnt: Record<string, number> = {}
  for (const l of wktLogs) {
    wktDay[l.date] = (wktDay[l.date] || 0) + (l.min || 0)
    wktCnt[l.date] = (wktCnt[l.date] || 0) + 1
  }
  const facDay: Record<string, number> = {}
  const facCnt: Record<string, number> = {}
  for (const l of facialLogs) {
    facDay[l.date] = (facDay[l.date] || 0) + (l.min || 0)
    facCnt[l.date] = (facCnt[l.date] || 0) + 1
  }
  const evDay: Record<string, number> = {}
  for (const e of events) evDay[e.date] = (evDay[e.date] || 0) + 1

  const goal = hydGoal(weight)
  const days = calOffset === 0 ? now.getDate() : daysInMonth

  let wktTotalMin = 0
  let wktTotalCnt = 0
  let wktMax = 0
  const wktCells = buildCells(first, daysInMonth, lead, (_dn, key) => {
    const isFuture = key > todayKeyStr
    const min = isFuture ? 0 : (wktDay[key] || 0)
    const cnt = isFuture ? 0 : (wktCnt[key] || 0)
    if (!isFuture) { wktTotalMin += min; wktTotalCnt += cnt; if (min > wktMax) wktMax = min }
    const pct = wktMax ? Math.max(6, Math.round(min / wktMax * 100)) : 0
    return {
      cls: 'hyd-cal-cell' + (min > 0 ? ' full' : '') + (isFuture ? ' other' : '') + (key === todayKeyStr ? ' today' : ''),
      barPct: pct,
      label: min ? wktMinFmt(min) : ''
    }
  })
  const wktStats = t('wkt-cal-total').replace('{0}', (wktTotalMin / 60).toFixed(1)) +
    ' \u00B7 ' + t('wkt-cal-count').replace('{0}', String(wktTotalCnt))

  let nutTotalKcal = 0
  let nutTotalCnt = 0
  const nutCells = buildCells(first, daysInMonth, lead, (_dn, key) => {
    const isFuture = key > todayKeyStr
    const kcal = isFuture ? 0 : (kcalDay[key] || 0)
    const cnt = isFuture ? 0 : (mealDay[key] || 0)
    if (!isFuture) { nutTotalKcal += kcal; nutTotalCnt += cnt }
    const pct = Math.min(100, Math.round(kcal / MEAL_GOAL_KCAL * 100))
    return {
      cls: 'hyd-cal-cell' + (kcal >= MEAL_GOAL_KCAL ? ' full' : '') + (isFuture ? ' other' : '') + (key === todayKeyStr ? ' today' : ''),
      barPct: pct,
      label: cnt ? cnt + ' \u00D7 ' + kcal : ''
    }
  })
  const nutAvg = days ? Math.round(nutTotalKcal / days) : 0
  const nutStats = t('nut-cal-total').replace('{0}', String(nutTotalKcal)).replace('{1}', String(nutTotalCnt)) +
    ' \u00B7 ' + t('nut-cal-avg').replace('{0}', String(nutAvg))

  let hydTotalMl = 0
  const hydCells = buildCells(first, daysInMonth, lead, (_dn, key) => {
    const isFuture = key > todayKeyStr
    const ml = isFuture ? 0 : (waterDay[key] || 0)
    if (!isFuture) hydTotalMl += ml
    const pct = Math.min(100, Math.round(ml / goal * 100))
    return {
      cls: 'hyd-cal-cell' + (ml >= goal && ml > 0 ? ' full' : '') + (isFuture ? ' other' : '') + (key === todayKeyStr ? ' today' : ''),
      barPct: pct,
      label: ml ? (ml >= 1000 ? (ml / 1000).toFixed(1) + 'L' : String(ml)) : ''
    }
  })
  const hydAvg = days ? Math.round(hydTotalMl / days) : 0
  const hydStats = t('hyd-cal-total').replace('{0}', (hydTotalMl / 1000).toFixed(1)) +
    ' \u00B7 ' + t('hyd-cal-avg').replace('{0}', (hydAvg / 1000).toFixed(1))

  let sleepTotalMin = 0
  const sleepCells = buildCells(first, daysInMonth, lead, (_dn, key) => {
    const isFuture = key > todayKeyStr
    const min = isFuture ? 0 : (sleepDay[key] || 0)
    if (!isFuture) sleepTotalMin += min
    const pct = Math.min(100, Math.round(min / SLEEP_GOAL_MIN * 100))
    return {
      cls: 'hyd-cal-cell' + (min >= SLEEP_GOAL_MIN && min > 0 ? ' full' : '') + (isFuture ? ' other' : '') + (key === todayKeyStr ? ' today' : ''),
      barPct: pct,
      label: min ? (min / 60).toFixed(1) + 'h' : ''
    }
  })
  const sleepAvg = days ? Math.round(sleepTotalMin / days) : 0
  const sleepStats = t('sleep-cal-total').replace('{0}', (sleepTotalMin / 60).toFixed(1)) +
    ' \u00B7 ' + t('sleep-cal-avg').replace('{0}', (sleepAvg / 60).toFixed(1))

  let facTotalMin = 0
  let facTotalCnt = 0
  let facMax = 0
  const facCells = buildCells(first, daysInMonth, lead, (_dn, key) => {
    const isFuture = key > todayKeyStr
    const min = isFuture ? 0 : (facDay[key] || 0)
    const cnt = isFuture ? 0 : (facCnt[key] || 0)
    if (!isFuture) { facTotalMin += min; facTotalCnt += cnt; if (min > facMax) facMax = min }
    const pct = facMax ? Math.max(6, Math.round(min / facMax * 100)) : 0
    return {
      cls: 'hyd-cal-cell' + (min > 0 ? ' full' : '') + (isFuture ? ' other' : '') + (key === todayKeyStr ? ' today' : ''),
      barPct: pct,
      label: min ? min + 'm' : ''
    }
  })
  const facStats = t('facial-cal-total').replace('{0}', (facTotalMin / 60).toFixed(1)) +
    ' \u00B7 ' + t('facial-cal-count').replace('{0}', String(facTotalCnt))

  let agTotal = 0
  const agCells = buildCells(first, daysInMonth, lead, (_dn, key) => {
    const isFuture = key > todayKeyStr
    const count = isFuture ? 0 : (evDay[key] || 0)
    if (!isFuture) agTotal += count
    return {
      cls: 'hyd-cal-cell' + (isFuture ? ' other' : '') + (key === todayKeyStr ? ' today' : ''),
      barPct: 0,
      dots: count,
      label: count > 3 ? '+' + (count - 3) : ''
    }
  })
  const agStats = t('agenda-cal-count').replace('{0}', String(agTotal))

  let calTitle = first.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  calTitle = capitalize(calTitle)

  const iconById: Record<string, ReactNode> = {}
  for (const m of MODULES) iconById[m.id] = m.icon

  const modules: { id: string; name: string; icon: ReactNode; cells: CalCell[]; stats: string; mode?: 'dots' }[] = [
    { id: 'workout', name: t(moduleNameKey('workout')), icon: iconById['workout'], cells: wktCells, stats: wktStats },
    { id: 'nutrition', name: t(moduleNameKey('nutrition')), icon: iconById['nutrition'], cells: nutCells, stats: nutStats },
    { id: 'hydration', name: t(moduleNameKey('hydration')), icon: iconById['hydration'], cells: hydCells, stats: hydStats },
    { id: 'sleep', name: t(moduleNameKey('sleep')), icon: iconById['sleep'], cells: sleepCells, stats: sleepStats },
    { id: 'facial', name: t(moduleNameKey('facial')), icon: iconById['facial'], cells: facCells, stats: facStats },
    { id: 'agenda', name: t(moduleNameKey('agenda')), icon: iconById['agenda'], cells: agCells, stats: agStats, mode: 'dots' }
  ]

  return (
    <div className="page-content active" id="page-allcal" data-od-id="screen-allcal">
      <div className="sub-top">
        <button className="sub-back" onClick={() => setView({ page: 'progress' })} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>

      <div className="card glass-card" style={{ marginBottom: 14 }}>
        <div className="hyd-cal-head">
          <button className="hyd-reset" onClick={() => setCalOffset(o => o - 1)} aria-label="Previous month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="hyd-cal-title">{calTitle}</div>
          <button className="hyd-reset" onClick={() => setCalOffset(o => o + 1)} aria-label="Next month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {modules.map(m => (
        <CalCard
          key={m.id}
          title={<span className="allcal-h"><span className="allcal-mod-icon">{m.icon}</span>{m.name}</span>}
          locale={locale}
          offset={calOffset}
          setOffset={setCalOffset}
          cells={m.cells}
          stats={m.stats}
          mode={m.mode}
          noNav
        />
      ))}
    </div>
  )
}

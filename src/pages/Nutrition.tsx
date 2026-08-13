import { useCallback, useEffect, useState } from 'react'
import { t } from '../i18n'
import HabitToggle from '../components/HabitToggle'
import { useLang } from '../lib/useLang'
import { db, type MealItem } from '../db'
import { todayKey, capitalize } from '../lib/date'
import { CalCard, buildCells, type CalCell } from '../components/CalCard'
import type { View } from '../App'

const MEAL_GOAL_KCAL = 2000

const MEAL_TYPES = [
  { id: 'breakfast', kcal: 350, key: 'nut-breakfast', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/></svg> },
  { id: 'lunch', kcal: 650, key: 'nut-lunch', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v8M7 11v10M4 3v6a3 3 0 0 0 3 3"/><path d="M17 3v18M17 3c-2 1-3 3-3 5 0 2 3 3 3 3"/></svg> },
  { id: 'dinner', kcal: 600, key: 'nut-dinner', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg> },
  { id: 'snack', kcal: 200, key: 'nut-snack', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="10" r="1"/><circle cx="12" cy="15" r="1"/></svg> }
]

export default function Nutrition({ setView }: { setView: (v: View) => void }) {
  const lang = useLang()
  const [byDay, setByDay] = useState<Map<string, MealItem[]>>(new Map())
  const [calOffset, setCalOffset] = useState(0)

  const reload = useCallback(async () => {
    const rows = await db.meals.toArray()
    const map = new Map<string, MealItem[]>()
    for (const r of rows) map.set(r.date, r.items)
    setByDay(map)
  }, [])

  useEffect(() => { reload() }, [reload])

  const addMeal = async (typeId: string) => {
    const type = MEAL_TYPES.find(m => m.id === typeId)
    if (!type) return
    const key = todayKey()
    const cur = byDay.get(key) || []
    await db.meals.put({ date: key, items: [...cur, { type: typeId, kcal: type.kcal, ts: Date.now() }] })
    await reload()
  }

  const adjustMeal = async (ts: number, delta: number) => {
    const key = todayKey()
    const cur = byDay.get(key) || []
    await db.meals.put({
      date: key,
      items: cur.map(m => (m.ts === ts ? { ...m, kcal: Math.max(0, (m.kcal || 0) + delta) } : m))
    })
    await reload()
  }

  const deleteMeal = async (ts: number) => {
    const key = todayKey()
    const cur = byDay.get(key) || []
    await db.meals.put({ date: key, items: cur.filter(m => m.ts !== ts) })
    await reload()
  }

  const todayList = byDay.get(todayKey()) || []
  let total = 0
  todayList.forEach(m => { total += m.kcal || 0 })
  const pct = Math.min(100, Math.round(total / MEAL_GOAL_KCAL * 100))
  const over = total > MEAL_GOAL_KCAL

  const locale = lang === 'ro' ? 'ro-RO' : 'en-US'
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + calOffset, 1)
  const todayKeyStr = todayKey()
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7

  let totalKcal = 0
  let totalMeals = 0
  let counted = 0

  const cells = buildCells(first, daysInMonth, lead, (_dayNum, key) => {
    const isFuture = key > todayKeyStr
    const list = (!isFuture && byDay.get(key)) || []
    const kcal = list.reduce((a, m) => a + (m.kcal || 0), 0)
    if (!isFuture) { totalKcal += kcal; totalMeals += list.length; counted++ }
    const cellPct = Math.min(100, Math.round(kcal / MEAL_GOAL_KCAL * 100))
    const cell: Omit<CalCell, 'dayNum' | 'key'> = {
      cls: 'hyd-cal-cell' +
        (kcal >= MEAL_GOAL_KCAL ? ' full' : '') +
        (isFuture ? ' other' : '') +
        (key === todayKeyStr ? ' today' : ''),
      barPct: cellPct,
      label: list.length ? list.length + ' \u00D7 ' + kcal : ''
    }
    return cell
  })

  const days = calOffset === 0 ? now.getDate() : daysInMonth
  const avg = days ? Math.round(totalKcal / days) : 0
  let calTitle = first.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  calTitle = capitalize(calTitle)
  const stats = t('nut-cal-total').replace('{0}', String(totalKcal)).replace('{1}', String(totalMeals)) + ' \u00B7 ' + t('nut-cal-avg').replace('{0}', String(avg))

  return (
    <div className="page-content active" id="page-nutrition" data-od-id="screen-nutrition">
      <div className="sub-top">
        <button className="sub-back" onClick={() => setView({ page: 'more' })} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>
      <div className="sub-hero glass-card">
        <div className="more-icon big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z"/><path d="M4 20c4-6 8-9 12-11"/></svg></div>
        <h3>{t('more-nutrition')}</h3>
        <p className="u-muted13">{t('nut-hero')}</p>
        <HabitToggle moduleId="nutrition" />
      </div>

      <div className="card glass-card">
        <div className="u-section-h">{t('nut-today')}</div>
        <div className="meal-chips" id="mealChips">
          {MEAL_TYPES.map(m => (
            <button className="meal-chip" key={m.id} onClick={() => addMeal(m.id)}>
              {m.icon}<span>{t(m.key)}</span>
            </button>
          ))}
        </div>
        <div id="mealToday">
          {todayList.length === 0 && <p className="u-muted13" style={{ textAlign: 'center' }}>{t('nut-no-meals')}</p>}
          {todayList.map(m => {
            const type = MEAL_TYPES.find(x => x.id === m.type)
            return (
              <div className="meal-row" key={m.ts}>
                <span className="meal-icon">{type ? type.icon : ''}</span>
                <span className="meal-name">{t(type ? type.key : 'nut-snack')}</span>
                <span className="meal-kcal">{m.kcal || 0} kcal</span>
                <button className="meal-adj" onClick={() => adjustMeal(m.ts, -50)}>−</button>
                <button className="meal-adj" onClick={() => adjustMeal(m.ts, 50)}>+</button>
                <button className="meal-adj del" onClick={() => deleteMeal(m.ts)}>×</button>
              </div>
            )
          })}
        </div>
        <div className="meal-total" id="mealTotal">
          <div className="nut-total-line">
            <span className="u-muted13">{t('nut-goal').replace('{0}', String(MEAL_GOAL_KCAL))}</span>
            <span style={{ fontWeight: 700 }}>{total} / {MEAL_GOAL_KCAL} kcal</span>
          </div>
          <div className="nut-bar"><i style={{ width: pct + '%', background: over ? 'var(--danger)' : 'var(--accent)' }}></i></div>
        </div>
      </div>

      <CalCard
        title={calTitle}
        locale={locale}
        offset={calOffset}
        setOffset={setCalOffset}
        cells={cells}
        stats={stats}
      />
    </div>
  )
}

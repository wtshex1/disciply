import { useCallback, useEffect, useState } from 'react'
import { t } from '../i18n'
import HabitToggle from '../components/HabitToggle'
import { useLang } from '../lib/useLang'
import { db } from '../db'
import { todayKey, capitalize } from '../lib/date'
import { CalCard, buildCells, type CalCell } from '../components/CalCard'
import type { View } from '../App'

const SLEEP_GOAL_MIN = 480

function sleepDurationLabel(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? h + 'h ' + m + 'm' : m + 'm'
}

export default function Sleep({ setView }: { setView: (v: View) => void }) {
  const lang = useLang()
  const [byDay, setByDay] = useState<Map<string, number>>(new Map())
  const [bed, setBed] = useState('23:00')
  const [wake, setWake] = useState('07:00')
  const [calOffset, setCalOffset] = useState(0)

  const reload = useCallback(async () => {
    const rows = await db.sleep.toArray()
    const map = new Map<string, number>()
    for (const r of rows) map.set(r.date, r.min)
    setByDay(map)
  }, [])

  useEffect(() => { reload() }, [reload])

  const save = async () => {
    if (!bed || !wake) return
    const [bh, bm] = bed.split(':').map(Number)
    const [wh, wm] = wake.split(':').map(Number)
    let min = wh * 60 + wm - (bh * 60 + bm)
    if (min <= 0) min += 24 * 60
    await db.sleep.put({ date: todayKey(), min })
    await reload()
  }

  const todayMin = byDay.get(todayKey()) || 0
  const locale = lang === 'ro' ? 'ro-RO' : 'en-US'
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + calOffset, 1)
  const todayKeyStr = todayKey()
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7

  let monthTotal = 0
  let counted = 0

  const cells = buildCells(first, daysInMonth, lead, (dayNum, key) => {
    const isFuture = key > todayKeyStr
    const min = !isFuture && byDay.get(key) ? byDay.get(key)! : 0
    if (!isFuture) { monthTotal += min; counted++ }
    const pct = Math.min(100, Math.round(min / SLEEP_GOAL_MIN * 100))
    const cell: Omit<CalCell, 'dayNum' | 'key'> = {
      cls: 'hyd-cal-cell' +
        (isFuture ? ' other' : '') +
        (key === todayKeyStr ? ' today' : '') +
        (min >= SLEEP_GOAL_MIN && min > 0 ? ' full' : ''),
      barPct: pct,
      label: min ? (min / 60).toFixed(1) + 'h' : ''
    }
    return cell
  })

  const days = calOffset === 0 ? now.getDate() : daysInMonth
  const avg = days ? Math.round(monthTotal / days) : 0
  let calTitle = first.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  calTitle = capitalize(calTitle)
  const stats = t('sleep-cal-total').replace('{0}', (monthTotal / 60).toFixed(1)) + ' \u00B7 ' + t('sleep-cal-avg').replace('{0}', (avg / 60).toFixed(1))

  return (
    <div className="page-content active" id="page-sleep" data-od-id="screen-sleep">
      <div className="sub-top">
        <button className="sub-back" onClick={() => setView({ page: 'more' })} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>
      <div className="sub-hero glass-card">
        <div className="more-icon big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></div>
        <h3>{t('more-sleep')}</h3>
        <p className="u-muted13" id="sleepGoalLabel">{t('sleep-goal').replace('{0}', '8h')}</p>
        <HabitToggle moduleId="sleep" />
      </div>

      <div className="card glass-card">
        <div className="u-section-h">{t('sleep-log')}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="sleep-field">
            <span>{t('sleep-bed')}</span>
            <input className="ps-name" type="time" id="sleepBed" value={bed} onChange={e => setBed(e.target.value)} style={{ textAlign: 'center', padding: 12 }} />
          </div>
          <div className="sleep-field">
            <span>{t('sleep-wake')}</span>
            <input className="ps-name" type="time" id="sleepWake" value={wake} onChange={e => setWake(e.target.value)} style={{ textAlign: 'center', padding: 12 }} />
          </div>
        </div>
        <button className="hyd-btn" onClick={save}>{t('sleep-save')}</button>
        <p className="u-muted13" style={{ textAlign: 'center' }} id="sleepDurLabel">
          {todayMin ? t('sleep-lasted').replace('{0}', sleepDurationLabel(todayMin)) : ''}
        </p>
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

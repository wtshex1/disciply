import { useCallback, useEffect, useState } from 'react'
import { t } from '../i18n'
import HabitToggle from '../components/HabitToggle'
import { useLang } from '../lib/useLang'
import { db, type AgendaEvent } from '../db'
import { todayKey, capitalize } from '../lib/date'
import { CalCard, buildCells, type CalCell } from '../components/CalCard'
import type { View } from '../App'

function agParseDate(key: string) {
  const p = key.split('-')
  return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10))
}

export default function Agenda({ setView }: { setView: (v: View) => void }) {
  const lang = useLang()
  const [events, setEvents] = useState<AgendaEvent[]>([])
  const [calOffset, setCalOffset] = useState(0)
  const [selected, setSelected] = useState<string>(todayKey())
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('12:00')

  const reload = useCallback(async () => {
    setEvents(await db.events.toArray())
  }, [])

  useEffect(() => { reload() }, [reload])

  const addEvent = async () => {
    if (!title.trim()) return
    const ev: AgendaEvent = { id: Date.now(), title: title.trim(), date: selected, time: time || '12:00' }
    await db.events.put(ev)
    setTitle('')
    await reload()
  }

  const deleteEvent = async (id: number) => {
    await db.events.delete(id)
    await reload()
  }

  const locale = lang === 'ro' ? 'ro-RO' : 'en-US'
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + calOffset, 1)
  const todayKeyStr = todayKey()
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7

  const byDay: Record<string, number> = {}
  events.forEach(e => { byDay[e.date] = (byDay[e.date] || 0) + 1 })

  const cells = buildCells(first, daysInMonth, lead, (_dayNum, key) => {
    const count = byDay[key] || 0
    const cell: Omit<CalCell, 'dayNum' | 'key'> = {
      cls: 'hyd-cal-cell' +
        (key === selected ? ' sel' : '') +
        (key === todayKeyStr && key !== selected ? ' today' : ''),
      barPct: 0,
      dots: count,
      label: count > 3 ? '+' + (count - 3) : ''
    }
    return cell
  })

  let calTitle = first.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  calTitle = capitalize(calTitle)

  const dayList = events.filter(e => e.date === selected).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  const nowTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
  const isToday = selected === todayKeyStr
  let dayTitle = ''
  if (isToday) {
    const d = agParseDate(selected)
    let s = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
    s = capitalize(s)
    dayTitle = t('agenda-today') + ' · ' + s
  } else if (selected) {
    const d = agParseDate(selected)
    let s = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
    s = capitalize(s)
    dayTitle = s
  }

  return (
    <div className="page-content active" id="page-agenda" data-od-id="screen-agenda">
      <div className="sub-top">
        <button className="sub-back" onClick={() => setView({ page: 'more' })} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>
      <div className="sub-hero glass-card">
        <div className="more-icon big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg></div>
        <h3>{t('more-agenda')}</h3>
        <p className="u-muted13">{t('agenda-hero')}</p>
        <HabitToggle moduleId="agenda" />
      </div>

      <CalCard
        title={calTitle}
        locale={locale}
        offset={calOffset}
        setOffset={setCalOffset}
        cells={cells}
        mode="dots"
        onCellClick={key => setSelected(key)}
      />

      <div className="card glass-card">
        <div className="u-section-h" id="agendaDayTitle">{dayTitle}</div>
        <div id="agendaList">
          {dayList.length === 0 && <p className="u-muted13" style={{ textAlign: 'center' }}>{t('agenda-empty')}</p>}
          {dayList.map(e => {
            const past = isToday && e.time < nowTime
            return (
              <div className="agenda-row" key={e.id}>
                <span className={'agenda-time' + (past ? ' past' : '')}>{e.time || '--:--'}</span>
                <span className={'agenda-title' + (past ? ' past' : '')}>{e.title}</span>
                <button className="meal-adj del" onClick={() => deleteEvent(e.id)}>×</button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card glass-card">
        <div className="u-section-h">{t('agenda-add')}</div>
        <div className="u-field" style={{ marginBottom: 10 }}>
          <input className="glass-input u-input" type="text" id="agTitle" placeholder={t('agenda-title-ph')} value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div className="sleep-field">
            <span>{t('agenda-date')}</span>
            <input className="ps-name" type="date" id="agDate" value={selected} onChange={e => setSelected(e.target.value)} style={{ textAlign: 'center', padding: 10 }} />
          </div>
          <div className="sleep-field">
            <span>{t('agenda-time')}</span>
            <input className="ps-name" type="time" id="agTime" value={time} onChange={e => setTime(e.target.value)} style={{ textAlign: 'center', padding: 10 }} />
          </div>
        </div>
        <button className="hyd-btn" onClick={addEvent}>{t('agenda-add-btn')}</button>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { t } from '../i18n'
import { useLang } from '../lib/useLang'
import { db, type GoalTerm } from '../db'
import { CATEGORIES, catName } from '../questions'
import { LUCIDE } from '../lib/lucide'
import TimeDial, { dialTo24, type DialTime } from '../components/TimeDial'
import type { View } from '../App'

const TERMS: GoalTerm[] = ['short', 'medium', 'long']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function DayGrid({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [view, setView] = useState(() => {
    const now = new Date()
    return { y: now.getFullYear(), m: now.getMonth() }
  })
  const first = new Date(view.y, view.m, 1)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const isSel = (d: number) => value === `${view.y}-${pad(view.m + 1)}-${pad(d)}`
  const isToday = (d: number) => todayStr() === `${view.y}-${pad(view.m + 1)}-${pad(d)}`
  const cells: (number | null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const nav = (dir: number) => {
    setView(v => {
      let m = v.m + dir
      let y = v.y
      if (m < 0) { m = 11; y-- }
      if (m > 11) { m = 0; y++ }
      return { y, m }
    })
  }

  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" className="cal-nav" onClick={() => nav(-1)} aria-label="Prev">‹</button>
        <span className="cal-month">
          {MONTHS[view.m]} {view.y}
        </span>
        <button type="button" className="cal-nav" onClick={() => nav(1)} aria-label="Next">›</button>
      </div>
      <div className="cal-week">
        {WEEKDAYS.map(w => <span key={w}>{w}</span>)}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) =>
          d === null
            ? <span key={i} className="cal-day empty"></span>
            : <button
                key={i}
                type="button"
                className={'cal-day' + (isSel(d) ? ' on' : '') + (isToday(d) ? ' today' : '')}
                onClick={() => onChange(`${view.y}-${pad(view.m + 1)}-${pad(d)}`)}
              >{d}</button>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="add-field">
      <div className="add-label">{label}</div>
      {children}
    </div>
  )
}

export default function AddItem({ setView, initialType }: { setView: (v: View) => void; initialType?: 'objective' | 'habit' }) {
  useLang()
  const [type, setType] = useState<'objective' | 'habit'>(initialType === 'habit' ? 'habit' : 'objective')
  const [icon, setIcon] = useState('target')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [term, setTerm] = useState<GoalTerm>('medium')
  const [date, setDate] = useState('')
  const [hour, setHour] = useState(-1)
  const [minute, setMinute] = useState(-1)
  const [area, setArea] = useState('')
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  const valid = name.trim().length > 0
  const time = hour >= 0 && minute >= 0 ? `${pad(hour)}:${pad(minute)}` : ''
  const dialValue: DialTime | null = hour >= 0
    ? { h: hour % 12 === 0 ? 12 : hour % 12, min: minute >= 0 ? minute : null, mer: hour < 12 ? 'am' : 'pm' }
    : null
  const dialChange = (dt: DialTime) => {
    setHour(dialTo24(dt))
    if (dt.min != null) setMinute(dt.min)
  }

  const cats = useMemo(() => ['All', ...Array.from(new Set(LUCIDE.map(e => e.c)))], [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = cat === 'All' ? LUCIDE : LUCIDE.filter(e => e.c === cat)
    if (q) list = list.filter(e => e.n.toLowerCase().includes(q))
    return list.slice(0, 120)
  }, [search, cat])

  const save = async () => {
    if (!valid || saving) return
    setSaving(true)
    const deadlineStr = type === 'objective' && date ? (date + (time ? 'T' + time : '')) : undefined
    await db.goals.add({
      type,
      icon,
      name: name.trim(),
      desc: desc.trim(),
      term: type === 'objective' ? term : undefined,
      deadline: deadlineStr,
      area,
      done: false,
      doneDates: [],
      createdAt: Date.now()
    })
    setView({ page: 'home' })
  }

  const currentIcon = LUCIDE.find(i => i.n === icon)

  return (
    <div className="page-content active" id="page-add" data-od-id="screen-add">
      <div className="sub-top">
        <button className="sub-back" onClick={() => setView({ page: 'home' })} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>
      <div className="card glass-card add-card">
        <div className="life-tabs" style={{ marginBottom: 16 }}>
          <button type="button" className={'life-tab' + (type === 'objective' ? ' on' : '')} onClick={() => setType('objective')}>{t('add-type-objective')}</button>
          <button type="button" className={'life-tab' + (type === 'habit' ? ' on' : '')} onClick={() => setType('habit')}>{t('add-type-habit')}</button>
        </div>

        <div className="name-desc">
          <div className="ni">
            <input
              className="glass-input"
              type="text"
              placeholder={t('add-name-ph')}
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="ni">
            <textarea className="glass-input" rows={2} placeholder={t('add-desc-ph')} value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
        </div>

        <Field label={t('add-icon')}>
          <button type="button" className={'icon-preview' + (showPicker ? ' open' : '')} onClick={() => setShowPicker(s => !s)}>
            {currentIcon && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="ipv-svg" dangerouslySetInnerHTML={{ __html: currentIcon.d }} />
            )}
            <span className="icon-preview-hint">{t('add-icon-change')}</span>
          </button>
          {showPicker && (
            <div className="emoji-picker">
              <input
                className="glass-input emoji-search"
                type="text"
                placeholder={t('add-icon-search')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="emoji-cats">
                {cats.map(c => (
                  <button
                    type="button"
                    key={c}
                    className={'em-cat' + (cat === c ? ' on' : '')}
                    onClick={() => { setCat(c); setSearch('') }}
                  >{c === 'All' ? t('add-icon-all') : c}</button>
                ))}
              </div>
              <div className="emoji-grid">
                {filtered.map(e => (
                  <button
                    type="button"
                    key={e.n}
                    className={'em-pick' + (icon === e.n ? ' on' : '')}
                    onClick={() => { setIcon(e.n); setShowPicker(false) }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: e.d }} />
                  </button>
                ))}
              </div>
              <p className="u-muted13" style={{ textAlign: 'center', marginTop: 6 }}>{t('add-icon-count').replace('{0}', String(filtered.length))}</p>
            </div>
          )}
        </Field>

        {type === 'objective' && (
          <>
            <Field label={t('add-term')}>
              <div className="term-chips">
                {TERMS.map(tr => (
                  <button
                    type="button"
                    key={tr}
                    className={'term-chip' + (term === tr ? ' on' : '')}
                    onClick={() => setTerm(tr)}
                  >{t('term-' + tr)}</button>
                ))}
              </div>
            </Field>

            <Field label={t('add-deadline')}>
              <DayGrid value={date} onChange={setDate} />
              <div className="dl-time" style={{ marginTop: 14 }}>
                <span className="up-label">{t('add-time')}</span>
                <button type="button" className="em-cat cal-clear" onClick={() => { setHour(-1); setMinute(-1) }}>{t('add-clear')}</button>
              </div>
              <TimeDial value={dialValue} onChange={dialChange} />
            </Field>
          </>
        )}

        <Field label={t('add-area') + ' · ' + t('add-optional')}>
          <div className="area-chips">
            {CATEGORIES.map(c => (
              <button
                type="button"
                key={c.key}
                className={'area-chip' + (area === c.key ? ' on' : '')}
                style={area === c.key ? { background: c.color, borderColor: c.color, color: '#fff' } : undefined}
                onClick={() => setArea(area === c.key ? '' : c.key)}
              >
                <span className="area-dot" style={{ background: c.color }}></span>
                {catName(c)}
              </button>
            ))}
          </div>
        </Field>

        <button className="hyd-btn" style={{ marginTop: 20 }} onClick={save} disabled={!valid}>
          {saving ? '…' : t('add-save')}
        </button>
        {!valid && <p className="u-muted13" style={{ textAlign: 'center', marginTop: 8 }}>{t('add-invalid')}</p>}
      </div>
    </div>
  )
}
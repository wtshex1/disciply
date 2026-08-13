import { useEffect, useState } from 'react'
import { t } from '../i18n'

export interface DialTime {
  h: number
  min: number | null
  mer: 'am' | 'pm'
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const MINS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
const CENTER = 125
const RADIUS = 96
const HALF = 23
const TICK_R = 56

function position(v: number): { left: number; top: number } {
  const a = (v * Math.PI) / 6
  return { left: CENTER + RADIUS * Math.sin(a) - HALF, top: CENTER - RADIUS * Math.cos(a) - HALF }
}

function tickPos(i: number): { left: number; top: number } {
  const a = ((i * 30 + 15) * Math.PI) / 180
  return { left: CENTER + TICK_R * Math.sin(a) - 1.5, top: CENTER - TICK_R * Math.cos(a) - 1.5 }
}

export function dialTo24(dt: DialTime): number {
  return dt.mer === 'pm' ? (dt.h % 12) + 12 : dt.h % 12
}

export default function TimeDial({ value, onChange }: { value: DialTime | null; onChange: (t: DialTime) => void }) {
  const [mode, setMode] = useState<'hour' | 'min'>('hour')

  useEffect(() => {
    if (!value) setMode('hour')
  }, [value])

  const base = value ?? { h: 12, min: null as number | null, mer: 'am' as 'am' | 'pm' }
  const currH = value ? value.h : null
  const currM = value && value.min != null ? value.min : null

  const labels = mode === 'hour'
    ? HOURS.map(h => ({ v: h, label: String(h) }))
    : MINS.map(m => ({ v: m, label: String(m).padStart(2, '0') }))
  const current = mode === 'hour' ? currH : currM

  const tapNumber = (v: number) => {
    if (mode === 'hour') {
      onChange({ ...base, h: v })
      setMode('min')
    } else if (v !== currM) {
      onChange({ ...base, min: v })
    }
  }

  const hh = value ? String(value.h).padStart(2, '0') : '--'
  const mm = currM != null ? String(currM).padStart(2, '0') : '--'
  const hourDeg = value ? (value.h % 12) * 30 : 0
  const minDeg = currM != null ? currM * 6 : null
  const complete = value != null && currM != null

  const preview = complete
    ? <>{hh}:{mm}<span className="mer">&nbsp;{base.mer.toUpperCase()}</span></>
    : <span className="empty">{value ? t('qa-preview-min') : t('qa-preview-empty')}</span>

  return (
    <div className="qa-wrap">
      <div className="qa-hint">{mode === 'hour' ? t('qa-dial-hint') : t('qa-dial-min-hint')}</div>
      <div className="qa-face">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="qa-tick" style={tickPos(i)} />
        ))}
        {value && (
          <span
            className="qa-hand hr"
            style={{ left: CENTER - 2, top: CENTER - 52, transform: `rotate(${hourDeg}deg)` }}
          />
        )}
        {minDeg != null && (
          <span
            className="qa-hand min"
            style={{ left: CENTER - 1.25, top: CENTER - 38, transform: `rotate(${minDeg}deg)` }}
          />
        )}
        {labels.map(({ v, label }) => (
          <button
            type="button"
            key={v}
            className={'qa-hr' + (current === v ? ' on' : '')}
            style={position(v)}
            onClick={() => tapNumber(v)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={'qa-center' + (mode === 'min' ? ' on' : '')}
          onClick={() => setMode('hour')}
          aria-label={t('qa-center')}
        >
          {value ? String(value.h).padStart(2, '0') : null}
        </button>
      </div>
      <div className="qa-mer">
        <button
          type="button"
          className={'qa-mer-btn' + (base.mer === 'am' ? ' on' : '')}
          onClick={() => onChange({ ...base, mer: 'am' })}
        >AM</button>
        <button
          type="button"
          className={'qa-mer-btn' + (base.mer === 'pm' ? ' on' : '')}
          onClick={() => onChange({ ...base, mer: 'pm' })}
        >PM</button>
      </div>
      <div className="qa-preview">
        {preview}
      </div>
    </div>
  )
}